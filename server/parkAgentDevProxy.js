const fs = require('node:fs')
const http = require('node:http')
const https = require('node:https')
const { isIPv4 } = require('node:net')
const dotenv = require('dotenv')
const { version } = require('../package.json')

const PREFIX = '/api/park-agent'
const SESSION_PATH = /^\/v1\/sessions(?:\/([\da-f-]{36})(?:\/(turns|voice-turns|finish|forward))?)?$/i
const CARE_MESSAGES = /^\/v1\/care\/messages(?:\/[\da-f-]{36}\/(open|dismiss))?$/i
const CARE_PAUSE = /^\/v1\/care\/plans\/[\da-f-]{36}\/pause$/i
const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1'])
const P8_USER_ID = /^[A-Za-z0-9_.:-]{1,120}$/

function isLocalSameOrigin(req, verifyIdentity) {
  const host = req.headers.host || ''
  const origin = req.headers.origin
  if (origin && origin !== `http://${host}`) return false

  const { remoteAddress, localAddress } = req.socket
  if (LOOPBACK.has(remoteAddress) && /^(127\.0\.0\.1|localhost)(:\d+)?$/i.test(host)) return true

  // 支持本机浏览器通过自己的局域网地址联调，连接的两端必须是同一个本机地址。
  const localIp = (localAddress || '').replace(/^::ffff:/, '')
  const peerIp = (remoteAddress || '').replace(/^::ffff:/, '')
  const hostIp = host.replace(/:\d+$/, '')
  return Boolean(verifyIdentity && isIPv4(localIp) && peerIp === localIp && hostIp === localIp)
}

async function p8UserInfo(url, authorization) {
  const transport = url.protocol === 'https:' ? https : http
  const body = await new Promise((resolve, reject) => {
    const request = transport.request(url, { method: 'POST', headers: { Authorization: authorization, Version: version, 'Content-Type': 'application/json', 'Content-Length': 2 } }, (response) => {
      if ([401, 403].includes(response.statusCode)) {
        response.resume()
        resolve(null)
        return
      }
      if (response.statusCode !== 200) {
        response.resume()
        reject(new Error('P8 user info unavailable'))
        return
      }
      const chunks = []
      let size = 0
      response.on('data', (chunk) => {
        size += chunk.length
        if (size > 1024 * 1024) request.destroy(new Error('P8 user info too large'))
        else chunks.push(chunk)
      })
      response.on('error', reject)
      response.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
        } catch (error) {
          reject(error)
        }
      })
    })
    const timeout = setTimeout(() => request.destroy(new Error('P8 user info timed out')), 6000)
    request.on('close', () => clearTimeout(timeout))
    request.on('error', reject)
    request.end('{}')
  })
  if (body?.head && body.head.success !== 'true') return null
  const user = body?.head ? body.data : body
  if (typeof user?.id !== 'string' || !P8_USER_ID.test(user.id) || user.id === 'local-dev-user' || String(user.isActivated) === '0') return null
  return user.id
}

function createParkAgentDevProxy(envFile, p8UserInfoUrl) {
  const config = dotenv.parse(fs.readFileSync(envFile))
  const token = config.AGENT_SERVICE_TOKEN
  if (!token) throw new Error('智能体 .env 缺少 AGENT_SERVICE_TOKEN')

  const identityUrl = p8UserInfoUrl ? new URL(p8UserInfoUrl) : null
  if (identityUrl && (!['http:', 'https:'].includes(identityUrl.protocol) || identityUrl.username || identityUrl.password || identityUrl.search || identityUrl.hash)) {
    throw new Error('PARK_AGENT_P8_USER_INFO_URL 格式不正确')
  }

  return async function parkAgentDevProxy(req, res, next) {
    if (!req.url.startsWith(PREFIX + '/')) return next()

    function reject(statusCode, detail) {
      res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify({ detail }))
    }

    if (!isLocalSameOrigin(req, identityUrl)) {
      return reject(403, '此联调入口仅限本机同源访问')
    }

    const path = req.url.slice(PREFIX.length)
    const pathname = path.split('?')[0]
    const match = SESSION_PATH.exec(pathname)
    const listing = match && !match[1] && req.method === 'GET'
    const sessionRoute = match && (listing || req.method === (match[1] && !match[2] ? 'GET' : 'POST'))
    const care = CARE_MESSAGES.exec(pathname)
    const careRoute = (care && req.method === (care[1] ? 'POST' : 'GET')) || (CARE_PAUSE.test(pathname) && req.method === 'POST')
    if (!sessionRoute && !careRoute) {
      return reject(404, '未开放此智能体接口')
    }

    let userId = 'local-dev-user'
    if (identityUrl) {
      if (!req.headers.authorization) return reject(401, '请先登录 P8')
      try {
        userId = await p8UserInfo(identityUrl, req.headers.authorization)
      } catch {
        return reject(502, '无法核验 P8 登录身份')
      }
      if (!userId) return reject(401, 'P8 登录已失效')
    } else if (careRoute) {
      return reject(503, '企业关怀需配置 P8 登录身份核验')
    }
    if (res.destroyed) return

    const headers = {
      Authorization: `Bearer ${token}`,
      'X-Park-Id': 'local-dev-park',
      'X-Enterprise-Id': 'local-dev-enterprise',
      'X-User-Id': userId
    }
    for (const name of ['accept', 'content-type', 'content-length', 'x-park-reply-audio']) {
      if (req.headers[name]) headers[name] = req.headers[name]
    }

    const upstream = http.request({ hostname: '127.0.0.1', port: 8000, path, method: req.method, headers, timeout: 120000 }, (response) => {
      const responseHeaders = { 'Content-Type': response.headers['content-type'] || 'application/json' }
      for (const name of ['cache-control', 'x-accel-buffering']) {
        if (response.headers[name]) responseHeaders[name] = response.headers[name]
      }
      res.writeHead(response.statusCode, responseHeaders)
      response.pipe(res)
      response.on('error', () => res.destroy())
    })
    upstream.on('timeout', () => upstream.destroy())
    upstream.on('error', () => {
      if (!res.headersSent) reject(502, '无法连接本机智能体服务')
      else res.destroy()
    })
    res.on('close', () => upstream.destroy())
    req.pipe(upstream)
  }
}

module.exports = createParkAgentDevProxy

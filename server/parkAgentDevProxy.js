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
const ADMIN_ROUTES = {
  GET: /^\/(?:admin|v1\/admin\/(?:providers|knowledge|email|care\/(?:plans|followups)|network-access))$/,
  POST: /^\/v1\/admin\/(?:providers\/(?:llm|asr|tts|embedding)\/test|knowledge\/import|email\/test|care\/plans(?:\/[\da-f-]{36}\/send)?)$/,
  PUT: /^\/v1\/admin\/(?:providers\/(?:llm|asr|tts|embedding)|care\/(?:plans|followups)\/[\da-f-]{36}|network-access)$/,
  DELETE: /^\/v1\/admin\/knowledge$/
}
const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1'])
const P8_USER_ID = /^[A-Za-z0-9_.:-]{1,120}$/
const ACCESS_URL = new URL('http://127.0.0.1:8000/v1/integrations/p8/network-access')
const DEFAULT_PARK_ID = 'local-dev-park'

function ipv4(address = '') {
  const value = address.replace(/^::ffff:/, '')
  return isIPv4(value) ? value : ''
}

function requestJson(url, options, body, timeoutMs) {
  const transport = url.protocol === 'https:' ? https : http
  return new Promise((resolve, reject) => {
    const request = transport.request(url, options, (response) => {
      if (response.statusCode !== 200) {
        response.resume()
        resolve({ status: response.statusCode })
        return
      }
      const chunks = []
      let size = 0
      response.on('data', (chunk) => {
        size += chunk.length
        if (size > 1024 * 1024) request.destroy(new Error('JSON response too large'))
        else chunks.push(chunk)
      })
      response.on('error', reject)
      response.on('end', () => {
        try {
          resolve({ status: response.statusCode, data: JSON.parse(Buffer.concat(chunks).toString('utf8')) })
        } catch (error) {
          reject(error)
        }
      })
    })
    const timeout = setTimeout(() => request.destroy(new Error('JSON request timed out')), timeoutMs)
    request.on('close', () => clearTimeout(timeout))
    request.on('error', reject)
    request.end(body)
  })
}

async function p8UserInfo(url, authorization) {
  const result = await requestJson(url, { method: 'POST', headers: { Authorization: authorization, Version: version, 'Content-Type': 'application/json', 'Content-Length': 2 } }, '{}', 6000)
  if ([401, 403].includes(result.status)) return null
  if (result.status !== 200) throw new Error('P8 user info unavailable')
  const body = result.data
  if (body?.head && body.head.success !== 'true') return null
  const user = body?.head ? body.data : body
  if (typeof user?.id !== 'string' || !P8_USER_ID.test(user.id) || user.id === 'local-dev-user' || String(user.isActivated) === '0') return null
  return user.id
}

async function loadNetworkAccess(token) {
  const { status, data } = await requestJson(ACCESS_URL, { method: 'GET', headers: { Authorization: `Bearer ${token}` } }, undefined, 3000)
  if (status === 404) return { park_id: DEFAULT_PARK_ID, p8_lan_enabled: false, admin_remote_enabled: false }
  if (
    status !== 200 ||
    typeof data?.park_id !== 'string' ||
    !P8_USER_ID.test(data.park_id) ||
    typeof data.p8_lan_enabled !== 'boolean' ||
    typeof data.admin_remote_enabled !== 'boolean' ||
    !Array.isArray(data.p8_client_ips) ||
    !Array.isArray(data.admin_client_ips)
  ) {
    throw new Error('Agent network access unavailable')
  }
  return data
}

function createParkAgentDevProxy(envFile, p8UserInfoUrl, { adminOnly = false } = {}) {
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

    const path = req.url.slice(PREFIX.length)
    const pathname = path.split('?')[0]
    const match = SESSION_PATH.exec(pathname)
    const listing = match && !match[1] && req.method === 'GET'
    const sessionRoute = match && (listing || req.method === (match[1] && !match[2] ? 'GET' : 'POST'))
    const care = CARE_MESSAGES.exec(pathname)
    const careRoute = (care && req.method === (care[1] ? 'POST' : 'GET')) || (CARE_PAUSE.test(pathname) && req.method === 'POST')
    const adminRoute = Boolean(ADMIN_ROUTES[req.method]?.test(pathname))
    if (!adminRoute && (adminOnly || (!sessionRoute && !careRoute))) {
      return reject(404, '未开放此智能体接口')
    }

    const host = req.headers.host || ''
    const scheme = req.socket.encrypted === true ? 'https' : 'http'
    const localIp = ipv4(req.socket.localAddress)
    const peerIp = ipv4(req.socket.remoteAddress)
    const matchesInterface = Boolean(localIp && host.replace(/:\d+$/, '') === localIp)
    const fromLoopback = LOOPBACK.has(req.socket.remoteAddress) && /^(127\.0\.0\.1|localhost)(:\d+)?$/i.test(host)
    const fromThisComputer = fromLoopback || Boolean(identityUrl && matchesInterface && peerIp === localIp)
    if ((req.headers.origin && req.headers.origin !== `${scheme}://${host}`) || (!fromThisComputer && (!matchesInterface || !peerIp))) {
      return reject(403, '此入口要求从本机或已配置的内网地址同源访问')
    }

    if (adminRoute && scheme !== 'https') return reject(403, '远程管理后台需要 HTTPS')
    if (!adminRoute && !fromThisComputer && !identityUrl) return reject(403, '内网助手需要 P8 登录身份核验')
    if (!adminRoute && fromThisComputer && identityUrl && !req.headers.authorization) return reject(401, '请先登录 P8')

    let access
    try {
      access = await loadNetworkAccess(token)
    } catch {
      return reject(502, '无法读取智能体网络访问配置')
    }
    if (adminRoute) {
      if (!access.admin_remote_enabled || !access.admin_client_ips?.includes(peerIp)) return reject(403, '当前设备未获准访问管理后台')
      if (pathname !== '/admin' && !req.headers.authorization) return reject(401, '请登录智能体管理后台')
    } else if (!fromThisComputer && (!access.p8_lan_enabled || !access.p8_client_ips?.includes(peerIp))) {
      return reject(403, '当前设备未获准访问园区助手')
    }

    let userId = 'local-dev-user'
    if (!adminRoute && identityUrl) {
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

    const headers = adminRoute
      ? req.headers.authorization
        ? { Authorization: req.headers.authorization }
        : {}
      : { Authorization: `Bearer ${token}`, 'X-Park-Id': access.park_id, 'X-Enterprise-Id': 'local-dev-enterprise', 'X-User-Id': userId }
    for (const name of ['accept', 'content-type', 'content-length', 'x-park-reply-audio']) {
      if (req.headers[name]) headers[name] = req.headers[name]
    }

    const upstream = http.request({ hostname: '127.0.0.1', port: 8000, path, method: req.method, headers, timeout: 120000 }, (response) => {
      const responseHeaders = { 'Content-Type': response.headers['content-type'] || 'application/json' }
      for (const name of ['cache-control', 'x-accel-buffering', 'content-security-policy', 'x-content-type-options']) {
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

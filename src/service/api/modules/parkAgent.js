const parkAgentBase = '/api/park-agent/v1'
const sessions = `${parkAgentBase}/sessions`

// 后台查询不经过 P8 的全局错误提示，由浮窗在收件箱内呈现失败状态。
export async function requestParkAgentCare(path, { token, controller, body }) {
  const headers = { Accept: 'application/json', Authorization: token }
  const options = { headers, cache: 'no-store', signal: controller.signal }
  if (body !== undefined) {
    options.method = 'POST'
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const response = await fetch(`${parkAgentBase}/care${path}`, options)
    if (!response.ok) {
      const error = new Error('care-http-error')
      error.status = response.status
      throw error
    }
    return await response.json()
  } finally {
    clearTimeout(timeout)
  }
}

// XHR 无法逐段读取响应，这两种会话轮次使用 Fetch 读取 NDJSON 流。
export async function streamParkAgentTurn({ sessionId, kind, input, token, signal, onEvent, speak = false }) {
  const isVoice = kind === 'voice'
  const headers = { Accept: 'application/x-ndjson', 'X-Park-Reply-Audio': speak ? 'on' : 'off' }
  if (token) headers.Authorization = token
  let body
  if (isVoice) {
    body = new FormData()
    body.append('audio', input.blob, input.filename)
  } else {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify({ text: input })
  }
  const url = `${sessions}/${encodeURIComponent(sessionId)}/${isVoice ? 'voice-turns' : 'turns'}`
  const response = await fetch(url, { method: 'POST', headers, body, signal })
  if (!response.ok) {
    const error = new Error('stream-http-error')
    error.response = { status: response.status }
    throw error
  }
  const type = response.headers.get('content-type') || ''
  if (type.includes('application/json')) return response.json()
  if (!type.includes('application/x-ndjson') || !response.body) throw new Error('invalid-stream')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      buffer += done ? decoder.decode() + '\n' : decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()
      for (const line of lines) {
        if (!line.trim()) continue
        const event = JSON.parse(line)
        if (event.type === 'done') return event
        if (event.type === 'error') throw new Error(event.detail || 'stream-failed')
        onEvent(event)
      }
      if (done) throw new Error('stream-incomplete')
    }
  } finally {
    await reader.cancel().catch(() => {})
  }
}

// 由同源 P8 网关验证登录态、识别企业并转发给园区助理。
export const parkAgentApi = {
  parkAgent: [
    { name: 'createSession', method: 'POST', path: sessions, sameOrigin: true, desc: '开启园区助理会话' },
    { name: 'listSessions', method: 'GET', path: sessions, sameOrigin: true, desc: '查询园区助理历史会话' },
    { name: 'getSession', method: 'GET', path: `${sessions}/{sessionId}`, sameOrigin: true, desc: '获取园区助理会话' },
    { name: 'sendText', method: 'POST', path: `${sessions}/{sessionId}/turns`, sameOrigin: true, desc: '发送园区助理文字消息' },
    { name: 'sendVoice', method: 'POST', path: `${sessions}/{sessionId}/voice-turns`, sameOrigin: true, desc: '发送园区助理语音消息' },
    { name: 'finishSession', method: 'POST', path: `${sessions}/{sessionId}/finish`, sameOrigin: true, desc: '结束园区助理会话' },
    { name: 'forwardSession', method: 'POST', path: `${sessions}/{sessionId}/forward`, sameOrigin: true, desc: '转达已结束的园区助理会话' }
  ]
}

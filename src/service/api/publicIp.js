// 外部公网 IP 服务使用独立请求，不附带平台登录凭证。
export async function queryPublicIp() {
  const controller = window.AbortController ? new window.AbortController() : null
  const timer = window.setTimeout(() => controller && controller.abort(), 5000)
  try {
    const response = await window.fetch('https://api.ipify.org?format=json', controller ? { signal: controller.signal } : {})
    if (!response.ok) return ''
    const result = await response.json()
    return String((result && result.ip) || '').trim()
  } catch (error) {
    return ''
  } finally {
    window.clearTimeout(timer)
  }
}

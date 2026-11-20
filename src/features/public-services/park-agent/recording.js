// 管理浏览器录音和麦克风生命周期，输出园区智能体支持的音频格式。
const RECORDING_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg', 'audio/mp4']
const AUDIO_EXTENSIONS = {
  'audio/webm': 'webm',
  'video/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
  'video/mp4': 'm4a'
}

export function canRecordAudio() {
  if (typeof window === 'undefined' || !window.isSecureContext) return false

  const { mediaDevices } = window.navigator
  return typeof mediaDevices?.getUserMedia === 'function' && typeof window.MediaRecorder === 'function'
}

export async function startParkRecording({ onStop, onError }) {
  if (!canRecordAudio()) {
    throw new DOMException('Media recording is unavailable.', 'NotSupportedError')
  }

  const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true })
  const { MediaRecorder } = window
  let recorder
  let chunks = []
  let finishing = false
  let closed = false

  function release() {
    closed = true
    chunks = []
    if (recorder) {
      recorder.ondataavailable = null
      recorder.onerror = null
      recorder.onstop = null
    }
    stream.getTracks().forEach((track) => track.stop())
  }

  function fail(error) {
    if (closed) return
    release()
    onError(error)
  }

  try {
    const mimeType = RECORDING_TYPES.find((type) => MediaRecorder.isTypeSupported?.(type))
    recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
    recorder.ondataavailable = ({ data }) => {
      if (!closed && data.size) chunks.push(data)
    }
    recorder.onerror = (event) => fail(event.error || new DOMException('Recording failed.', 'AbortError'))
    recorder.onstop = () => {
      if (closed) return
      if (!finishing) {
        fail(new DOMException('Recording stopped unexpectedly.', 'AbortError'))
        return
      }
      if (!chunks.length) {
        fail(new DOMException('No recording data.', 'EmptyRecording'))
        return
      }

      const recordingType = recorder.mimeType || chunks[0].type
      const extension = AUDIO_EXTENSIONS[recordingType.split(';')[0].toLowerCase()]
      if (!extension) {
        fail(new DOMException('Unsupported recording format.', 'NotSupportedError'))
        return
      }

      const blob = new Blob(chunks, { type: recordingType })
      release()
      onStop({ blob, filename: `park-message.${extension}` })
    }
    recorder.start()
  } catch (error) {
    release()
    throw error
  }

  return {
    finish() {
      if (closed || finishing) return
      finishing = true
      try {
        if (recorder.state !== 'inactive') recorder.stop()
      } catch (error) {
        fail(error)
      }
    },
    cancel() {
      if (closed) return
      release()
      try {
        if (recorder.state !== 'inactive') recorder.stop()
      } catch {
        // 麦克风轨道已释放。
      }
    }
  }
}

export function recordingErrorMessage(error) {
  switch (error?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return '无法访问麦克风。请在浏览器中允许录音，或改用文字。'
    case 'NotFoundError':
      return '未检测到麦克风。请连接麦克风，或改用文字。'
    case 'NotReadableError':
      return '麦克风暂不可用。请检查设备是否被占用，或改用文字。'
    case 'NotSupportedError':
      return '当前页面无法录音。请使用支持录音的浏览器访问 HTTPS 页面，或改用文字。'
    case 'EmptyRecording':
      return '这次录音没有内容。请重新录制，或改用文字。'
    default:
      return '录音未完成。请重新录制，或改用文字。'
  }
}

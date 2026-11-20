export function createSpeechPlayback(onError) {
  let context
  let source
  let generation = 0
  let pending = Promise.resolve()

  function stop() {
    generation++
    pending = Promise.resolve()
    if (source) source.stop()
    source = null
  }

  return {
    enable() {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return false
      try {
        if (!context) context = new AudioContext()
        if (context.state !== 'running') context.resume().catch(onError)
        return true
      } catch {
        return false
      }
    },
    play(base64) {
      if (!context) return
      const version = generation
      pending = pending
        .then(async () => {
          if (version !== generation) return
          const bytes = Uint8Array.from(window.atob(base64), (character) => character.charCodeAt(0))
          const buffer = await context.decodeAudioData(bytes.buffer)
          if (version !== generation) return
          await new Promise((resolve) => {
            const clip = context.createBufferSource()
            clip.buffer = buffer
            clip.connect(context.destination)
            clip.onended = () => {
              clip.disconnect()
              if (source === clip) source = null
              resolve()
            }
            clip.start()
            source = clip
          })
        })
        .catch(() => {
          if (version === generation) onError()
        })
    },
    stop,
    close() {
      stop()
      if (context) context.close().catch(() => {})
    }
  }
}

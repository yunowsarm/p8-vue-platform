export function createSpeechPlayback(onError) {
  let context
  let stopCurrent

  function stop() {
    stopCurrent?.()
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
    play(base64, onProgress) {
      stop()
      if (!context) return Promise.resolve()

      return new Promise((resolve) => {
        let clip
        let frame
        let started = false

        function finish() {
          if (stopCurrent !== finish) return
          stopCurrent = null
          if (frame !== undefined) window.cancelAnimationFrame(frame)
          if (clip) {
            clip.onended = null
            if (started) clip.stop()
            clip.disconnect()
          }
          resolve()
        }

        stopCurrent = finish
        const startPlayback = async () => {
          const bytes = Uint8Array.from(window.atob(base64), (character) => character.charCodeAt(0))
          const buffer = await context.decodeAudioData(bytes.buffer)
          if (stopCurrent !== finish) return
          if (context.state !== 'running' || !buffer.duration) throw new Error('audio-unavailable')

          clip = context.createBufferSource()
          clip.buffer = buffer
          clip.connect(context.destination)
          clip.onended = () => {
            clip.disconnect()
            clip = null
            finish()
          }
          const startedAt = context.currentTime
          clip.start()
          started = true

          const tick = () => {
            const progress = Math.min(1, (context.currentTime - startedAt) / buffer.duration)
            onProgress(progress)
            if (progress < 1) frame = window.requestAnimationFrame(tick)
          }
          tick()
        }

        startPlayback().catch(() => {
          if (stopCurrent === finish) {
            finish()
            onError()
          }
        })
      })
    },
    stop,
    close() {
      stop()
      if (context) context.close().catch(() => {})
    }
  }
}

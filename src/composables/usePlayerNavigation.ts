import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Player-specific TV navigation composable.
 *
 * When the player is active (fullscreen or focused), this composable intercepts
 * arrow keys and maps them to player controls:
 *   - Left/Right → seek backward/forward
 *   - Up/Down → volume up/down
 *   - Enter/Space → play/pause
 *   - Escape/Backspace → go back
 *   - M → mute/unmute
 *   - F → fullscreen toggle
 *
 * It also manages an auto-hiding control overlay for TV navigation.
 */

export interface PlayerNavOptions {
  /** The RMP player instance getter — call this to get the current player ref */
  getPlayer?: () => any
  /** Callback when user presses back/escape */
  onBack?: () => void
  /** Seek step in seconds */
  seekStep?: number
  /** Volume step (0-1) */
  volumeStep?: number
  /** Auto-hide controls after this many ms (0 = never auto-hide) */
  autoHideMs?: number
  /** Container element selector for the player */
  containerSelector?: string
}

export function usePlayerNavigation(options: PlayerNavOptions = {}) {
  const {
    getPlayer,
    onBack,
    seekStep = 10,
    volumeStep = 0.1,
    autoHideMs = 4000,
    containerSelector = '#rmp-container, #movie-rmp'
  } = options

  const isEnabled = ref(false)
  const controlsVisible = ref(true)
  let autoHideTimer: ReturnType<typeof setTimeout> | null = null

  // ──────────────────────────────────────────────────────
  // Player control helpers
  // ──────────────────────────────────────────────────────
  function getVideoEl(): HTMLVideoElement | null {
    if (containerSelector) {
      const containers = document.querySelectorAll(containerSelector)
      for (const c of containers) {
        const v = c.querySelector('video')
        if (v) return v
      }
    }
    return document.querySelector('video')
  }

  function getPlayerInstance(): any {
    if (getPlayer) {
      try { return getPlayer() } catch { return null }
    }
    return null
  }

  function seekRelative(seconds: number) {
    const player = getPlayerInstance()
    const video = getVideoEl()

    // Try RMP API first
    if (player) {
      try {
        if (typeof player.getCurrentTime === 'function' && typeof player.seek === 'function') {
          const currentTime = player.getCurrentTime()
          const duration = typeof player.getDuration === 'function' ? player.getDuration() : Infinity
          const newTime = Math.max(0, Math.min(currentTime + seconds, duration - 1))
          player.seek(newTime)
          showControls()
          return
        }
      } catch {}
    }

    // Fallback to native video element
    if (video) {
      const newTime = Math.max(0, Math.min(video.currentTime + seconds, video.duration - 1))
      video.currentTime = newTime
      showControls()
    }
  }

  function togglePlayPause() {
    const player = getPlayerInstance()
    const video = getVideoEl()

    if (player) {
      try {
        if (typeof player.togglePlayPause === 'function') {
          player.togglePlayPause()
          showControls()
          return
        }
        if (typeof player.pause === 'function' && typeof player.play === 'function') {
          const paused = typeof player.getPaused === 'function' ? player.getPaused() : true
          if (paused) player.play()
          else player.pause()
          showControls()
          return
        }
      } catch {}
    }

    if (video) {
      if (video.paused) video.play()
      else video.pause()
      showControls()
    }
  }

  function changeVolume(delta: number) {
    const video = getVideoEl()
    if (video) {
      video.volume = Math.max(0, Math.min(1, video.volume + delta))
      showControls()
    }
  }

  function toggleMute() {
    const player = getPlayerInstance()
    const video = getVideoEl()

    if (player) {
      try {
        if (typeof player.toggleMute === 'function') {
          player.toggleMute()
          showControls()
          return
        }
      } catch {}
    }

    if (video) {
      video.muted = !video.muted
      showControls()
    }
  }

  function toggleFullscreen() {
    const container = containerSelector
      ? document.querySelector(containerSelector)
      : document.querySelector('#rmp-container') || document.querySelector('#movie-rmp')

    if (!container) return

    if (document.fullscreenElement) {
      document.exitFullscreen?.()
    } else {
      (container as HTMLElement).requestFullscreen?.()
    }
    showControls()
  }

  // ──────────────────────────────────────────────────────
  // Controls visibility
  // ──────────────────────────────────────────────────────
  function showControls() {
    controlsVisible.value = true
    resetAutoHide()
  }

  function hideControls() {
    controlsVisible.value = false
  }

  function resetAutoHide() {
    if (autoHideTimer) clearTimeout(autoHideTimer)
    if (autoHideMs > 0) {
      autoHideTimer = setTimeout(() => {
        controlsVisible.value = false
      }, autoHideMs)
    }
  }

  // ──────────────────────────────────────────────────────
  // Keyboard handler
  // ──────────────────────────────────────────────────────
  function handleKeyDown(event: KeyboardEvent) {
    if (!isEnabled.value) return

    // Only handle if video is actually present
    const video = getVideoEl()
    if (!video) return

    switch (event.key) {
      case 'ArrowLeft':
        seekRelative(-seekStep)
        event.preventDefault()
        event.stopPropagation()
        break
      case 'ArrowRight':
        seekRelative(seekStep)
        event.preventDefault()
        event.stopPropagation()
        break
      case 'ArrowUp':
        changeVolume(volumeStep)
        event.preventDefault()
        event.stopPropagation()
        break
      case 'ArrowDown':
        changeVolume(-volumeStep)
        event.preventDefault()
        event.stopPropagation()
        break
      case 'Enter':
      case ' ':
        togglePlayPause()
        event.preventDefault()
        event.stopPropagation()
        break
      case 'Escape':
      case 'Backspace':
        onBack?.()
        event.preventDefault()
        event.stopPropagation()
        break
      case 'm':
      case 'M':
        toggleMute()
        event.preventDefault()
        event.stopPropagation()
        break
      case 'f':
      case 'F':
        toggleFullscreen()
        event.preventDefault()
        event.stopPropagation()
        break
      default:
        // Any key press shows controls
        showControls()
        return
    }
  }

  // ──────────────────────────────────────────────────────
  // Lifecycle
  // ──────────────────────────────────────────────────────
  const enable = () => {
    if (isEnabled.value) return
    isEnabled.value = true
    // Use capture phase with high priority to intercept before TV navigation
    document.addEventListener('keydown', handleKeyDown, true)
    showControls()
  }

  const disable = () => {
    isEnabled.value = false
    document.removeEventListener('keydown', handleKeyDown, true)
    if (autoHideTimer) {
      clearTimeout(autoHideTimer)
      autoHideTimer = null
    }
  }

  onMounted(() => {
    // Don't auto-enable - let the player views control this
  })

  onUnmounted(() => {
    disable()
  })

  return {
    isEnabled,
    controlsVisible,
    enable,
    disable,
    showControls,
    hideControls,
    seekRelative,
    togglePlayPause,
    changeVolume,
    toggleMute,
    toggleFullscreen
  }
}

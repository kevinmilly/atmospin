/**
 * Background music manager — uses HTMLAudioElement (better for looping tracks
 * than AudioContext which is optimised for short SFX).
 */

let themeEl: HTMLAudioElement | null = null
let gameEl: HTMLAudioElement | null = null
let fadeTimer: ReturnType<typeof setInterval> | null = null
let _muted = false

const MUTE_KEY = 'atmospin_muted'
// Restore muted state from localStorage
if (typeof localStorage !== 'undefined') {
  _muted = localStorage.getItem(MUTE_KEY) === '1'
}

function clearFade() {
  if (fadeTimer !== null) { clearInterval(fadeTimer); fadeTimer = null }
}

function fadeOut(el: HTMLAudioElement, onDone?: () => void) {
  clearFade()
  fadeTimer = setInterval(() => {
    if (el.volume > 0.04) {
      el.volume = Math.max(0, el.volume - 0.04)
    } else {
      el.volume = 0
      el.pause()
      clearFade()
      onDone?.()
    }
  }, 60)
}

function fadeIn(el: HTMLAudioElement, targetVolume: number) {
  if (_muted) return
  clearFade()
  el.volume = 0
  el.play().catch(() => {/* autoplay blocked, silently skip */})
  fadeTimer = setInterval(() => {
    if (el.volume < targetVolume - 0.04) {
      el.volume = Math.min(targetVolume, el.volume + 0.04)
    } else {
      el.volume = targetVolume
      clearFade()
    }
  }, 60)
}

export const music = {
  /** Play theme song (home screen). Fades in, loops. */
  startTheme() {
    if (!themeEl) {
      themeEl = new Audio('/sounds/theme.mp3')
      themeEl.loop = true
    }
    if (!themeEl.paused) return
    fadeIn(themeEl, 0.45)
  },

  /** Fade out theme and optionally start game music after. */
  stopTheme(startGame = false) {
    if (!themeEl || themeEl.paused) {
      if (startGame) music.startGame()
      return
    }
    fadeOut(themeEl, () => {
      if (startGame) music.startGame()
    })
  },

  /** Play in-game ambient track. Fades in, loops. */
  startGame() {
    if (!gameEl) {
      gameEl = new Audio('/sounds/game.mp3')
      gameEl.loop = true
    }
    if (!gameEl.paused) return
    fadeIn(gameEl, 0.35)
  },

  get isMuted() { return _muted },

  /** Toggle mute — pauses all audio immediately; restores on unmute. */
  toggleMute() {
    _muted = !_muted
    localStorage.setItem(MUTE_KEY, _muted ? '1' : '0')
    if (_muted) {
      themeEl?.pause()
      gameEl?.pause()
    }
    // On unmute, callers are responsible for resuming via startTheme/startGame
    return _muted
  },

  /** Fade out in-game music. */
  stopGame(restoreTheme = false) {
    if (!gameEl || gameEl.paused) {
      if (restoreTheme) music.startTheme()
      return
    }
    fadeOut(gameEl, () => {
      if (restoreTheme) music.startTheme()
    })
  },
}

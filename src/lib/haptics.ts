function vibrate(pattern: number | number[]) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

export const haptics = {
  pin: () => vibrate(50),
  lockIn: () => vibrate([50, 50, 100]),
  correct: () => vibrate([50, 30, 100, 30, 150]),
  incorrect: () => vibrate(300),
  streak: () => vibrate([50, 30, 50, 30, 50, 30, 200]),
}

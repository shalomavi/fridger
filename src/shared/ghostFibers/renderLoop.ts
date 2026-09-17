// Drives the requestAnimationFrame loop, throttled to a target fps and
// paused whenever the canvas is off-screen, the tab is hidden, the caller
// asks for it, or the user prefers reduced motion.

type RenderLoopOptions = {
  render: () => void
  setTime: (seconds: number) => void
}

export type RenderLoop = {
  start: () => void
  setPaused: (value: boolean) => void
  setVisible: (value: boolean) => void
  setPageVisible: (value: boolean) => void
  setFrameRate: (value: number) => void
  dispose: () => void
}

export function createRenderLoop({ render, setTime }: RenderLoopOptions): RenderLoop {
  let frameId = 0
  let elapsed = 0
  let previousTime = performance.now()
  let lastRenderTime = 0
  let frameRate = 60
  let isPaused = false
  let isVisible = true
  let isPageVisible = !document.hidden
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  const canAnimate = () => isVisible && isPageVisible && !isPaused && !reducedMotion.matches

  const stop = () => {
    if (frameId !== 0) cancelAnimationFrame(frameId)
    frameId = 0
  }

  const loop = (now: number) => {
    frameId = 0
    if (!canAnimate()) return

    const delta = Math.min((now - previousTime) / 1000, 0.1)
    previousTime = now
    elapsed += delta

    if (now - lastRenderTime >= 1000 / frameRate - 0.5) {
      setTime(elapsed)
      render()
      lastRenderTime = now
    }

    frameId = requestAnimationFrame(loop)
  }

  const start = () => {
    if (!canAnimate() || frameId !== 0) return
    previousTime = performance.now()
    frameId = requestAnimationFrame(loop)
  }

  const sync = () => {
    if (canAnimate()) start()
    else {
      stop()
      render()
    }
  }

  reducedMotion.addEventListener('change', sync)

  return {
    start,
    setPaused: (value) => {
      isPaused = value
      sync()
    },
    setVisible: (value) => {
      isVisible = value
      sync()
    },
    setPageVisible: (value) => {
      isPageVisible = value
      sync()
    },
    setFrameRate: (value) => {
      frameRate = Math.min(Math.max(value, 1), 120)
    },
    dispose: () => {
      stop()
      reducedMotion.removeEventListener('change', sync)
    }
  }
}

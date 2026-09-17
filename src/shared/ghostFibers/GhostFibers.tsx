import { useEffect, useRef, type FC } from 'react'
import { createGhostFibersScene, type GhostFibersScene } from './scene'
import { applyProps } from './uniforms'
import type { GhostFibersProps } from './types'

const defaultProps: Required<Omit<GhostFibersProps, 'className'>> = {
  lineColor: '#140E35',
  glowColor: '#3437A0',
  backdropColor: '#120F17',
  speed: 0.2,
  scale: 2,
  rotation: 0,
  rotationSpeed: 0.25,
  layers: 4,
  waveAmplitude: 0.015,
  waveFrequency: 3,
  waveSpeed: 0.15,
  layerSpeed: 0.08,
  twist: 0.1,
  twistFrequency: 5,
  twistSpeed: 1.2,
  lineFrequency: 5,
  lineSpacing: 2,
  lineSharpness: 16,
  glowFalloff: 10,
  glowIntensity: 1.6,
  brightness: 2,
  blueBoost: 1.25,
  vignette: 0.8,
  grain: 0.05,
  lightMode: false,
  dpr: 1,
  fps: 60,
  paused: false
}

// backdropColor has no single sensible default: it must be light for
// lightMode and dark otherwise, so an explicit prop wins but an unset one
// falls back per-mode instead of always defaulting to the dark value.
const lightBackdropDefault = '#FFFFFF'

const GhostFibers: FC<GhostFibersProps> = (props) => {
  const merged = { ...defaultProps, ...props }
  if (props.backdropColor === undefined) {
    merged.backdropColor = merged.lightMode ? lightBackdropDefault : defaultProps.backdropColor
  }
  const containerRef = useRef<HTMLDivElement | null>(null)
  const sceneRef = useRef<GhostFibersScene | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = createGhostFibersScene(container, merged.dpr)
    sceneRef.current = scene
    applyProps(scene.uniforms, merged)
    scene.render()

    return () => {
      scene.dispose()
      sceneRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merged.dpr])

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    applyProps(scene.uniforms, merged)
    scene.renderLoop.setFrameRate(merged.fps)
    scene.renderLoop.setPaused(merged.paused)
    scene.render()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    merged.lineColor,
    merged.glowColor,
    merged.backdropColor,
    merged.speed,
    merged.scale,
    merged.rotation,
    merged.rotationSpeed,
    merged.layers,
    merged.waveAmplitude,
    merged.waveFrequency,
    merged.waveSpeed,
    merged.layerSpeed,
    merged.twist,
    merged.twistFrequency,
    merged.twistSpeed,
    merged.lineFrequency,
    merged.lineSpacing,
    merged.lineSharpness,
    merged.glowFalloff,
    merged.glowIntensity,
    merged.brightness,
    merged.blueBoost,
    merged.vignette,
    merged.grain,
    merged.lightMode,
    merged.fps,
    merged.paused
  ])

  // No default position class here: Tailwind's stylesheet defines .relative
  // after .absolute, so a hardcoded "relative" would always beat a caller's
  // "absolute" override regardless of className order. Let the caller own
  // positioning entirely.
  return <div ref={containerRef} className={`h-full w-full overflow-hidden ${props.className ?? ''}`.trim()} />
}

export default GhostFibers

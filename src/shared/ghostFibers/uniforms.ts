import { hexToRgb, setColor } from './color'
import type { GhostFibersProps } from './types'

// Defaults mirror the prop defaults in GhostFibers.tsx — kept here so the
// initial Program is created with the same values the first prop-sync pass
// would apply, avoiding a one-frame flash of "wrong" uniforms.
export function createUniforms() {
  return {
    uResolution: { value: new Float32Array([1, 1]) },
    uTime: { value: 0 },
    uSpeed: { value: 0.2 },
    uScale: { value: 2 },
    uRotation: { value: 0 },
    uRotationSpeed: { value: 0.25 },
    uLayers: { value: 4 },
    uWaveAmplitude: { value: 0.015 },
    uWaveFrequency: { value: 3 },
    uWaveSpeed: { value: 0.15 },
    uLayerSpeed: { value: 0.08 },
    uTwist: { value: 0.1 },
    uTwistFrequency: { value: 5 },
    uTwistSpeed: { value: 1.2 },
    uLineFrequency: { value: 5 },
    uLineSpacing: { value: 2 },
    uLineSharpness: { value: 16 },
    uGlowFalloff: { value: 10 },
    uGlowIntensity: { value: 1.6 },
    uBrightness: { value: 2 },
    uBlueBoost: { value: 1.25 },
    uVignette: { value: 0.8 },
    uGrain: { value: 0.05 },
    uLightMode: { value: 0 },
    uLineColor: { value: new Float32Array(hexToRgb('#140E35')) },
    uGlowColor: { value: new Float32Array(hexToRgb('#3437A0')) }
  }
}

export type GhostFibersUniforms = ReturnType<typeof createUniforms>

export function applyProps(uniforms: GhostFibersUniforms, props: Required<Omit<GhostFibersProps, 'className'>>) {
  setColor(uniforms.uLineColor, props.lineColor)
  setColor(uniforms.uGlowColor, props.glowColor)
  uniforms.uSpeed.value = props.speed
  uniforms.uScale.value = props.scale
  uniforms.uRotation.value = props.rotation
  uniforms.uRotationSpeed.value = props.rotationSpeed
  uniforms.uLayers.value = Math.min(Math.max(Math.round(props.layers), 1), 10)
  uniforms.uWaveAmplitude.value = props.waveAmplitude
  uniforms.uWaveFrequency.value = props.waveFrequency
  uniforms.uWaveSpeed.value = props.waveSpeed
  uniforms.uLayerSpeed.value = props.layerSpeed
  uniforms.uTwist.value = props.twist
  uniforms.uTwistFrequency.value = props.twistFrequency
  uniforms.uTwistSpeed.value = props.twistSpeed
  uniforms.uLineFrequency.value = props.lineFrequency
  uniforms.uLineSpacing.value = props.lineSpacing
  uniforms.uLineSharpness.value = props.lineSharpness
  uniforms.uGlowFalloff.value = props.glowFalloff
  uniforms.uGlowIntensity.value = props.glowIntensity
  uniforms.uBrightness.value = props.brightness
  uniforms.uBlueBoost.value = props.blueBoost
  uniforms.uVignette.value = props.vignette
  uniforms.uGrain.value = props.grain
  uniforms.uLightMode.value = props.lightMode ? 1 : 0
}

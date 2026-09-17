import { Mesh, Program, Renderer, Triangle } from 'ogl'
import { fragment, vertex } from './shaders'
import { createRenderLoop } from './renderLoop'
import { createUniforms, type GhostFibersUniforms } from './uniforms'

export type GhostFibersScene = {
  uniforms: GhostFibersUniforms
  render: () => void
  renderLoop: ReturnType<typeof createRenderLoop>
  dispose: () => void
}

function createRenderer(container: HTMLDivElement, dpr: number) {
  const renderer = new Renderer({
    webgl: 2,
    alpha: false,
    antialias: false,
    dpr: Math.min(Math.max(dpr, 0.5), 2)
  })
  const gl = renderer.gl
  const canvas = gl.canvas as HTMLCanvasElement
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.display = 'block'
  canvas.setAttribute('aria-hidden', 'true')
  container.appendChild(canvas)
  return { renderer, gl, canvas }
}

// Builds the WebGL renderer/program/mesh, wires up resize + visibility
// observers, and returns a handle the component effect can drive and tear
// down. Kept out of the component so the mount effect stays short.
export function createGhostFibersScene(container: HTMLDivElement, dpr: number): GhostFibersScene {
  const { renderer, gl, canvas } = createRenderer(container, dpr)
  const geometry = new Triangle(gl)
  const uniforms = createUniforms()
  const program = new Program(gl, { vertex, fragment, uniforms })
  const mesh = new Mesh(gl, { geometry, program })

  const render = () => renderer.render({ scene: mesh })
  const renderLoop = createRenderLoop({ render, setTime: (t) => (uniforms.uTime.value = t) })

  const setSize = () => {
    const rect = container.getBoundingClientRect()
    renderer.setSize(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)))
    uniforms.uResolution.value[0] = gl.drawingBufferWidth
    uniforms.uResolution.value[1] = gl.drawingBufferHeight
    render()
  }

  const resizeObserver = new ResizeObserver(setSize)
  resizeObserver.observe(container)

  const intersectionObserver = new IntersectionObserver(([entry]) => renderLoop.setVisible(entry.isIntersecting), {
    threshold: 0
  })
  intersectionObserver.observe(container)

  const handleVisibility = () => renderLoop.setPageVisible(!document.hidden)
  document.addEventListener('visibilitychange', handleVisibility)

  setSize()
  renderLoop.start()

  const dispose = () => {
    renderLoop.dispose()
    resizeObserver.disconnect()
    intersectionObserver.disconnect()
    document.removeEventListener('visibilitychange', handleVisibility)
    if (canvas.parentNode === container) container.removeChild(canvas)
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }

  return { uniforms, render, renderLoop, dispose }
}

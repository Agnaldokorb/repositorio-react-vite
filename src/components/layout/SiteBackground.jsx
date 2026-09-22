import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const fragmentShader = `
  precision mediump float;

  uniform vec2 iResolution;
  uniform float iTime;

  varying vec2 vUv;

  mat2 rotation(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat2(c, -s, s, c);
  }

  float map(vec3 p) {
    p.xz *= rotation(iTime * 0.4);
    p.xy *= rotation(iTime * 0.3);

    vec3 q = p * 2.0 + iTime;

    return length(p + vec3(sin(iTime * 0.7)))
      * log(length(p) + 1.0)
      + sin(q.x + sin(q.z + sin(q.y))) * 0.5
      - 1.0;
  }

  void main() {
    vec2 fragCoord = vUv * iResolution;

    vec2 uv = (
      fragCoord - 0.5 * iResolution
    ) / min(iResolution.x, iResolution.y);

    vec3 color = vec3(0.0);
    float distanceTravelled = 2.5;

    for (int i = 0; i <= 5; i++) {
      vec3 p = vec3(0.0, 0.0, 5.0)
        + normalize(vec3(uv, -1.0)) * distanceTravelled;

      float result = map(p);

      float intensity = clamp(
        (result - map(p + 0.1)) * 0.5,
        -0.1,
        1.0
      );

      vec3 base = vec3(0.1, 0.3, 0.4)
        + vec3(5.0, 2.5, 3.0) * intensity;

      color = color * base
        + (1.0 - smoothstep(0.0, 2.5, result)) * 0.7 * base;

      distanceTravelled += min(result, 1.0);
    }

    float centerDistance = distance(
      fragCoord,
      iResolution * 0.5
    );

    float radius = min(iResolution.x, iResolution.y) * 0.5;

    float dim = smoothstep(
      radius * 0.3,
      radius * 0.5,
      centerDistance
    );

    color = mix(color * 0.3, color, dim);

    gl_FragColor = vec4(color, 1.0);
  }
`

export default function SiteBackground() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let renderer

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: false,
        powerPreference: 'low-power',
      })
    } catch {
      // O gradiente CSS continua visível se WebGL não estiver disponível.
      return
    }

    const canvas = renderer.domElement
    canvas.style.display = 'block'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    container.appendChild(canvas)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(1, 1) },
    }

    const geometry = new THREE.PlaneGeometry(2, 2)

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthTest: false,
      depthWrite: false,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )

    let previousTime = null
    let elapsed = 0

    function renderFrame(time) {
      if (previousTime !== null) {
        elapsed += Math.min((time - previousTime) / 1000, 0.1)
      }

      previousTime = time

      // Velocidade mais suave para um fundo usado durante a leitura.
      uniforms.iTime.value = elapsed * 0.35
      renderer.render(scene, camera)
    }

    function updateAnimation() {
      renderer.setAnimationLoop(null)
      previousTime = null

      if (document.hidden) return

      if (reducedMotion.matches) {
        renderer.render(scene, camera)
        return
      }

      renderer.setAnimationLoop(renderFrame)
    }

    function resize() {
      const width = Math.max(container.clientWidth, 1)
      const height = Math.max(container.clientHeight, 1)

      // Evita renderizar em resoluções excessivas em telas de alta densidade.
      const maxPixels = 2_000_000
      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        1.5,
        Math.sqrt(maxPixels / (width * height)),
      )

      renderer.setPixelRatio(pixelRatio)
      renderer.setSize(width, height, false)

      uniforms.iResolution.value.set(width, height)

      if (!document.hidden) {
        renderer.render(scene, camera)
      }
    }

    function handleContextLost(event) {
      event.preventDefault()
      renderer.setAnimationLoop(null)
      canvas.style.visibility = 'hidden'
    }

    function handleContextRestored() {
      canvas.style.visibility = 'visible'
      resize()
      updateAnimation()
    }

    const observer = new ResizeObserver(resize)
    observer.observe(container)

    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', updateAnimation)
    reducedMotion.addEventListener('change', updateAnimation)
    canvas.addEventListener('webglcontextlost', handleContextLost)
    canvas.addEventListener('webglcontextrestored', handleContextRestored)

    resize()
    updateAnimation()

    return () => {
      observer.disconnect()

      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', updateAnimation)
      reducedMotion.removeEventListener('change', updateAnimation)
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      canvas.removeEventListener('webglcontextrestored', handleContextRestored)

      renderer.setAnimationLoop(null)

      scene.remove(mesh)
      geometry.dispose()
      material.dispose()
      renderer.dispose()

      canvas.remove()
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 25% 30%, #403060, #142338 55%, #080811)',
        }}
      />

      {/* Usa a cor do tema para preservar a leitura do conteúdo. */}
      <div className="absolute inset-0 bg-background/50" />
    </div>
  )
}
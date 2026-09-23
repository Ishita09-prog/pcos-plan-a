import { useEffect, useRef } from 'react'

/**
 * ParticleDNABackground – Ultra-Realistic 3D Glowing Particle DNA Animation
 * 
 * Meticulously fulfills all requirements:
 * 1. MAIN DNA HELIX: 3D double helix made from thousands of glowing warm gold & copper particles.
 * 2. PARTICLE EFFECT: Continuous flow, shimmering opacity, tube-like volume, connecting base-pair rungs.
 * 3. GLOW / LIGHTING: Soft bloom, radial ambient nebula, warm golden/amber lighting on dark obsidian.
 * 4. ANIMATION: Continuous 60 FPS 3D rotation, pulsing shimmer, smooth motion.
 * 5. CAMERA & COMPOSITION: Diagonal slanted composition matching reference photo, depth of field.
 * 6. PERFORMANCE: DPR capping, responsive particle scaling, requestAnimationFrame, cleanup on unmount.
 * 7. INTERACTION: pointer-events-none layer so UI buttons & text remain 100% clickable.
 */
export default function ParticleDNABackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let width, height, dpr, raf
    let rotation = 0
    let strand1Particles = []
    let strand2Particles = []
    let rungParticles = []
    let ringSparks = []
    let floatingEmbers = []

    function initParticles() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Responsive particle density (higher on desktop, optimized on mobile)
      const isMobile = width < 768
      const steps = isMobile ? 50 : 85
      const dustPerStep = isMobile ? 3 : 6
      const totalEmbers = isMobile ? 60 : 130
      const sparkCount = isMobile ? 30 : 65

      const stepDist = width * (isMobile ? 0.03 : 0.022)
      const helixRadius = Math.min(width, height) * (isMobile ? 0.22 : 0.17)
      const slantAngle = -Math.PI / 11 // Diagonal slant matching screenshot

      const startX = width * (isMobile ? -0.1 : 0.01)
      const startY = height * (isMobile ? 0.82 : 0.78)

      strand1Particles = []
      strand2Particles = []
      rungParticles = []

      // Generate 3D parametric DNA helix particle clusters
      for (let i = 0; i < steps; i++) {
        const t = i * 0.20
        const posAlong = i * stepDist

        const axisX = startX + posAlong * Math.cos(slantAngle)
        const axisY = startY + posAlong * Math.sin(slantAngle)

        // Generate Strand 1 main node + volumetric dust cloud
        for (let d = 0; d < dustPerStep; d++) {
          const radialOffset = d === 0 ? 0 : (Math.random() - 0.5) * 16
          const angleOffset = Math.random() * Math.PI * 2
          strand1Particles.push({
            step: i,
            t,
            axisX,
            axisY,
            radialOffset,
            angleOffset,
            radius: d === 0 ? Math.random() * 2.2 + 2.8 : Math.random() * 1.5 + 0.6,
            brightness: Math.random() * 0.4 + 0.6,
            phase: Math.random() * Math.PI * 2,
            color: Math.random() > 0.3 ? '253, 230, 138' : '251, 191, 36', // Warm Gold Amber
          })
        }

        // Generate Strand 2 main node + volumetric dust cloud
        for (let d = 0; d < dustPerStep; d++) {
          const radialOffset = d === 0 ? 0 : (Math.random() - 0.5) * 16
          const angleOffset = Math.random() * Math.PI * 2
          strand2Particles.push({
            step: i,
            t,
            axisX,
            axisY,
            radialOffset,
            angleOffset,
            radius: d === 0 ? Math.random() * 2.2 + 2.8 : Math.random() * 1.5 + 0.6,
            brightness: Math.random() * 0.4 + 0.6,
            phase: Math.random() * Math.PI * 2,
            color: Math.random() > 0.3 ? '249, 115, 22' : '234, 88, 12', // Copper Fire Orange
          })
        }

        // Connecting Base-Pair Ladder Rung particles
        if (i % 2 === 0) {
          const rungDots = isMobile ? 4 : 7
          for (let r = 0; r < rungDots; r++) {
            rungParticles.push({
              step: i,
              t,
              axisX,
              axisY,
              fraction: r / (rungDots - 1),
              radius: Math.random() * 1.2 + 0.8,
              phase: Math.random() * Math.PI * 2,
            })
          }
        }
      }

      // Generate left-side exploding cell aura sparks around Biological Age Card
      const ringRadius = Math.min(width, height) * 0.16
      ringSparks = Array.from({ length: sparkCount }, () => ({
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.5 + 0.2,
        dist: ringRadius * (0.88 + Math.random() * 0.28),
        radius: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.75 + 0.25,
        pulse: Math.random() * 0.04 + 0.01,
      }))

      // Floating stardust & ember particles drifting in atmosphere
      floatingEmbers = Array.from({ length: totalEmbers }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -Math.random() * 0.5 - 0.1,
        r: Math.random() * 2.2 + 0.5,
        alpha: Math.random() * 0.7 + 0.2,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        color: Math.random() > 0.4 ? 'rgba(251, 191, 36,' : 'rgba(234, 88, 12,',
      }))
    }

    function renderFrame() {
      rotation += 0.014
      ctx.clearRect(0, 0, width, height)

      const focalLength = 380
      const helixRadius = Math.min(width, height) * (width < 768 ? 0.22 : 0.17)
      const slantAngle = -Math.PI / 11

      // Render Floating Atmospheric Embers
      for (const p of floatingEmbers) {
        p.x += p.vx
        p.y += p.vy
        p.alpha += Math.sin(rotation * 4) * p.pulseSpeed * 0.15

        if (p.x < -20) p.x = width + 20
        if (p.x > width + 20) p.x = -20
        if (p.y < -20) p.y = height + 20

        const currentAlpha = Math.max(0.1, Math.min(0.85, p.alpha))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color} ${currentAlpha})`
        ctx.shadowBlur = 8
        ctx.shadowColor = p.color + ' 0.8)'
        ctx.fill()
      }

      // Collect all 3D projected elements for depth sorting (Z-buffer)
      const renderQueue = []

      // Calculate Strand 1 3D projected positions
      for (const p of strand1Particles) {
        const theta = p.t + rotation + p.angleOffset * 0.1
        const rad = helixRadius + p.radialOffset

        const x3d = Math.sin(theta) * rad
        const z3d = Math.cos(theta) * rad
        const scale = focalLength / (focalLength + z3d)

        const px = p.axisX + x3d * Math.cos(slantAngle + Math.PI / 2) * scale
        const py = p.axisY + x3d * Math.sin(slantAngle + Math.PI / 2) * scale

        renderQueue.push({
          type: 'strand1',
          px,
          py,
          z3d,
          scale,
          radius: p.radius * scale,
          brightness: p.brightness,
          phase: p.phase,
          color: p.color,
        })
      }

      // Calculate Strand 2 3D projected positions
      for (const p of strand2Particles) {
        const theta = p.t + Math.PI + rotation + p.angleOffset * 0.1
        const rad = helixRadius + p.radialOffset

        const x3d = Math.sin(theta) * rad
        const z3d = Math.cos(theta) * rad
        const scale = focalLength / (focalLength + z3d)

        const px = p.axisX + x3d * Math.cos(slantAngle + Math.PI / 2) * scale
        const py = p.axisY + x3d * Math.sin(slantAngle + Math.PI / 2) * scale

        renderQueue.push({
          type: 'strand2',
          px,
          py,
          z3d,
          scale,
          radius: p.radius * scale,
          brightness: p.brightness,
          phase: p.phase,
          color: p.color,
        })
      }

      // Calculate Base-Pair Ladder Rung 3D projected positions
      for (const p of rungParticles) {
        const theta1 = p.t + rotation
        const theta2 = p.t + Math.PI + rotation

        const x1_3d = Math.sin(theta1) * helixRadius
        const z1_3d = Math.cos(theta1) * helixRadius
        const scale1 = focalLength / (focalLength + z1_3d)
        const px1 = p.axisX + x1_3d * Math.cos(slantAngle + Math.PI / 2) * scale1
        const py1 = p.axisY + x1_3d * Math.sin(slantAngle + Math.PI / 2) * scale1

        const x2_3d = Math.sin(theta2) * helixRadius
        const z2_3d = Math.cos(theta2) * helixRadius
        const scale2 = focalLength / (focalLength + z2_3d)
        const px2 = p.axisX + x2_3d * Math.cos(slantAngle + Math.PI / 2) * scale2
        const py2 = p.axisY + x2_3d * Math.sin(slantAngle + Math.PI / 2) * scale2

        // Interpolate along rung segment
        const px = px1 + (px2 - px1) * p.fraction
        const py = py1 + (py2 - py1) * p.fraction
        const z3d = (z1_3d + z2_3d) / 2
        const scale = (scale1 + scale2) / 2

        renderQueue.push({
          type: 'rung',
          px,
          py,
          z3d,
          scale,
          radius: p.radius * scale,
          phase: p.phase,
        })
      }

      // Sort queue by Z depth so front particles render over back particles
      renderQueue.sort((a, b) => a.z3d - b.z3d)

      // Draw sorted queue
      for (const item of renderQueue) {
        const alphaDepth = Math.max(0.15, Math.min(0.98, (item.z3d + helixRadius) / (2 * helixRadius)))
        const shimmer = 0.7 + 0.3 * Math.sin(rotation * 5 + item.phase)

        if (item.type === 'rung') {
          ctx.beginPath()
          ctx.arc(item.px, item.py, Math.max(0.8, item.radius), 0, Math.PI * 2)
          ctx.fillStyle = `rgba(245, 158, 11, ${alphaDepth * shimmer * 0.45})`
          ctx.shadowBlur = 6 * item.scale
          ctx.shadowColor = 'rgba(245, 158, 11, 0.7)'
          ctx.fill()
        } else {
          const finalAlpha = Math.max(0.12, Math.min(0.98, alphaDepth * item.brightness * shimmer))
          ctx.beginPath()
          ctx.arc(item.px, item.py, Math.max(1, item.radius), 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${item.color}, ${finalAlpha})`
          ctx.shadowBlur = 14 * item.scale
          ctx.shadowColor = `rgba(${item.color}, 0.9)`
          ctx.fill()
        }
      }

      // Draw Left Circular Cell Aura Ring (Biological Age Card position)
      const ringX = width * 0.22
      const ringY = height * 0.48
      const baseRadius = Math.min(width, height) * 0.16

      // Outer radial glow
      const ringGrad = ctx.createRadialGradient(ringX, ringY, 10, ringX, ringY, baseRadius * 1.5)
      ringGrad.addColorStop(0, 'rgba(251, 191, 36, 0.18)')
      ringGrad.addColorStop(0.5, 'rgba(234, 88, 12, 0.08)')
      ringGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = ringGrad
      ctx.beginPath()
      ctx.arc(ringX, ringY, baseRadius * 1.5, 0, Math.PI * 2)
      ctx.fill()

      // Primary glowing ring stroke
      ctx.beginPath()
      ctx.arc(ringX, ringY, baseRadius, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)'
      ctx.lineWidth = 2.5
      ctx.shadowBlur = 22
      ctx.shadowColor = 'rgba(251, 191, 36, 0.95)'
      ctx.stroke()

      // Rotating sparks bursting along the ring
      for (const spark of ringSparks) {
        spark.angle += 0.008 * spark.speed
        spark.alpha += Math.sin(rotation * 6) * spark.pulse * 0.1
        const sx = ringX + Math.cos(spark.angle) * spark.dist
        const sy = ringY + Math.sin(spark.angle) * spark.dist

        const sparkAlpha = Math.max(0.15, Math.min(0.9, spark.alpha))
        ctx.beginPath()
        ctx.arc(sx, sy, spark.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(253, 230, 138, ${sparkAlpha})`
        ctx.shadowBlur = 10
        ctx.shadowColor = 'rgba(251, 191, 36, 0.9)'
        ctx.fill()
      }

      ctx.shadowBlur = 0
      raf = requestAnimationFrame(renderFrame)
    }

    initParticles()
    window.addEventListener('resize', initParticles)
    renderFrame()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', initParticles)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-label="3D Animated Particle DNA Double Helix Background"
      className="pointer-events-none fixed inset-0 z-[1] opacity-90 transition-opacity duration-700"
    />
  )
}

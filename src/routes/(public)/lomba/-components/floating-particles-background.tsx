import * as React from "react";

export function FloatingParticlesBackground() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking with silky-smooth interpolation and blooming radius
    const mouse = {
      targetX: -9999,
      targetY: -9999,
      currentX: -9999,
      currentY: -9999,
      targetRadius: 0,
      currentRadius: 0,
      targetOpacity: 0,
      currentOpacity: 0,
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handlePointerMove = (e: PointerEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.targetRadius = 180;
      mouse.targetOpacity = 0.35; // Subtle delicate phantom shadow, not overpowering
      if (mouse.currentX < -1000) {
        mouse.currentX = e.clientX;
        mouse.currentY = e.clientY;
      }
    };

    const handlePointerLeave = () => {
      mouse.targetOpacity = 0;
      mouse.targetRadius = 0;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerleave", handlePointerLeave);

    // 1. HIGHLIGHTED LARON / FIREFLY AMBIENT PARTICLES
    const particleCount = 48;
    const laronParticles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 1.0,
      speedX: (Math.random() - 0.5) * 0.32,
      speedY: -Math.random() * 0.45 - 0.12, // Floating gently upward
      opacity: Math.random() * 0.55 + 0.25,
      pulseOffset: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.006,
      isTwinkle: Math.random() > 0.65, // Twinkling cross sparkle
    }));

    // Grid spacing for the Antigravity mouse hover matrix
    const gridSpacing = 28;
    let startTime = performance.now();

    const render = (time: number) => {
      const elapsed = (time - startTime) * 0.001;

      ctx.clearRect(0, 0, width, height);

      // =========================================================================
      // LAYER A: SUBTLE ANTIGRAVITY SQUARE GRID MOUSE HOVER MATRIX (BAYANGAN HALUS)
      // =========================================================================
      mouse.currentX += (mouse.targetX - mouse.currentX) * 0.12;
      mouse.currentY += (mouse.targetY - mouse.currentY) * 0.12;
      mouse.currentRadius += (mouse.targetRadius - mouse.currentRadius) * 0.08;
      mouse.currentOpacity += (mouse.targetOpacity - mouse.currentOpacity) * 0.06;

      if (mouse.currentOpacity > 0.01 && mouse.currentRadius > 5 && mouse.currentX > -500) {
        const mx = mouse.currentX;
        const my = mouse.currentY;
        const radius = mouse.currentRadius;
        const rSq = radius * radius;

        const startCol = Math.max(0, Math.floor((mx - radius) / gridSpacing));
        const endCol = Math.min(Math.ceil(width / gridSpacing), Math.ceil((mx + radius) / gridSpacing));
        const startRow = Math.max(0, Math.floor((my - radius) / gridSpacing));
        const endRow = Math.min(Math.ceil(height / gridSpacing), Math.ceil((my + radius) / gridSpacing));

        for (let col = startCol; col <= endCol; col++) {
          const px = col * gridSpacing;
          const dx = px - mx;
          const dxSq = dx * dx;

          for (let row = startRow; row <= endRow; row++) {
            const py = row * gridSpacing;
            const dy = py - my;
            const distSq = dxSq + dy * dy;

            if (distSq < rSq) {
              const dist = Math.sqrt(distSq);
              const norm = dist / radius; // 0 at center, 1 at edge

              // Cosine falloff: brightest right under mouse, smoothly tapering to 0 at perimeter
              const falloff = Math.cos(norm * (Math.PI / 2));
              const intensity = falloff * falloff * mouse.currentOpacity;

              // Delicate square dimensions: ~1.4px at periphery up to ~2.8px at center
              const size = 1.4 + falloff * 1.5;
              const half = size / 2;

              // Subtle golden shadow palette (Tema Royal Gold: #f5cf68, #d4af37, #8c6d23 - TANPA WARNA PUTIH)
              if (norm < 0.25) {
                ctx.fillStyle = `rgba(245, 207, 104, ${Math.min(0.48, intensity * 1.15)})`;
              } else if (norm < 0.65) {
                ctx.fillStyle = `rgba(212, 175, 55, ${intensity * 0.85})`;
              } else {
                ctx.fillStyle = `rgba(140, 109, 35, ${intensity * 0.55})`;
              }

              ctx.fillRect(px - half, py - half, size, size);
            }
          }
        }
      }

      // =========================================================================
      // LAYER B: HIGHLIGHTED LARON FIREFLIES (PARTIKEL UTAMA BERKILAU EMAS TEMA)
      // =========================================================================
      for (let i = 0; i < laronParticles.length; i++) {
        const p = laronParticles[i];

        // Harmonic organic swaying
        p.x += p.speedX + Math.sin(elapsed * 0.75 + p.pulseOffset) * 0.25;
        p.y += p.speedY;

        // Wrap around viewport boundaries
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Warm pulsing glow
        const pulse = Math.sin(elapsed * 1.8 + p.pulseOffset);
        const currentOpacity = Math.max(0.12, Math.min(0.85, p.opacity + pulse * 0.22));

        // Draw soft glowing firefly mote
        ctx.beginPath();
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.8);
        grad.addColorStop(0, `rgba(245, 207, 104, ${currentOpacity})`);
        grad.addColorStop(0.4, `rgba(212, 175, 55, ${currentOpacity * 0.55})`);
        grad.addColorStop(1, "rgba(212, 175, 55, 0)");

        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.radius * 2.8, 0, Math.PI * 2);
        ctx.fill();

        // Twinkling cross sparkle accent in theme gold
        if (p.isTwinkle && currentOpacity > 0.4) {
          const starLen = p.radius * 1.8;
          ctx.strokeStyle = `rgba(245, 207, 104, ${currentOpacity * 0.75})`;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(p.x - starLen, p.y);
          ctx.lineTo(p.x + starLen, p.y);
          ctx.moveTo(p.x, p.y - starLen);
          ctx.lineTo(p.x, p.y + starLen);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{ zIndex: 0 }}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Overlay Path Titik-Titik Halus (Sesuai Gaya di Intro) */}
      <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1.2px,_transparent_1.2px)] [background-size:28px_28px] opacity-10 pointer-events-none" />

      {/* Canvas Layer: Laron Fireflies Highlight + Antigravity Smooth Square Grid Shadow */}
      <canvas
        ref={canvasRef}
        style={{ zIndex: 0 }}
        className="absolute inset-0 pointer-events-none z-0"
      />
    </div>
  );
}

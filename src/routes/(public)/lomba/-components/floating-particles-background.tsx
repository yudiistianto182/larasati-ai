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

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Create 45 ambient warm firefly/laron motes
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.8,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.5 - 0.1, // Float gently upwards
      opacity: Math.random() * 0.6 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      hue: Math.random() > 0.3 ? 42 : 35, // Gold / Warm Amber
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += Math.sin(Date.now() * p.pulseSpeed) * 0.005;

        // Wrap around boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentOpacity = Math.max(0.1, Math.min(0.8, p.opacity));

        // Draw soft glowing particle
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
        gradient.addColorStop(0, `hsla(${p.hue}, 85%, 65%, ${currentOpacity})`);
        gradient.addColorStop(0.5, `hsla(${p.hue}, 80%, 50%, ${currentOpacity * 0.4})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 80%, 40%, 0)`);

        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-75"
    />
  );
}

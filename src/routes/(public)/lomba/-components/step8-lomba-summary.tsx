import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { playCtaClickSound, playTransitionChime } from "./lomba-sound-effects";
import type { KasusSimulasi } from "@/routes/(admin)/dashboard/master/kasus/-components/data";

interface Step8LombaSummaryProps {
  groupName?: string;
  kasus?: KasusSimulasi;
  hasAudioRecorder?: boolean;
}

// Canvas Fireworks & Confetti Component
function CelebratoryCanvas() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

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

    // Particle classes
    interface ConfettiPiece {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      shape: "rect" | "circle" | "star";
    }

    interface FireworkSpark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      decay: number;
      size: number;
    }

    interface FireworkRocket {
      x: number;
      y: number;
      targetY: number;
      speed: number;
      color: string;
      exploded: boolean;
    }

    const GOLD_COLORS = ["#fde047", "#d4af37", "#facc15", "#fef08a", "#fffbeb", "#ca8a04"];
    const ACCENT_COLORS = ["#38bdf8", "#4ade80", "#fb7185", "#c084fc", "#fde047"];
    const ALL_COLORS = [...GOLD_COLORS, ...ACCENT_COLORS];

    const confettiList: ConfettiPiece[] = [];
    const sparksList: FireworkSpark[] = [];
    const rocketsList: FireworkRocket[] = [];

    // Initialize 60 gentle confetti pieces
    for (let i = 0; i < 60; i++) {
      confettiList.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        size: Math.random() * 8 + 5,
        color: ALL_COLORS[Math.floor(Math.random() * ALL_COLORS.length)],
        speedX: (Math.random() - 0.5) * 2.2,
        speedY: Math.random() * 2 + 1.2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 4,
        opacity: Math.random() * 0.7 + 0.3,
        shape: Math.random() > 0.4 ? "rect" : Math.random() > 0.5 ? "circle" : "star",
      });
    }

    const spawnFirework = () => {
      const startX = Math.random() * (width * 0.7) + width * 0.15;
      const targetY = Math.random() * (height * 0.35) + height * 0.1;
      const color = ALL_COLORS[Math.floor(Math.random() * ALL_COLORS.length)];
      rocketsList.push({
        x: startX,
        y: height,
        targetY,
        speed: Math.random() * 3 + 7,
        color,
        exploded: false,
      });
    };

    const explodeRocket = (rocket: FireworkRocket) => {
      const sparkCount = Math.floor(Math.random() * 25) + 35;
      for (let i = 0; i < sparkCount; i++) {
        const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.3;
        const speed = Math.random() * 4.5 + 1.5;
        sparksList.push({
          x: rocket.x,
          y: rocket.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() > 0.3 ? rocket.color : "#fff8db",
          alpha: 1,
          decay: Math.random() * 0.015 + 0.012,
          size: Math.random() * 2.5 + 1.5,
        });
      }
    };

    // Initial bursts
    setTimeout(spawnFirework, 150);
    setTimeout(spawnFirework, 650);
    setTimeout(spawnFirework, 1200);

    let fireworkTimer = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      fireworkTimer++;
      if (fireworkTimer % 120 === 0 && Math.random() > 0.25) {
        spawnFirework();
      }

      // 1. Update & Draw Rockets
      for (let i = rocketsList.length - 1; i >= 0; i--) {
        const r = rocketsList[i];
        r.y -= r.speed;
        r.speed *= 0.985;

        // Trail spark
        ctx.fillStyle = r.color;
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (r.y <= r.targetY || r.speed < 1.5) {
          explodeRocket(r);
          rocketsList.splice(i, 1);
        }
      }

      // 2. Update & Draw Sparks
      for (let i = sparksList.length - 1; i >= 0; i--) {
        const s = sparksList[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.05; // gravity
        s.vx *= 0.98;
        s.alpha -= s.decay;

        if (s.alpha <= 0) {
          sparksList.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, s.alpha);
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. Update & Draw Confetti
      for (const c of confettiList) {
        c.y += c.speedY;
        c.x += c.speedX;
        c.rotation += c.rotationSpeed;

        if (c.y > height + 20) {
          c.y = -20;
          c.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate((c.rotation * Math.PI) / 180);
        ctx.globalAlpha = c.opacity;
        ctx.fillStyle = c.color;

        if (c.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, c.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (c.shape === "rect") {
          ctx.fillRect(-c.size / 2, -c.size / 3, c.size, c.size * 0.6);
        } else {
          // Sparkle Diamond
          ctx.beginPath();
          ctx.moveTo(0, -c.size);
          ctx.lineTo(c.size / 2, 0);
          ctx.lineTo(0, c.size);
          ctx.lineTo(-c.size / 2, 0);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
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
      className="fixed inset-0 pointer-events-none z-20 size-full"
      style={{ opacity: 0.95 }}
    />
  );
}

export function Step8LombaSummary({
  groupName = "Kelompok Peserta",
}: Step8LombaSummaryProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center justify-center select-none animate-in fade-in zoom-in-95 duration-500 text-[#fef08a] my-auto">
      {/* 1. Celebratory Fireworks & Confetti Dynamic Canvas FX */}
      <CelebratoryCanvas />

      {/* 2. Main Grand Hero Trophy Card (Clean & Elegant) */}
      <div className="relative z-30 w-full rounded-3xl border-2 border-[#fde047]/80 bg-gradient-to-b from-[#2a1a0e]/95 via-[#1a1108]/95 to-[#100b06]/98 p-8 sm:p-12 text-center shadow-[0_0_60px_rgba(212,175,55,0.35)] overflow-hidden flex flex-col items-center">
        {/* Radiant Ambient Aureole */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-[radial-gradient(ellipse_at_top,_#eab308_0%,_transparent_70%)] opacity-35 pointer-events-none" />

        {/* Floating Golden Trophy Crest */}
        <div className="relative mb-5 flex size-20 sm:size-24 items-center justify-center rounded-full bg-gradient-to-tr from-[#8c6d23] via-[#fde047] to-[#d4af37] text-[#140e09] shadow-[0_0_40px_rgba(253,224,71,0.6)] animate-bounce">
          <Trophy className="size-10 sm:size-12 stroke-[2.5]" />
        </div>

        {/* Top Badges */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
          <Badge className="bg-gradient-to-r from-[#8c6d23] to-[#d4af37] text-[#14100c] font-black text-xs px-3.5 py-1 uppercase tracking-widest shadow-md">
            Larasati Journey Selesai
          </Badge>
          <Badge
            variant="outline"
            className="border-[#fde047]/60 text-[#fde047] bg-[#140e08] text-xs font-mono px-3 py-1"
          >
            5 dari 5 Pos Terverifikasi
          </Badge>
        </div>

        {/* Title & Celebration Statement */}
        <h1 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl uppercase tracking-wide bg-gradient-to-r from-[#fffbeb] via-[#fde047] to-[#ca8a04] bg-clip-text text-transparent drop-shadow-md leading-tight max-w-xl mx-auto mt-1">
          Selamat! Anda Telah Menyelesaikan Larasati Journey
        </h1>

        <p className="text-xs sm:text-sm text-[#e6cf9b] max-w-lg mx-auto mt-4 leading-relaxed">
          Seluruh rangkaian 5 pos simulasi OSCE kebidanan telah berhasil dituntaskan dengan baik oleh{" "}
          <strong className="text-[#fde047] font-serif underline decoration-[#d4af37] decoration-2 underline-offset-4">
            {groupName}
          </strong>
          . Data transkrip wawancara, identifikasi faktor risiko, prosedur SOP, serta asuhan klinis telah berhasil terekam dan dikirimkan ke dewan penguji.
        </p>

        {/* Action Button to Return */}
        <div className="mt-8 flex items-center justify-center w-full max-w-xs">
          <Button
            nativeButton={false}
            size="lg"
            onClick={() => {
              playCtaClickSound();
              playTransitionChime();
            }}
            className="w-full h-12 px-8 rounded-2xl bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] font-serif font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(212,175,55,0.45)] hover:brightness-115 border border-[#fff8db]/70 gap-2 cursor-pointer active:scale-98 transition-all"
            render={<Link to="/dashboard/contest" />}
          >
            <span>Kembali ke Dashboard Lomba</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

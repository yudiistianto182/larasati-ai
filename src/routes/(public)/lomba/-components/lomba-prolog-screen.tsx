import * as React from "react";
import {
  ArrowRight,
  BookOpen,
  Crown,
  Flame,
  Heart,
  Quote,
  Shield,
  Sparkles,
  Volume2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { playCtaClickSound, playTransitionChime } from "./lomba-sound-effects";

interface LombaPrologScreenProps {
  onProceed: () => void;
}

const PROLOG_PARAGRAPHS = [
  {
    id: 1,
    theme: "Kelahiran Sang Tokoh",
    icon: Crown,
    text: "Pada masa ketika candi berdiri megah dan kerajaan menjadi pusat kehidupan, hiduplah seorang perempuan bernama Larasati.",
    emphasis: "Larasati",
  },
  {
    id: 2,
    theme: "Keanggunan & Ketajaman Pikir",
    icon: Sparkles,
    text: "Ia dikenal bukan hanya karena keanggunannya, tetapi juga karena ketajaman pikirannya, keberaniannya, serta kepeduliannya terhadap kehidupan perempuan di sekelilingnya.",
    emphasis: "ketajaman pikiran & keberanian",
  },
  {
    id: 3,
    theme: "Makna Kekuatan Sejati",
    icon: Shield,
    text: "Bagi Larasati, kekuatan sejati bukanlah tentang siapa yang paling kuat mengangkat senjata. Kekuatan adalah kemampuan untuk melihat sesuatu yang sering tidak terlihat, mengenali bahaya sebelum terlambat, dan berusaha menyelamatkan kehidupan.",
    emphasis: "kemampuan melihat bahaya sebelum terlambat",
  },
  {
    id: 4,
    theme: "Kebangkitan Semangat",
    icon: Heart,
    text: "Semangat itulah yang kini hidup kembali dalam diri seorang bidan.",
    emphasis: "hidup kembali dalam diri seorang bidan",
  },
  {
    id: 5,
    theme: "Larasati Masa Kini",
    icon: Flame,
    text: "Larasati masa kini tidak lagi memasuki medan perjuangan dengan busur dan anak panah. Ia hadir sebagai seorang bidan yang membawa pengetahuan, keterampilan, dan keberanian. LARASATI JOURNEY, sebuah perjalanan klinis melalui lima pos. Setiap pos adalah bagian dari perjalanan seorang bidan dalam menjaga kesehatan perempuan khususnya untuk melakukan deteksi dini kanker serviks.",
    emphasis: "LARASATI JOURNEY — 5 Pos Deteksi Dini",
  },
];

export function LombaPrologScreen({ onProceed }: LombaPrologScreenProps) {
  const [activeStoryIndex, setActiveStoryIndex] = React.useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = React.useState<boolean>(true);

  // Auto-advance through story cards every 6.5 seconds if autoplay is on
  React.useEffect(() => {
    if (!isAutoPlay) return;

    const timer = setInterval(() => {
      setActiveStoryIndex((prev) => {
        if (prev < PROLOG_PARAGRAPHS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 6500);

    return () => clearInterval(timer);
  }, [isAutoPlay]);



  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 select-none overflow-x-hidden">
      {/* Dynamic Keyframe Animations for Majestic Floating & Breathing Zoom */}
      <style>{`
        @keyframes prologFloatUpDown {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-18px) scale(1.06);
          }
        }
        @keyframes prologAuraPulse {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.95);
          }
          50% {
            opacity: 0.75;
            transform: scale(1.18);
          }
        }
        @keyframes prologShimmerText {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes prologRayRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Atmospheric Background Layer with Sacred Javanese Palatial Motif */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0704] via-[#140d07] to-[#080503]" />

        {/* Radial ambient spotlights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,_#d4af37_0%,_transparent_70%)] opacity-20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-[radial-gradient(circle,_#8c6d23_0%,_transparent_70%)] opacity-15 blur-2xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-[radial-gradient(circle,_#ca8a04_0%,_transparent_70%)] opacity-15 blur-2xl pointer-events-none" />

        {/* Subtle patterned overlay grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,_transparent_1px)] [background-size:32px_32px] opacity-10" />
      </div>

      {/* Top Header Navigation Bar */}
      <header className="relative z-20 w-full max-w-6xl flex items-center justify-between py-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-gradient-to-tr from-[#8c6d23] to-[#d4af37] text-[#14100c] flex items-center justify-center shadow-lg font-serif font-black">
            <Crown className="size-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-sm sm:text-base font-extrabold bg-gradient-to-r from-[#fffbeb] via-[#fde047] to-[#ca8a04] bg-clip-text text-transparent tracking-wider">
              LARASATI JOURNEY
            </span>
            <span className="text-[10px] text-[#d4af37]/80 font-mono">
              Prolog &bull; Larasati Journey
            </span>
          </div>
        </div>

        {/* Skip to Login Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            playCtaClickSound();
            playTransitionChime();
            onProceed();
          }}
          className="h-9 px-4 text-xs font-serif font-semibold rounded-xl bg-[#20150b]/80 border border-[#8c6d23]/70 text-[#fde047] hover:bg-[#342416] hover:text-[#fff8db] hover:border-[#d4af37] shadow-md gap-1.5 cursor-pointer transition-all active:scale-95"
        >
          <span>Lewati ke Login</span>
          <ArrowRight className="size-3.5" />
        </Button>
      </header>

      {/* Main Prologue Hero Stage Card */}
      <main className="relative z-10 w-full max-w-6xl overflow-hidden rounded-3xl border-2 border-[#8c6d23]/60 bg-[#120c07]/95 shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.2)] backdrop-blur-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">

          {/* ============================================================ */}
          {/* LEFT COLUMN: HERO ARTWORK LARASATI DENGAN ANIMASI ATAS-BAWAH & ZOOM IN/OUT */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center p-6 sm:p-10 border-b lg:border-b-0 lg:border-r border-[#8c6d23]/40 bg-gradient-to-b from-[#24170d] via-[#180f08] to-[#0d0804] overflow-hidden">

            {/* Ambient Pulsing Aura Halo Behind Larasati */}
            <div
              style={{ animation: "prologAuraPulse 5s ease-in-out infinite" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-80 sm:size-96 rounded-full bg-[radial-gradient(circle,_#d4af37_0%,_#854d0e_50%,_transparent_75%)] blur-2xl pointer-events-none opacity-40"
            />

            {/* Floating and Breathing Zoom Medallion */}
            <div
              style={{
                animation: "prologFloatUpDown 6s ease-in-out infinite",
                transformOrigin: "center center",
              }}
              className="relative flex flex-col items-center justify-center my-auto transition-transform"
            >
              {/* Grand Ornate Golden Oval Arch Frame */}
              <div className="relative rounded-[50%/42%] border-3 border-[#d4af37] bg-gradient-to-b from-[#3a2512] via-[#20150a] to-[#120d07] shadow-[0_0_45px_rgba(212,175,55,0.5),inset_0_0_20px_rgba(212,175,55,0.3)] ring-4 ring-[#8c6d23]/40 overflow-hidden w-60 sm:w-72 md:w-80 aspect-[4/5] flex items-center justify-center group">

                {/* Larasati Image with subtle continuous zoom effect */}
                <img
                  src="/images/larasati.png"
                  alt="Larasati"
                  className="w-full h-full object-cover object-top filter brightness-110 contrast-105 transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = "/images/ny_ani_patient_torso.jpg";
                  }}
                />

                {/* Golden Gradient Fog at Bottom of Oval */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#140e08] via-[#140e08]/70 to-transparent pointer-events-none" />

                {/* Inner Glow Border Ring */}
                <div className="absolute inset-0 rounded-[50%/42%] border border-[#fff8db]/30 pointer-events-none" />
              </div>

              {/* Character Title Badge Under Frame */}
              <div className="mt-4 flex flex-col items-center text-center">
                <Badge className="bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] font-serif font-black text-xs px-4 py-1 shadow-lg tracking-widest uppercase border border-[#fff8db]/50">
                  LARASATI
                </Badge>
                <span className="text-[11px] text-[#e6d59c]/80 font-serif italic mt-1">
                  Simbol Keberanian & Penjaga Kehidupan
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN: PROLOGUE NARRATION & CINEMATIC STORY EXPERIENCE */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 lg:p-10 text-[#f3e5ab] bg-[#140e08]/85">

            {/* Story Header */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-wider bg-gradient-to-r from-[#fff8db] via-[#fde047] to-[#ca8a04] bg-clip-text text-transparent leading-tight">
                LARASATI JOURNEY
              </h1>

              <h2 className="text-sm sm:text-base font-serif font-bold text-[#d4af37] mt-1 flex items-center gap-2">
                <span>Perjalanan Sang Penjaga Kesehatan Perempuan</span>
              </h2>

              <div className="w-full h-px bg-gradient-to-r from-[#8c6d23]/80 via-[#d4af37]/40 to-transparent my-4" />
            </div>

            {/* Active Narrative Card Section */}
            <div className="my-auto flex flex-col gap-4">

              {/* Highlighted Quote Box for the Active Chapter */}
              <div className="relative rounded-2xl border-2 border-[#8c6d23]/60 bg-gradient-to-br from-[#22160d] via-[#1c120a] to-[#140d07] p-5 sm:p-6 shadow-xl overflow-hidden transition-all duration-500">
                {/* Decorative Giant Watermark Quote */}
                <Quote className="absolute -bottom-4 -right-4 size-24 text-[#d4af37]/10 pointer-events-none rotate-12" />

                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {React.createElement(PROLOG_PARAGRAPHS[activeStoryIndex].icon, {
                      className: "size-4 text-[#d4af37]",
                    })}
                    <span className="font-serif text-xs font-extrabold text-[#fde047] uppercase tracking-wider">
                      {PROLOG_PARAGRAPHS[activeStoryIndex].theme}
                    </span>
                  </div>
                </div>

                <p className="font-serif text-sm sm:text-base text-[#fff8db] leading-relaxed text-justify relative z-10 drop-shadow-sm font-medium">
                  &ldquo;{PROLOG_PARAGRAPHS[activeStoryIndex].text}&rdquo;
                </p>
              </div>

              {/* Interactive Paragraph Selectors / Timeline Dots */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  {PROLOG_PARAGRAPHS.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setIsAutoPlay(false);
                        setActiveStoryIndex(idx);
                      }}
                      className={cn(
                        "h-2 rounded-full transition-all cursor-pointer",
                        activeStoryIndex === idx
                          ? "w-8 bg-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.7)]"
                          : "w-2.5 bg-[#8c6d23]/40 hover:bg-[#8c6d23]",
                      )}
                      title={`Buka Bagian ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className="text-[10px] text-[#d4af37]/80 hover:text-[#fff8db] transition-colors flex items-center gap-1 font-mono cursor-pointer"
                >
                  <Volume2 className="size-3 text-[#d4af37]" />
                  <span>{isAutoPlay ? "Narasi Otomatis: ON" : "Narasi Manual"}</span>
                </button>
              </div>

              {/* Climax Callout Box (Always visible at the climax of journey) */}
              <div className="rounded-xl border border-[#d4af37]/40 bg-[#26180c]/60 p-3.5 flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="font-serif text-xs sm:text-sm font-black text-[#f9f586] tracking-wide">
                    Bersiaplah… Hari ini, kalianlah Larasati itu…
                  </span>
                  <span className="text-[11px] text-[#e6d59c]/80">
                    Buktikan dedikasi, ketelitian, dan keahlian asuhan klinis Anda di 5 stase ujian.
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Action Row: Proceed to Login / Start Journey */}
            <div className="pt-4 border-t border-[#8c6d23]/30 flex flex-col sm:flex-row items-end justify-between gap-3 mt-4">
              <Button
                type="button"
                size="lg"
                onClick={() => {
                  playCtaClickSound();
                  playTransitionChime();
                  onProceed();
                }}
                className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] text-xs font-serif font-black tracking-widest uppercase shadow-[0_0_25px_rgba(212,175,55,0.45)] hover:brightness-115 transition-all cursor-pointer border border-[#fff8db]/70 gap-2 active:scale-98 group"
              >
                <span>Mulai Larasati Journey</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

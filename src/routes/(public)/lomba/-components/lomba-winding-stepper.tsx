import * as React from "react";
import { cn } from "@/lib/utils";

interface LombaWindingStepperProps {
  currentStep: number; // 2 is Pos 1, 3 is Pos 2, etc.
  totalStase?: number;
  onSelectStase?: (posNumber: number) => void;
}

export function LombaWindingStepper({
  currentStep,
  totalStase = 6,
  onSelectStase,
}: LombaWindingStepperProps) {
  const currentPos = currentStep - 1; // 1 to 6
  const visiblePositions = Array.from({ length: totalStase }, (_, i) => i + 1);

  return (
    <div className="relative w-full rounded-2xl border border-[#8c6d23]/40 bg-[#140e08]/90 px-6 py-4 shadow-lg select-none">
      {/* Dynamic Keyframes for Track Glow and Smooth Pulse */}
      <style>{`
        @keyframes dashTravelGold {
          to { stroke-dashoffset: -20; }
        }
        @keyframes activePosBlink {
          0%, 100% {
            box-shadow: 0 0 10px rgba(212,175,55,0.4), inset 0 0 8px rgba(255,248,219,0.3);
            border-color: #8c6d23;
          }
          50% {
            box-shadow: 0 0 24px rgba(212,175,55,0.95), inset 0 0 14px rgba(255,248,219,0.8);
            border-color: #fff8db;
          }
        }
      `}</style>

      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#2b1c0e_0%,_#100b07_100%)] opacity-85 pointer-events-none rounded-2xl" />

      <div className="relative z-10 flex items-center justify-between gap-2 sm:gap-4 overflow-x-auto py-1 scrollbar-none">
        {visiblePositions.map((posNumber, idx) => {
          const isCurrent = currentPos === posNumber;
          const isPassed = currentPos > posNumber;
          const isNext = currentPos < posNumber;

          return (
            <React.Fragment key={posNumber}>
              {/* Station Node (Minimalist Circular / Rounded Angka Aja) */}
              <button
                type="button"
                onClick={() => onSelectStase?.(posNumber)}
                className="relative flex flex-col items-center justify-center transition-transform duration-300 shrink-0 cursor-pointer group focus:outline-none"
              >
                {/* Node Box */}
                <div
                  style={
                    isCurrent
                      ? { animation: "activePosBlink 2.2s ease-in-out infinite" }
                      : undefined
                  }
                  className={cn(
                    "flex size-10 sm:size-11 items-center justify-center rounded-full border-2 transition-all duration-300 shadow-md",
                    isCurrent
                      ? "bg-gradient-to-br from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] scale-110 ring-2 ring-[#d4af37]/60"
                      : isPassed
                        ? "border-[#d4af37] bg-gradient-to-br from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                        : "border-[#8c6d23]/35 bg-[#1a120a] text-[#8c6d23]/70 opacity-60 group-hover:opacity-100 group-hover:border-[#d4af37]/60",
                  )}
                >
                  <span className="font-serif font-black text-sm sm:text-base tracking-tighter">
                    {posNumber}
                  </span>
                </div>
              </button>

              {/* Connecting Curved Golden Track Path */}
              {idx < visiblePositions.length - 1 && (
                <div className="flex-1 min-w-[20px] max-w-[120px] flex items-center justify-center relative px-0.5">
                  <svg
                    viewBox="0 0 60 16"
                    fill="none"
                    className="w-full h-4 text-[#8c6d23]/40"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id={`goldTrackGrad-${idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8c6d23" />
                        <stop offset="50%" stopColor="#d4af37" />
                        <stop offset="100%" stopColor="#8c6d23" />
                      </linearGradient>
                    </defs>

                    {/* Base Background Path */}
                    <path
                      d={idx % 2 === 0 ? "M 0 11 Q 30 2 60 8" : "M 0 5 Q 30 14 60 8"}
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-[#8c6d23]/25"
                    />

                    {/* Animated Golden Spline */}
                    <path
                      d={idx % 2 === 0 ? "M 0 11 Q 30 2 60 8" : "M 0 5 Q 30 14 60 8"}
                      stroke={`url(#goldTrackGrad-${idx})`}
                      strokeWidth={isPassed || currentPos === idx + 1 ? "2.5" : "1.5"}
                      strokeDasharray="5 5"
                      style={{
                        animation: "dashTravelGold 1.2s linear infinite",
                      }}
                      className={cn(
                        isPassed || currentPos === idx + 1
                          ? "opacity-100"
                          : "opacity-30",
                      )}
                    />
                  </svg>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

import * as React from "react";
import {
  Activity,
  Radio,
  User,
  Volume2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AiVideoAvatarProps {
  patientName?: string;
  patientAge?: number | string;
  patientSubtitle?: string;
  patientParity?: string;
  avatarImageUrl?: string;
  avatarUrl?: string;
  backgroundImageUrl?: string;
  backgroundUrl?: string;
  isSpeaking: boolean;
  isListening?: boolean;
  isAiThinking?: boolean;
  theme?: "default" | "wayang";
  onReplayVoice?: () => void;
}

export function AiVideoAvatar({
  patientName = "Ny. Ani",
  patientAge = 29,
  patientSubtitle,
  patientParity = "G2P1A0",
  avatarImageUrl,
  avatarUrl = "/images/ny_ani_patient_torso.jpg",
  backgroundImageUrl,
  backgroundUrl = "/images/puskesmas_clinic_empty.jpg",
  isSpeaking,
  isListening = false,
  isAiThinking = false,
  theme = "default",
  onReplayVoice,
}: AiVideoAvatarProps) {
  const [callDurationSeconds, setCallDurationSeconds] = React.useState(0);

  const effectiveAvatar = avatarImageUrl || avatarUrl;
  const effectiveBg = backgroundImageUrl || backgroundUrl;
  const isWayang = theme === "wayang";

  // Call timer simulation
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCallDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "relative flex h-full min-h-[400px] w-full flex-col justify-between overflow-hidden rounded-2xl border shadow-lg select-none",
        isWayang
          ? "border-[#8c6d23]/50 bg-[#120c08] text-[#f3e5ab]"
          : "border-border/80 bg-neutral-950 text-white",
      )}
    >
      {/* Background: Empty Puskesmas Consultation Room */}
      <div className="absolute inset-0 z-0">
        <img
          src={effectiveBg}
          alt="Puskesmas Consultation Room Background"
          className="h-full w-full object-cover object-center filter brightness-[0.65] contrast-[1.1]"
          onError={(e) => {
            (e.target as HTMLElement).style.display = "none";
          }}
        />
        <div
          className={cn(
            "absolute inset-0",
            isWayang
              ? "bg-gradient-to-t from-[#120c08]/90 via-[#1a110a]/40 to-[#120c08]/70"
              : "bg-gradient-to-t from-black/85 via-black/25 to-black/65",
          )}
        />
      </div>

      {/* Top Bar: High Contrast LIVE REC badge & Timer */}
      <div className="relative z-10 flex items-center justify-between p-3.5">
        <div className="flex items-center gap-2">
          {/* Sharp High-Contrast LIVE REC Badge */}
          <div className="flex items-center gap-1.5 rounded-md bg-red-600 px-2 py-0.5 text-white font-bold text-[10px] tracking-wider uppercase shadow-sm">
            <span className="size-1.5 rounded-full bg-white animate-ping" />
            <span>LIVE REC</span>
          </div>

          <span className="font-mono text-xs font-bold text-white drop-shadow-md">
            {formatTimer(callDurationSeconds)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn(
              "font-medium text-[10px] border backdrop-blur-md",
              isWayang
                ? "bg-[#1f150c]/80 text-[#f3e5ab] border-[#8c6d23]/50"
                : "bg-black/60 text-white border-white/15",
            )}
          >
            Puskesmas Poli KIA
          </Badge>
        </div>
      </div>

      {/* Center: Large Rounded-Rectangle Patient Avatar */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-4">
        <div className="relative flex items-center justify-center">
          {/* Speaking Glowing Ring Wave */}
          {isSpeaking && (
            <div
              className={cn(
                "absolute -inset-2.5 rounded-3xl animate-pulse blur-md",
                isWayang ? "bg-[#d4af37]/40" : "bg-blue-500/30",
              )}
            />
          )}

          {/* Listening Pulse */}
          {isListening && (
            <div
              className={cn(
                "absolute -inset-2.5 rounded-3xl animate-pulse blur-md",
                isWayang ? "bg-[#d4af37]/30" : "bg-emerald-500/30",
              )}
            />
          )}

          {/* Large Rounded-Rectangle Avatar Frame */}
          <div
            className={cn(
              "relative w-[260px] sm:w-[300px] aspect-4/3 overflow-hidden rounded-2xl sm:rounded-3xl border-2 shadow-2xl transition-all duration-300 bg-neutral-900",
              isSpeaking
                ? isWayang
                  ? "border-[#fff8db] ring-4 ring-[#d4af37]/60 scale-102 shadow-[0_0_25px_rgba(212,175,55,0.5)]"
                  : "border-blue-400 ring-4 ring-blue-500/40 scale-102"
                : isListening
                  ? isWayang
                    ? "border-[#d4af37] ring-4 ring-[#d4af37]/40"
                    : "border-emerald-400 ring-4 ring-emerald-500/40"
                  : isWayang
                    ? "border-[#8c6d23]/60 ring-1 ring-black/60"
                    : "border-white/30 ring-1 ring-black/40",
            )}
          >
            <img
              src={effectiveAvatar}
              alt={patientName}
              className="h-full w-full object-cover object-top"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />

            {/* Fallback Placeholder */}
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-neutral-800 to-neutral-900 text-white">
              <User className="size-20 opacity-60" />
            </div>

            {/* Patient Name Badge overlay on avatar */}
            <div
              className={cn(
                "absolute bottom-2 left-2 right-2 rounded-xl backdrop-blur-md px-3 py-1.5 border flex items-center justify-between",
                isWayang
                  ? "bg-[#19110a]/85 border-[#8c6d23]/40"
                  : "bg-black/75 border-white/10",
              )}
            >
              <div className="flex flex-col">
                <span className="font-bold text-xs text-white leading-tight">
                  {patientName}{" "}
                  <span className="text-[11px] font-normal text-white/80">
                    ({patientAge} th)
                  </span>
                </span>
                <span
                  className={cn(
                    "text-[10px] font-medium leading-tight",
                    isWayang ? "text-[#d4af37]" : "text-blue-300",
                  )}
                >
                  {patientSubtitle || `${patientParity} • Pasien Konsultasi`}
                </span>
              </div>

              {isSpeaking && (
                <div className="flex items-center gap-0.5">
                  <div
                    className={cn(
                      "w-1 h-3 rounded-full animate-bounce delay-75",
                      isWayang ? "bg-[#d4af37]" : "bg-blue-400",
                    )}
                  />
                  <div
                    className={cn(
                      "w-1 h-4 rounded-full animate-bounce delay-150",
                      isWayang ? "bg-[#fff8db]" : "bg-blue-400",
                    )}
                  />
                  <div
                    className={cn(
                      "w-1 h-2 rounded-full animate-bounce delay-100",
                      isWayang ? "bg-[#d4af37]" : "bg-blue-400",
                    )}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Speaking / Listening Status Text */}
        <div className="mt-3.5 flex items-center gap-1.5 h-5">
          {isSpeaking ? (
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs drop-shadow-sm font-semibold animate-pulse",
                isWayang
                  ? "bg-[#d4af37]/20 border-[#d4af37]/50 text-[#fff8db]"
                  : "bg-blue-500/20 border border-blue-400/30 text-blue-300",
              )}
            >
              <Volume2
                className={cn(
                  "size-3.5 animate-bounce",
                  isWayang ? "text-[#d4af37]" : "text-blue-400",
                )}
              />
              <span>Pasien Sedang Berbicara...</span>
            </div>
          ) : isListening ? (
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs drop-shadow-sm font-semibold animate-pulse",
                isWayang
                  ? "bg-[#d4af37]/20 border-[#d4af37]/40 text-[#f3e5ab]"
                  : "bg-emerald-500/20 border border-emerald-400/30 text-emerald-300",
              )}
            >
              <div
                className={cn(
                  "size-2 rounded-full animate-ping",
                  isWayang ? "bg-[#d4af37]" : "bg-emerald-400",
                )}
              />
              <span>Mendengarkan Pertanyaan Bidan...</span>
            </div>
          ) : (
            <span className="text-[11px] text-white/70 drop-shadow-sm">
              Menunggu pertanyaan bidan...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

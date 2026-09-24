import * as React from "react";
import {
  Loader2,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { SimliConnectionStatus } from "@/hooks/use-simli-avatar";
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
  simliStatus?: SimliConnectionStatus;
  simliStream?: MediaStream | null;
  simliVideoRef?: React.RefObject<HTMLVideoElement | null>;
  simliAudioRef?: React.RefObject<HTMLAudioElement | null>;
  onReplayVoice?: () => void;
}

export function AiVideoAvatar({
  patientName = "Ny. Ani",
  patientAge = 29,
  patientSubtitle,
  patientParity = "G2P1A0",
  avatarImageUrl,
  avatarUrl = "/images/fallback-pasien-2.jfif",
  backgroundImageUrl,
  backgroundUrl = "/images/puskesmas_clinic_empty.jpg",
  isSpeaking,
  isListening = false,
  isAiThinking: _isAiThinking = false,
  theme = "default",
  simliStatus = "fallback",
  simliStream,
  simliVideoRef,
  simliAudioRef,
  onReplayVoice: _onReplayVoice,
}: AiVideoAvatarProps) {
  const [callDurationSeconds, setCallDurationSeconds] = React.useState(0);
  const localVideoRef = React.useRef<HTMLVideoElement | null>(null);

  const effectiveAvatar = avatarImageUrl || avatarUrl;
  const effectiveBg = backgroundImageUrl || backgroundUrl;
  const isWayang = theme === "wayang";
  const isSimliLive = simliStatus === "connected";
  const isSimliConnecting = simliStatus === "connecting";

  // Clean patient name from any embedded parentheses (e.g. "Ny. Ani (45 tahun)" -> "Ny. Ani")
  const cleanPatientName = patientName.replace(/\s*\([^)]*\)/g, "").trim() || patientName;

  // Call timer simulation
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCallDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Pastikan MediaStream terpasang ke video element saat stream aktif
  React.useEffect(() => {
    const videoEl = localVideoRef.current;
    if (!videoEl) return;
    const streamToAttach =
      simliStream instanceof MediaStream
        ? simliStream
        : simliVideoRef?.current?.srcObject instanceof MediaStream
          ? (simliVideoRef.current.srcObject as MediaStream)
          : null;

    if (streamToAttach && videoEl.srcObject !== streamToAttach) {
      videoEl.srcObject = streamToAttach;
      videoEl.play().catch(() => {});
    }
  }, [simliStream, simliVideoRef, isSimliLive]);

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
      {/* Muted Audio element for Simli WebRTC Stream (Muted so only clear browser speech is heard) */}
      {simliAudioRef && (
        <audio
          ref={(el) => {
            if (el) {
              el.muted = true;
              el.volume = 0;
              el.onplay = () => {
                el.muted = true;
                el.volume = 0;
              };
            }
            if (simliAudioRef) {
              simliAudioRef.current = el;
            }
          }}
          autoPlay
          playsInline
          muted
          className="hidden"
          aria-hidden="true"
        />
      )}

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

      {/* Top Bar: LIVE REC badge, Simli Status & Room Badge */}
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
          {/* Simli Avatar Mode Status Badge */}
          {isSimliLive ? (
            <Badge
              className="bg-emerald-500/20 text-emerald-300 border-emerald-500/50 text-[10px] font-medium flex items-center gap-1.5 shadow-xs"
            >
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>3D Live</span>
            </Badge>
          ) : isSimliConnecting ? (
            <Badge
              className="bg-amber-500/20 text-amber-300 border-amber-500/50 text-[10px] font-medium flex items-center gap-1.5 animate-pulse"
            >
              <Loader2 className="size-2.5 animate-spin" />
              <span>Menyiapkan Pasien Virtual...</span>
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-medium",
                isWayang
                  ? "bg-[#1f150c]/80 text-[#d4af37] border-[#8c6d23]/50"
                  : "bg-black/40 text-neutral-300 border-white/20",
              )}
            >
              Avatar Foto
            </Badge>
          )}

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

          {/* Large Rounded-Rectangle Avatar Frame (Enlarged Box & Scale) */}
          <div
            className={cn(
              "relative w-[360px] sm:w-[440px] md:w-[500px] lg:w-[540px] max-w-[96%] aspect-4/3 overflow-hidden rounded-2xl sm:rounded-3xl border-2 shadow-2xl transition-all duration-300 bg-neutral-900",
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
            {/* 1. SIMLI LIVE VIDEO STREAM (Jika terhubung) */}
            <video
              ref={(el) => {
                localVideoRef.current = el;
                if (el) {
                  const streamToAttach =
                    simliStream instanceof MediaStream
                      ? simliStream
                      : simliVideoRef?.current?.srcObject instanceof MediaStream
                        ? simliVideoRef.current.srcObject
                        : null;
                  if (streamToAttach && el.srcObject !== streamToAttach) {
                    el.srcObject = streamToAttach;
                    el.play().catch(() => { });
                  }
                  if (simliVideoRef) {
                    simliVideoRef.current = el;
                  }
                }
              }}
              autoPlay
              playsInline
              muted
              className={cn(
                "h-full w-full object-cover object-center scale-[1.0] -translate-y-3 sm:-translate-y-4 origin-center transition-transform duration-300",
                isSimliLive ? "block" : "hidden",
              )}
            />

            {/* 2. FALLBACK PHOTO AVATAR (Jika Simli belum terhubung atau fallback) */}
            {!isSimliLive && (
              <>
                <img
                  src={effectiveAvatar}
                  alt={patientName}
                  className="h-full w-full object-cover object-[center_50%] scale-[1.02] -translate-y-3.5 sm:-translate-y-4.5 origin-center transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />

                {/* Fallback Icon Placeholder */}
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-neutral-800 to-neutral-900 text-white">
                  <User className="size-24 opacity-60" />
                </div>
              </>
            )}

            {/* 3. SIMLI LIVE AUDIO ELEMENT */}
            <audio
              ref={(el) => {
                if (el && simliAudioRef) {
                  simliAudioRef.current = el;
                  el.muted = false;
                  el.volume = 1.0;
                }
              }}
              autoPlay
              playsInline
              className="hidden"
            />

            {/* Connecting Spinner Overlay */}
            {isSimliConnecting && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white">
                <Loader2 className="size-7 animate-spin text-[#d4af37]" />
                <span className="text-[11px] font-mono text-[#f3e5ab]">
                  Menghubungkan Pasien Virtual...
                </span>
              </div>
            )}

            {/* Patient Name Badge overlay on avatar with Dynamic Audio Frequency Bars */}
            <div
              className={cn(
                "absolute bottom-1.5 left-1.5 right-1.5 rounded-lg backdrop-blur-md px-3 py-1.5 border flex items-center justify-between z-10",
                isWayang
                  ? "bg-[#19110a]/90 border-[#8c6d23]/40"
                  : "bg-black/75 border-white/10",
              )}
            >
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs text-white leading-tight truncate">
                  {cleanPatientName}{" "}
                  <span className="text-[11px] font-normal text-white/80">
                    ({patientAge} th)
                  </span>
                </span>
                <span
                  className={cn(
                    "text-[10px] font-medium leading-tight truncate",
                    isWayang ? "text-[#d4af37]" : "text-blue-300",
                  )}
                >
                  {patientSubtitle || `${patientParity} • Pasien Konsultasi`}
                </span>
              </div>

              {/* Dynamic Audio Frequency Bars (Besar-Kecil Berirama) */}
              <div
                className="flex items-end gap-1 h-6 px-1.5 shrink-0"
                title={isSpeaking ? "Pasien sedang berbicara (Audio Aktif)" : "Audio Hening"}
              >
                {isSpeaking ? (
                  <>
                    <span
                      className="w-1 rounded-full bg-[#f9f586] animate-pulse"
                      style={{ height: "13px", animationDuration: "550ms" }}
                    />
                    <span
                      className="w-1 rounded-full bg-[#fff8db] animate-pulse"
                      style={{ height: "22px", animationDuration: "380ms" }}
                    />
                    <span
                      className="w-1 rounded-full bg-[#d4af37] animate-pulse"
                      style={{ height: "10px", animationDuration: "720ms" }}
                    />
                    <span
                      className="w-1 rounded-full bg-[#f9f586] animate-pulse"
                      style={{ height: "18px", animationDuration: "460ms" }}
                    />
                    <span
                      className="w-1 rounded-full bg-[#fff8db] animate-pulse"
                      style={{ height: "12px", animationDuration: "600ms" }}
                    />
                  </>
                ) : (
                  <>
                    <span className="w-1 rounded-full bg-[#d4af37]/30 h-1.5" />
                    <span className="w-1 rounded-full bg-[#d4af37]/30 h-1.5" />
                    <span className="w-1 rounded-full bg-[#d4af37]/30 h-1.5" />
                    <span className="w-1 rounded-full bg-[#d4af37]/30 h-1.5" />
                    <span className="w-1 rounded-full bg-[#d4af37]/30 h-1.5" />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

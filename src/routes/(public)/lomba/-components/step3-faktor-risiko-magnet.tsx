import * as React from "react";
import {
  ArrowRight,
  CheckCircle2,
  GripHorizontal,
  Magnet,
  Plus,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trxResponseAnswerService } from "@/services/api/trx-response-answer-service";

import type { Kasus } from "@/routes/(admin)/dashboard/master/kasus/-components/data";

interface RiskFactorOption {
  id: string;
  label: string;
  category?: string;
  isCorrect?: boolean;
}



const PIN_COLORS = [
  "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]",
  "bg-yellow-300 shadow-[0_0_10px_rgba(253,224,71,0.8)]",
  "bg-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.8)]",
  "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]",
  "bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.8)]",
];

// ============================================================
// Web Audio API Procedural Sound Synthesizer for Magnetic Effects
// ============================================================
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// 1. Magnetic Snap Sound (When card sticks to the magnet board with high-impact click and magnetic ping)
function playMagneticSnapSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // A. Primary transient impact (thud/click)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(420, now);
    osc1.frequency.exponentialRampToValueAtTime(70, now + 0.05);

    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.06);

    // B. Resonant metallic ping harmonic
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1480, now + 0.01);
    osc2.frequency.exponentialRampToValueAtTime(320, now + 0.12);

    gain2.gain.setValueAtTime(0.2, now + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.01);
    osc2.stop(now + 0.13);
  } catch {}
}

// 2. Magnetic Detach Sound (Quick gentle 'unstick' pop)
function playDetachSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.04);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch {}
}

// 3. Card Pickup / Drag Sound
function playPickupSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.07);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  } catch {}
}

// 4. Board Proximity / Drag Hover Sound
function playHoverSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(920, now);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch {}
}

// 5. Reset Board Sound
function playResetSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.16);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.17);
  } catch {}
}

interface Step3FaktorRisikoMagnetProps {
  selectedIds?: string[];
  onChange?: (ids: string[]) => void;
  kasus?: Kasus;
  responseId?: number;
  casequestId?: number;
  duration?: number | string;
}

export function Step3FaktorRisikoMagnet({
  selectedIds: initialSelectedIds,
  onChange,
  kasus,
  responseId,
  casequestId,
  duration,
}: Step3FaktorRisikoMagnetProps) {
  const riskFactorPool: RiskFactorOption[] = React.useMemo(() => {
    const rawFactors = kasus?.stase_data?.stase2?.faktor_risiko;
    if (rawFactors && rawFactors.length > 0) {
      return rawFactors.map((f) => ({
        id: f.id,
        label: f.nama_jawaban,
        isCorrect: f.skor > 0,
        category: "Temuan / Riwayat Pasien",
      }));
    }
    return [];
  }, [kasus]);

  const [pinnedIds, setPinnedIds] = React.useState<string[]>(initialSelectedIds || []);
  const [isDragOverBoard, setIsDragOverBoard] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  // Reset pinned items when case changes
  React.useEffect(() => {
    setPinnedIds([]);
  }, [kasus]);

  const saveAnswerTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const saveAnswersToApi = React.useCallback(
    (ids: string[]) => {
      const activeCasequestId = casequestId || kasus?.stase_data?.stase2?.casequest_id;
      if (responseId && activeCasequestId) {
        if (saveAnswerTimeoutRef.current) clearTimeout(saveAnswerTimeoutRef.current);
        saveAnswerTimeoutRef.current = setTimeout(() => {
          const currentDuration =
            duration !== undefined
              ? duration
              : kasus?.stase_data?.stase2?.header?.durasi_detik ?? 0;

          trxResponseAnswerService
            .store({
              response_id: responseId,
              casequest_id: activeCasequestId,
              answers: ids,
              duration: String(currentDuration),
            })
            .catch((err) => console.warn("[Pos 2 Store Error]", err));
        }, 400);
      }
    },
    [responseId, casequestId, kasus, duration],
  );

  const handleTogglePin = (id: string) => {
    const isCurrentlyPinned = pinnedIds.includes(id);
    if (soundEnabled) {
      if (isCurrentlyPinned) {
        playDetachSound();
      } else {
        playMagneticSnapSound();
      }
    }
    const next = isCurrentlyPinned
      ? pinnedIds.filter((pId) => pId !== id)
      : [...pinnedIds, id];
    setPinnedIds(next);
    onChange?.(next);
    saveAnswersToApi(next);
  };

  const handleResetBoard = () => {
    if (soundEnabled) {
      playResetSound();
    }
    setPinnedIds([]);
    onChange?.([]);
    saveAnswersToApi([]);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (soundEnabled) {
      playPickupSound();
    }
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOverBoard = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragOverBoard) {
      if (soundEnabled) {
        playHoverSound();
      }
      setIsDragOverBoard(true);
    }
  };

  const handleDragLeaveBoard = () => {
    setIsDragOverBoard(false);
  };

  const handleDropOnBoard = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverBoard(false);
    const droppedId = e.dataTransfer.getData("text/plain");
    if (droppedId && !pinnedIds.includes(droppedId)) {
      if (soundEnabled) {
        playMagneticSnapSound();
      }
      const next = [...pinnedIds, droppedId];
      setPinnedIds(next);
      onChange?.(next);
      saveAnswersToApi(next);
    }
  };

  const unpinnedPool = riskFactorPool.filter((item) => !pinnedIds.includes(item.id));
  const pinnedList = riskFactorPool.filter((item) => pinnedIds.includes(item.id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full max-w-full overflow-x-hidden select-none items-stretch">
      {/* 1. Left Column: Options Card Tray (Baki Kartu) */}
      <div className="lg:col-span-5 flex flex-col gap-3 rounded-2xl border border-[#8c6d23]/40 bg-[#1a130d]/90 p-4 sm:p-5 shadow-xl text-[#f3e5ab] w-full">
        {/* Tray Header */}
        <div className="flex items-center justify-between border-b border-[#8c6d23]/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
              <Plus className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-[#fff8db]">
                Baki Kartu Faktor Risiko
              </h3>
              <p className="text-[10px] text-[#d4af37]/80 leading-tight">
                Tarik (*drag*) atau klik kartu untuk menempelkan ke papan
              </p>
            </div>
          </div>

          <Badge variant="outline" className="border-[#d4af37]/40 bg-[#251b11] text-[#d4af37] text-xs font-semibold px-2.5 py-0.5 shrink-0">
            {unpinnedPool.length} Tersedia
          </Badge>
        </div>

        {/* Tray Cards List */}
        {unpinnedPool.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-xs text-[#d4af37]/60 italic border border-dashed border-[#8c6d23]/30 rounded-xl bg-[#150e08]/40 min-h-[240px]">
            <CheckCircle2 className="size-8 text-[#d4af37]/40 mb-2" />
            <span className="font-semibold text-[#fff8db]/90">
              {riskFactorPool.length === 0 ? "Belum Ada Opsi Faktor Risiko" : "Semua kartu telah ditempel"}
            </span>
            <p className="text-[11px] text-[#d4af37]/60 mt-1 max-w-xs">
              {riskFactorPool.length === 0
                ? "Kasus ini belum memiliki konfigurasi faktor risiko dari sistem ujian."
                : "Semua opsi faktor risiko telah dipindahkan ke Papan Magnet di sebelah kanan."}
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-[580px] pr-1">
            {unpinnedPool.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onClick={() => handleTogglePin(item.id)}
                className="group relative flex flex-col justify-between rounded-xl border border-[#8c6d23]/40 bg-[#251b11] p-3 sm:p-3.5 text-xs transition-all duration-150 hover:border-[#d4af37] hover:bg-[#322315] hover:shadow-lg cursor-grab active:cursor-grabbing shrink-0 gap-2.5"
                title="Klik atau Tarik (Drag) ke Papan Magnet di sebelah kanan"
              >
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="secondary" className="text-[9px] font-semibold bg-[#140e08] text-[#e6d59c] border border-[#8c6d23]/40 shadow-2xs">
                    {item.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-[#d4af37]/70 group-hover:text-[#f9f586] transition-colors">
                    <GripHorizontal className="size-3.5" />
                    <span className="hidden sm:inline">Tarik</span>
                  </div>
                </div>

                <p className="font-semibold text-[#fff8db] text-xs sm:text-[13px] leading-snug group-hover:text-[#f9f586] transition-colors">
                  {item.label}
                </p>

                <div className="flex items-center justify-between text-[11px] text-[#d4af37]/80 border-t border-[#8c6d23]/30 pt-2 mt-auto">
                  <span className="text-[10px] font-mono text-[#d4af37]/60">
                    Opsi Faktor Risiko
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#f9f586] bg-[#140e08] border border-[#d4af37]/50 px-2 py-0.5 rounded-md group-hover:bg-[#d4af37] group-hover:text-[#14100c] group-hover:border-[#fff8db] transition-all shadow-xs">
                    <span>Pindah ke Papan</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Right Column: Interactive Magnet Board (Papan Magnet) */}
      <div
        onDragOver={handleDragOverBoard}
        onDragLeave={handleDragLeaveBoard}
        onDrop={handleDropOnBoard}
        className={cn(
          "lg:col-span-7 flex flex-col gap-3 rounded-2xl border-2 sm:border-4 p-4 sm:p-5 shadow-2xl transition-all duration-300 w-full min-h-[440px]",
          isDragOverBoard
            ? "border-[#d4af37] bg-[#2d1e11] ring-4 ring-[#d4af37]/40 shadow-[0_0_30px_rgba(212,175,55,0.25)]"
            : "border-[#8c6d23] bg-[#1f150c]",
        )}
      >
        {/* Board Header Bar */}
        <div className="flex items-center justify-between border-b border-[#8c6d23]/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-r from-[#8c6d23] to-[#d4af37] text-[#14100c] shadow-md">
              <Magnet className="size-4.5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-serif font-bold text-[#fff8db]">
                  Papan Magnet Faktor Risiko
                </h3>
                <Badge className="bg-[#d4af37] text-[#14100c] text-[10px] font-bold shadow-xs">
                  {pinnedList.length} Tertempel
                </Badge>
              </div>
              <p className="text-[10px] text-[#d4af37]/80 leading-tight">
                Drop area: Kartu yang tertempel adalah kesimpulan identifikasi Anda
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setSoundEnabled((prev) => !prev)}
              className={cn(
                "h-7 px-2 text-xs gap-1 border transition-colors",
                soundEnabled
                  ? "text-[#d4af37] border-[#d4af37]/30 hover:bg-[#d4af37]/10"
                  : "text-[#d4af37]/40 border-transparent hover:text-[#d4af37]/80",
              )}
              title={soundEnabled ? "Nonaktifkan Efek Suara" : "Aktifkan Efek Suara"}
            >
              {soundEnabled ? <Volume2 className="size-3.5 text-[#d4af37]" /> : <VolumeX className="size-3.5 text-[#d4af37]/40" />}
              <span className="hidden sm:inline text-[11px]">{soundEnabled ? "SFX On" : "Muted"}</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleResetBoard}
              disabled={pinnedList.length === 0}
              className="h-7 text-xs text-[#d4af37]/80 hover:text-rose-400 hover:bg-rose-500/10 gap-1 border border-transparent hover:border-rose-500/30"
            >
              <RotateCcw className="size-3" />
              <span>Reset</span>
            </Button>
          </div>
        </div>

        {/* Board Canvas */}
        <div
          className={cn(
            "flex-1 min-h-[360px] rounded-xl border-2 border-dashed p-3 sm:p-4 transition-colors shadow-inner flex flex-col justify-start overflow-y-auto max-h-[580px]",
            isDragOverBoard
              ? "border-[#d4af37] bg-[#3a2717]/60"
              : "border-[#8c6d23]/50 bg-[#150e08]/80",
          )}
        >
          {pinnedList.length === 0 ? (
            <div className="my-auto flex flex-col items-center justify-center py-10 text-center text-xs text-[#d4af37]/60">
              <div className="size-14 rounded-full bg-[#d4af37]/10 flex items-center justify-center mb-3 border border-[#d4af37]/20">
                <Magnet className="size-7 text-[#d4af37]/60 animate-bounce" />
              </div>
              <span className="font-serif font-bold text-sm text-[#fff8db]">Papan Magnet Masih Kosong</span>
              <p className="text-[11px] text-[#d4af37]/80 mt-1 max-w-xs leading-relaxed">
                Tarik (*drag*) kartu dari baki di sebelah kiri atau klik langsung untuk menempelkannya pada area papan magnet ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {pinnedList.map((item, index) => {
                const pinColor = PIN_COLORS[index % PIN_COLORS.length];

                return (
                  <div
                    key={item.id}
                    className="relative flex flex-col justify-between rounded-xl border-2 border-[#d4af37] bg-gradient-to-r from-[#8c6d23]/40 via-[#d4af37]/25 to-[#8c6d23]/30 p-3.5 ring-2 ring-[#d4af37]/50 shadow-[0_0_15px_rgba(212,175,55,0.25)] transition-transform hover:-translate-y-0.5 animate-in zoom-in-95 duration-200"
                  >
                    {/* Magnetic Pin Dot in Gold */}
                    <div
                      className={cn(
                        "absolute -top-2.5 left-1/2 -translate-x-1/2 size-4.5 rounded-full border-2 border-[#fff8db] shadow-md z-10",
                        pinColor,
                      )}
                    />

                    <div className="flex items-center justify-between gap-2 mt-1">
                      <Badge className="text-[9px] font-bold bg-[#140e08] text-[#f9f586] border border-[#d4af37] shadow-xs">
                        {item.category}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => handleTogglePin(item.id)}
                        className="text-[#fff8db]/70 hover:text-rose-400 hover:bg-rose-500/20 transition-colors p-1 rounded-md shrink-0"
                        title="Lepas dari papan magnet"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>

                    <p className="my-3 font-serif font-bold text-sm sm:text-[15px] text-[#fff8db] leading-snug drop-shadow-md">
                      {item.label}
                    </p>

                    <div className="border-t border-[#d4af37]/40 pt-2 flex items-center justify-between text-[11px] text-[#f9f586] font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-[#d4af37]" />
                        <span>Tertempel di Papan</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTogglePin(item.id)}
                        className="text-[#fff8db]/80 hover:text-rose-300 hover:underline text-[11px] font-medium"
                      >
                        Lepas
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

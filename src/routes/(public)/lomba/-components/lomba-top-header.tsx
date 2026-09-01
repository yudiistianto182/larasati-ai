import * as React from "react";
import {
  BookOpen,
  Clock,
  FileText,
  HeartPulse,
  Sparkles,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PanduanPengerjaanModal } from "./panduan-pengerjaan-modal";
import { playCtaClickSound } from "./lomba-sound-effects";

interface LombaTopHeaderProps {
  staseNumber: number;
  totalStase: number;
  staseName: string;
  kodeAmplop: string;
  durasiRemainingSeconds: number;
  petunjukSoal: string;
  panduanPenggunaan: string;
  groupName?: string;
}

export function LombaTopHeader({
  staseNumber,
  totalStase,
  staseName,
  kodeAmplop,
  durasiRemainingSeconds,
  petunjukSoal,
  panduanPenggunaan,
  groupName = "Kelompok Peserta",
}: LombaTopHeaderProps) {
  const [isGuideOpen, setIsGuideOpen] = React.useState(false);

  const minutes = Math.floor(durasiRemainingSeconds / 60);
  const seconds = durasiRemainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isLowTime = durasiRemainingSeconds <= 10;
  const isWarningTime = durasiRemainingSeconds <= 25;

  // Dynamic patient attributes list
  const patientAttributes = [
    { label: "HPHT", value: "3 Bulan Lalu" },
    { label: "Riwayat KB", value: "Suntik 3 Bulan" },
    { label: "Paritas", value: "G2P1A0 Normal" },
    { label: "Keluhan Tambahan", value: "Kram Perut Bawah" },
    { label: "Kontak Berdarah", value: "Pasca Senggama" },
    { label: "Poli Periksa", value: "KIA Puskesmas" },
  ];

  return (
    <header className="w-full max-w-full overflow-hidden flex flex-col gap-3.5 rounded-2xl border border-[#8c6d23]/40 bg-[#1a130d]/90 p-4 sm:p-5 shadow-lg text-[#f3e5ab] select-none">
      {/* Upper Row: Stase Summary (Left), Big Digital Timer (Center/Right), & Guide Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#8c6d23]/30 pb-3.5">
        {/* Left: Stase Info & Envelope */}
        <div className="flex items-center gap-3 min-w-0">
          <Badge className="bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] font-serif font-bold text-xs shadow-xs uppercase tracking-wider px-3 py-1 shrink-0">
            Pos {staseNumber} / {totalStase}
          </Badge>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#fff8db] leading-snug truncate">
                {staseName}
              </h2>
            </div>
            <span className="text-xs text-[#d4af37]/75 truncate">
              Sirkuit Ujian Kebidanan
            </span>
          </div>
        </div>

        {/* Right: Big Glowing Countdown Clock & Instruction Button */}
        <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
          {/* Instruction Guide Trigger */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              playCtaClickSound();
              setIsGuideOpen(true);
            }}
            className="h-9 px-3 text-xs font-serif font-semibold bg-[#261b11] text-[#f3e5ab] border-[#8c6d23]/50 hover:bg-[#342416] hover:text-[#fff8db] gap-1.5 shadow-xs cursor-pointer"
          >
            <BookOpen className="size-3.5 text-[#d4af37]" />
            <span className="hidden sm:inline">Panduan Pos</span>
          </Button>

          {/* High-Awareness Digital Timer Badge */}
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-xl border-2 px-4 py-1.5 shadow-lg transition-all duration-300 font-mono font-extrabold text-base sm:text-xl",
              isLowTime
                ? "border-red-500 bg-red-950/80 text-red-100 ring-4 ring-red-500/30 animate-pulse"
                : isWarningTime
                  ? "border-amber-500 bg-amber-950/60 text-amber-200"
                  : "border-[#d4af37] bg-[#23170d] text-[#fff8db] shadow-[0_0_15px_rgba(212,175,55,0.25)]",
            )}
          >
            <Clock className={cn("size-4 sm:size-5 text-[#d4af37]", isLowTime && "text-red-400 animate-spin")} />
            <span className="tracking-widest">{timeFormatted}</span>
          </div>
        </div>
      </div>

      {/* Lower Row: Full Radiant Golden Gradient Patient Briefing Section */}
      <div className="w-full max-w-full overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 bg-gradient-to-r from-[#d4af37] via-[#f7e492] to-[#c49a2a] rounded-xl border-2 border-[#fff8db] p-4 shadow-[0_0_25px_rgba(212,175,55,0.35)] text-[#140e08]">
        {/* Left: Patient Avatar & Demographics with High-Contrast Dark Text */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="size-13 rounded-xl overflow-hidden border-2 border-[#1a120b] shrink-0 shadow-md">
            <img
              src="/images/ny_ani_patient_torso.jpg"
              alt="Ny. Ani"
              className="size-full object-cover object-top"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-serif font-black text-base text-[#140e08] tracking-tight">
                Ny. Ani (45 Tahun)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Panduan Modal Dialog */}
      <PanduanPengerjaanModal
        open={isGuideOpen}
        onOpenChange={setIsGuideOpen}
        staseNumber={staseNumber}
        staseName={staseName}
        panduanText={panduanPenggunaan}
      />
    </header>
  );
}

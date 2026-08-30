import * as React from "react";
import {
  AlertCircle,
  BookOpen,
  Clock,
  Crown,
  FileText,
  HeartPulse,
  HelpCircle,
  Sparkles,
  User,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PanduanPengerjaanModal } from "./panduan-pengerjaan-modal";

interface LombaSidePanelProps {
  staseNumber: number;
  totalStase: number;
  staseName: string;
  kodeAmplop: string;
  durasiRemainingSeconds: number;
  petunjukSoal: string;
  panduanPenggunaan: string;
  groupName?: string;
}

export function LombaSidePanel({
  staseNumber,
  totalStase,
  staseName,
  kodeAmplop,
  durasiRemainingSeconds,
  petunjukSoal,
  panduanPenggunaan,
  groupName = "Kelompok Peserta",
}: LombaSidePanelProps) {
  const [isGuideOpen, setIsGuideOpen] = React.useState(false);

  const minutes = Math.floor(durasiRemainingSeconds / 60);
  const seconds = durasiRemainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isLowTime = durasiRemainingSeconds <= 60;
  const isWarningTime = durasiRemainingSeconds <= 120;

  return (
    <aside className="w-full lg:w-88 xl:w-96 shrink-0 flex flex-col gap-3.5 select-none">
      {/* 1. Strategic Highly-Visible Countdown Timer Card */}
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1 rounded-2xl border-2 p-4 text-center shadow-lg transition-all duration-300",
          isLowTime
            ? "border-red-500 bg-red-950/80 text-red-100 ring-4 ring-red-500/30 animate-pulse"
            : isWarningTime
              ? "border-amber-500 bg-amber-950/60 text-amber-200"
              : "border-[#d4af37]/60 bg-[#1c140c]/90 text-[#f3e5ab] shadow-[0_0_20px_rgba(212,175,55,0.15)]",
        )}
      >
        <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest opacity-80">
          <Clock className={cn("size-4", isLowTime && "animate-spin")} />
          <span>Sisa Waktu Pos {staseNumber}</span>
        </div>

        <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-widest drop-shadow-md">
          {timeFormatted}
        </span>

        <span className="text-[10px] opacity-75">
          {isLowTime
            ? "⚠️ Waktu hampir habis! Segera selesaikan pengerjaan."
            : "Waktu berjalan mundur otomatis"}
        </span>
      </div>

      {/* 2. Stase Info & Envelope Box */}
      <div className="rounded-2xl border border-[#8c6d23]/40 bg-[#1a130d]/90 p-4 shadow-md text-[#f3e5ab] flex flex-col gap-2.5">
        <div className="flex items-center justify-between border-b border-[#8c6d23]/30 pb-2">
          <Badge className="bg-gradient-to-r from-[#8c6d23] to-[#d4af37] text-[#14100c] font-bold text-xs shadow-xs uppercase tracking-wider">
            Pos {staseNumber} dari {totalStase}
          </Badge>
          <Badge variant="outline" className="border-[#d4af37]/50 text-[#d4af37] font-mono text-[10px]">
            {kodeAmplop}
          </Badge>
        </div>

        <div>
          <h3 className="text-sm font-serif font-bold text-[#fff8db] leading-snug">
            {staseName}
          </h3>
          <span className="text-[11px] text-[#d4af37]/75">
            Sirkuit OSCE Kebidanan Terintegrasi
          </span>
        </div>

        {/* Instruksi Soal */}
        <div className="rounded-xl border border-[#8c6d23]/30 bg-[#241a10] p-3 text-xs leading-relaxed text-[#e6d59c]">
          <span className="font-bold text-[#fff8db] text-[11px] uppercase tracking-wider block mb-1 flex items-center gap-1">
            <FileText className="size-3 text-[#d4af37]" /> Instruksi Kasus:
          </span>
          <p className="text-[11px] text-[#e6d59c]/90 leading-relaxed">
            {petunjukSoal}
          </p>
        </div>

        {/* Action Button: Panduan Cara Pengerjaan (Opens Dialog Modal) */}
        <Button
          type="button"
          onClick={() => setIsGuideOpen(true)}
          className="w-full h-8.5 text-xs font-serif font-semibold tracking-wider bg-[#2a1d12] hover:bg-[#382718] text-[#f3e5ab] border border-[#d4af37]/40 shadow-xs gap-1.5"
        >
          <BookOpen className="size-3.5 text-[#d4af37]" />
          <span>Panduan Cara Pengerjaan Pos</span>
        </Button>
      </div>

      {/* 3. Patient Profile Visual Card (Ny. Ani - Directly Displayed) */}
      <div className="rounded-2xl border border-[#8c6d23]/40 bg-[#1a130d]/90 p-4 shadow-md text-[#f3e5ab] flex flex-col gap-3">
        <div className="flex items-center gap-3 border-b border-[#8c6d23]/30 pb-2.5">
          <div className="relative size-12 rounded-xl overflow-hidden border-2 border-[#d4af37]/60 shrink-0 shadow-md">
            <img
              src="/images/ny_ani_patient_torso.jpg"
              alt="Ny. Ani"
              className="size-full object-cover object-top"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="font-serif font-bold text-sm text-[#fff8db] truncate">
              Ny. Ani (29 Tahun)
            </h4>
            <span className="text-[11px] text-[#d4af37]/80 truncate">
              G2P1A0 &bull; Hamil Trimester II
            </span>
            <span className="text-[10px] text-[#e6d59c]/70">
              Poli KIA Puskesmas
            </span>
          </div>
        </div>

        {/* Keluhan Utama */}
        <div className="flex flex-col gap-1">
          <span className="font-bold text-[11px] text-[#d4af37] uppercase tracking-wider flex items-center gap-1">
            <HeartPulse className="size-3 text-rose-400" /> Keluhan Utama:
          </span>
          <p className="text-[11px] text-[#e6d59c] leading-relaxed">
            Keputihan kental warna kuning kehijauan dan berbau amis selama 2 minggu, disertai flek darah pasca senggama.
          </p>
        </div>

        {/* Atribut Grid */}
        <div className="grid grid-cols-2 gap-1.5 text-[10px] border-t border-[#8c6d23]/30 pt-2.5">
          <div className="p-1.5 rounded-lg bg-[#241a10] border border-[#8c6d23]/30">
            <span className="text-[#d4af37]/75">HPHT:</span>
            <strong className="block text-[#fff8db]">3 Bulan Lalu</strong>
          </div>
          <div className="p-1.5 rounded-lg bg-[#241a10] border border-[#8c6d23]/30">
            <span className="text-[#d4af37]/75">Riwayat KB:</span>
            <strong className="block text-[#fff8db]">Suntik 3 Bulan</strong>
          </div>
          <div className="p-1.5 rounded-lg bg-[#241a10] border border-[#8c6d23]/30">
            <span className="text-[#d4af37]/75">Paritas:</span>
            <strong className="block text-[#fff8db]">G2P1A0 Normal</strong>
          </div>
          <div className="p-1.5 rounded-lg bg-[#241a10] border border-[#8c6d23]/30">
            <span className="text-[#d4af37]/75">Gejala:</span>
            <strong className="block text-[#fff8db]">Kram Perut Bawah</strong>
          </div>
        </div>
      </div>

      {/* Modal Dialog Panduan Pengerjaan */}
      <PanduanPengerjaanModal
        open={isGuideOpen}
        onOpenChange={setIsGuideOpen}
        staseNumber={staseNumber}
        staseName={staseName}
        panduanText={panduanPenggunaan}
      />
    </aside>
  );
}

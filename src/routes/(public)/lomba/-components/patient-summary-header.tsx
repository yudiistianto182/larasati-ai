import * as React from "react";
import {
  Activity,
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  HelpCircle,
  Layers,
  Sparkles,
  User,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface PatientSummaryHeaderProps {
  staseNumber: number;
  staseName: string;
  kodeAmplop: string;
  durasiRemainingSeconds: number;
  petunjukSoal: string;
  panduanPenggunaan: string;
  totalStase?: number;
}

export function PatientSummaryHeader({
  staseNumber,
  staseName,
  kodeAmplop,
  durasiRemainingSeconds,
  petunjukSoal,
  panduanPenggunaan,
  totalStase = 6,
}: PatientSummaryHeaderProps) {
  const [isInstructionOpen, setIsInstructionOpen] = React.useState(true);

  // Format MM:SS
  const minutes = Math.floor(durasiRemainingSeconds / 60);
  const seconds = durasiRemainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isLowTime = durasiRemainingSeconds <= 60;
  const isWarningTime = durasiRemainingSeconds <= 120;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
      {/* Top Bar: Stase Info, Patient Badge Popover, and Live Countdown Timer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        {/* Left: Stase & Envelope Badge */}
        <div className="flex items-center gap-2.5">
          <Badge className="bg-primary text-primary-foreground font-mono text-xs font-bold px-2.5 py-1 shadow-2xs">
            Pos {staseNumber} / {totalStase}
          </Badge>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-foreground leading-tight">
                {staseName}
              </h2>
              <Badge variant="outline" className="font-mono text-[10px] bg-background">
                {kodeAmplop}
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Midwife Circuit Challenge &bull; Skenario Klinis Pasien Virtual
            </span>
          </div>
        </div>

        {/* Right: Patient Profile Trigger & Live Timer */}
        <div className="flex items-center gap-2.5">
          {/* Patient Quick Profile Sheet Popover */}
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-2 text-xs font-semibold bg-background shadow-2xs hover:border-primary"
                >
                  <div className="size-5 rounded-full overflow-hidden border border-primary/40 shrink-0">
                    <img
                      src="/images/ny_ani_patient_torso.jpg"
                      alt="Ny. Ani"
                      className="size-full object-cover object-top"
                    />
                  </div>
                  <span>Biodata Pasien: <strong>Ny. Ani</strong></span>
                  <ChevronDown className="size-3 text-muted-foreground" />
                </Button>
              }
            />
            <PopoverContent
              className="w-80 p-4 shadow-2xl border-border/80 bg-card"
              align="end"
            >
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex items-center gap-3 border-b pb-2.5">
                  <div className="size-12 rounded-xl overflow-hidden border-2 border-primary/30 shrink-0 shadow-xs">
                    <img
                      src="/images/ny_ani_patient_torso.jpg"
                      alt="Ny. Ani"
                      className="size-full object-cover object-top"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-foreground">Ny. Ani (29 Tahun)</span>
                    <span className="text-[11px] text-muted-foreground">G2P1A0 &bull; Hamil Trimester II</span>
                    <Badge variant="secondary" className="text-[10px] font-semibold w-fit mt-0.5">
                      Poli KIA Puskesmas
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="font-semibold text-foreground">Keluhan Utama:</span>
                  <p className="text-muted-foreground leading-relaxed text-[11px]">
                    Keputihan kental warna kuning kehijauan dan berbau amis selama 2 minggu, disertai flek darah pasca berhubungan.
                  </p>
                </div>

                <div className="flex flex-col gap-1 border-t pt-2">
                  <span className="font-semibold text-foreground">Riwayat Medis & Atribut:</span>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <div className="p-1.5 rounded bg-muted/40 border">
                      <span className="text-muted-foreground">HPHT:</span>
                      <strong className="block text-foreground">3 Bulan Lalu</strong>
                    </div>
                    <div className="p-1.5 rounded bg-muted/40 border">
                      <span className="text-muted-foreground">Riwayat KB:</span>
                      <strong className="block text-foreground">Suntik 3 Bulan</strong>
                    </div>
                    <div className="p-1.5 rounded bg-muted/40 border">
                      <span className="text-muted-foreground">Paritas:</span>
                      <strong className="block text-foreground">G2P1A0 (1 Anak Normal)</strong>
                    </div>
                    <div className="p-1.5 rounded bg-muted/40 border">
                      <span className="text-muted-foreground">Gejala Lain:</span>
                      <strong className="block text-foreground">Kram Perut Bawah</strong>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Live Countdown Timer Badge */}
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3 py-1.5 shadow-2xs font-mono font-bold text-sm transition-all duration-300",
              isLowTime
                ? "border-destructive bg-destructive/15 text-destructive animate-pulse ring-2 ring-destructive/30"
                : isWarningTime
                  ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                  : "border-primary/30 bg-primary/5 text-primary",
            )}
          >
            <Clock className={cn("size-4", isLowTime && "animate-spin")} />
            <span>{timeFormatted}</span>
          </div>
        </div>
      </div>

      {/* Accordion / Collapsible Instruction Box */}
      <div className="rounded-xl border border-border/80 bg-muted/15 overflow-hidden transition-all">
        <div
          onClick={() => setIsInstructionOpen(!isInstructionOpen)}
          className="flex items-center justify-between px-3.5 py-2 cursor-pointer hover:bg-muted/30 transition-colors select-none text-xs"
        >
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <BookOpen className="size-3.5 text-primary" /> Petunjuk Soal & Panduan Pengerjaan
          </span>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>{isInstructionOpen ? "Sembunyikan" : "Tampilkan Panduan"}</span>
            {isInstructionOpen ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </div>
        </div>

        {isInstructionOpen && (
          <div className="px-3.5 pb-3 pt-1 border-t border-border/40 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs animate-in fade-in duration-200">
            {/* Left: Petunjuk Soal Stase */}
            <div className="flex flex-col gap-1 rounded-lg bg-background p-2.5 border">
              <span className="font-bold text-foreground flex items-center gap-1">
                <FileText className="size-3 text-primary" /> Instruksi Kasus Soal:
              </span>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                {petunjukSoal}
              </p>
            </div>

            {/* Right: Panduan Cara Pengerjaan */}
            <div className="flex flex-col gap-1 rounded-lg bg-background p-2.5 border">
              <span className="font-bold text-foreground flex items-center gap-1">
                <HelpCircle className="size-3 text-amber-500" /> Cara Pengerjaan Pos Ini:
              </span>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                {panduanPenggunaan}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import {
  Activity,
  Bot,
  Check,
  CheckCircle2,
  ClipboardList,
  FileText,
  HeartHandshake,
  Image as ImageIcon,
  Layers,
  ShieldCheck,
  Tag,
  Users,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { KasusAttribute, StaseSoalData } from "../../-components/data";

interface Step4PerekamNilaiProps {
  hasPerekamNilai: boolean;
  onHasPerekamNilaiChange: (value: boolean) => void;
  nama: string;
  deskripsi: string;
  atribut: KasusAttribute[];
  selectedPasienCount: number;
  staseData: StaseSoalData;
}

export function Step4PerekamNilai({
  hasPerekamNilai,
  onHasPerekamNilaiChange,
  nama,
  deskripsi,
  atribut,
  selectedPasienCount,
  staseData,
}: Step4PerekamNilaiProps) {
  // Score calculations
  const totalScoreStase1 = staseData.stase1.triggers.reduce((acc, t) => acc + (Number(t.skor) || 0), 0);
  const totalScoreStase2 = staseData.stase2.faktor_risiko.reduce((acc, f) => acc + (Number(f.skor) || 0), 0);
  const totalScoreStase3 = staseData.stase3.langkah_prosedur.reduce((acc, l) => acc + (Number(l.skor) || 0), 0);
  const totalScoreStase4 = staseData.stase4.pilihan_jawaban.find((o) => o.is_correct)?.skor || 0;
  const totalScoreStase5 = staseData.stase5.triggers.reduce((acc, t) => acc + (Number(t.skor) || 0), 0);
  const grandTotalScore = totalScoreStase1 + totalScoreStase2 + totalScoreStase3 + totalScoreStase4 + totalScoreStase5;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 border-b pb-3">
        <h3 className="text-base font-semibold text-foreground">
          Step 4: Perekam Nilai & Konfirmasi Kasus
        </h3>
        <p className="text-xs text-muted-foreground">
          Tentukan opsi perekaman skor hasil pengerjaan peserta dan tinjau ringkasan kasus sebelum disimpan.
        </p>
      </div>

      {/* Score Recorder Question */}
      <div className="flex flex-col gap-3">
        <Label className="text-sm font-semibold text-foreground">
          Apakah kasus ini dilengkapi dengan perekam nilai? <span className="text-destructive">*</span>
        </Label>

        {/* Radio Cards: YES (Green) / NO (Muted) */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {/* Option YES (Green Emerald Accent) */}
          <div
            onClick={() => onHasPerekamNilaiChange(true)}
            className={cn(
              "group relative flex cursor-pointer flex-col gap-3 rounded-2xl border-2 p-4 transition-all duration-200 select-none",
              hasPerekamNilai
                ? "border-emerald-500 bg-emerald-500/10 shadow-sm ring-2 ring-emerald-500/20"
                : "border-border/60 bg-card hover:border-emerald-500/40 hover:bg-emerald-500/5",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-xl transition-colors",
                    hasPerekamNilai
                      ? "bg-emerald-500 text-white shadow-xs"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  )}
                >
                  <CheckCircle2 className="size-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-foreground">
                    YA (Dilengkapi)
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Perekam Skor Aktif ({grandTotalScore} Poin)
                  </span>
                </div>
              </div>

              {/* Radio Indicator */}
              <div
                className={cn(
                  "flex size-5 items-center justify-center rounded-full border-2 transition-all",
                  hasPerekamNilai
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-muted-foreground/40 bg-transparent",
                )}
              >
                {hasPerekamNilai && <Check className="size-3 stroke-[3]" />}
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-snug">
              Setiap respons dan tindakan peserta dalam kasus ini akan direkam, dihitung bobot nilainya, dan dimasukkan ke dalam rekapitulasi ujian.
            </p>
          </div>

          {/* Option NO (Muted Neutral Accent) */}
          <div
            onClick={() => onHasPerekamNilaiChange(false)}
            className={cn(
              "group relative flex cursor-pointer flex-col gap-3 rounded-2xl border-2 p-4 transition-all duration-200 select-none",
              !hasPerekamNilai
                ? "border-foreground/30 bg-muted/40 shadow-xs ring-1 ring-border"
                : "border-border/60 bg-card hover:border-border hover:bg-muted/20",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-xl transition-colors",
                    !hasPerekamNilai
                      ? "bg-muted-foreground/20 text-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <XCircle className="size-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-foreground">
                    TIDAK (Tanpa Perekam)
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Mode Latihan / Mandiri
                  </span>
                </div>
              </div>

              {/* Radio Indicator */}
              <div
                className={cn(
                  "flex size-5 items-center justify-center rounded-full border-2 transition-all",
                  !hasPerekamNilai
                    ? "border-foreground/50 bg-foreground/10 text-foreground"
                    : "border-muted-foreground/40 bg-transparent",
                )}
              >
                {!hasPerekamNilai && <Check className="size-3 stroke-[3]" />}
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-snug">
              Kasus difungsikan sebagai bahan eksplorasi, simulasi latihan mandiri, atau studi referensi tanpa penilaian formal.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Recap Box */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/20 p-4">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <ShieldCheck className="size-4 text-primary" /> Ringkasan Konfigurasi Kasus:
        </span>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
          <div className="flex flex-col rounded-lg border bg-card p-2.5">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <FileText className="size-3 text-primary" /> Nama Kasus
            </span>
            <span className="font-semibold text-foreground truncate mt-0.5" title={nama}>
              {nama || "Belum diisi"}
            </span>
          </div>

          <div className="flex flex-col rounded-lg border bg-card p-2.5">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Users className="size-3 text-primary" /> Pasien Terpilih
            </span>
            <span className="font-semibold text-foreground mt-0.5">
              {selectedPasienCount} Pasien
            </span>
          </div>

          <div className="flex flex-col rounded-lg border bg-card p-2.5">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Tag className="size-3 text-primary" /> Atribut Dinamis
            </span>
            <span className="font-semibold text-foreground mt-0.5">
              {atribut.length} Parameter
            </span>
          </div>

          <div className="flex flex-col rounded-lg border bg-card p-2.5">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Layers className="size-3 text-primary" /> 5 Stase Ujian
            </span>
            <span className="font-semibold text-foreground mt-0.5">
              {grandTotalScore} Poin Total
            </span>
          </div>
        </div>

        {/* 5 Stations Mini Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2 border-t border-border/50 text-[11px]">
          <div className="flex items-center gap-1.5 rounded-md bg-card p-2 border">
            <Bot className="size-3.5 text-blue-500 shrink-0" />
            <div className="flex flex-col truncate">
              <span className="font-semibold truncate">1. Interaktif AI</span>
              <span className="text-[10px] text-muted-foreground">{staseData.stase1.triggers.length} triggers ({totalScoreStase1}p)</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-md bg-card p-2 border">
            <Activity className="size-3.5 text-amber-500 shrink-0" />
            <div className="flex flex-col truncate">
              <span className="font-semibold truncate">2. Multi Select</span>
              <span className="text-[10px] text-muted-foreground">{staseData.stase2.faktor_risiko.length} faktor ({totalScoreStase2}p)</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-md bg-card p-2 border">
            <ClipboardList className="size-3.5 text-purple-500 shrink-0" />
            <div className="flex flex-col truncate">
              <span className="font-semibold truncate">3. Urutkan Langkah</span>
              <span className="text-[10px] text-muted-foreground">{staseData.stase3.langkah_prosedur.length} langkah ({totalScoreStase3}p)</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-md bg-card p-2 border">
            <ImageIcon className="size-3.5 text-emerald-500 shrink-0" />
            <div className="flex flex-col truncate">
              <span className="font-semibold truncate">4. Single Choice Image</span>
              <span className="text-[10px] text-muted-foreground">{staseData.stase4.images.length} foto ({totalScoreStase4}p)</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-md bg-card p-2 border">
            <HeartHandshake className="size-3.5 text-rose-500 shrink-0" />
            <div className="flex flex-col truncate">
              <span className="font-semibold truncate">5. Interaktif AI</span>
              <span className="text-[10px] text-muted-foreground">{staseData.stase5.triggers.length} asuhan ({totalScoreStase5}p)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import * as React from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Trophy,
  Tv,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RekapHeaderProps {
  contestName?: string;
  periodeName?: string;
}

export function RekapHeader({
  contestName = "Midwife OSCE Circuit Challenge 2026",
  periodeName = "Periode 2026",
}: RekapHeaderProps) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Nav & Breadcrumb Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          render={<Link to="/dashboard/contest" />}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground pl-0"
        >
          <ArrowLeft className="size-4" />
          <span>Kembali ke Daftar Lomba</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 text-xs h-8 shadow-xs"
          >
            <Printer className="size-3.5 text-muted-foreground" />
            <span>Cetak Rekap</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            render={
              <Link
                to="/liveview"
                target="_blank"
                rel="noreferrer"
              />
            }
            className="gap-1.5 text-xs h-8 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10 shadow-xs"
          >
            <Tv className="size-3.5" />
            <span>Buka Liveview Sirkuit</span>
          </Button>
        </div>
      </div>

      {/* Main Title & Context Strip */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl border bg-card p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold gap-1">
              <Trophy className="size-3" />
              <span>Rekapitulasi Penilaian Lomba</span>
            </Badge>
            <Badge variant="outline" className="text-xs font-mono">
              {periodeName}
            </Badge>
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs font-semibold gap-1">
              <CheckCircle2 className="size-3" />
              <span>Status: Selesai & Terverifikasi</span>
            </Badge>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black tracking-tight text-foreground">
            {contestName}
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            Evaluasi komprehensif 5 stase klinis kebidanan terintegrasi (Anamnesis, Faktor Risiko, Prosedur SOP IVA, Interpretasi Visual, dan Asuhan). Memuat perbandingan jawaban seluruh kelompok beserta rubrik kunci jawaban standar.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start md:self-center">
          <div className="flex flex-col items-end gap-1 text-right">
            <span className="text-[11px] text-muted-foreground font-medium">Total Kelompok Dinilai</span>
            <div className="flex items-center gap-1 text-base font-bold text-foreground">
              <Users className="size-4 text-primary" />
              <span>2 Kelompok Peserta</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
              5 dari 5 Pos Teruji
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

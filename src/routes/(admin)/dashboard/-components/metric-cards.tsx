import {
  CheckCircle2,
  GraduationCap,
  Layers,
  TrendingUp,
  Trophy,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Contest } from "@/stores/contest-store";
import type { KelompokRekapData } from "@/routes/(admin)/dashboard/contest/rekap/-components/rekap-data";

interface MetricCardsProps {
  selectedContest: Contest;
  rekapList: KelompokRekapData[];
  totalKasusCount: number;
  totalMahasiswaCount: number;
}

export function MetricCards({
  selectedContest,
  rekapList,
  totalKasusCount,
  totalMahasiswaCount,
}: MetricCardsProps) {
  const contestGroups = selectedContest?.kelompok_list || [];
  const activeMhsCount = contestGroups.reduce(
    (acc, k) => acc + (k.mahasiswa_ids?.length || 0),
    0,
  );

  // Match rekap data for this contest
  const currentRekap = rekapList.filter((r) =>
    contestGroups.some((k) => k.id === r.id || k.nama === r.nama),
  );
  const displayRekap = currentRekap.length > 0 ? currentRekap : rekapList;

  const topTeam = displayRekap[0] || {
    nama: contestGroups[0]?.nama || "Kelompok A",
    totalAkumulasi: 490,
    rataRataSkor: 98.0,
    predikat: "Sangat Kompeten",
  };

  const totalPassing = displayRekap.filter((r) => r.status === "Lulus").length;
  const passRate =
    displayRekap.length > 0
      ? Math.round((totalPassing / displayRekap.length) * 100)
      : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs">
      {/* 1. Kelompok Terbaik */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Kelompok Terbaik
            </CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Trophy className="size-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-2xl text-foreground truncate">
              {topTeam.nama}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <span className="text-foreground font-extrabold text-sm">
              {topTeam.totalAkumulasi}
            </span>
            <span>/ 500 Poin</span>
            <span className="text-muted-foreground">&bull;</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              Avg: {topTeam.rataRataSkor}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Tingkat Kelulusan */}
      <Card className="border-emerald-500/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tingkat Kelulusan
            </CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono font-extrabold text-3xl text-foreground">
              {passRate}%
            </span>
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
              <TrendingUp className="size-3 mr-0.5" />
              Lulus
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {totalPassing} dari {displayRekap.length} kelompok berstatus Lulus
          </p>
        </CardContent>
      </Card>

      {/* 3. Peserta & Mahasiswa */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Peserta & Mahasiswa
            </CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <GraduationCap className="size-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono font-extrabold text-3xl text-foreground">
              {contestGroups.length} Kelompok
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {activeMhsCount} Mahasiswa aktif dari {totalMahasiswaCount} terdaftar
          </p>
        </CardContent>
      </Card>

      {/* 4. Kasus & Stase Sirkuit */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Stase & Bank Kasus
            </CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="size-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono font-extrabold text-3xl text-foreground">
              5 Stase Pos
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              Total 25 Menit
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            5 Menit per stase &bull; {totalKasusCount} Kasus OSCE Tersedia
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

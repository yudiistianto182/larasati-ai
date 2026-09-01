import * as React from "react";
import {
  Award,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  HeartHandshake,
  Image as ImageIcon,
  Layers,
  Medal,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type KelompokRekapData, REKAP_KELOMPOK_LIST } from "./rekap-data";

interface RekapOverviewCardsProps {
  onOpenKelompokModal: (kelompok: KelompokRekapData) => void;
}

export function RekapOverviewCards({ onOpenKelompokModal }: RekapOverviewCardsProps) {
  const groups = REKAP_KELOMPOK_LIST;
  const topGroup = groups[0];

  // Calculate dynamic totals for each group
  const getGroupTotalAkumulasi = (g: KelompokRekapData) =>
    g.stase1.totalSkor + g.stase2.totalSkor + g.stase3.totalSkor + g.stase4.totalSkor + g.stase5.totalSkor;

  const topGroupTotal = getGroupTotalAkumulasi(topGroup);
  const topGroupAvg = (topGroupTotal / 5).toFixed(1);

  const allTotals = groups.map(getGroupTotalAkumulasi);
  const avgAkumulasi = (allTotals.reduce((a, b) => a + b, 0) / groups.length).toFixed(1);
  const avgPosScore = (Number(avgAkumulasi) / 5).toFixed(1);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Juara 1 / Kelompok Terbaik */}
        <Card
          onClick={() => onOpenKelompokModal(topGroup)}
          className="shadow-xs border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card relative overflow-hidden cursor-pointer hover:border-primary/50 transition-all group"
        >
          <CardContent className="p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Kelompok Terbaik
              </span>
              <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <Trophy className="size-4" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-serif font-black text-foreground group-hover:text-primary transition-colors">
                {topGroup.nama}
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-mono font-black text-primary">
                  {topGroupTotal}
                </span>
                <span className="text-xs text-muted-foreground font-mono">/ 500 Poin</span>
                <Badge className="ml-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] px-1.5 py-0">
                  Rata-rata: {topGroupAvg} 🥇
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
              <span className="truncate">{topGroup.kasusNama}</span>
              <span className="text-primary font-semibold flex items-center gap-0.5 shrink-0">
                Lihat Jawaban &rarr;
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Rata-Rata Nilai Sirkuit */}
        <Card className="shadow-xs">
          <CardContent className="p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Rata-Rata Nilai Sirkuit
              </span>
              <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="size-4" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-mono font-black text-foreground">{avgAkumulasi}</span>
                <span className="text-xs text-muted-foreground font-mono">/ 500 Poin</span>
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                Rata-rata per-pos: <strong>{avgPosScore}</strong> / 100 (Ambang batas: 75.0)
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Akumulasi 5 pos stase kebidanan
            </span>
          </CardContent>
        </Card>

        {/* Metric 3: Tingkat Kelulusan */}
        <Card className="shadow-xs">
          <CardContent className="p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tingkat Kelulusan
              </span>
              <div className="flex size-8 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                <CheckCircle2 className="size-4" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-mono font-black text-foreground">100%</span>
              <span className="text-xs text-muted-foreground mt-0.5">
                2 dari 2 Kelompok Lulus
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Semua kelompok mencapai standar kompetensi
            </span>
          </CardContent>
        </Card>

        {/* Metric 4: Kecepatan Rata-Rata */}
        <Card className="shadow-xs">
          <CardContent className="p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Waktu Tempuh Rata-Rata
              </span>
              <div className="flex size-8 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                <Clock className="size-4" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-mono font-black text-foreground">08:07</span>
              <span className="text-xs text-muted-foreground mt-0.5">
                Menit:Detik (Batas Waktu: 10:00)
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Efisiensi waktu sirkuit sangat baik
            </span>
          </CardContent>
        </Card>
      </div>

      {/* 2. Komparasi Tabel Nilai Per-Pos Antar Kelompok (Interactive with Modal trigger) */}
      <Card className="shadow-xs overflow-hidden">
        <CardHeader className="p-5 sm:p-6 pb-3 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base sm:text-lg font-serif font-bold">
                Tabel Rekap Nilai 5 Pos & Akumulasi Akhir
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Nilai akhir merupakan akumulasi total dari Pos 1 s/d Pos 5 (Maks 500 Poin). Klik baris untuk membuka dialog jawaban lengkap.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono self-start sm:self-auto">
              Skor Pos: 100 / Pos &bull; Total: 500 Poin
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-12 text-center">Rank</TableHead>
                <TableHead className="min-w-[190px]">Kelompok & Kasus</TableHead>
                <TableHead className="text-center min-w-[80px]">
                  <div className="flex flex-col items-center">
                    <span className="font-semibold text-xs flex items-center gap-1">
                      <Bot className="size-3 text-primary" /> Pos 1
                    </span>
                    <span className="text-[10px] text-muted-foreground font-normal">Anamnesis</span>
                  </div>
                </TableHead>
                <TableHead className="text-center min-w-[80px]">
                  <div className="flex flex-col items-center">
                    <span className="font-semibold text-xs flex items-center gap-1">
                      <ShieldAlert className="size-3 text-amber-600" /> Pos 2
                    </span>
                    <span className="text-[10px] text-muted-foreground font-normal">Faktor Risiko</span>
                  </div>
                </TableHead>
                <TableHead className="text-center min-w-[80px]">
                  <div className="flex flex-col items-center">
                    <span className="font-semibold text-xs flex items-center gap-1">
                      <Layers className="size-3 text-blue-600" /> Pos 3
                    </span>
                    <span className="text-[10px] text-muted-foreground font-normal">SOP IVA</span>
                  </div>
                </TableHead>
                <TableHead className="text-center min-w-[80px]">
                  <div className="flex flex-col items-center">
                    <span className="font-semibold text-xs flex items-center gap-1">
                      <ImageIcon className="size-3 text-emerald-600" /> Pos 4
                    </span>
                    <span className="text-[10px] text-muted-foreground font-normal">Interpretasi</span>
                  </div>
                </TableHead>
                <TableHead className="text-center min-w-[80px]">
                  <div className="flex flex-col items-center">
                    <span className="font-semibold text-xs flex items-center gap-1">
                      <HeartHandshake className="size-3 text-rose-600" /> Pos 5
                    </span>
                    <span className="text-[10px] text-muted-foreground font-normal">Asuhan</span>
                  </div>
                </TableHead>
                <TableHead className="text-center min-w-[110px]">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xs text-primary">Total Akumulasi</span>
                    <span className="text-[10px] text-muted-foreground font-normal">(Maks: 500)</span>
                  </div>
                </TableHead>
                <TableHead className="text-center min-w-[85px]">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xs text-foreground">Rata-Rata</span>
                    <span className="text-[10px] text-muted-foreground font-normal">(Skala 100)</span>
                  </div>
                </TableHead>
                <TableHead className="text-center min-w-[110px]">Predikat</TableHead>
                <TableHead className="text-right min-w-[125px] pr-5">Aksi Dialog</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => {
                const totalAkumulasi = getGroupTotalAkumulasi(group);
                const rataRata = (totalAkumulasi / 5).toFixed(1);

                return (
                  <TableRow
                    key={group.id}
                    onClick={() => onOpenKelompokModal(group)}
                    className="hover:bg-primary/5 cursor-pointer transition-colors group"
                  >
                    <TableCell className="text-center">
                      {group.rank === 1 ? (
                        <div className="flex size-7 mx-auto items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-500/40 shadow-xs">
                          🥇 1
                        </div>
                      ) : (
                        <div className="flex size-7 mx-auto items-center justify-center rounded-full bg-slate-500/15 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-500/30">
                          🥈 2
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-xs sm:text-sm group-hover:text-primary transition-colors">
                          {group.nama}
                        </span>
                        <span className="text-[11px] text-muted-foreground line-clamp-1">
                          {group.kasusNama}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            Ketua: <strong className="text-foreground">{group.anggota[0]?.nama}</strong> ({group.anggota.length} Anggota)
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Pos 1 Score */}
                    <TableCell className="text-center font-mono font-bold text-xs">
                      <Badge variant="outline" className="bg-muted/50 border-primary/20 text-foreground font-mono">
                        {group.stase1.totalSkor}
                      </Badge>
                    </TableCell>

                    {/* Pos 2 Score */}
                    <TableCell className="text-center font-mono font-bold text-xs">
                      <Badge variant="outline" className="bg-muted/50 border-amber-500/20 text-foreground font-mono">
                        {group.stase2.totalSkor}
                      </Badge>
                    </TableCell>

                    {/* Pos 3 Score */}
                    <TableCell className="text-center font-mono font-bold text-xs">
                      <Badge variant="outline" className="bg-muted/50 border-blue-500/20 text-foreground font-mono">
                        {group.stase3.totalSkor}
                      </Badge>
                    </TableCell>

                    {/* Pos 4 Score */}
                    <TableCell className="text-center font-mono font-bold text-xs">
                      <Badge variant="outline" className="bg-muted/50 border-emerald-500/20 text-foreground font-mono">
                        {group.stase4.totalSkor}
                      </Badge>
                    </TableCell>

                    {/* Pos 5 Score */}
                    <TableCell className="text-center font-mono font-bold text-xs">
                      <Badge variant="outline" className="bg-muted/50 border-rose-500/20 text-foreground font-mono">
                        {group.stase5.totalSkor}
                      </Badge>
                    </TableCell>

                    {/* Total Akumulasi (Maks 500) */}
                    <TableCell className="text-center">
                      <div className="flex items-baseline justify-center gap-0.5 font-mono">
                        <span className="font-black text-sm text-primary">
                          {totalAkumulasi}
                        </span>
                        <span className="text-[10px] text-muted-foreground">/500</span>
                      </div>
                    </TableCell>

                    {/* Rata-Rata */}
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono font-bold text-xs">
                        {rataRata}
                      </Badge>
                    </TableCell>

                    {/* Predikat */}
                    <TableCell className="text-center">
                      <Badge
                        className={
                          group.predikat === "Sangat Kompeten"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[11px]"
                            : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[11px]"
                        }
                      >
                        {group.predikat}
                      </Badge>
                    </TableCell>

                    {/* Action CTA to Open Large Dialog */}
                    <TableCell className="text-right pr-5" onClick={(e) => e.stopPropagation()}>
                      <Button
                        type="button"
                        size="xs"
                        onClick={() => onOpenKelompokModal(group)}
                        className="gap-1 text-xs font-semibold h-7 px-2.5 rounded-lg shadow-xs"
                      >
                        <Eye className="size-3" />
                        <span>Buka Jawaban</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

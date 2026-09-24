import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  Calendar,
  ClipboardCheck,
  Play,
  Trophy,
  Tv,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Contest } from "@/stores/contest-store";

interface AdminHeaderBannerProps {
  contests: Contest[];
  selectedContest: Contest;
  onSelectContestId: (id: string) => void;
}

export function AdminHeaderBanner({
  contests,
  selectedContest,
  onSelectContestId,
}: AdminHeaderBannerProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : format(d, "dd MMM yyyy");
    } catch {
      return dateStr;
    }
  };

  const startPretty = formatDate(selectedContest?.tanggal_mulai);
  const endPretty = formatDate(selectedContest?.tanggal_selesai);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-6 lg:p-7 shadow-xs">
      {/* Background Decorative Glow */}
      <div className="absolute -top-24 -right-24 size-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left Side: Title & Info */}
        <div className="flex flex-col gap-3 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold gap-1.5"
            >
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{selectedContest?.status || "Sedang Berlangsung"}</span>
            </Badge>
            {selectedContest?.periode_nama && (
              <Badge variant="outline" className="text-xs font-medium">
                {selectedContest.periode_nama}
              </Badge>
            )}
          </div>

          <div>
            <h1 className="font-bold text-2xl sm:text-3xl text-foreground tracking-tight leading-snug">
              {selectedContest?.nama || "Midwife OSCE Circuit Challenge"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {selectedContest?.deskripsi ||
                "Evaluasi kompetensi klinis kebidanan komprehensif 5 stase terintegrasi (Anamnesis, Faktor Risiko, Prosedur IVA, Interpretasi Visual, dan Asuhan Konseling)."}
            </p>
          </div>

          {/* Metadata Row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-1">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="size-3.5 text-primary shrink-0" />
              <span>
                {startPretty} s/d {endPretty}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Users className="size-3.5 text-primary shrink-0" />
              <span>{selectedContest?.kelompok_list?.length || 0} Kelompok Bertanding</span>
            </div>
          </div>
        </div>

        {/* Right Side: Contest Selector Dropdown & Quick Actions */}
        <div className="flex flex-col sm:items-end gap-3.5 shrink-0">
          {/* Lomba Selector Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              Pilih Lomba:
            </span>
            <Select
              value={selectedContest?.id || contests[0]?.id}
              onValueChange={(val) => {
                if (val) onSelectContestId(val);
              }}
            >
              <SelectTrigger className="h-9 w-full sm:w-64 text-xs font-semibold bg-background/80 border-primary/30 shadow-xs">
                <SelectValue placeholder="Pilih Lomba untuk Di-preview" />
              </SelectTrigger>
              <SelectContent>
                {contests.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    <span className="font-semibold">{c.nama}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              className="h-8 text-xs font-semibold gap-1.5"
              nativeButton={false}
              render={
                <Link
                  to="/liveview"
                  search={{
                    mode: "podium",
                    contestId: selectedContest?.id,
                    simulate: true,
                  }}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              <Trophy className="size-3.5" />
              <span>Simulasi Podium</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs font-semibold gap-1.5 border-primary/30"
              nativeButton={false}
              render={
                <Link
                  to="/liveview"
                  search={{ contestId: selectedContest?.id }}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              <Tv className="size-3.5 text-primary" />
              <span>Liveview</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs font-semibold gap-1.5"
              nativeButton={false}
              render={
                <Link
                  to="/dashboard/contest/rekap"
                  search={{ contestId: selectedContest?.id }}
                />
              }
            >
              <ClipboardCheck className="size-3.5 text-emerald-600" />
              <span>Rekap Nilai</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs font-semibold gap-1.5"
              nativeButton={false}
              render={
                <Link
                  to="/lomba"
                  search={{ lombaId: selectedContest?.id ? String(selectedContest.id) : undefined }}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              <Play className="size-3.5" />
              <span>Ujian</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { KelompokRekapData } from "@/routes/(admin)/dashboard/contest/rekap/-components/rekap-data";

interface PodiumPreviewCardProps {
  rekapList: KelompokRekapData[];
  contestId: string;
}

export function PodiumPreviewCard({ rekapList, contestId }: PodiumPreviewCardProps) {
  const top1 = rekapList[0];
  const top2 = rekapList[1];

  return (
    <Card className="shadow-xs flex flex-col justify-between overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              Podium Kejuaraan Sirkuit
            </CardTitle>
            <CardDescription className="text-xs">
              Peringkat resmi kelompok tercepat & nilai tertinggi
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs font-semibold gap-1.5 px-2.5 shrink-0"
            nativeButton={false}
            render={
              <Link
                to="/liveview"
                search={{ mode: "podium", contestId, simulate: true }}
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            <span>Buka Simulasi Podium</span>
            <ExternalLink className="size-3 opacity-70" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 flex flex-col gap-4">
        {/* 2-Stand Visual Mini Podium */}
        <div className="grid grid-cols-2 gap-3 items-end pt-2 pb-1">
          {/* Juara 2 */}
          <div className="flex flex-col items-center text-center gap-2 p-3 rounded-2xl border bg-muted/30 shadow-xs">
            <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground border shadow-xs font-bold text-sm">
              #2
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs text-foreground truncate max-w-[120px]">
                {top2?.nama || "Kelompok B"}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {top2?.totalAkumulasi || 430} Poin
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
              {top2?.waktuPengerjaan?.slice(0, 8) || "08m 30s"}
            </Badge>
            {/* Stand Pillar 2 */}
            <div className="w-full h-12 rounded-t-xl bg-muted border-t border-x flex items-center justify-center">
              <span className="font-semibold text-muted-foreground text-xs">Peringkat 2</span>
            </div>
          </div>

          {/* Juara 1: Aksen Gold */}
          <div className="flex flex-col items-center text-center gap-2 p-3 rounded-2xl border-2 border-amber-400/60 bg-gradient-to-t from-amber-500/10 via-card to-amber-500/5 shadow-xs">
            <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-tr from-[#b8860b] via-[#f59e0b] to-[#d4af37] text-slate-950 shadow-xs font-black text-base">
              #1
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-foreground truncate max-w-[130px]">
                {top1?.nama || "Kelompok A"}
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                {top1?.totalAkumulasi || 490} Poin
              </span>
            </div>
            <Badge variant="outline" className="border-amber-500/30 text-amber-700 dark:text-amber-300 bg-amber-500/10 text-[10px] font-mono px-1.5 py-0">
              {top1?.waktuPengerjaan?.slice(0, 8) || "07m 45s"}
            </Badge>
            {/* Stand Pillar 1 (Gold) */}
            <div className="w-full h-18 rounded-t-xl bg-gradient-to-t from-amber-600/30 via-amber-500/40 to-amber-500/50 border-t-2 border-x-2 border-amber-400/80 flex items-center justify-center shadow-xs">
              <span className="font-bold text-xs text-amber-950 dark:text-amber-200">
                Juara 1
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import * as React from "react";
import {
  Award,
  CheckCircle2,
  Clock,
  Eye,
  Flag,
  Medal,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GroupRaceState } from "./liveview-types";

interface ModePodiumViewProps {
  groups: GroupRaceState[];
  onSelectGroup?: (groupId: string) => void;
  onSwitchToCircuit?: () => void;
}

export function ModePodiumView({
  groups,
  onSelectGroup,
  onSwitchToCircuit,
}: ModePodiumViewProps) {
  // Only groups that have reached Pos 5 (Finish line)
  const finishedGroups = React.useMemo(() => {
    return groups
      .filter((g) => g.pos >= 5)
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [groups]);

  const firstPlace = finishedGroups[0] || null;
  const secondPlace = finishedGroups[1] || null;
  const thirdPlace = finishedGroups[2] || null;
  const otherFinishers = finishedGroups.slice(3);

  return (
    <div className="relative size-full flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 overflow-y-auto select-none">
      {/* Radiant Background Ambient FX */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,_#eab308_0%,_transparent_70%)] opacity-20 pointer-events-none" />

      {/* 1. Header Title & Finisher Counter */}
      <div className="relative z-10 flex flex-col items-center text-center gap-1.5 max-w-xl mx-auto">
        <div className="flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] font-black text-xs px-3 py-0.5 uppercase tracking-widest shadow-md">
            🏆 Podium Kejuaraan Sirkuit
          </Badge>
          <Badge
            variant="outline"
            className="border-[#fde047]/60 text-[#fde047] bg-[#140e08] text-xs font-mono px-2.5 py-0.5"
          >
            {finishedGroups.length} dari {groups.length} Kelompok Finish
          </Badge>
        </div>

        <h2 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl uppercase tracking-wide bg-gradient-to-r from-[#fffbeb] via-[#fde047] to-[#ca8a04] bg-clip-text text-transparent drop-shadow-md">
          Podium Kelompok Larasati Journey
        </h2>

        <p className="text-xs text-[#e6cf9b]/80 max-w-md leading-relaxed">
          Peringkat resmi kelompok yang telah menuntaskan seluruh 5 Pos Sirkuit OSCE Kebidanan berdasarkan perolehan skor dan waktu finish.
        </p>
      </div>

      {/* 2. Main Content: Either Empty State or 2-Stand / 3-Tier Podium */}
      {finishedGroups.length === 0 ? (
        /* Empty State (No groups finished yet) */
        <div className="relative z-10 my-auto flex flex-col items-center text-center gap-4 max-w-md p-8 rounded-3xl border-2 border-dashed border-[#8c6d23]/40 bg-[#160f09]/80 backdrop-blur-xs">
          <div className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-tr from-[#3a2612] to-[#1a1108] border-2 border-[#d4af37]/40 text-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.2)]">
            <Trophy className="size-10 opacity-70" />
            <div className="absolute inset-0 rounded-full border border-[#fde047] animate-ping opacity-25" />
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-serif font-bold text-base text-[#fff8db]">
              Belum Ada Kelompok yang Mencapai Finish
            </span>
            <p className="text-xs text-[#e6cf9b]/70 leading-relaxed">
              Podium kejuaraan akan secara otomatis menampilkan kelompok begitu ada tim yang berhasil menuntaskan Pos 5.
            </p>
          </div>

          {/* Current Leader Status in Circuit */}
          <div className="w-full rounded-2xl border border-[#8c6d23]/30 bg-[#100b06] p-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Flag className="size-4 text-[#d4af37]" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-[#e6cf9b]/60 font-mono">Kelompok Terdepan:</span>
                <span className="font-bold text-[#fff8db]">
                  {groups[0]?.name || "Kelompok A"}
                </span>
              </div>
            </div>

            <Badge variant="outline" className="border-[#fde047]/60 text-[#fde047] font-mono text-[11px]">
              Pos {groups[0]?.pos || 0} / 05
            </Badge>
          </div>

          {onSwitchToCircuit && (
            <Button
              type="button"
              onClick={onSwitchToCircuit}
              className="h-9 px-5 rounded-xl font-serif font-bold text-xs bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] hover:brightness-110 shadow-md cursor-pointer"
            >
              <span>Kembali ke Tampilan Sirkuit</span>
            </Button>
          )}
        </div>
      ) : (
        /* Grand Podium Display (Optimized for 2 Teams) */
        <div className="relative z-10 w-full max-w-3xl mx-auto my-auto flex flex-col items-center gap-8">
          {/* 2-Podium Stands Row (Juara 2 Perak - Juara 1 Emas) */}
          <div className="grid grid-cols-2 gap-6 sm:gap-10 items-end w-full max-w-xl pt-8">
            {/* ============================================================ */}
            {/* PODIUM #2: JUARA 2 (PERAK)                                  */}
            {/* ============================================================ */}
            <div className="flex flex-col items-center gap-3">
              {secondPlace ? (
                <div
                  onClick={() => onSelectGroup?.(secondPlace.id)}
                  className="flex flex-col items-center text-center gap-2 cursor-pointer group animate-in fade-in zoom-in-95 duration-500"
                >
                  <div className="relative flex size-16 sm:size-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-slate-400 via-slate-200 to-slate-400 text-slate-900 border-2 border-white shadow-[0_0_25px_rgba(203,213,225,0.4)] group-hover:scale-105 transition-transform font-black text-xl">
                    🥈
                  </div>
                  <Badge className="bg-slate-300 text-slate-900 font-bold text-[11px] px-2.5 py-0.5">
                    Juara 2
                  </Badge>
                  <span className="font-serif font-bold text-sm sm:text-base text-[#f1f5f9] group-hover:text-[#fde047] transition-colors line-clamp-1 max-w-[150px] sm:max-w-[180px]">
                    {secondPlace.name}
                  </span>
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base sm:text-lg font-mono font-bold text-slate-300">
                        {secondPlace.totalScore} Poin
                      </span>
                      <Badge variant="outline" className="border-slate-400 text-slate-300 font-mono text-[10px]">
                        ⏱️ {secondPlace.timeElapsedFormatted}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Rata-rata: {(secondPlace.totalScore / 5).toFixed(1)} / 100
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center gap-2 opacity-40">
                  <div className="size-16 rounded-2xl bg-[#22170d] border border-[#8c6d23]/40 flex items-center justify-center text-sm font-mono text-[#d4af37]">
                    #2
                  </div>
                  <span className="text-xs text-[#e6cf9b]/50">Menunggu Juara 2</span>
                </div>
              )}

              {/* Pillar 2 */}
              <div className="w-full h-40 sm:h-48 rounded-t-3xl border-t-2 border-x-2 border-slate-400/60 bg-gradient-to-b from-slate-700/80 via-slate-800/90 to-[#140e08]/95 p-4 flex flex-col items-center justify-between shadow-lg">
                <span className="font-serif font-black text-3xl sm:text-4xl text-slate-300">
                  2
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                  Silver Medal
                </span>
              </div>
            </div>

            {/* ============================================================ */}
            {/* PODIUM #1: JUARA 1 (EMAS / TERTINGGI)                       */}
            {/* ============================================================ */}
            <div className="flex flex-col items-center gap-3 -mt-6 sm:-mt-10">
              {firstPlace ? (
                <div
                  onClick={() => onSelectGroup?.(firstPlace.id)}
                  className="flex flex-col items-center text-center gap-2 cursor-pointer group animate-in fade-in zoom-in-95 duration-500"
                >
                  <div className="relative flex size-20 sm:size-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-[#8c6d23] via-[#fde047] to-[#d4af37] text-[#140e09] border-2 border-[#fff8db] shadow-[0_0_40px_rgba(253,224,71,0.6)] group-hover:scale-105 transition-transform animate-bounce">
                    <Trophy className="size-10 sm:size-12 stroke-[2.5]" />
                  </div>
                  <Badge className="bg-gradient-to-r from-[#8c6d23] to-[#d4af37] text-[#14100c] font-black text-xs px-3 py-0.5 uppercase tracking-wider shadow-md">
                    Champion
                  </Badge>
                  <span className="font-serif font-black text-base sm:text-lg text-[#fff8db] group-hover:text-[#fde047] transition-colors line-clamp-1 max-w-[160px] sm:max-w-[220px]">
                    {firstPlace.name}
                  </span>
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg sm:text-xl font-mono font-black text-[#fde047]">
                        {firstPlace.totalScore} Poin
                      </span>
                      <Badge variant="outline" className="border-[#fde047]/60 text-[#fde047] font-mono text-[10px]">
                        ⏱️ {firstPlace.timeElapsedFormatted}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-[#fde047]/90 font-mono font-semibold">
                      Rata-rata: {(firstPlace.totalScore / 5).toFixed(1)} / 100
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center gap-2 opacity-40">
                  <div className="size-20 rounded-3xl bg-[#22170d] border border-[#8c6d23]/40 flex items-center justify-center text-sm font-mono text-[#d4af37]">
                    #1
                  </div>
                  <span className="text-xs text-[#e6cf9b]/50">Menunggu Juara 1</span>
                </div>
              )}

              {/* Pillar 1 (Tallest) */}
              <div className="w-full h-52 sm:h-64 rounded-t-3xl border-t-2 border-x-2 border-[#fde047] bg-gradient-to-b from-[#8c6d23]/90 via-[#3a2612]/95 to-[#140e08] p-4 flex flex-col items-center justify-between shadow-[0_0_35px_rgba(212,175,55,0.35)]">
                <span className="font-serif font-black text-4xl sm:text-5xl text-[#fde047] drop-shadow-md">
                  1
                </span>
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#fde047]">
                  Gold Medal
                </span>
              </div>
            </div>
          </div>

          {/* 3rd place or other finishers if present */}
          {thirdPlace && (
            <div className="w-full flex flex-col gap-2 border-t border-[#8c6d23]/30 pt-4">
              <span className="text-xs font-bold text-[#d4af37] font-serif uppercase tracking-wider">
                Kelompok Finisher Lainnya:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[thirdPlace, ...otherFinishers].map((g, idx) => (
                  <div
                    key={g.id}
                    onClick={() => onSelectGroup?.(g.id)}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#8c6d23]/30 bg-[#1a1108]/90 hover:border-[#d4af37] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Badge variant="outline" className="border-[#8c6d23] text-[#d4af37] font-mono text-xs">
                        #{idx + 3}
                      </Badge>
                      <span className="font-bold text-xs text-[#fff8db]">{g.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-[#fde047] font-bold">{g.totalScore} Poin</span>
                      <span className="text-[#e6cf9b]/60">⏱️ {g.timeElapsedFormatted}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Bottom Quick Navigation Action Bar */}
      <div className="relative z-10 w-full flex items-center justify-between border-t border-[#8c6d23]/25 pt-3 mt-4 text-xs text-[#d4af37]/75">
        <span className="font-mono">
          🏁 Sirkuit 5 Pos &bull; Finish Line Pos 5
        </span>
        {onSwitchToCircuit && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSwitchToCircuit}
            className="text-xs text-[#fde047] hover:text-[#fff8db] hover:bg-[#d4af37]/10"
          >
            <span>&larr; Lihat Peta Sirkuit</span>
          </Button>
        )}
      </div>
    </div>
  );
}

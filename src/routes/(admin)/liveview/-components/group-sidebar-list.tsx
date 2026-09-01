import * as React from "react";
import { ChevronRight, Eye, Sparkles, Trophy, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GroupRaceState } from "./liveview-types";
import { CIRCUIT_WAYPOINTS } from "./liveview-types";

interface GroupSidebarListProps {
  groups: GroupRaceState[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
  onStepGroup: (groupNum: number, delta: number) => void;
}

export function GroupSidebarList({
  groups,
  selectedGroupId,
  onSelectGroup,
  onStepGroup,
}: GroupSidebarListProps) {
  const sorted = [...groups].sort((a, b) => b.pos - a.pos);

  return (
    <aside className="w-full xl:w-[340px] flex flex-col gap-3 rounded-3xl border border-[#8c6d23]/40 bg-[#160f09]/95 backdrop-blur-md p-4 shadow-2xl select-none text-[#fef08a] shrink-0 h-full overflow-hidden">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-[#8c6d23]/30 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
            <Users className="size-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xs sm:text-sm text-[#fff8db]">
              Daftar Kelompok Peserta
            </h3>
            <p className="text-[10px] text-[#d4af37]/80">
              Pilih kelompok untuk inspeksi jawaban live
            </p>
          </div>
        </div>

        <Badge className="bg-[#24170d] text-[#d4af37] border border-[#8c6d23]/50 text-[10px] font-bold">
          {groups.length} Tim
        </Badge>
      </div>

      {/* 4 Group Cards List (Scrollable if needed) */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-[#8c6d23]/50">
        {sorted.map((grp, idx) => {
          const isSelected = selectedGroupId === grp.id;
          const currentWp = CIRCUIT_WAYPOINTS.find((w) => w.pos === grp.pos) || CIRCUIT_WAYPOINTS[0];
          const progressPct = Math.round((grp.pos / 5) * 100);

          let medal = <span className="text-[11px] font-bold text-[#c4a46a]">#{idx + 1}</span>;
          if (idx === 0 && grp.pos > 0) medal = <span className="text-xs">🥇</span>;
          else if (idx === 1 && grp.pos > 0) medal = <span className="text-xs">🥈</span>;
          else if (idx === 2 && grp.pos > 0) medal = <span className="text-xs">🥉</span>;

          return (
            <div
              key={grp.id}
              onClick={() => onSelectGroup(grp.id)}
              className={cn(
                "p-3 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col gap-2 relative group",
                isSelected
                  ? "border-[#d4af37] bg-gradient-to-r from-[#4d3316]/95 via-[#2b1c0e]/95 to-[#1c120a]/95 ring-2 ring-[#d4af37]/60 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                  : "border-[#8c6d23]/35 bg-[#20150d]/80 hover:border-[#d4af37]/70 hover:bg-[#2b1c11]/90 shadow-md",
              )}
            >
              {/* Group Name & Badge */}
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  {medal}
                  <div
                    className="size-7 rounded-full flex items-center justify-center font-bold text-xs text-black shadow-md shrink-0"
                    style={{ backgroundColor: grp.color }}
                  >
                    0{grp.groupNum}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-serif font-bold text-xs text-[#fff8db] leading-tight truncate">
                      {grp.name}
                    </span>
                    <span className="text-[10px] text-[#d4af37]/80 truncate">
                      {currentWp.name}
                    </span>
                  </div>
                </div>

                {/* Score & Step Action */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onStepGroup(grp.groupNum, -1)}
                    disabled={grp.pos <= 0}
                    className="size-5 rounded bg-[#160e08] border border-[#8c6d23]/60 text-[#fef08a] hover:bg-[#342416] text-[10px] font-bold flex items-center justify-center transition disabled:opacity-20 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono text-[11px] font-bold text-[#d4af37] w-5 text-center">
                    {grp.pos}/5
                  </span>
                  <button
                    type="button"
                    onClick={() => onStepGroup(grp.groupNum, 1)}
                    disabled={grp.pos >= 5}
                    className="size-5 rounded bg-[#160e08] border border-[#8c6d23]/60 text-[#fef08a] hover:bg-[#342416] text-[10px] font-bold flex items-center justify-center transition disabled:opacity-20 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Progress Bar & Live Status */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#d4af37]/75 font-medium flex items-center gap-1">
                    {grp.pos === 5 ? (
                      <span className="text-emerald-400 font-bold">🏆 Selesai Finish</span>
                    ) : grp.pos > 0 ? (
                      <span className="text-[#fde047] font-semibold animate-pulse">● Live Pengerjaan</span>
                    ) : (
                      <span className="text-muted-foreground">Belum Mulai</span>
                    )}
                  </span>
                  <span className="font-mono font-bold text-[#fde047]">{progressPct}%</span>
                </div>

                <div className="w-full bg-[#120c07] rounded-full h-1.5 overflow-hidden border border-[#8c6d23]/30">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%`, backgroundColor: grp.color }}
                  />
                </div>
              </div>

              {/* Bottom Inspection Prompt */}
              <div className="border-t border-[#8c6d23]/30 pt-1.5 flex items-center justify-between text-[10px]">
                <span className="text-[#e6cf9b] flex items-center gap-1 group-hover:text-[#fde047] transition-colors">
                  <Eye className="size-3 text-[#d4af37]" />
                  <span>{isSelected ? "Sedang Diinspeksi" : "Klik untuk Lihat Detail"}</span>
                </span>
                <ChevronRight className={cn("size-3.5 transition-transform", isSelected ? "rotate-90 text-[#fde047]" : "text-[#d4af37]/60 group-hover:translate-x-0.5")} />
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

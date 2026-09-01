import * as React from "react";
import {
  Dices,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GroupRaceState } from "./liveview-types";
import { CIRCUIT_WAYPOINTS } from "./liveview-types";

interface LiveviewCommandDeckProps {
  groups: GroupRaceState[];
  isAutoRacing: boolean;
  onStepGroup: (groupNum: number, delta: number) => void;
  onSimulateStep: () => void;
  onToggleAutoRace: () => void;
  onResetRace: () => void;
}

export function LiveviewCommandDeck({
  groups,
  isAutoRacing,
  onStepGroup,
  onSimulateStep,
  onToggleAutoRace,
  onResetRace,
}: LiveviewCommandDeckProps) {
  // Sort groups by position descending (leaders first)
  const sortedGroups = [...groups].sort((a, b) => b.pos - a.pos);
  const leaderPos = sortedGroups[0]?.pos ?? 0;

  const raceStatus =
    leaderPos === 0
      ? { text: "Bersiap", badgeClass: "bg-[#382512] text-[#fde047] border-[#eab308]/40" }
      : leaderPos >= 5
        ? { text: "Selesai!", badgeClass: "bg-emerald-950 text-emerald-300 border-emerald-500/50 animate-pulse" }
        : { text: "Berlangsung", badgeClass: "bg-[#854d0e] text-[#fffbeb] border-[#fde047]/60" };

  return (
    <section className="w-full flex flex-col xl:flex-row gap-5 items-stretch select-none text-[#fef08a]">
      {/* 1. Left: Larasati Prominent Profile Card */}
      <div className="rounded-3xl border border-[#eab308]/50 bg-gradient-to-br from-[#1c120b]/95 to-[#100b07]/95 backdrop-blur-md p-5 flex items-center gap-4 shadow-2xl xl:w-[360px] shrink-0">
        <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#fde047] shrink-0 shadow-lg bg-[#20140a]">
          <img
            src="/images/larasati.png"
            alt="Larasati"
            className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              // fallback
              (e.currentTarget as HTMLImageElement).src =
                "https://ui-avatars.com/api/?name=Larasati&background=d4af37&color=000";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#140e09]/80 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="flex flex-col justify-center min-w-0">
          <div className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-[#fde047] tracking-wider mb-0.5">
            <Sparkles className="size-3 text-[#fde047]" />
            <span>Tokoh Pemandu</span>
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold bg-gradient-to-r from-[#fffbeb] via-[#fde047] to-[#ca8a04] bg-clip-text text-transparent leading-tight">
            Larasati
          </h3>
          <p className="text-[11px] text-[#e6cf9b] italic mt-1 leading-snug">
            &ldquo;Membimbing calon bidan menguasai seni anamnesis & asuhan berbudaya.&rdquo;
          </p>
        </div>
      </div>

      {/* 2. Center: 4-Group Live Leaderboard Grid */}
      <div className="rounded-3xl border border-[#eab308]/40 bg-gradient-to-br from-[#1c120b]/95 to-[#100b07]/95 backdrop-blur-md p-5 flex-1 flex flex-col justify-between shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#854d0e]/40 mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-[#fde047]" />
            <h2 className="font-serif text-sm sm:text-base font-bold text-[#fef08a]">
              Klasemen & Progres Kelompok
            </h2>
          </div>

          <span
            className={cn(
              "text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border shadow-xs",
              raceStatus.badgeClass,
            )}
          >
            {raceStatus.text}
          </span>
        </div>

        {/* 2 Groups Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sortedGroups.map((grp, index) => {
            const isLeader = index === 0 && grp.pos > 0;
            const progressPct = Math.round((grp.pos / 5) * 100);
            const waypoint = CIRCUIT_WAYPOINTS.find((w) => w.pos === grp.pos) || CIRCUIT_WAYPOINTS[0];

            let medalIcon = <span className="text-xs font-bold text-[#c4a46a]">#{index + 1}</span>;
            if (index === 0 && grp.pos > 0) medalIcon = <span className="text-sm">🥇</span>;
            else if (index === 1 && grp.pos > 0) medalIcon = <span className="text-sm">🥈</span>;
            else if (index === 2 && grp.pos > 0) medalIcon = <span className="text-sm">🥉</span>;

            return (
              <div
                key={grp.id}
                className={cn(
                  "p-3 rounded-2xl flex flex-col gap-2 transition-all duration-300 border shadow-md",
                  isLeader
                    ? "border-[#fde047] bg-gradient-to-br from-[#553817]/90 to-[#23170c]/95 shadow-[0_0_20px_rgba(234,179,8,0.25)]"
                    : "border-[#eab308]/25 bg-gradient-to-br from-[#2a1c11]/80 to-[#140e09]/90 hover:border-[#fde047]/60",
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {medalIcon}
                    <div
                      className="size-6 rounded-full flex items-center justify-center font-bold text-[11px] text-black shadow-inner shrink-0"
                      style={{ backgroundColor: grp.color }}
                    >
                      {grp.groupNum}
                    </div>
                    <span className="font-bold text-xs text-[#fef08a] leading-none truncate">
                      {grp.name}
                    </span>
                  </div>

                  {/* Manual Step + / - Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onStepGroup(grp.groupNum, -1)}
                      disabled={grp.pos <= 0}
                      className="size-5 rounded bg-[#26190e] border border-[#854d0e] text-[#fef08a] hover:bg-[#3d2714] text-[10px] font-bold flex items-center justify-center transition disabled:opacity-30 cursor-pointer"
                      title="Mundur 1 Langkah"
                    >
                      -
                    </button>
                    <span className="font-mono text-[11px] font-bold text-[#fde047] w-6 text-center">
                      {grp.pos}/5
                    </span>
                    <button
                      type="button"
                      onClick={() => onStepGroup(grp.groupNum, 1)}
                      disabled={grp.pos >= 5}
                      className="size-5 rounded bg-[#26190e] border border-[#854d0e] text-[#fef08a] hover:bg-[#3d2714] text-[10px] font-bold flex items-center justify-center transition disabled:opacity-30 cursor-pointer"
                      title="Maju 1 Langkah"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Current Pos Label */}
                <div className="flex items-center justify-between text-[10px] text-[#c4a46a] mt-0.5">
                  <span className="truncate max-w-[120px] font-medium">{waypoint.name}</span>
                  <span className="font-mono font-bold text-[#fde047]">{progressPct}%</span>
                </div>

                <div className="w-full bg-[#18110a] rounded-full h-1.5 overflow-hidden border border-[#854d0e]/30">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%`, backgroundColor: grp.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Right: Admin Simulation Control Deck */}
      <div className="rounded-3xl border border-[#eab308]/50 bg-gradient-to-br from-[#1c120b]/95 to-[#100b07]/95 backdrop-blur-md p-5 flex flex-col justify-center gap-3 xl:w-[300px] shrink-0 shadow-2xl">
        <Button
          type="button"
          onClick={onSimulateStep}
          className="w-full h-11 bg-gradient-to-r from-[#eab308] via-[#ca8a04] to-[#854d0e] hover:from-[#fde047] hover:to-[#a16207] text-[#140e09] font-serif font-black tracking-wider text-xs uppercase shadow-[0_4px_20px_rgba(234,179,8,0.3)] active:scale-95 border border-[#fff8db]/60 gap-2"
        >
          <Dices className="size-5" />
          <span>Simulasi Langkah</span>
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onToggleAutoRace}
            className={cn(
              "h-9 text-xs font-semibold gap-1.5 transition-all",
              isAutoRacing
                ? "bg-[#854d0e] text-white border-[#fde047] animate-pulse"
                : "bg-[#24160c] hover:bg-[#382313] border-[#854d0e]/70 text-[#fde047]",
            )}
          >
            {isAutoRacing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            <span>{isAutoRacing ? "Jeda" : "Auto Race"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onResetRace}
            className="h-9 text-xs font-semibold gap-1 bg-[#24160c] hover:bg-[#382313] border-[#854d0e]/70 text-[#e6cf9b]"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset</span>
          </Button>
        </div>
      </div>
    </section>
  );
}

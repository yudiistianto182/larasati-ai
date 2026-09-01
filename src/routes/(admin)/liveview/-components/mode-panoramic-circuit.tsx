import * as React from "react";
import { Flag, Maximize2, Sparkles, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GroupRaceState } from "./liveview-types";
import { CIRCUIT_WAYPOINTS } from "./liveview-types";

interface ModePanoramicCircuitProps {
  groups: GroupRaceState[];
  isMinimized?: boolean;
  onMaximize?: () => void;
  onSelectGroup?: (groupId: string) => void;
  onSelectWaypoint?: (pos: number) => void;
}

export function ModePanoramicCircuit({
  groups,
  isMinimized = false,
  onMaximize,
  onSelectGroup,
  onSelectWaypoint,
}: ModePanoramicCircuitProps) {
  // Count how many avatars are on each position to calculate smart non-overlapping offsets
  const getAvatarOffset = (pos: number, groupIndexAtPos: number) => {
    if (groupIndexAtPos === 0) return { x: -24, y: -74 };
    if (groupIndexAtPos === 1) return { x: -52, y: -62 };
    if (groupIndexAtPos === 2) return { x: 4, y: -62 };
    return { x: -24, y: -108 };
  };

  const posCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  return (
    <div
      onClick={isMinimized ? onMaximize : undefined}
      className={cn(
        "relative select-none transition-all duration-500",
        isMinimized
          ? "w-72 sm:w-80 h-44 sm:h-48 rounded-2xl border-2 border-[#d4af37] shadow-[0_15px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(212,175,55,0.4)] cursor-pointer hover:scale-105 z-30"
          : "w-full h-full flex-1 rounded-3xl border-[2.5px] border-[#eab308]/60 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(234,179,8,0.2)]",
      )}
    >
      {/* Keyframe Animations for Energy Dash & Slow Pulsing Color Transition */}
      <style>{`
        @keyframes dashEnergyPulse {
          to { stroke-dashoffset: -1000; }
        }
        @keyframes activeStationSlowGlowPulse {
          0%, 100% {
            background-color: #24170d;
            border-color: rgba(212, 175, 55, 0.7);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.85);
            color: #fff8db;
          }
          50% {
            background-color: #71460d;
            border-color: #fde047;
            box-shadow: 0 0 30px rgba(253, 224, 71, 0.85), inset 0 0 15px rgba(253, 224, 71, 0.4);
            color: #ffffff;
          }
        }
        @keyframes activePillPulse {
          0%, 100% {
            border-color: #d4af37;
            box-shadow: 0 0 12px rgba(212, 175, 55, 0.4);
          }
          50% {
            border-color: #fde047;
            box-shadow: 0 0 28px rgba(253, 224, 71, 0.9), 0 0 45px rgba(234, 179, 8, 0.5);
          }
        }
      `}</style>

      {/* Minimized Expand Indicator Overlay */}
      {isMinimized && (
        <div className="absolute top-2 right-2 z-40 flex items-center gap-1 rounded-lg bg-black/85 border border-[#d4af37] px-2 py-0.5 text-[10px] text-[#fef08a] font-bold shadow-md">
          <Maximize2 className="size-3 text-[#d4af37]" />
          <span>Perbesar Peta</span>
        </div>
      )}

      {/* Main Panoramic Arena Canvas Container */}
      <div className="size-full relative overflow-hidden rounded-[inherit] bg-[#0c0805]">
        {/* 1. SCENIC BACKGROUND PAINTING LAYER */}
        <div className="absolute inset-0 size-full z-0">
          <img
            src="/images/latarbelakangtrack.png"
            alt="Latar Belakang Track Larasati"
            className="size-full object-cover object-center filter brightness-[0.78] contrast-[1.08]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0705]/85 via-transparent to-[#0a0705]/50 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0705]/40 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* 2. Tokoh Pemandu (Larasati) Centered at Top INSIDE the Arena Board */}
        {!isMinimized && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#20140a]/95 via-[#342010]/95 to-[#20140a]/95 border-2 border-[#d4af37]/80 shadow-[0_8px_25px_rgba(0,0,0,0.85),0_0_20px_rgba(212,175,55,0.3)] backdrop-blur-md">
            <div className="relative size-11 sm:size-12 rounded-xl overflow-hidden border-2 border-[#fde047] shrink-0 shadow-md bg-[#20140a]">
              <img
                src="/images/larasati.png"
                alt="Larasati"
                className="size-full object-cover object-top"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://ui-avatars.com/api/?name=Larasati&background=d4af37&color=000";
                }}
              />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-3 text-[#fde047]" />
                <span className="font-serif font-black text-xs sm:text-sm bg-gradient-to-r from-[#fffbeb] via-[#fde047] to-[#ca8a04] bg-clip-text text-transparent">
                  Larasati
                </span>
                <Badge className="bg-[#140e08] text-[#f9f586] border border-[#d4af37] text-[9px] font-bold px-1.5 py-0">
                  Tokoh Pemandu
                </Badge>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#e6cf9b] italic leading-tight">
                &ldquo;Membimbing calon bidan menguasai seni anamnesis & asuhan berbudaya.&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* 3. Royal Corner Ornaments */}
        {!isMinimized && (
          <>
            <div className="absolute top-3 left-3 size-8 border-t-3 border-l-3 border-[#fde047] rounded-tl-lg pointer-events-none z-30 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
            <div className="absolute top-3 right-3 size-8 border-t-3 border-r-3 border-[#fde047] rounded-tr-lg pointer-events-none z-30 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
            <div className="absolute bottom-3 left-3 size-8 border-b-3 border-l-3 border-[#fde047] rounded-bl-lg pointer-events-none z-30 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
            <div className="absolute bottom-3 right-3 size-8 border-b-3 border-r-3 border-[#fde047] rounded-br-lg pointer-events-none z-30 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
          </>
        )}

        {/* 4. SVG ENERGY PATHS WITH RADIANT GOLD GRADIENTS */}
        <svg
          className="absolute inset-0 size-full pointer-events-none z-10"
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Rich Radiant Gold Gradient for the main animated path */}
            <linearGradient id="royalGoldTrackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff8db" />
              <stop offset="20%" stopColor="#fde047" />
              <stop offset="45%" stopColor="#d4af37" />
              <stop offset="70%" stopColor="#ca8a04" />
              <stop offset="88%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#9a6a16" />
            </linearGradient>

            {/* Glowing Golden Aura Filter */}
            <filter id="goldRoadAura" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Track Border */}
          <path
            d="M 100 162 C 160 170, 190 378, 260 378 C 330 378, 370 198, 440 198 C 510 198, 540 420, 610 420 C 680 420, 700 222, 770 222 C 830 222, 860 378, 910 378"
            fill="none"
            stroke="#422508"
            strokeWidth={isMinimized ? 20 : 34}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
          />

          {/* Base Dark Track */}
          <path
            d="M 100 162 C 160 170, 190 378, 260 378 C 330 378, 370 198, 440 198 C 510 198, 540 420, 610 420 C 680 420, 700 222, 770 222 C 830 222, 860 378, 910 378"
            fill="none"
            stroke="#180d04"
            strokeWidth={isMinimized ? 14 : 24}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Soft Golden Ambient Underlay Glow */}
          <path
            d="M 100 162 C 160 170, 190 378, 260 378 C 330 378, 370 198, 440 198 C 510 198, 540 420, 610 420 C 680 420, 700 222, 770 222 C 830 222, 860 378, 910 378"
            fill="none"
            stroke="url(#royalGoldTrackGrad)"
            strokeWidth={isMinimized ? 8 : 14}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
            filter="url(#goldRoadAura)"
          />

          {/* Animated Radiant Gold Gradient Energy Dash Line */}
          <path
            d="M 100 162 C 160 170, 190 378, 260 378 C 330 378, 370 198, 440 198 C 510 198, 540 420, 610 420 C 680 420, 700 222, 770 222 C 830 222, 860 378, 910 378"
            fill="none"
            stroke="url(#royalGoldTrackGrad)"
            strokeWidth={isMinimized ? 3.5 : 5.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="16 12"
            style={{
              filter: "drop-shadow(0 0 8px #d4af37) drop-shadow(0 0 16px rgba(212, 175, 55, 0.8))",
              animation: "dashEnergyPulse 24s linear infinite",
            }}
          />
        </svg>

        {/* 5. WAYPOINT NODES WITH DYNAMIC LIGHTING */}
        {CIRCUIT_WAYPOINTS.map((wp) => {
          const isFinish = wp.isFinish;
          const isStart = wp.isStart;
          const teamsAtPos = groups.filter((g) => g.pos === wp.pos);
          const hasActiveTeams = teamsAtPos.length > 0;
          const isPassedByAny = groups.some((g) => g.pos > wp.pos);

          // Compute dynamic multi-color border for Minimized PiP mode
          let minimizedBorderClass = "border-2 border-[#d4af37]/70";
          let dynamicStyle: React.CSSProperties = {};

          if (isMinimized) {
            if (hasActiveTeams) {
              if (teamsAtPos.length === 1) {
                dynamicStyle = {
                  borderColor: teamsAtPos[0].color,
                  boxShadow: `0 0 14px ${teamsAtPos[0].color}`,
                };
              } else {
                const colorStops = teamsAtPos
                  .map((t, idx) => {
                    const startPct = (idx / teamsAtPos.length) * 100;
                    const endPct = ((idx + 1) / teamsAtPos.length) * 100;
                    return `${t.color} ${startPct}%, ${t.color} ${endPct}%`;
                  })
                  .join(", ");

                dynamicStyle = {
                  border: "2.5px solid transparent",
                  backgroundImage: `linear-gradient(#1e130a, #1e130a), conic-gradient(${colorStops})`,
                  backgroundOrigin: "border-box",
                  backgroundClip: "content-box, border-box",
                  boxShadow: "0 0 18px rgba(253, 224, 71, 0.6)",
                };
              }
            } else if (isPassedByAny) {
              dynamicStyle = {
                background: "linear-gradient(135deg, #d4af37, #f7e492, #ca8a04)",
                color: "#14100c",
                borderColor: "#fff8db",
                boxShadow: "0 0 12px rgba(253, 224, 71, 0.6)",
              };
            }
          }

          return (
            <div
              key={wp.pos}
              onClick={(e) => {
                if (isMinimized) {
                  onMaximize?.();
                } else {
                  e.stopPropagation();
                  onSelectWaypoint?.(wp.pos);
                }
              }}
              style={{
                left: `${wp.leftPct}%`,
                top: `${wp.topPct}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group transition-all duration-300 z-20 hover:-translate-y-[55%] hover:scale-105"
            >
              {/* MINIMIZED VIEW: CLEAN NUMBERED CIRCLE WITH MULTI-COLOR BORDERS (REPRESENTING TEAMS) */}
              {isMinimized ? (
                <div
                  style={dynamicStyle}
                  className={cn(
                    "size-8 rounded-full flex items-center justify-center font-serif font-black text-xs text-[#fef08a] bg-[#1a1108] shadow-lg transition-all",
                    minimizedBorderClass,
                    hasActiveTeams && "scale-110",
                  )}
                >
                  {isFinish ? (
                    <Trophy className="size-4" />
                  ) : isStart ? (
                    "00"
                  ) : (
                    `0${wp.pos}`
                  )}
                </div>
              ) : (
                /* NORMAL VIEW: SCULPTED PILL NODE WITH COLOR STATUS */
                <div
                  style={
                    hasActiveTeams
                      ? { animation: "activeStationSlowGlowPulse 3s ease-in-out infinite, activePillPulse 3s ease-in-out infinite" }
                      : undefined
                  }
                  className={cn(
                    "flex items-center gap-2.5 rounded-full border-2 backdrop-blur-xl transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.85)] px-3.5 py-1.5",
                    /* Status 1: Pos yang sedang aktif (hasActiveTeams) handled by slow pulse animation */
                    hasActiveTeams
                      ? "ring-2 ring-[#fde047]/60"
                      /* Status 2: Pos yang sudah dilalui (Permanent Gold Gradient) */
                      : isPassedByAny
                        ? "border-[#fff8db] bg-gradient-to-r from-[#d4af37] via-[#f7e492] to-[#c49a2a] text-[#14100c] shadow-[0_0_20px_rgba(253,224,71,0.5)] ring-1 ring-[#d4af37]/60"
                        /* Status 3: Pos yang belum dilalui */
                        : isFinish
                          ? "border-[#fde047]/60 bg-gradient-to-r from-[#382412]/95 via-[#23160a]/95 to-[#160d06]/95 text-[#fef08a]"
                          : isStart
                            ? "border-[#d4af37]/80 bg-gradient-to-r from-[#24170d]/95 to-[#150d06]/95 text-[#fff8db]"
                            : "border-[#d4af37]/60 bg-gradient-to-r from-[#24170d]/95 via-[#1a1007]/95 to-[#120a04]/95 text-[#fff8db] hover:border-[#fde047]",
                  )}
                >
                  {/* Station Number Jewel Badge */}
                  <div
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center font-serif font-black text-xs shrink-0 shadow-md border transition-colors",
                      isPassedByAny && !hasActiveTeams
                        ? "bg-[#140e08] text-[#fde047] border-[#fff8db]/60"
                        : hasActiveTeams
                          ? "bg-gradient-to-tr from-[#fde047] to-[#ca8a04] text-[#14100c] border-white"
                          : "bg-gradient-to-br from-[#8c6d23] to-[#d4af37] text-[#14100c] border-white/60",
                    )}
                  >
                    {isFinish ? (
                      <Trophy className="size-4 stroke-[2.5]" />
                    ) : isStart ? (
                      "00"
                    ) : (
                      `0${wp.pos}`
                    )}
                  </div>

                  {/* Clean Station Name */}
                  <span
                    className={cn(
                      "font-serif font-bold text-xs sm:text-sm tracking-wide whitespace-nowrap pr-1 drop-shadow-xs transition-colors",
                      isPassedByAny && !hasActiveTeams
                        ? "text-[#14100c] font-black"
                        : hasActiveTeams
                          ? "text-[#ffffff] font-black"
                          : "text-[#fff8db]",
                    )}
                  >
                    {wp.name}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* 6. FLOATING TEAM AVATAR BUBBLES (Rendered ONLY in Normal Full View) */}
        {!isMinimized && (() => {
          const localCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          return groups.map((group) => {
            const targetWp =
              CIRCUIT_WAYPOINTS.find((w) => w.pos === group.pos) || CIRCUIT_WAYPOINTS[0];

            const totalAtPos = groups.filter((g) => g.pos === group.pos).length;
            const currentIdx = localCounts[group.pos] || 0;
            localCounts[group.pos] = currentIdx + 1;

            const offsetX = totalAtPos > 1 ? (currentIdx === 0 ? -22 : 22) : 0;
            const offsetY = -56;

            return (
              <div
                key={group.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectGroup?.(group.id);
                }}
                style={{
                  left: `calc(${targetWp.leftPct}% + ${offsetX}px)`,
                  top: `calc(${targetWp.topPct}% + ${offsetY}px)`,
                  transition: "all 0.85s cubic-bezier(0.34, 1.25, 0.64, 1)",
                }}
                className="absolute z-40 cursor-pointer pointer-events-auto group -translate-x-1/2"
                title={`Klik untuk melihat detail jawaban ${group.name}`}
              >
                <div
                  className={cn(
                    "relative rounded-full shadow-2xl transition-transform hover:scale-125 border-[3px] size-11 sm:size-12",
                    group.borderClass,
                  )}
                >
                  <img
                    src={group.avatarUrl || "/images/larasati.png"}
                    alt={group.name}
                    className="size-full object-cover object-top rounded-full"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=K${group.groupNum}&background=d4af37&color=000`;
                    }}
                  />

                  {/* Team Number Pill */}
                  <div
                    className="absolute -bottom-1 -right-1 size-5 rounded-full border-2 border-white flex items-center justify-center font-black text-[10px] text-black shadow-md"
                    style={{ backgroundColor: group.color }}
                  >
                    0{group.groupNum}
                  </div>
                </div>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}

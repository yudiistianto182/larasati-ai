import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Trophy } from "lucide-react";

import { useContestStore } from "@/stores/contest-store";
import { FloatingParticlesBackground } from "@/routes/(public)/lomba/-components/floating-particles-background";
import { FloatingControlsDock } from "./-components/floating-controls-dock";
import { GroupSidebarList } from "./-components/group-sidebar-list";
import { GroupStaseDetailView } from "./-components/group-stase-detail-view";
import type { GroupRaceState } from "./-components/liveview-types";
import {
  DEFAULT_GROUPS_META,
  INITIAL_MOCK_STASES_FACTORY,
} from "./-components/liveview-types";
import { LiveviewWinnerModal } from "./-components/liveview-winner-modal";
import { ModePanoramicCircuit } from "./-components/mode-panoramic-circuit";
import { WaypointDetailModal } from "./-components/waypoint-detail-modal";

export const Route = createFileRoute("/(admin)/liveview")({
  component: LiveviewRouteComponent,
});

function LiveviewRouteComponent() {
  const { contests } = useContestStore();
  const [selectedContestId, setSelectedContestId] = React.useState<string>(
    contests[0]?.id || "lomba-01",
  );
  const activeContest = contests.find((c) => c.id === selectedContestId) || contests[0];

  // Selected Group for Drill-down answer inspection (null = show full circuit board)
  const [selectedGroupId, setSelectedGroupId] = React.useState<string | null>(null);

  // Selected Waypoint for Pos-centric inspection modal (null = closed)
  const [inspectingWaypointPos, setInspectingWaypointPos] = React.useState<number | null>(null);

  // Initial group race states (4 groups)
  const [groups, setGroups] = React.useState<GroupRaceState[]>([
    {
      id: "grp-1",
      groupNum: 1,
      name: activeContest?.kelompok_list[0]?.nama || "Kelompok 1 (Surya Emas)",
      pos: 1,
      color: DEFAULT_GROUPS_META[1].color,
      borderClass: DEFAULT_GROUPS_META[1].borderClass,
      badgeBg: DEFAULT_GROUPS_META[1].badgeBg,
      totalScore: 92,
      timeElapsedFormatted: "05:42",
      currentStaseStatus: "working",
      staseData: INITIAL_MOCK_STASES_FACTORY(1, 1),
    },
    {
      id: "grp-2",
      groupNum: 2,
      name: activeContest?.kelompok_list[1]?.nama || "Kelompok 2 (Zamrud)",
      pos: 0,
      color: DEFAULT_GROUPS_META[2].color,
      borderClass: DEFAULT_GROUPS_META[2].borderClass,
      badgeBg: DEFAULT_GROUPS_META[2].badgeBg,
      totalScore: 0,
      timeElapsedFormatted: "00:00",
      currentStaseStatus: "idle",
      staseData: INITIAL_MOCK_STASES_FACTORY(0, 2),
    },
    {
      id: "grp-3",
      groupNum: 3,
      name: activeContest?.kelompok_list[2]?.nama || "Kelompok 3 (Safir)",
      pos: 0,
      color: DEFAULT_GROUPS_META[3].color,
      borderClass: DEFAULT_GROUPS_META[3].borderClass,
      badgeBg: DEFAULT_GROUPS_META[3].badgeBg,
      totalScore: 0,
      timeElapsedFormatted: "00:00",
      currentStaseStatus: "idle",
      staseData: INITIAL_MOCK_STASES_FACTORY(0, 3),
    },
    {
      id: "grp-4",
      groupNum: 4,
      name: activeContest?.kelompok_list[3]?.nama || "Kelompok 4 (Delima)",
      pos: 0,
      color: DEFAULT_GROUPS_META[4].color,
      borderClass: DEFAULT_GROUPS_META[4].borderClass,
      badgeBg: DEFAULT_GROUPS_META[4].badgeBg,
      totalScore: 0,
      timeElapsedFormatted: "00:00",
      currentStaseStatus: "idle",
      staseData: INITIAL_MOCK_STASES_FACTORY(0, 4),
    },
  ]);

  const [isAutoRacing, setIsAutoRacing] = React.useState<boolean>(false);
  const [winnerGroup, setWinnerGroup] = React.useState<GroupRaceState | null>(null);

  // Manual step adjustment
  const handleStepGroup = (groupNum: number, delta: number) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.groupNum === groupNum) {
          const nextPos = Math.max(0, Math.min(6, g.pos + delta));
          const updatedStaseData = INITIAL_MOCK_STASES_FACTORY(nextPos, g.groupNum);
          const updatedTotalScore = Object.values(updatedStaseData).reduce(
            (acc, st) => acc + (st.score || 0),
            0,
          );

          if (nextPos === 6 && g.pos < 6 && !winnerGroup) {
            setWinnerGroup({ ...g, pos: 6 });
          }

          return {
            ...g,
            pos: nextPos,
            totalScore: updatedTotalScore,
            staseData: updatedStaseData,
          };
        }
        return g;
      }),
    );
  };

  // Random simulation step
  const handleSimulateStep = () => {
    let firstToFinish: GroupRaceState | null = null;

    setGroups((prev) =>
      prev.map((g) => {
        const advance = Math.floor(Math.random() * 2) + 1;
        const nextPos = Math.min(6, g.pos + advance);
        const updatedStaseData = INITIAL_MOCK_STASES_FACTORY(nextPos, g.groupNum);
        const updatedTotalScore = Object.values(updatedStaseData).reduce(
          (acc, st) => acc + (st.score || 0),
          0,
        );

        if (nextPos === 6 && g.pos < 6 && !firstToFinish && !winnerGroup) {
          firstToFinish = { ...g, pos: 6 };
        }

        return {
          ...g,
          pos: nextPos,
          totalScore: updatedTotalScore,
          staseData: updatedStaseData,
        };
      }),
    );

    if (firstToFinish) {
      setWinnerGroup(firstToFinish);
    }
  };

  // Auto-Race interval toggle
  React.useEffect(() => {
    if (!isAutoRacing) return;

    const interval = setInterval(() => {
      handleSimulateStep();
    }, 1800);

    return () => clearInterval(interval);
  }, [isAutoRacing, winnerGroup]);

  const handleToggleAutoRace = () => {
    setIsAutoRacing((prev) => !prev);
  };

  const handleResetRace = () => {
    setIsAutoRacing(false);
    setWinnerGroup(null);
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        pos: 0,
        totalScore: 0,
        staseData: INITIAL_MOCK_STASES_FACTORY(0, g.groupNum),
      })),
    );
  };

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null;

  return (
    <div className="relative h-screen max-h-screen w-full max-w-full overflow-hidden bg-[#0a0705] text-[#fef08a] flex flex-col justify-between select-none">
      {/* Background Floating Particles */}
      <FloatingParticlesBackground />

      {/* Radial Ambient Background Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,_#2a180b_0%,_transparent_65%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_50%,_#1c1108_0%,_transparent_55%)] pointer-events-none z-0" />

      {/* Winner Celebration Modal Dialog */}
      <LiveviewWinnerModal
        winner={winnerGroup}
        onClose={() => setWinnerGroup(null)}
      />

      {/* Waypoint Station-Centric Inspection Modal */}
      <WaypointDetailModal
        waypointPos={inspectingWaypointPos}
        groups={groups}
        onClose={() => setInspectingWaypointPos(null)}
      />

      {/* Top Header Title */}
      <header className="relative z-10 w-full pt-3 pb-2 px-6 flex items-center justify-between shrink-0 border-b border-[#8c6d23]/25 bg-[#140e08]/75 backdrop-blur-xs">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-gradient-to-tr from-[#8c6d23] to-[#d4af37] text-[#14100c] flex items-center justify-center shadow-md font-bold">
            <Trophy className="size-4.5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-serif text-lg sm:text-xl font-black bg-gradient-to-r from-[#fffbeb] via-[#fde047] to-[#ca8a04] bg-clip-text text-transparent uppercase tracking-wider leading-tight">
              Perjalanan Larasati
            </h1>
            <span className="text-[10px] text-[#d4af37]/80">
              Live Arena Sirkuit Balapan Kebidanan &bull; {activeContest?.judul || "Lomba Utama"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-extrabold text-emerald-300 shadow-xs">
            <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
            <span>LIVE TRACKING AKTIF</span>
          </span>
        </div>
      </header>

      {/* Main Split Layout: Board / Detail View + Group Sidebar */}
      <main className="relative z-10 flex-1 w-full p-4 pb-20 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Left / Center Area: Full Panoramic Board OR Group Stase Detail View */}
        <div className="flex-1 relative size-full flex flex-col overflow-hidden">
          {selectedGroup ? (
            <>
              {/* Group Stase Detail & Live Answers View */}
              <div className="size-full overflow-hidden">
                <GroupStaseDetailView
                  group={selectedGroup}
                  onClose={() => setSelectedGroupId(null)}
                />
              </div>

              {/* Minimized Circuit Board PiP at Top-Right Corner */}
              <div className="absolute top-4 right-4 z-40">
                <ModePanoramicCircuit
                  groups={groups}
                  isMinimized={true}
                  onMaximize={() => setSelectedGroupId(null)}
                  onSelectGroup={(id) => setSelectedGroupId(id)}
                  onSelectWaypoint={(pos) => setInspectingWaypointPos(pos)}
                />
              </div>
            </>
          ) : (
            /* Full Panoramic Circuit Board */
            <div className="size-full">
              <ModePanoramicCircuit
                groups={groups}
                isMinimized={false}
                onSelectGroup={(id) => setSelectedGroupId(id)}
                onSelectWaypoint={(pos) => setInspectingWaypointPos(pos)}
              />
            </div>
          )}
        </div>

        {/* Right Area: Group Sidebar List */}
        <GroupSidebarList
          groups={groups}
          selectedGroupId={selectedGroupId}
          onSelectGroup={(id) => setSelectedGroupId(id)}
          onStepGroup={handleStepGroup}
        />
      </main>

      {/* Floating Bottom Control Pill Dock */}
      <FloatingControlsDock
        selectedContestId={selectedContestId}
        onSelectContestId={setSelectedContestId}
        contests={contests}
        isAutoRacing={isAutoRacing}
        onSimulateStep={handleSimulateStep}
        onToggleAutoRace={handleToggleAutoRace}
        onResetRace={handleResetRace}
      />
    </div>
  );
}

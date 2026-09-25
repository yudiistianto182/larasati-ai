import * as React from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { Flag, Trophy } from "lucide-react";

import { contestService } from "@/services/api/contest-service";
import { contestTeamService } from "@/services/api/contest-team-service";
import { trxResponseService } from "@/services/api/trx-response-service";
import { trxResponseAnswerService } from "@/services/api/trx-response-answer-service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TrxResponseItem } from "@/types/api/trx-response";
import type { TrxResponseAnswerDetail } from "@/types/api/trx-response-answer";
import { FloatingParticlesBackground } from "@/routes/(public)/lomba/-components/floating-particles-background";
import { FloatingControlsDock } from "./-components/floating-controls-dock";
import { GroupSidebarList } from "./-components/group-sidebar-list";
import { GroupStaseDetailView } from "./-components/group-stase-detail-view";
import type { GroupRaceState, StaseDetailData } from "./-components/liveview-types";
import {
  DEFAULT_GROUPS_META,
  INITIAL_MOCK_STASES_FACTORY,
} from "./-components/liveview-types";
import { LiveviewWinnerModal } from "./-components/liveview-winner-modal";
import { ModePanoramicCircuit } from "./-components/mode-panoramic-circuit";
import { ModePodiumView } from "./-components/mode-podium-view";
// import { WaypointDetailModal } from "./-components/waypoint-detail-modal";

export const Route = createFileRoute("/(admin)/liveview")({
  component: LiveviewRouteComponent,
});

function createBaseStaseData(
  item: TrxResponseItem,
  completedCount: number,
): Record<number, StaseDetailData> {
  const result: Record<number, StaseDetailData> = {};
  for (let p = 1; p <= 5; p++) {
    const posInfo = item.pos?.find((x) => x.pos_order === p || x.casequest_order === p);
    const isCompleted = posInfo ? posInfo.is_completed : p <= completedCount;
    const isWorking = !isCompleted && p === completedCount + 1;
    const score = posInfo?.score !== undefined ? posInfo.score : (isCompleted ? 70 : undefined);

    result[p] = {
      pos: p,
      name: posInfo?.pos_name || posInfo?.casequest_name || `Pos 0${p}`,
      kodeAmplop: `AMP-0${p}`,
      status: isCompleted ? "completed" : isWorking ? "in_progress" : "locked",
      score,
      maxScore: 100,
      timeSpentFormatted: isCompleted ? "02:00" : "-",
      summaryAnswer: isCompleted
        ? posInfo?.status_text || "Telah Diselesaikan"
        : isWorking
          ? "Sedang Dikerjakan"
          : "Menunggu Giliran",
      liveActivity: isWorking ? "Sedang Mengerjakan Soal..." : undefined,
    };
  }
  return result;
}

function mapTrxAnswerDetailToStaseData(
  detail: TrxResponseAnswerDetail,
  completedCount: number,
): Record<number, StaseDetailData> {
  const result: Record<number, StaseDetailData> = {};

  // Pos 1: Anamnesis Pasien (Method 1)
  const pos1 = detail.pos?.find((p) => p.casequest_order === 1 || p.casequest_method_id === 1);
  const pos1Chats = Array.isArray(pos1?.answers?.chats) ? pos1.answers.chats : [];
  const pos1Completed = Boolean(pos1Chats.length > 0 || completedCount >= 1);
  result[1] = {
    pos: 1,
    name: pos1?.casequest_name || "Pos 1: Anamnesis Pasien",
    kodeAmplop: "AMP-ANM-01",
    status: pos1Completed ? "completed" : completedCount === 0 ? "in_progress" : "locked",
    score: pos1?.total_score ?? 0,
    maxScore: 100,
    timeSpentFormatted: pos1Completed ? "01:30" : "-",
    summaryAnswer:
      pos1Chats.length > 0
        ? `${pos1Chats.length} Pesan Percakapan Terkirim (${pos1?.total_score ?? 0} Poin)`
        : "Belum ada riwayat dialog anamnesis.",
    liveActivity: pos1Chats.length > 0 ? "Dialog anamnesis selesai." : "Sedang melakukan anamnesis...",
    details: {
      type: "chat",
      chatMessages: pos1Chats.map((c: any) => ({
        sender: c.sender || (c.responseia_sender === 2 ? "Bidan" : "Pasien"),
        text: c.responseia_text,
      })),
    },
  };

  // Pos 2: Faktor Risiko (Method 2)
  const pos2 = detail.pos?.find((p) => p.casequest_order === 2 || p.casequest_method_id === 2);
  const pos2Answers = Array.isArray(pos2?.answers) ? pos2.answers : [];
  const pos2Completed = Boolean(pos2Answers.length > 0 || completedCount >= 2);
  const pos2Items = pos2Answers.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (a: any) => a.casequestmc_name || a.name || `Pilihan #${a.casequestmc_id || ""}`,
  );
  result[2] = {
    pos: 2,
    name: pos2?.casequest_name || "Pos 2: Deteksi Faktor Risiko",
    kodeAmplop: "AMP-RSK-02",
    status: pos2Completed ? "completed" : completedCount === 1 ? "in_progress" : "locked",
    score: pos2?.total_score ?? 0,
    maxScore: 100,
    timeSpentFormatted: pos2Completed ? "01:15" : "-",
    summaryAnswer:
      pos2Items.length > 0
        ? `${pos2Items.length} Kartu Faktor Risiko Tertempel (${pos2?.total_score ?? 0} Poin)`
        : "Belum ada kartu tertempel.",
    liveActivity: pos2Items.length > 0 ? "Papan magnet terisi." : "Menempelkan kartu...",
    details: {
      type: "magnet",
      items: pos2Items,
    },
  };

  // Pos 3: Prosedur IVA (Method 3)
  const pos3 = detail.pos?.find((p) => p.casequest_order === 3 || p.casequest_method_id === 3);
  const pos3Answers = Array.isArray(pos3?.answers) ? pos3.answers : [];
  const pos3Completed = Boolean(pos3Answers.length > 0 || completedCount >= 3);
  const sortedPos3 = [...pos3Answers].sort(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (a: any, b: any) => (a.responseos_order || a.user_order || 0) - (b.responseos_order || b.user_order || 0),
  );
  const pos3Items = sortedPos3.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (a: any, idx) => `${idx + 1}. ${a.casequestos_name || a.name || `Langkah ${idx + 1}`}`,
  );
  result[3] = {
    pos: 3,
    name: pos3?.casequest_name || "Pos 3: Prosedur IVA",
    kodeAmplop: "AMP-SOP-03",
    status: pos3Completed ? "completed" : completedCount === 2 ? "in_progress" : "locked",
    score: pos3?.total_score ?? 0,
    maxScore: 100,
    timeSpentFormatted: pos3Completed ? "01:45" : "-",
    summaryAnswer:
      pos3Items.length > 0
        ? `${pos3Items.length} Langkah SOP Tersusun (${pos3?.total_score ?? 0} Poin)`
        : "Belum ada urutan langkah.",
    liveActivity: pos3Items.length > 0 ? "Urutan SOP tersusun." : "Menyusun langkah SOP...",
    details: {
      type: "sequence",
      items: pos3Items,
    },
  };

  // Pos 4: Interpretasi Visual (Method 4)
  const pos4 = detail.pos?.find((p) => p.casequest_order === 4 || p.casequest_method_id === 4);
  const pos4Answers = Array.isArray(pos4?.answers) ? pos4.answers : [];
  const pos4Completed = Boolean(pos4Answers.length > 0 || completedCount >= 4);
  const selectedOption =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pos4Answers[0] as any)?.casequestcioption_name ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pos4Answers[0] as any)?.name ||
    (pos4Answers.length > 0 ? "Jawaban Terpilih" : "-");
  result[4] = {
    pos: 4,
    name: pos4?.casequest_name || "Pos 4: Interpretasi Visual",
    kodeAmplop: "AMP-ITP-04",
    status: pos4Completed ? "completed" : completedCount === 3 ? "in_progress" : "locked",
    score: pos4?.total_score ?? 0,
    maxScore: 100,
    timeSpentFormatted: pos4Completed ? "01:20" : "-",
    summaryAnswer:
      selectedOption !== "-"
        ? `Diagnosis: ${selectedOption} (${pos4?.total_score ?? 0} Poin)`
        : "Belum memilih kesimpulan diagnosis.",
    liveActivity: selectedOption !== "-" ? "Diagnosis telah dipilih." : "Menganalisis foto porsio serviks...",
    details: {
      type: "mcq",
      selectedOption,
    },
  };

  // Pos 5: Asuhan Kebidanan (Method 1 kedua / order 5)
  const pos5 = detail.pos?.find(
    (p) => p.casequest_order === 5 || (p.casequest_method_id === 1 && p !== pos1),
  );
  const pos5Chats = Array.isArray(pos5?.answers?.chats) ? pos5.answers.chats : [];
  const pos5Completed = Boolean(pos5Chats.length > 0 || completedCount >= 5);
  result[5] = {
    pos: 5,
    name: pos5?.casequest_name || "Pos 5: Asuhan Kebidanan & Konseling",
    kodeAmplop: "AMP-ASH-05",
    status: pos5Completed ? "completed" : completedCount === 4 ? "in_progress" : "locked",
    score: pos5?.total_score ?? 0,
    maxScore: 100,
    timeSpentFormatted: pos5Completed ? "01:30" : "-",
    summaryAnswer:
      pos5Chats.length > 0
        ? `${pos5Chats.length} Pesan Edukasi & Konseling Terkirim (${pos5?.total_score ?? 0} Poin)`
        : "Belum ada dialog asuhan/konseling.",
    liveActivity: pos5Chats.length > 0 ? "Asuhan dan konseling selesai." : "Sedang memberikan konseling...",
    details: {
      type: "chat",
      chatMessages: pos5Chats.map((c: any) => ({
        sender: c.sender || (c.responseia_sender === 2 ? "Bidan" : "Pasien"),
        text: c.responseia_text,
      })),
    },
  };

  return result;
}

function LiveviewRouteComponent() {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const search: any = useSearch({ strict: false });
  const isPodiumSimulation =
    search?.mode === "podium" || search?.simulate === true || search?.simulate === "true";

  // List Lomba dari API
  const [apiContests, setApiContests] = React.useState<Array<{ id: string; nama: string }>>([]);
  const [selectedContestId, setSelectedContestId] = React.useState<string>(
    search?.contestId ? String(search.contestId) : "",
  );

  React.useEffect(() => {
    contestService
      .getAll()
      .then((res) => {
        if (res.status && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((c) => ({
            id: String(c.contest_id),
            nama: c.contest_name || `Lomba #${c.contest_id}`,
          }));
          setApiContests(mapped);
          setSelectedContestId((prev) => prev || mapped[0].id);
        }
      })
      .catch((err) => console.warn("[Liveview Contests Error]", err));
  }, []);

  const handleSelectContest = (id: string) => {
    setSelectedContestId(id);
    navigate({
      search: (prev: Record<string, unknown>) => ({ ...prev, contestId: id }),
      replace: true,
    } as any).catch(() => {});
  };

  const contestSelectItems = React.useMemo(
    () =>
      apiContests.map((c) => ({
        value: String(c.id),
        label: c.nama,
      })),
    [apiContests],
  );

  const currentContestName =
    apiContests.find((c) => String(c.id) === String(selectedContestId))?.nama || "Lomba Utama";

  // Display Mode: "circuit" (panoramic board) or "podium" (finishers-only grand podium)
  const [viewMode, setViewMode] = React.useState<"circuit" | "podium">(
    isPodiumSimulation ? "podium" : "circuit",
  );

  // Selected Group for Drill-down answer inspection (null = show full circuit board)
  const [selectedGroupId, setSelectedGroupId] = React.useState<string | null>(null);

  // Selected Waypoint for Pos-centric inspection modal (di-comment sementara)
  // const [inspectingWaypointPos, setInspectingWaypointPos] = React.useState<number | null>(null);

  // Exact time progress mapping matching Rekap Penilaian
  const KEL_A_TIMES = ["00:00", "01:30", "02:45", "04:30", "05:40", "07:45"];
  const KEL_B_TIMES = ["00:00", "01:40", "03:10", "05:10", "06:30", "08:30"];

  const [groups, setGroups] = React.useState<GroupRaceState[]>([]);
  const [winnerGroup, setWinnerGroup] = React.useState<GroupRaceState | null>(null);
  // Track team IDs that have already been celebrated so the modal doesn't pop up repeatedly on interval poll
  const celebratedTeamIdsRef = React.useRef<Set<string>>(new Set());

  // Reset data grup dan perayaan saat berpindah lomba
  React.useEffect(() => {
    celebratedTeamIdsRef.current.clear();
    setWinnerGroup(null);
    setSelectedGroupId(null);
    setGroups([]);
  }, [selectedContestId]);

  // 1-Second Real-time Polling from TrxResponse API + Contest Teams + Real Answers Detail
  React.useEffect(() => {
    let isMounted = true;

    const fetchLiveTeams = async () => {
      try {
        const contestNumericId = selectedContestId
          ? parseInt(selectedContestId.replace(/\D/g, ""), 10) || undefined
          : undefined;

        // Ambil data respon dan tim terdaftar secara paralel
        const [trxRes, teamsRes] = await Promise.allSettled([
          trxResponseService.getAll(contestNumericId),
          contestNumericId
            ? contestTeamService.getAll(contestNumericId)
            : Promise.resolve({ status: true, data: [] }),
        ]);

        const allTrx =
          trxRes.status === "fulfilled" && trxRes.value?.status && Array.isArray(trxRes.value.data)
            ? trxRes.value.data
            : [];

        // Filter ketat sesuai contest_id yang dipilih agar data antar lomba tidak tercampur
        const filteredTrx = contestNumericId
          ? allTrx.filter((item) => Number(item.response_contest_id) === Number(contestNumericId))
          : allTrx;

        const contestTeams =
          teamsRes.status === "fulfilled" &&
          (teamsRes.value as any)?.status &&
          Array.isArray((teamsRes.value as any)?.data)
            ? ((teamsRes.value as any).data as any[])
            : [];

        // Ambil detail jawaban real secara paralel untuk setiap tim yang memiliki response_id
        const detailsMap = new Map<number, TrxResponseAnswerDetail>();
        await Promise.allSettled(
          filteredTrx.map(async (item) => {
            if (item.response_id) {
              try {
                const detailRes = await trxResponseAnswerService.getDetail(item.response_id);
                if (detailRes.status && detailRes.data) {
                  detailsMap.set(item.response_id, detailRes.data);
                }
              } catch {}
            }
          }),
        );

        let mappedGroups: GroupRaceState[] = [];

        if (contestTeams.length > 0) {
          // Jika ada tim terdaftar di contest_team, jadikan acuan utama
          mappedGroups = contestTeams.map((team, idx) => {
            const metaIdx = ((idx % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
            const meta = DEFAULT_GROUPS_META[metaIdx] || DEFAULT_GROUPS_META[1];

            const matchingTrx = filteredTrx.find(
              (t) => Number(t.response_contestteam_id) === Number(team.contestteam_id),
            );

            if (matchingTrx) {
              const completedCount =
                matchingTrx.pos_completed_count ??
                matchingTrx.pos?.filter((p) => p.is_completed).length ??
                0;
              const totalScore =
                matchingTrx.calculated_total_score ??
                Math.round(parseFloat(matchingTrx.response_total_score || "0"));

              const realDetail = matchingTrx.response_id ? detailsMap.get(matchingTrx.response_id) : undefined;
              const staseData = realDetail
                ? mapTrxAnswerDetailToStaseData(realDetail, completedCount)
                : createBaseStaseData(matchingTrx, completedCount);

              return {
                id: String(matchingTrx.response_contestteam_id || team.contestteam_id),
                groupNum: idx + 1,
                name: team.contestteam_name || matchingTrx.contestteam_name || `Kelompok ${idx + 1}`,
                pos: Math.min(5, completedCount),
                color: meta.color,
                borderClass: meta.borderClass,
                badgeBg: meta.badgeBg,
                totalScore,
                timeElapsedFormatted: matchingTrx.pos_completed_orders?.length
                  ? `${String(matchingTrx.pos_completed_orders.length * 2).padStart(2, "0")}:00`
                  : "00:00",
                currentStaseStatus: matchingTrx.response_is_submited
                  ? "completed"
                  : completedCount > 0
                    ? "working"
                    : "idle",
                staseData,
              };
            }

            // Tim belum mulai mengerjakan (berada di posisi 0 / Garis Start)
            return {
              id: String(team.contestteam_id),
              groupNum: idx + 1,
              name: team.contestteam_name || `Kelompok ${idx + 1}`,
              pos: 0,
              color: meta.color,
              borderClass: meta.borderClass,
              badgeBg: meta.badgeBg,
              totalScore: 0,
              timeElapsedFormatted: "00:00",
              currentStaseStatus: "idle",
              staseData: INITIAL_MOCK_STASES_FACTORY(0, idx + 1),
            };
          });
        } else if (filteredTrx.length > 0) {
          // Fallback jika tidak ada data dari contest_team, gunakan filteredTrx
          mappedGroups = filteredTrx.map((item, idx) => {
            const metaIdx = ((idx % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
            const meta = DEFAULT_GROUPS_META[metaIdx] || DEFAULT_GROUPS_META[1];
            const completedCount =
              item.pos_completed_count ??
              item.pos?.filter((p) => p.is_completed).length ??
              0;
            const totalScore =
              item.calculated_total_score ??
              Math.round(parseFloat(item.response_total_score || "0"));

            const realDetail = item.response_id ? detailsMap.get(item.response_id) : undefined;
            const staseData = realDetail
              ? mapTrxAnswerDetailToStaseData(realDetail, completedCount)
              : createBaseStaseData(item, completedCount);

            return {
              id: String(item.response_contestteam_id),
              groupNum: idx + 1,
              name: item.contestteam_name || `Kelompok ${idx + 1}`,
              pos: Math.min(5, completedCount),
              color: meta.color,
              borderClass: meta.borderClass,
              badgeBg: meta.badgeBg,
              totalScore,
              timeElapsedFormatted: item.pos_completed_orders?.length
                ? `${String(item.pos_completed_orders.length * 2).padStart(2, "0")}:00`
                : "00:00",
              currentStaseStatus: item.response_is_submited
                ? "completed"
                : completedCount > 0
                  ? "working"
                  : "idle",
              staseData,
            };
          });
        }

        if (isMounted) {
          setGroups(mappedGroups);

          // Cek pemenang baru: hanya tim yang mencapai pos 5 dan BELUM pernah diselamati (1x saja)
          const newFinisher = mappedGroups.find(
            (g) => g.pos >= 5 && !celebratedTeamIdsRef.current.has(g.id),
          );
          if (newFinisher) {
            celebratedTeamIdsRef.current.add(newFinisher.id);
            setWinnerGroup(newFinisher);
          }
        }
      } catch (err) {
        console.warn("[Liveview Fetch Error]", err);
      }
    };

    fetchLiveTeams();
    const interval = setInterval(fetchLiveTeams, 1000); // 1 DETIK INTERVAL

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedContestId]);

  // Manual step adjustment (jika dibutuhkan admin)
  const handleStepGroup = (groupNum: number, delta: number) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.groupNum === groupNum) {
          const nextPos = Math.max(0, Math.min(5, g.pos + delta));
          const updatedStaseData = INITIAL_MOCK_STASES_FACTORY(nextPos, g.groupNum);
          const updatedTotalScore = Object.values(updatedStaseData).reduce(
            (acc, st) => acc + (st.score || 0),
            0,
          );
          const updatedTime =
            g.groupNum === 1
              ? KEL_A_TIMES[nextPos] || "07:45"
              : KEL_B_TIMES[nextPos] || "08:30";

          if (nextPos === 5 && g.pos < 5 && !celebratedTeamIdsRef.current.has(g.id)) {
            celebratedTeamIdsRef.current.add(g.id);
            setWinnerGroup({
              ...g,
              pos: 5,
              totalScore: updatedTotalScore,
              timeElapsedFormatted: updatedTime,
            });
          }

          return {
            ...g,
            pos: nextPos,
            totalScore: updatedTotalScore,
            timeElapsedFormatted: updatedTime,
            staseData: updatedStaseData,
          };
        }
        return g;
      }),
    );
  };

  const handleSimulateStep = () => {};
  const handleToggleAutoRace = () => {};
  const handleResetRace = () => {
    celebratedTeamIdsRef.current.clear();
    setWinnerGroup(null);
  };

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null;

  return (
    <div className="relative isolate h-screen max-h-screen w-full max-w-full overflow-hidden bg-[#0a0705] text-[#fef08a] flex flex-col justify-between select-none">
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

      {/* Waypoint Station-Centric Inspection Modal (di-comment sementara sesuai permintaan) */}
      {/* <WaypointDetailModal
        waypointPos={inspectingWaypointPos}
        groups={groups}
        onClose={() => setInspectingWaypointPos(null)}
      /> */}

      {/* Top Header Title & Navigation Switcher */}
      <header className="relative z-10 w-full pt-3 pb-2 px-6 flex items-center justify-between shrink-0 border-b border-[#8c6d23]/25 bg-[#140e08]/75 backdrop-blur-xs gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-gradient-to-tr from-[#8c6d23] to-[#d4af37] text-[#14100c] flex items-center justify-center shadow-md font-bold">
            <Trophy className="size-4.5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-serif text-lg sm:text-xl font-black bg-gradient-to-r from-[#fffbeb] via-[#fde047] to-[#ca8a04] bg-clip-text text-transparent uppercase tracking-wider leading-tight">
              Larasati Journey
            </h1>
            <span className="text-[10px] text-[#d4af37]/80">
              Live Arena Sirkuit Balapan Kebidanan &bull; {currentContestName}
            </span>
          </div>
        </div>

        {/* View Mode Navigation Switcher (Sirkuit vs Podium) */}
        <div className="flex items-center bg-[#1c120a] p-1 rounded-2xl border border-[#8c6d23]/40 shadow-inner">
          <button
            type="button"
            onClick={() => setViewMode("circuit")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
              viewMode === "circuit"
                ? "bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] shadow-md border border-[#fff8db]/60"
                : "text-[#d4af37]/75 hover:text-[#fff8db] hover:bg-[#d4af37]/10"
            }`}
          >
            <Flag className="size-3.5" />
            <span>Tampilan Sirkuit</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("podium")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
              viewMode === "podium"
                ? "bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] shadow-md border border-[#fff8db]/60"
                : "text-[#d4af37]/75 hover:text-[#fff8db] hover:bg-[#d4af37]/10"
            }`}
          >
            <Trophy className="size-3.5" />
            <span>Tampilan Podium</span>
            {groups.filter((g) => g.pos >= 5).length > 0 && (
              <span className="ml-1 size-4 rounded-full bg-[#14100c] text-[#fde047] text-[10px] flex items-center justify-center font-mono font-black border border-[#fde047]/50">
                {groups.filter((g) => g.pos >= 5).length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Header Contest Selector */}
          <div className="hidden md:flex items-center gap-1.5">
            <Trophy className="size-3.5 text-[#d4af37] shrink-0" />
            <Select
              items={contestSelectItems}
              value={String(selectedContestId)}
              onValueChange={(val) => {
                if (val) handleSelectContest(String(val));
              }}
            >
              <SelectTrigger className="h-8 text-xs bg-[#24170d] text-[#fff8db] border-[#8c6d23]/60 rounded-xl min-w-[180px] shadow-xs">
                <SelectValue placeholder="Pilih Lomba">
                  {currentContestName}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#1e130a] text-[#fef08a] border-[#8c6d23]">
                {apiContests.map((c) => (
                  <SelectItem
                    key={c.id}
                    value={String(c.id)}
                    label={c.nama}
                    className="text-xs focus:bg-[#342416] focus:text-white"
                  >
                    {c.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-extrabold text-emerald-300 shadow-xs">
            <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
            <span>LIVE TRACKING AKTIF</span>
          </span>
        </div>
      </header>

      {/* Main View: Conditional Podium View OR Split Circuit Board */}
      {viewMode === "podium" ? (
        <main className="relative z-10 flex-1 w-full p-4 pb-20 flex flex-col overflow-hidden">
          <div className="size-full rounded-2xl border border-[#8c6d23]/30 bg-[#120c07]/85 backdrop-blur-xs overflow-hidden shadow-2xl">
            <ModePodiumView
              groups={groups}
              onSelectGroup={(id) => setSelectedGroupId(id)}
              onSwitchToCircuit={() => setViewMode("circuit")}
            />
          </div>
        </main>
      ) : (
        /* Main Split Layout: Board / Detail View + Group Sidebar */
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
                    // onSelectWaypoint={(pos) => setInspectingWaypointPos(pos)}
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
                  // onSelectWaypoint={(pos) => setInspectingWaypointPos(pos)}
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
      )}

      {/* Floating Bottom Control Pill Dock */}
      <FloatingControlsDock
        selectedContestId={selectedContestId}
        onSelectContestId={handleSelectContest}
        contests={apiContests}
        isAutoRacing={false}
        onSimulateStep={handleSimulateStep}
        onToggleAutoRace={handleToggleAutoRace}
        onResetRace={handleResetRace}
      />
    </div>
  );
}

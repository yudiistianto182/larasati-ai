import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

import { useContestStore } from "@/stores/contest-store";
import { useKasusStore } from "@/stores/kasus-store";
import {
  type KelompokRekapData,
  REKAP_KELOMPOK_LIST,
  mapTrxResponseAnswerToKelompokRekap,
} from "@/routes/(admin)/dashboard/contest/rekap/-components/rekap-data";
import { trxResponseService, trxResponseAnswerService } from "@/services/api";
import { AdminHeaderBanner } from "./-components/admin-header-banner";
import { MetricCards } from "./-components/metric-cards";
import { PodiumPreviewCard } from "./-components/podium-preview-card";
import { RekapLombaTable } from "./-components/rekap-lomba-table";
import { StasePerformanceChart } from "./-components/stase-performance-chart";

export const Route = createFileRoute("/(admin)/dashboard/")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { contests, mahasiswaList } = useContestStore();
  const { kasusList } = useKasusStore();

  const [selectedContestId, setSelectedContestId] = React.useState<string>(
    contests[0]?.id || "lomba-01",
  );
  const [apiRekapList, setApiRekapList] = React.useState<KelompokRekapData[]>([]);

  const selectedContest =
    contests.find((c) => c.id === selectedContestId) || contests[0];

  React.useEffect(() => {
    let isMounted = true;
    const fetchApiRekap = async () => {
      try {
        const contestNum = parseInt(String(selectedContestId || "1").replace(/\D/g, ""), 10) || undefined;
        const res = await trxResponseService.getAll(contestNum);

        if (isMounted && res.status && Array.isArray(res.data) && res.data.length > 0) {
          const detailed = await Promise.all(
            res.data.map(async (item, idx) => {
              try {
                const ansRes = await trxResponseAnswerService.getDetail(item.response_id);
                if (ansRes.status && ansRes.data) {
                  return mapTrxResponseAnswerToKelompokRekap(ansRes.data, idx + 1);
                }
              } catch {}
              return null;
            }),
          );

          const valid = detailed.filter((d): d is KelompokRekapData => d !== null);
          if (valid.length > 0 && isMounted) {
            setApiRekapList(valid);
          }
        }
      } catch (err) {
        console.warn("[Dashboard Rekap API]", err);
      }
    };

    fetchApiRekap();
    return () => {
      isMounted = false;
    };
  }, [selectedContestId]);

  // Match rekap data for this contest
  const contestGroups = selectedContest?.kelompok_list || [];
  const sourceList = apiRekapList.length > 0 ? apiRekapList : REKAP_KELOMPOK_LIST;
  const matchingRekap = sourceList.filter((r) =>
    contestGroups.some((k) => k.id === r.id || k.nama === r.nama),
  );
  const displayRekap = matchingRekap.length > 0 ? matchingRekap : sourceList;

  return (
    <div className="@container/main flex flex-col gap-5 sm:gap-6 max-w-7xl mx-auto w-full pb-10">
      {/* 1. Header Banner with Contest Selector */}
      <AdminHeaderBanner
        contests={contests}
        selectedContest={selectedContest}
        onSelectContestId={setSelectedContestId}
      />

      {/* 2. 4 Primary OSCE & Contest Metric Cards */}
      <MetricCards
        selectedContest={selectedContest}
        rekapList={displayRekap}
        totalKasusCount={kasusList.length}
        totalMahasiswaCount={mahasiswaList.length}
      />

      {/* 3. Middle Grid: Stase Performance Analysis & Mini Podium Stand */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <StasePerformanceChart rekapList={displayRekap} />
        </div>
        <div className="lg:col-span-5 flex flex-col">
          <PodiumPreviewCard
            rekapList={displayRekap}
            contestId={selectedContestId}
          />
        </div>
      </div>

      {/* 4. Bottom Row: Group Scoreboard Table */}
      <RekapLombaTable
        rekapList={displayRekap}
        contestId={selectedContestId}
      />
    </div>
  );
}

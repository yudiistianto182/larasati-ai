import { createFileRoute } from "@tanstack/react-router";
import { RekapMainView } from "./-components/rekap-main-view";

export interface RekapSearchParams {
  contestId?: string;
  kelompokId?: string;
}

export const Route = createFileRoute("/(admin)/dashboard/contest/rekap")({
  validateSearch: (search: Record<string, unknown>): RekapSearchParams => {
    return {
      contestId: search.contestId ? String(search.contestId) : "lomba-01",
      kelompokId: search.kelompokId ? String(search.kelompokId) : undefined,
    };
  },
  component: RekapPage,
});

function RekapPage() {
  const search = Route.useSearch();
  return <RekapMainView contestId={search.contestId} />;
}

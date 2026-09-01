import { createFileRoute } from "@tanstack/react-router";
import { RekapMainView } from "./-components/rekap-main-view";

export const Route = createFileRoute("/(admin)/dashboard/contest/rekap")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      contestId: search.contestId ? String(search.contestId) : "lomba-01",
    };
  },
  component: RekapPage,
});

function RekapPage() {
  const search = Route.useSearch();
  return <RekapMainView contestId={search.contestId} />;
}

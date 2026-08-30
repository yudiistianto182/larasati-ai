import { createFileRoute } from "@tanstack/react-router";
import { TambahContestPage } from "./-components/tambah-contest-page";

export const Route = createFileRoute("/(admin)/dashboard/contest/tambah")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      contestId: search.contestId ? String(search.contestId) : undefined,
    };
  },
  component: TambahContestPage,
});

import { createFileRoute } from "@tanstack/react-router";
import { LombaExamContainer } from "./-components/lomba-exam-container";

export const Route = createFileRoute("/(public)/lomba")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      lombaId: search.lombaId ? String(search.lombaId) : undefined,
      kelompokId: search.kelompokId ? String(search.kelompokId) : undefined,
      kasusId: search.kasusId ? String(search.kasusId) : undefined,
    };
  },
  component: LombaExamContainer,
});

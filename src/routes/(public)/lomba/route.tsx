import { createFileRoute } from "@tanstack/react-router";
import { LombaExamContainer } from "./-components/lomba-exam-container";

export interface LombaSearchParams {
  lombaId?: string;
  kasusId?: string;
}

export const Route = createFileRoute("/(public)/lomba")({
  validateSearch: (search: Record<string, unknown>): LombaSearchParams => {
    return {
      lombaId: search.lombaId ? String(search.lombaId) : undefined,
      kasusId: search.kasusId ? String(search.kasusId) : undefined,
    };
  },
  component: LombaExamContainer,
});

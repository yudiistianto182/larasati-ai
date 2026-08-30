import { createFileRoute } from "@tanstack/react-router";
import { TambahKasusPage } from "./-components/tambah-kasus-page";

interface KasusTambahSearch {
  kasusId?: string;
}

export const Route = createFileRoute("/(admin)/dashboard/master/kasus/tambah")({
  validateSearch: (search: Record<string, unknown>): KasusTambahSearch => ({
    kasusId: typeof search.kasusId === "string" ? search.kasusId : undefined,
  }),
  component: Page,
});

function Page() {
  const { kasusId } = Route.useSearch();
  return <TambahKasusPage editKasusId={kasusId} />;
}

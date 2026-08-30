import { createFileRoute } from "@tanstack/react-router";
import { KasusComponent } from "./-components/kasus";

export const Route = createFileRoute("/(admin)/dashboard/master/kasus/")({
  component: Page,
});

function Page() {
  return <KasusComponent />;
}

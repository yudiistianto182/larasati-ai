import { createFileRoute } from "@tanstack/react-router";
import { Periode } from "./-components/periode";

export const Route = createFileRoute("/(admin)/dashboard/master/periode")({
  component: Page,
});

function Page() {
  return <Periode />;
}

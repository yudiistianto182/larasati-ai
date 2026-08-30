import { createFileRoute } from "@tanstack/react-router";
import { Contest } from "./-components/contest";

export const Route = createFileRoute("/(admin)/dashboard/contest/")({
  component: Page,
});

function Page() {
  return <Contest />;
}

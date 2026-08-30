import { createFileRoute } from "@tanstack/react-router";
import { Roles } from "./-components/roles";

export const Route = createFileRoute("/(admin)/dashboard/system/role")({
  component: Page,
});

function Page() {
  return <Roles />;
}

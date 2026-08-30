import { createFileRoute } from "@tanstack/react-router";
import { AdminUsers } from "./-components/users";

export const Route = createFileRoute("/(admin)/dashboard/system/user")({
  component: Page,
});

function Page() {
  return <AdminUsers />;
}

import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)/dashboard/config/pasien")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/master/pasien" });
  },
});

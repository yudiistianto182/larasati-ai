import { createFileRoute } from "@tanstack/react-router";
import { PasienComponent } from "./-components/pasien";

export const Route = createFileRoute("/(admin)/dashboard/master/pasien")({
  component: PasienComponent,
});

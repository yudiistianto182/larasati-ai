import { createFileRoute } from "@tanstack/react-router";
import { TestInteractiveChat } from "./-components/test-interactive-chat";

export const Route = createFileRoute("/(public)/test")({
  component: TestInteractiveChat,
});

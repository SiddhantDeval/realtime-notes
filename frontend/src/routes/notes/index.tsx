import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/notes/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <p>Welcome</p>;
}

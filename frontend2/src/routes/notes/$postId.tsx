import { Note } from "@/Views";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/notes/$postId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Note noteId={""} initialContent={""} initialVersion={0} socket={undefined} />
}

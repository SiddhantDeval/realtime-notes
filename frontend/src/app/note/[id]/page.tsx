
import Note from "@/Views/Note";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Note noteId={id} />;
}

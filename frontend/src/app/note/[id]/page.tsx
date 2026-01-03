
import Note from "@/Views/Note";
import ProtectedRoute from "@/components/ProtectedRoute";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ProtectedRoute>
      <Note noteId={id} />
    </ProtectedRoute>
  );
}

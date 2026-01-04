import ProtectedRoute from '@/components/ProtectedRoute'
import { Note } from '@/Views'

async function RouteComponent({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    return (
        <ProtectedRoute>
            <Note noteId={slug} />
        </ProtectedRoute>
    )
}

export default RouteComponent

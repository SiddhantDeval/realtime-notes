import { Notes } from '@/Views'
import ProtectedRoute from '@/components/ProtectedRoute'

function RouteComponent() {
    return (
        <ProtectedRoute>
            <Notes />
        </ProtectedRoute>
    )
}

export default RouteComponent

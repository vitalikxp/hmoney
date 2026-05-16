import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="bg-canvas min-h-screen flex items-center justify-center">
        <div className="text-muted text-sm">Загрузка...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

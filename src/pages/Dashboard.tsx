import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function Dashboard() {
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    try { await logout() } catch (e) { console.error('Logout failed', e) }
  }

  return (
    <div className="bg-canvas min-h-screen">
      <header className="border-b border-hairline">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <span className="text-yellow text-lg" aria-hidden="true">🐝</span>
            <span className="text-ink font-bold tracking-tight">hmoney</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-muted hover:text-ink transition-colors cursor-pointer"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold tracking-tighter text-ink mb-3">
          Добро пожаловать!
        </h2>
        <p className="text-body text-lg mb-8">
          Приложение в разработке. Скоро здесь появится управление транзакциями, календарь и отчёты.
        </p>
        <div className="inline-flex flex-wrap items-center justify-center gap-2">
          {['Календарь', 'Счета', 'Категории', 'Отчёты'].map((f) => (
            <span
              key={f}
              className="px-3 py-1.5 text-sm font-medium bg-elevated text-muted rounded-lg"
            >
              {f}
            </span>
          ))}
        </div>
      </main>
    </div>
  )
}

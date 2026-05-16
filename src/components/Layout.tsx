import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

interface Props {
  children: React.ReactNode
}

const NAV_ITEMS = [
  { to: '/accounts', label: 'Счета', icon: '💳' },
  { to: '/envelopes', label: 'Конверты', icon: '📨' },
]

export default function Layout({ children }: Props) {
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    try { await logout() } catch (e) { console.error('Logout failed', e) }
  }

  return (
    <div className="bg-canvas min-h-screen pb-16 md:pb-0">
      <header className="border-b border-hairline">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <NavLink to="/" className="flex items-center gap-2 cursor-pointer shrink-0">
              <span className="text-yellow text-lg" aria-hidden="true">🐝</span>
              <span className="text-ink font-bold tracking-tight">hmoney</span>
            </NavLink>
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-yellow/15 text-yellow font-medium'
                        : 'text-muted hover:text-ink hover:bg-elevated'
                    }`
                  }
                >
                  {item.icon} {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted hidden sm:block">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-muted hover:text-ink transition-colors cursor-pointer"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {children}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-hairline flex items-center justify-around h-14 safe-area-bottom z-40">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1 text-xs transition-colors cursor-pointer ${
                isActive ? 'text-yellow' : 'text-muted hover:text-ink'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

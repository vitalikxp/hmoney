import { useCallback, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { FirebaseError } from 'firebase/app'
import { useAuthStore } from '../stores/authStore'

export default function LoginPage() {
  const glowRef = useRef<HTMLDivElement>(null)
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (glowRef.current) {
      const rect = glowRef.current.getBoundingClientRect()
      glowRef.current.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`)
      glowRef.current.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`)
    }
  }, [])
  const { user, loading, login } = useAuthStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="dot-grid bg-canvas min-h-screen flex items-center justify-center">
        <div className="text-muted text-sm">Загрузка...</div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/invalid-credential':
            setError('Неверный email или пароль')
            break
          case 'auth/invalid-email':
            setError('Некорректный email')
            break
          default:
            setError('Ошибка входа')
        }
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ошибка входа')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className="dot-grid bg-canvas min-h-screen flex items-center justify-center px-4 transition-colors"
    >
      <div
        ref={glowRef}
        className="spotlight-layer pointer-events-none fixed inset-0 z-0"
      />
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <span className="text-yellow text-4xl font-bold" aria-hidden="true">🐝</span>
          <h1 className="text-2xl font-bold tracking-tighter text-ink mt-2">hmoney</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-body mb-1">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-surface text-ink rounded-lg border border-hairline focus:border-yellow focus:outline-none text-sm transition-colors"
              placeholder="mail@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-body mb-1">Пароль</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-surface text-ink rounded-lg border border-hairline focus:border-yellow focus:outline-none text-sm transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-rose text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-yellow text-[#0a0a0a] font-semibold rounded-lg hover:brightness-110 disabled:opacity-50 transition-all text-sm"
          >
            {submitting ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-link hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  )
}

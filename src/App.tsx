import { useCallback, useRef } from 'react'

function App() {
  const glowRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (glowRef.current) {
      const rect = glowRef.current.getBoundingClientRect()
      glowRef.current.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`)
      glowRef.current.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`)
    }
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      cardRef.current.style.setProperty('--cx', `${e.clientX - rect.left}px`)
      cardRef.current.style.setProperty('--cy', `${e.clientY - rect.top}px`)
    }
  }, [])

  return (
    <div
      onMouseMove={handleMouseMove}
      className="dot-grid bg-canvas min-h-screen flex flex-col items-center justify-center px-4 transition-colors"
    >
      <div
        ref={glowRef}
        className="spotlight-layer pointer-events-none fixed inset-0 z-0"
      />
      <main className="text-center max-w-lg relative z-10">
        <span className="text-yellow text-6xl font-bold leading-none" aria-hidden="true">🐝</span>
        <h1 className="text-5xl font-bold tracking-tighter text-ink mt-4 mb-2">
          hmoney
        </h1>
        <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase bg-yellow text-[#0a0a0a] rounded-full mb-8">
          В разработке
        </span>
        <p className="text-body text-lg leading-relaxed mb-10">
          Приложение для ручного учёта личных финансов. Удобный инструмент для контроля бюджета, транзакций и финансового планирования.
        </p>
        <div
          ref={cardRef}
          className="card-glow rounded-xl p-6 text-left border border-hairline transition-colors"
        >
          <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
            Технологии
          </h2>
          <div className="flex flex-wrap gap-2">
            {['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Firebase', 'PWA', 'opencode.ai'].map(t => (
              <span key={t} className="px-2.5 py-1 text-xs font-medium bg-elevated text-ink rounded-md transition-colors">
                {t}
              </span>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-hairline flex items-center justify-between transition-colors">
            <a
              href="https://github.com/vitalikxp/hmoney"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
            <span className="text-xs text-muted">
              Разработка: <a href="https://vitalik.dev" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-ink transition-colors">vitalik.dev</a> и <a href="https://opencode.ai" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-ink transition-colors">opencode.ai</a>
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App

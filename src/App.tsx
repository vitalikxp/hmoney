function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex flex-col items-center justify-center px-4 text-white">
      <main className="text-center max-w-lg">
        <div className="text-6xl mb-4" aria-hidden="true">🐝</div>
        <h1 className="text-5xl font-bold tracking-tight mb-3">hmoney</h1>
        <span className="inline-block px-3 py-1 text-sm font-medium bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 mb-8">
          В разработке
        </span>
        <p className="text-lg text-slate-300 mb-10 leading-relaxed">
          Приложение для ручного учёта личных финансов.
          Скоро здесь появится удобный инструмент для контроля бюджета,
          транзакций и финансового планирования.
        </p>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-left border border-white/10">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Технологии</h2>
          <div className="flex flex-wrap gap-2">
            {['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Firebase', 'PWA'].map(t => (
              <span key={t} className="px-2.5 py-1 text-xs font-medium bg-white/10 text-slate-200 rounded-md">
                {t}
              </span>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <a
              href="https://github.com/vitalikxp/hmoney"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </main>
      <footer className="mt-12 text-xs text-slate-600">
        &copy; {new Date().getFullYear()} hmoney
      </footer>
    </div>
  )
}

export default App

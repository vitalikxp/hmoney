# hmoney

Учёт личных финансов. Pet-project — упрощённый аналог HoneyMoney.

**Домен**: https://money.vitalik.dev

## Требования

- Node.js 20+
- pnpm (`corepack enable` или `npm i -g pnpm`)

## Установка и запуск

```bash
pnpm install
pnpm run dev
```

Открыть http://127.0.0.1:5173

## Скрипты

| Команда | Описание |
|---------|----------|
| `pnpm run dev` | Dev-сервер с HMR |
| `pnpm run build` | TypeScript check + production сборка в `dist/` |
| `pnpm run preview` | Локальный preview собранного `dist/` |
| `pnpm test` | Unit-тесты (Vitest) |
| `pnpm run test:e2e:full` | E2E-тесты (Playwright) + очистка тестовых пользователей |

## Технологии

React, TypeScript, Vite, Tailwind CSS, pnpm, Firebase (в плане), PWA (в плане).

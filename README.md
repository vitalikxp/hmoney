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

Dev-сервер по умолчанию работает на **local-драйвере** (данные в `localStorage`, без Firebase и сети).
Вернуться на Firestore в дев-режиме: `VITE_STORAGE_DRIVER=firestore pnpm run dev` (нужен `.env` с Firebase-конфигом).

## Скрипты

| Команда | Описание |
|---------|----------|
| `pnpm run dev` | Dev-сервер с HMR (local-драйвер по умолчанию) |
| `pnpm run build` | TypeScript check + production сборка в `dist/` (Firestore) |
| `pnpm run preview` | Локальный preview собранного `dist/` |
| `pnpm test` | Unit-тесты (Vitest) |
| `pnpm run test:e2e` | E2E на local-драйвере (localStorage) + production-проект против money.vitalik.dev |
| `pnpm run test:e2e:firebase` | E2E local-проекта на реальном Firestore (нужны правила и `.env`) |
| `pnpm run test:e2e:full` | E2E + очистка тестовых пользователей Firebase |

## Технологии

React, TypeScript, Vite, Tailwind CSS, pnpm, Firebase Firestore/Auth (адаптер), localStorage-адаптер (dev), PWA (в плане).

---
created: 2026-09-11
updated: 2026-09-11
tags: [research, stack, preact, react, bundle]
status: updated
---

# Preact — актуальность и применимость к hmoney

## Вывод (обновлено 2026-09-11: миграция выполнена)

Preact жив и активно развивается (10.29.x, релизы регулярные; v11 в бете с начала 2026 — совместимость заявлена с React 19 через `preact/compat`).

**Решение пользователя — перейти на Preact — реализовано в тот же день.** Итоги миграции:
- бандл 852 kB raw / 255 kB gzip → **642 kB / 191 kB (−25%)** (Preact + уход от react-number-format)
- react-router-dom 7 и zustand работают без изменений через `preact/compat` (zustand не тронут — он использует `useSyncExternalStore` из aliased `react`)
- настоящий React полностью удалён из зависимостей через shim-пакеты `vendor/react-shim`/`react-dom-shim`
- `react-number-format` удалён — несовместим с compat (зацикливание при вводе через userEvent); заменён собственным `MoneyInput`
- тесты: 151 unit + 23 e2e — все зелёные

## Факты о Preact (2026)

- Размер: ~3–4 kB gzip (react + react-dom ≈ 40–45 kB gzip)
- MIT, 0 зависимостей, ~39k звёзд на GitHub, active team (developit, marvinhagemeister, jovidecroock)
- Совместимость через `preact/compat` (алиас react/react-dom): hooks, context, JSX — API тот же
- v11 — в бете (фев 2026): добавляет стриминговую гидратацию, репортит React 19
- Дифф быстрее React на большинстве сценариев; DevTools поддерживаются
- Различия без compat: тонкие отличия в edge-cases (`<input>` события, `dangerouslySetInnerHTML`, некоторые флаги)

## Оценка до миграции (2026-09-11, историческое)

| Фактор | Оценка |
|--------|--------|
| Бандл | 852 kB (255 kB gzip), из них Firebase SDK — большинство; React ядро ~40 kB raw (~15 kB gzip) → замена даёт ~2% итогового gzip |
| Зависимости | react-router-dom 7 — работает через compat; react-number-format — проверить; zustand — нейтрален |
| Тесты | @testing-library/react требует react-dom → юнит-стек пришлось бы оставить на React или переписывать |
| Фичи React 19 | Экзотические API не используются — совместимо, но и без выгоды |

Прогноз «~2% gzip» оказался неточным: реальный выигрыш — 25% (убрался дубль React-подграфа,
который тянул react-number-format CJS + ESM, и сам react-number-format).

## Связанные страницы

- [Обоснование стека](../Архитектура/Стек.md)
- [Каталог wiki](../index.md)

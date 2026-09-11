---
created: 2026-05-16
tags: [changelog, log]
status: updated
---

# Журнал изменений

## [2026-09-11] реализация | Бесконечный повтор: автопродление серий

- «Повторять до» пустое → серия повторяется бесконечно: реализовано автопродление — при каждой загрузке транзакций (`fetchTransactions`) серии без `until` дозаматериализуются от последнего экземпляра до 12-месячного горизонта (rolling window); значения берутся из последнего экземпляра (отражает правки «эту и будущие»)
- Интеграционный тест с real-генератором и local-адаптером (`repeatSeries.integration.test.ts`)
- Тесты: 238 unit (+4: продление, серия с until не продлевается), 37 e2e

## [2026-09-11] ux | Плановые транзакции не создаются в прошлом

- Валидация в TransactionModal: для plan-режима и серий выбранная дата (и «Повторять до:») должна быть сегодня или позже; иначе кнопка заблокирована + подсказка «Плановая транзакция не создаётся в прошлом»; у поля даты `min={сегодня}` для план-режима
- Тесты: 234 unit (+2), 37 e2e (+1)

## [2026-09-11] ux | «Будущее»: сортировка по возрастанию

- Вкладка «Будущее»: дни по возрастанию — ближайшее будущее сверху, далёкое ниже (сегодня закреплён первым). «Прошлое» — по убыванию как раньше
- Тесты: 232 unit (+1), e2e без изменений

## [2026-09-11] ux | Переключатель «Прошлое / Будущее» на странице транзакций

- Переключатель сверху (по предложению пользователя): «Прошлое» (дефолт) / «Будущее»; сегодняшний день виден всегда в обоих режимах и выделяется цветом (жёлтая рамка + бейдж «сегодня»)
- `TransactionList`: проп `range` — фильтр прошлых (date ≤ сегодня) / будущих (date > сегодня + сегодняшний блок закреплён сверху); «Показать ещё» сбрасывается при переключении; пустое состояние «Будущих транзакций пока нет»
- `TransactionDayGroup`: проп `isToday` — подсветка
- **Исправлен таймзонный баг дефолтной даты**: `setHours(0,0,0,0)` + `toISOString()` давали вчерашний день для утренних часов MSK (полночь локальная = 21:00 UTC предыдущего дня). Даты форматируются локально (`toLocalInputValue`)
- Ловушка e2e: модал создания заполнялся до окончания settle — поздний effect для `transaction=null` затирал fill; эффект сброса теперь срабатывает только в режиме редактирования
- Тесты: 231 unit (+4 диапазоны), 36 e2e (+1 переключатель)

## [2026-09-11] реализация | Этап 4 завершён: повторения, переводы, Факт/План, редактор категорий

- `types/transaction.ts`: + `transfer`, `mode: 'fact' | 'plan'`, `TransactionRepeat` (frequency/interval/until/weekendMode), `seriesId`, `toAccountId`, `toEnvelopeId`
- `repeatUtils.generateRecurringDates`: материализация серий — день/неделя/месяц/год, N дней (2–6), N недель (2–4), N месяцев (2–4), 1.5 месяца (дробные месяцы ≈30 дней), полгода, по будням/выходным; «Повторять до:» или горизонт 12 месяцев; месяцы/годы от базовой даты (31.01 → 28.02 → 31.03), кламп конца месяца
- `transactionStore`: создание серий (N план-транзакций с общим seriesId, без дельт); дельты только для `mode: 'fact'` (расход/доход ± счёт+конверт; перевод счетов −/+; перевод конвертов −/+); `updateTransaction`/`deleteTransaction` с scope «one» / «future» (пересоздание серии от этой даты, прошлые не трогаются)
- `TransactionModal`: три типа (Расход/Доход/Перевод), перевод двух видов (между счетами/конвертами с двойным выбором), переключатель Факт/План, блок Повторять (пресеты + «Повторять до:»), для серий — выбор «Только эту / Эту и будущие» («Прошлые транзакции будут не тронуты»)
- `TransactionCard`: переводы «Карта → Наличные» / «Резервы → Отпуск» (⇄), бейджи «План» и 🔁; `TransactionList/DayGroup` — прокидывание имён счетов/конвертов
- `CategoriesModal` — редактор категорий: список уникальных категорий с счётчиками, переименование batch во всех транзакциях (кнопка «Категории» на странице)
- Тесты: +24 (repeatUtils 10, store серий/переводов/scope 6, Card переводы/бейджи, CategoriesModal 5). Итого **227 unit** (27 файлов)
- E2E: +6 сценариев (план без влияния на баланс, перевод счетов с проверкой балансов, перевод конвертов, серия, правка «эту и будущие», редактор категорий). Итого **35 e2e** (30 local + 5 production)
- Wiki: `Данные.md` (модель Transaction — реализованная), `ФТ.md` (TR-06/07/11/14/15/16, EN-13 → ✅), `Компоненты.md`

## [2026-09-11] реализация | Страница «Транзакции»: список по дням, NL-ввод, дельты балансов

- `types/transaction.ts`: Transaction (type/date/amount/category/description/accountId/envelopeId, нейтральные timestamps); `TransactionRepository` в backend (оба адаптера: firestore `users/{uid}/transactions`, local `hmoney:data:{uid}:transactions`)
- `transactionService` (фассад) + `transactionStore`: CRUD + **дельты балансов** (расход: счёт−, конверт−; доход: счёт+, конверт+; правка/удаление откатывают старые дельты; ХаниМани вычисляется сам)
- `parseTransactionInput` — NL-парсер `5*250 яблоки (комментарий)`, поддержка запятой, описание без суммы
- UI (`src/components/transactions/`): `TransactionCard` (кружок с буквой категории, ±сумма), `TransactionDayGroup` (сворачиваемый блок дня с итогами −/+), `TransactionList` (группировка по дням, батчи 30 дней + IntersectionObserver «Показать ещё»), `TransactionModal` (NL-поле с подсказкой парсинга, дата, категория на ходу, счёт/конверт select)
- `TransactionsPage` на `/transactions` (третий пункт навигации, desktop + bottom menu); пустое состояние как у счетов
- Тесты: +52 (парсер, store-дельты, адаптер, 4 компонента, страница). Итого **203 unit** (25 файлов)
- E2E: `transactions.spec.ts` (6 тестов) + POM `TransactionsPage.ts`; production-проект игнорирует его. Итого **29 e2e** (24 local + 5 production), все зелёные
- **Исправлена скрытая регрессия миграции на Preact**: core preact НЕ нормализует `onChange` (это нативный change на blur) — все формы обновляли state только при blur. Заменено на `onInput` во всех формах (AccountModal, EnvelopeModal, TransactionModal, Login, Register)
- Ловушка: модал транзакций при первом открытии не подставлял счёт (список грузился позже) → `required` select молча блокировал submit; добавлена синхронизация + подсказка «Сначала создайте счёт»
- Wiki: `Данные.md` (модель Transaction: реализованная часть + план расширений), `Компоненты.md` (+TransactionsPage дерево), `ФТ.md` (TR-01..05/09/10, EN-07 → ✅)

## [2026-09-11] требования | ТЗ перестроено: полная карта функций + приоритеты

- `ТЗ.md`: пересобран — принципы (личный проект: без онбординга/партнёрки; адаптивный UI на каждом этапе), карта функций HoneyMoney → hmoney с разметкой ✅/MVP-этап/post-MVP/out of scope, план работ со статусами (этапы 1–3 ✅, Э4 🚧)
- Решения пользователя: UI адаптивный всегда; отдельный мобильный UI, партнёрская программа и онбординг — исключены
- Расклад по этапам: Э4 = транзакции + повторения («эту и будущие») + переводы между счетами и конвертами + категории на ходу; Э5 = календарь + список (фильтры, кратко/подробно, drag&drop, сводки); Э6 = отчёты (период/категории/Net Worth) + прогноз Резервов; Э7 = PWA; Э8 = горячие клавиши/полировка
- post-MVP: импорт CSV, категории счетов, будущий баланс счёта, сравнение периодов, treemap, подкатегории, виртуальные счёта-цели, мультивалютность, семейный доступ, тэги
- out of scope: синхронизация с банками/SMS, оплата счетов, партнёрка
- `Функциональные_требования.md`: + новые требования (TR-06/07 повторения с сериями, TR-14/15 переводы двух типов, TR-16 категории на ходу, CA-04/05/08/09/10, AN-02/03/05/06, PL-01..05), статусы реализации во всех таблицах, исключены EN-14/PL-06/PL-07

## [2026-09-11] чистка | wiki: удалена Исследования/Аутентификация.md

- Суть перенесена в `Архитектура/index.md` (решение 16: auth-архитектура, 404-redirect для SPA на Pages, env FIREBASE_*)
- `Исследования/HoneyMoney_сайт.md`: обновлён раздел Отчёты + ссылка на новую карту функций из бандла
- `index.md`: ссылка удалена, счётчики пересчитаны (30 md-страниц)

## [2026-09-11] исследование | HoneyMoney: свежий проход сайта, бандла демо и обзоров

- Новые источники в `Источники/`:
  - «Возможности и тарифы (актуализация 2026-09)» — /ru/about, /ru/pricing ($5→$2/мес), полный список горячих клавиш, механика Резервов, сравнение с YNAB/Mint
  - «Карта функций приложения (бандл демо 2026-09)» — детальная карта функций, извлечённая из JS-чанков demo.hmbee.ru (89 чанков): регулярные транзакции с гибкой периодичностью, импорт CSV (#импорт), отчёты (period/treemap/compare/net_worth), виртуальные счёта-цели, категории счетов, будущий баланс счёта, мобильный UI, настройки
  - «Отзывы и сторонние обзоры» — startpack (4.9/50 отзывов), testimonials EN, сравнение трекеров; выводы: онбординг для системы конвертов обязателен, производительность на объёме
- `index.md`: каталог источников обновлён

## [2026-09-11] архитектура | Миграция React 19 → Preact 10 (compat)

- Зависимости: удалены `react`, `react-dom`, `@types/react`, `@types/react-dom`, `@testing-library/react`, `@vitejs/plugin-react`, `react-number-format`; добавлены `preact`, `@testing-library/preact`, `@preact/preset-vite`
- **Shim-пакеты** `vendor/react-shim`/`vendor/react-dom-shim` (re-export `preact/compat`), объявлены в `package.json` как `react`/`react-dom` — pnpm peer-разрешение подставляет их всем зависимостям; настоящий React полностью исчез из графа. Это решило проблему экстернализованных в vitest dep-пакетов (react-router/react-number-format тянули настоящий react в обход vite-алиасов)
- Ловушка с раздельными сборками preact (CJS ≠ ESM, разное hooks-состояние): shim экспортирует только `default`-условие (ESM), Node 24 умеет `require(esm)` — вся цепочка живёт в одном инстансе
- `vite.config.ts`/`vitest.config.ts`: `@vitejs/plugin-react` → `@preact/preset-vite`; `tsconfig.app.json`: `jsxImportSource: preact`, `esModuleInterop`
- `main.tsx`: `createRoot` из `preact/compat/client`, `StrictMode` убран (no-op в compat)
- Типы: глобальные `React.ReactNode/FormEvent/MouseEvent` → `ComponentChildren`/`TargetedEvent<T>`/`TargetedMouseEvent<T>` из `preact`; обработчики — `e.currentTarget` вместо `e.target` (в preact-типах target — голый EventTarget); 9 файлов импортов `react` → `preact/hooks`
- **MoneyInput переписан собственными силами** (тот же API: `value`/`onValueChange({floatValue})`/`allowNegative`): react-number-format 5.4.5 несовместим с preact/compat — зацикливание при вводе (render ок, ввод через userEvent зависает); заменён react-number-format → anti vendor-lock
- Тестовый стек: `@testing-library/react` → `@testing-library/preact` (14 файлов, setup.ts); zustand/роутинг — без единой правки
- Бандл: 852.68 kB raw / 255.33 kB gzip → **642.67 kB / 191.04 kB (−25%)**
- Верификация: `pnpm test` 151/151 ✅, build ✅, e2e 23/23 ✅ (18 local на localStorage + 5 production)
- Wiki: `Стек.md` (Preact + shim-механика), `Исследования/Preact_vs_React.md` (обновлён вывод), GEMINI/README/AGENTS обновлены

## [2026-09-11] исследование | Preact vs React — актуальность

- Новая страница `Исследования/Preact_vs_React.md`: Preact активен (10.29.x, v11 в бете, React 19 compat), но для hmoney не оправдан — бандл доминирует Firebase SDK, выигрыш ~2% gzip, риски в @testing-library/react
- `index.md`: страница добавлена в каталог

## [2026-09-11] архитектура | Backend-абстракция: удаление vendor-lock на Firestore

- `src/lib/backend/`: нейтральные интерфейсы (`Backend`, `AuthProvider`, `Repository`, `BackendError`, `User`) + фабрика драйвера по `VITE_STORAGE_DRIVER`
- `firestore/` адаптер: код из прежних `accountService`/`envelopeService` и auth-логики `authStore`; Firebase инициализируется лениво (`getFirebase()`) — только при реальных операциях
- `local/` адаптер: данные в `localStorage` (`hmoney:users`, `hmoney:session`, `hmoney:data:{uid}:accounts|envelopes`), фейковая auth с сессией; пароль открытым текстом — dev only
- `types/account.ts`, `types/envelope.ts`: `Timestamp` (firebase) → `number` (epoch ms); конвертация на границе firestore-адаптера
- `accountService`/`envelopeService` — тонкие фассады над `backend` (API прежний → stores не тронуты)
- `authStore` — на `backend.auth` + `createProfile`; `logout` теперь сам сбрасывает user в state (fix: с local-адаптером logout не выходил, т.к. не было onAuthStateChanged)
- Страницы Login/Register: `FirebaseError` → `BackendError` (нейтральные коды `invalid-credential`, `email-already-in-use`, `weak-password`, `invalid-email`)
- **Dev-режим по умолчанию на local-драйвере**: `.env.development` (в git) задаёт `VITE_STORAGE_DRIVER=local`; production-сборка — `firestore`; override: `VITE_STORAGE_DRIVER=firestore pnpm run dev`
- Скрипт `test:e2e:firebase` — local-проект e2e на реальном Firestore (env наследуется webServer-процессом)
- Тесты: +14 для local-адаптера (auth/CRUD/rollback/deleteUser); `authStore.test` переписан на мок `backend`; моки Timestamp → number. Итого **151 unit** (18 файлов)
- E2E-фиксы устаревшего: EnvelopeModal POM — локаторы `spinbutton` → `#envelope-balance`/`#target` (сломано ещё MoneyInput-рефакторингом в мае); удалён e2e «empty state конвертов» — состояние недостижимо (built-in «Резервы» неудаляем, текст в тесте тоже устарел). Итого **18 local + 5 production = 23**, все зелёные
- Wiki: `Стек.md` (раздел Backend-абстракция), `Данные.md` (нейтральные типы), `Архитектура/index.md` (решение 14), README/GEMINI/AGENTS обновлены
- Следствие: дев-разработка и local e2e работают без `.env`, сети и Firebase; правила Firestore влияют только на production-проект и `test:e2e:firebase`

## [2026-09-11] инфраструктура | Миграция на pnpm + обновление всех зависимостей до latest

- `package.json`: добавлен `packageManager: pnpm@11.13.1` (corepack), скрипт `test:e2e:full` переведён на pnpm (семантика `;` сохранена — cleanup идёт даже при падении тестов)
- `package-lock.json` удалён → `pnpm-lock.yaml`; `pnpm-workspace.yaml` создан (allowBuilds: esbuild, protobufjs, @firebase/util — иначе pnpm 11 блокирует их postinstall)
- Обновления minor/patch: react/react-dom 19.3.0, firebase 12.19.0, vite 8.3.0, @vitejs/plugin-react 6.1.1, @playwright/test 1.63.0, tailwindcss/@tailwindcss/vite 4.3.3, react-router-dom 7.18.3, zustand 5.0.15, @types/react(-dom) 19.3.0, fontsource 5.3.0, tsx 4.23.13
- Обновления major: typescript 6.0.3 → **7.0.2** (нативный компилятор, `tsc -b` прошёл без правок), vitest 4 → **5.0.0** (137/137 без правок), @testing-library/jest-dom 6 → **7.0.1**, jsdom 29 → **30.0.1**, firebase-admin 13 → **14.4.0**
- `deploy.yml`: `pnpm/action-setup@v4` + `cache: pnpm` + `pnpm install --frozen-lockfile`, `npm test/build` → pnpm, node 20 → 24 (совпадает с локальной средой)
- `playwright.config.ts`: `npm run dev` → `pnpm run dev`; **webServer перенесён на верхний уровень конфига** — в Playwright 1.61+ пер-проектный webServer больше не поддерживается и молча игнорируется (19 local-тестов падали с ERR_CONNECTION_REFUSED); URL localhost → 127.0.0.1
- `vite.config.ts`: `server.host: '127.0.0.1'` — на Node 24 vite 8 привязывается только к IPv6 `[::1]`, из-за чего Chromium (127.0.0.1) получал connection refused
- README.md, GEMINI.md, AGENTS.md: все команды npm → pnpm (заодно исправлены старые опечатки `ppnpm`)
- Верификация: `pnpm test` 137/137 ✅, `pnpm run build` (TS 7 + vite 8.3) ✅, локальный E2E — 13/24 ✅ (см. проблему правил ниже)

## [2026-09-11] аудит | Проблема: правила Firestore запрещают записи даже в продакшене

- Симптом: все CRUD E2E (счета/конверты) падают с «Ошибка создания счёта»; консоль браузера — `FirebaseError: Missing or insufficient permissions` из accountStore
- Воспроизводится на трёх транспортах: localhost (webServer), продакшен https://money.vitalik.dev (headless Chrome), чистый Firestore REST v1 с валидным idToken
- Разрешено при этом: создание `users/{uid}` при регистрации и создание built-in конвертов; запрещено: чтение `users/{uid}/accounts` (список «Загрузка…» навсегда) и запись `accounts`/**`envelopes` для всех транспортов кроме channel-запросов SDK
- Приложение не менялось с мая — это серверная конфигурация (Firebase Console → Firestore → Rules), НЕ следствие миграции на pnpm
- Unit-тесты это не ловят (Firebase мокается), E2E — единственная защита от такого регресса
- TODO: проверить правила в консоли Firebase; после исправления прогнать `pnpm run test:e2e:full`
- Тестовые пользователи (`test-*@vitalik.dev`) остались в Auth — удалить через `pnpm run test:e2e:cleanup` (нужен сервисный аккаунт)

## [2026-05-17] аудит | wiki: BudgetSummaryWidget, E2E-счётчик, ФТ EN-01/EN-02

- `Компоненты.md`: «Накопления» → «Конверты» в описании BudgetSummaryWidget
- `index.md`: E2E «23 (18 local + 5 production)» → «19 local + 5 production» (реальный count)
- `ФТ.md EN-01/EN-02`: уточнены формулировки под `isGoal` флаг вместо type-значений fund/goal

## [2026-05-17] аудит | wiki: счётчики тестов, react-number-format, AC-08/EN-09/AC-01/EN-01

- `Стек.md`, `index.md`: 140 тестов → 139 (актуальный count после refactoring)
- `Стек.md`: добавлен раздел `react-number-format` (зависимость, MoneyInput)
- `Данные.md`: в примере Account `"Тинькофф"` → `"Карта"` (плейсхолдер переименован ранее)
- `ФТ.md AC-01`: убраны «инвестиции» (группа инвестиций удалена)
- `ФТ.md AC-08`: «группировка Favorites/Investments/Hidden» → «единая сворачиваемая группа»
- `ФТ.md EN-09`: «скрытые конверты» зачёркнуто (isHidden удалён)
- `ФТ.md EN-01/EN-02`: убраны type-значения «fund»/«goal», заменены на `isGoal` флаг

## [2026-05-17] refactor | Simplify: MoneyInput компонент, упрощение AccountList, toInput

- `src/components/ui/MoneyInput.tsx` создан — обёртка `NumericFormat` с общими пропами (`thousandSeparator`, `decimalScale`, `className`); устраняет 4 копии идентичного блока пропов
- `AccountModal`, `EnvelopeModal`: импорт `NumericFormat` заменён на `MoneyInput`
- `AccountList`: убрана лишняя `<div className="space-y-3">` вокруг единственного дочернего элемента — прямой return `AccountGroup`
- `AccountModal.toInput`: `creditLimit` явно вынесен из `rest` перед нормализацией `?? undefined` — убрана двусмысленная перезапись

## [2026-05-17] refactor | Числовые инпуты: react-number-format, форматирование разрядов, отрицательный баланс

- `package.json`: добавлена зависимость `react-number-format ^5.4.5`
- `AccountModal`: `type="number"` → `NumericFormat` с `thousandSeparator=" "`, `allowNegative={true}` для баланса, `allowNegative={false}` для кредитного лимита
- `EnvelopeModal`: `type="number"` → `NumericFormat` с `thousandSeparator=" "` для баланса и целевой суммы
- E2E: `AccountModal.ts` — локаторы `getByRole('spinbutton')` → `locator('#balance')` / `locator('#credit-limit-amount')`; удалён лишний `selectGroup`
- E2E: `accounts.spec.ts` — тест «создать счёт в группе Инвестиции» → «создать счёт с отрицательным балансом»; проверка `-5 000₽`
- Unit: `AccountModal.test.tsx` — добавлен тест «позволяет ввести отрицательный баланс»

## [2026-05-17] refactor | Счета: AccountGroup в стиле EnvelopeGroup + инструкции по визуальным паттернам

- `AccountGroup.tsx` создан — зеркальная копия вёрстки `EnvelopeGroup` (сворачиваемый заголовок, иконка, счётчик, сумма)
- `AccountList.tsx` упрощён: убрана строка «Всего», используется единый `AccountGroup`
- `AccountGroup.test.tsx` добавлен
- `AGENTS.md`: новый раздел «Визуальные компоненты и переиспользование вёрстки» с таблицей паттернов
- `CLAUDE.md`: добавлена строка о переиспользовании вёрстки
- `Компоненты.md`: `AccountGroup` возвращён в дерево

## [2026-05-17] refactor | Конверты: удалён признак «Скрытый конверт» (isHidden)

- `src/types/envelope.ts`: удалено поле `isHidden`
- `EnvelopeModal`: удалён чекбокс «Скрытый конверт»
- `EnvelopeCard`: удалён бейдж «скрыт»
- `envelopeService`: убран `isHidden: false` из built-in конвертов
- Тесты: `createMockEnvelope`, `envelopeStore.test`, `EnvelopeCard.test` очищены
- Wiki: `Данные.md` обновлена

## [2026-05-17] refactor | Счета: убрана группировка, обновлён плейсхолдер

- `src/types/account.ts`: удалено поле `group`
- `AccountModal`: удалён `<select>` группы, плейсхолдер «Тинькофф» → «Карта»
- `AccountList`: плоский список карточек вместо группировки по `AccountGroup`
- `AccountGroup` (компонент и тест) удалён
- Тесты: `createMockAccount`, `accountStore.test`, `AccountList.test`, `AccountModal.test`, e2e-модели и `accounts.spec` очищены от `group`
- Wiki: `ТЗ.md`, `Данные.md`, `Компоненты.md` обновлены

## [2026-05-17] refactor | Упрощение конвертов: убран тип, добавлен признак «Цель»

- `src/types/envelope.ts`: удалён `EnvelopeType` и поле `type`; добавлен `isGoal: boolean`
- `src/components/envelopes/constants.ts`: убраны `TYPE_LABELS/TYPE_ICONS/TYPE_ORDER`; новая палитра с `✉️` первым, `DEFAULT_ICON = '✉️'`
- `src/lib/envelopeService.ts`: `ensureBuiltInEnvelopes` — идентификация Резервов через `isBuiltIn` вместо `type`
- `src/stores/envelopeStore.ts`: убраны блокировки по типу `spending`/`reserve`
- `EnvelopeCard`: убрана метка типа, добавлен badge «цель» при `isGoal: true`, дефолтная иконка `✉️`
- `EnvelopeGroup`: убран `type` проп, принимает `label` и `icon`
- `EnvelopeList`: одна группа «Конверты», empty state с кнопкой «Создать первый конверт»
- `EnvelopeModal`: убран селектор типа, добавлен чекбокс «Это цель» + поле «Целевая сумма *»
- `BudgetSummaryWidget`: `goalsBalance` → `envelopesBalance`, метка «Накопления» → «Конверты» (`✉️`)
- `EnvelopesPage`: `onAdd` проп передан в `EnvelopeList`; расчёт сумм через `isBuiltIn`
- Все unit-тесты и E2E-модели обновлены
- `wiki/Требования/ТЗ.md`, `wiki/Архитектура/Данные.md`: модель данных обновлена

## [2026-05-16] аудит | Актуализация wiki после редизайна BudgetSummaryWidget

- ТЗ.md: ХаниМани уточнён как вычисляемое значение, Резервы — единственный системный Firestore-конверт
- Компоненты.md: EnvelopesPage обновлён под BudgetSummaryWidget + EnvelopeList только для fund/goal
- index.md: исправлены markdown-ссылки на источники с круглыми скобками, добавлена секция «Связанные страницы»
- index.md, Стек.md: счётчики unit-тестов обновлены до 140 тестов / 17 файлов
- Функциональные_требования.md: TR-09, EN-03, EN-04 уточнены под ХаниМани как `envelopeId: null`; E2E-локаторы конвертов ранее обновлены под summary-виджет

## [2026-05-16] feat | BudgetSummaryWidget — виджет сводки бюджета на странице Конвертов

- `BudgetSummaryWidget.tsx`: новый компонент — 4 тайла (ХаниМани, Резервы, Накопления, Всего)
- `EnvelopesPage.tsx`: вычисление 4 значений через `useMemo`; виджет отображается вместо SpendingRow и Резервы-группы
- `EnvelopeList.tsx`: упрощён — только пользовательские конверты (fund/goal), возвращает null если список пуст
- `constants.ts`: TYPE_ORDER = ['fund', 'goal'] (reserve убран, ХаниМани никогда не был)
- `SpendingRow.tsx`: удалён (заменён виджетом)
- Тесты обновлены; итого 139 тестов

## [2026-05-16] arch | ХаниМани — вычисляемое значение, убран из Firestore

- `envelopeService.ts`: убран spending из BUILT_IN_ENVELOPES — при регистрации создаётся только 1 документ (Резервы)
- `envelopeStore.ts`: разделены ошибки для spending/reserve; spending теперь отдельная ветка с корректным сообщением
- `SpendingRow.tsx`: новый компонент — read-only строка с вычисленным балансом ХаниМани
- `EnvelopeList.tsx`: принимает `spendingBalance`, рендерит SpendingRow; убран spending из TYPE_ORDER
- `constants.ts`: spending убран из TYPE_ORDER
- `EnvelopesPage.tsx`: подключён `useAccountStore`, баланс ХаниМани вычисляется через `useMemo`
- Тесты: EnvelopeGroup/EnvelopeList/EnvelopesPage/envelopeStore обновлены; итого 141 тест
- Вики: Данные.md, ФТ.md EN-01, Архитектура/index.md #13 обновлены

## [2026-05-16] аудит | 4 правки (тесты ×2, EN-03, sortOrder-комментарии)

- index.md стр. 44: «139 тестов» → 137
- Стек.md:66: «139 тестов» → 137
- ФТ.md EN-03: «редактировать любой конверт» → уточнено: пользовательские (Фонды, Цели); системные read-only
- Данные.md: комментарии `sortOrder` обновлены («хранится, но сортировка по createdAt»); `isBuiltIn` — добавлено «редактировать»

## [2026-05-16] fix | nav-ссылки + порядок счетов/конвертов

- Layout.tsx: активные nav-ссылки переведены с `text-yellow` на `text-link` (в светлой теме — синий #2563eb)
- accountService.ts, envelopeService.ts: `orderBy('sortOrder')` → `orderBy('createdAt')` — записи выводятся в порядке создания

## [2026-05-16] fix | Переделка страницы Конвертов: баги дубликатов и редактирования

- envelopeStore.ts: убрана повторная вызов `ensureBuiltInEnvelopes` из `fetchEnvelopes` — устраняет race condition, приводивший к 2× ХаниМани и 2× Резервы
- EnvelopeCard.tsx: кнопки ✎ и 🗑 скрыты для `isBuiltIn`-конвертов — системные конверты теперь read-only
- EnvelopeModal.tsx: убраны spending/reserve из списка типов; убрана логика `disabled` для built-in
- EnvelopesPage.tsx: убрана ветка «пустых конвертов» (системные конверты всегда есть)
- EnvelopesPage.test.tsx: удалены 2 теста на пустое состояние, один переработан; итого 137 тестов
- wiki/Источники/ХаниМани — Конверты демо (интерфейс).md: новый источник со скриншотом из demo.hmbee.ru

## [2026-05-16] модель | Двухуровневая архитектура конвертов: 2 системных + до 20 пользовательских

- ФТ.md: EN-01 — «2 системных + до 20 пользовательских»; EN-02 — добавлен лимит; EN-15 — новое требование (блокировка при лимите)
- ТЗ.md: секция 3.4 переписана: системные (ХаниМани, Резервы) vs пользовательские (Фонды, Цели), лимит 20 суммарно
- Данные.md: таблица типов разбита на «Системные» и «Пользовательские», лимит 20 указан явно
- Архитектура/index.md: решение #13 (двухуровневая модель + лимит)
- envelopeStore.ts: проверка лимита 20 в createEnvelope
- envelopeStore.test.ts: тест «блокирует при лимите 20»; итого 140 тестов

## [2026-05-16] аудит | 5 исправлений (версии стека, PWA, Layout, RegisterPage, конверты)

- ТЗ.md: React 18+ → React 19, React Router → React Router 7, Tailwind CSS → Tailwind CSS v4
- Архитектура/index.md: #6 PWA помечено как «не реализовано, план Этап 7»
- Стек.md: добавлены React Router 7, Tailwind v4 (конфиг через CSS), раздел PWA (план)
- Аутентификация.md: RegisterPage — добавлено создание встроенных конвертов и rollback auth при ошибке
- Компоненты.md: Layout hierarchy — добавлена реальная структура (Layout внутри страниц) vs плановая
- index.md: 30-е обновление

## [2026-05-16] источники | Обработка 11 источников hmbee.ru — 4 новых требования

Прочитаны все 13 источников из wiki/Источники/. Большинство подтверждают известное.
Новые инсайты, которых не было в вики:

- **EN-10**: уточнён горизонт прогноза Резервов — до 12 месяцев вперёд
- **EN-13**: переводы между конвертами (envelope transfer) — отдельная операция
- **EN-14**: онбординг — после регистрации предлагать создать фонд «На чёрный день»
- **TR-13**: массовое удаление неподтверждённых транзакций (bulk delete при возврате после перерыва)
- Данные.md: горизонт 12 месяцев добавлен к формуле прогноза Резервов
- ТЗ.md: переводы между конвертами + горизонт добавлены в раздел 3.4
- Создана страница Исследования/Паттерны_использования.md (3 горизонта HM, онбординг, долги, возврат после перерыва, UX-советы)
- index.md: страниц 25 → 26, 29-е обновление

## [2026-05-16] аудит | 5 исправлений

- Дизайн.md: удалена дублирующая секция «Вопросы и противоречия» в конце файла
- Стек.md: 76 тестов (10 файлов) → 139 тестов (16 файлов)
- Аутентификация.md: `VITE_FIREBASE_*` → `FIREBASE_*` (строка с `envPrefix`)
- Аутентификация.md: маршрут `/→Dashboard` → актуальные маршруты `/accounts`, `/envelopes`, `*→/accounts`
- index.md: 138 тестов → 139 (28-е обновление)

## [2026-05-16] источники | Скачана документация с hmbee.ru — 11 новых страниц

Сайт hmbee.ru — JS SPA (Vue.js), статический скрапинг невозможен. Контент извлечён из предзагружаемых Vue-чанков (`/js/view-ru-docs-*.js`).

Созданы в `wiki/Источники/`:
- `ХаниМани — О системе` (hmbee.ru/ru/about, ~80 KB чанк)
- `ХаниМани — Быстрый старт для новичков` (docs/quick_start)
- `ХаниМани — Планирование и Резервы` (docs/reserves)
- `ХаниМани — Учёт кредитных карт` (docs/credit_cards)
- `ХаниМани — Учёт долгов` (docs/debts)
- `ХаниМани — Философия (почему нет автоматизации)` (docs/why_manual)
- `ХаниМани — Как вносить транзакции быстрее` (docs/faster)
- `ХаниМани — Как вернуться после перерыва` (docs/comeback)
- `ХаниМани — Мобильное приложение и вход` (docs/mobile + docs/login_problems)
- `ХаниМани — Откладывать на налоги` (docs/saving_for_taxes)
- `ХаниМани — Тарифы и философия монетизации` (ru/pricing)

Обнаружены, но не скачаны: encyclopedia (авто, быт, дети, еда, красота, одежда, путешествия, развлечения, ремонт, услуги, здоровье) — не релевантны для проекта.
index.md: страниц 14 → 25, 27-е обновление.

## [2026-05-16] аудит | Аудит wiki — 5 проблем исправлено

- Данные.md: убрана пометка ⚠️ «Не реализовано» перед моделью Envelope (реализована)
- Компоненты.md: добавлены маршруты /register и /envelopes; EnvelopeForm → EnvelopeModal; ✅ для EnvelopesPage, EnvelopeList, EnvelopeGroup, EnvelopeCard, EnvelopeModal
- log.md: заголовок `# Журнал изменений` перемещён в начало файла (был на строке 21)
- index.md: Unit-тестов 76→138, E2E 17→23 (18 local + 5 production), 26-е обновление
- Архитектура/index.md: добавлено решение #12 (Playwright E2E)

## [2026-05-16] конверты | Фиксированные ХаниМани и Резервы, isBuiltIn, вики-справка

- Источники: добавлена «Справка ХаниМани — виртуальные счета» (из справки hm)
- Данные.md: Envelope — добавлен `isBuiltIn`, таблица типов с колонкой «Фиксированный»
- ФТ.md: EN-01, EN-02, EN-04 уточнены (ХаниМани/Резервы — built-in, не создаются/не удаляются)
- Envelope: добавлен `isBuiltIn` в тип
- envelopeService: ensureBuiltInEnvelopes() — автосоздание при регистрации и первом fetch
- authStore: при регистрации создаются ХаниМани и Резервы
- envelopeStore: create/delete блокируются для built-in
- EnvelopeCard: скрыта кнопка удаления для built-in
- EnvelopeModal: создание только fund/goal; редактирование built-in — без смены типа
- EnvelopeList: ХаниМани и Резервы всегда отображаются (группы не скрываются)

## [2026-05-16] аудит | Исправление env-префикса, удаление GITHUB_TOKEN
- Аутентификация.md: `VITE_FIREBASE_*` → `FIREBASE_*` (соответствие реальному .env)
- index.md: добавлена ссылка на E2E-секцию AGENTS.md, счётчик 24
- .env: удалён GITHUB_TOKEN

## [2026-05-16] e2e | Cleanup: удаление тестовых пользователей через Admin SDK

- e2e: создан record.ts — запись email'ов тестовых пользователей
- e2e: создан cleanup.ts — удаление пользователей из Auth + Firestore (recursiveDelete)
- auth.spec.ts, accounts.spec.ts: record(email) после регистрации
- package.json: скрипты test:e2e:cleanup, test:e2e:full
- .env: добавлен FIREBASE_SERVICE_ACCOUNT
- .env.example, .gitignore: обновлены
- AGENTS.md: секция «Очистка тестовых пользователей»

## [2026-05-16] требования | Категории убраны из ТЗ
- ТЗ.md: удалена секция 3.3 Категории, исправлена нумерация 3.5→3.4, 3.6→3.5, 3.7→3.6
- "категория" убрана из полей транзакции и из фильтров

## [2026-05-16] источник | Справка с сайта Honey Money
- Источники: создана страница-сводка «Справка с сайта Honey Money»
- ТЗ.md: добавлен прогноз Резервов (дефицит/профицит)
- Функциональные_требования.md: добавлены EN-10, EN-11, EN-12; Alt+X уточнён
- Данные.md: добавлена формула расчёта прогноза Резервов
- Компоненты.md: NetWorthPopover → ReserveForecastPopover

## [2026-05-16] wiki | Добавлен пропущенный источник
- index.md: добавлена «Справка с сайта Honey Money», счётчик обновлён до 13

## [2026-05-16] аудит | Исправление счётчика обновлений
- index.md: счётчик исправлен с 11 на 12

## [2026-05-16] реализация | Регистрация и аутентификация
- Установлены firebase, react-router-dom, zustand
- Созданы: firebase.ts, authStore (Zustand), AuthGuard, LoginPage, RegisterPage, Dashboard
- App.tsx переписан на BrowserRouter с маршрутами /, /login, /register
- Добавлен .env с Firebase config, .env.example — шаблон
- build-скрипт: копирование index.html → 404.html для SPA routing на GH Pages
- Создана страница wiki/Исследования/Аутентификация.md

## [2026-05-16] аудит | Исправление ссылок в Аутентификация.md
- Аутентификация.md: `../../wiki/` → `../` (неконсистентные пути)

## [2026-05-16] аудит | Категория как строка, перенос HoneyMoney_сайт.md
- HoneyMoney_сайт.md перемещён из Источники/ в Исследования/ (ошибочно считался источником)
- Данные.md: удалена коллекция Category, поле categoryId → category (строка)
- Компоненты.md: удалены CategoryEditorModal, CategorySelect, `/categories` route; категория — текстовое поле
- ТЗ.md: категория возвращена в поля и фильтры транзакций (как строка)
- ФТ.md: TR-01, TR-08 — категория добавлена в поля и фильтры
- index.md: обновлён раздел Исследования, убран HoneyMoney_сайт.md из Источников

## [2026-05-15] инициализация | Создание структуры wiki
Создана начальная структура wiki: index.md, log.md, AGENTS.md,
категории requirements, architecture, sources и research.

## [2026-05-15] рефакторинг | Переименование папок wiki
Папки переименованы на русский с заглавной буквы.
Файлы переименованы: с заглавной буквы, дефис заменён на `_`.
Обновлены все перекрёстные ссылки и AGENTS.md.

## [2026-05-15] обновление | Актуализация по референсам из демо
Обновлены все страницы wiki на основе анализа демо-версии HoneyMoney.
Добавлены: 4 типа конвертов, типы транзакций (доход/расход/перевод/неподтверждённая),
мультивалютность, иерархия категорий через `/`, Net Worth в хедере,
фильтры, группировка счетов. Обновлены модели данных и компоненты.

## [2026-05-15] обновление | Расширение по референсам из демо (2-я итерация)
Добавлены: natural language input (`5*250 яблоки`), Факт/План режим,
горячие клавиши (Alt+1..4, Z, X, Ctrl+Enter), статистика с подкатегориями,
редактор категорий с счётчиком, курсы валют (172+). Обновлены модели,
компоненты (модалы), функциональные требования (HK, TR-10/11/12).
Поправлена иерархия компонентов — модалы вынесены на уровень App.

## [2026-05-15] аудит | Исправление найденных проблем
Аудит wiki: найдены и исправлены 7 проблем.
- Битые ссылки (регистр) в Архитектура/index.md
- TR-02: «неподтверждённая» перенесена из типов в статус
- Добавлен toAccountId в Transaction (переводы), description сделан обязательным
- Убран дубль: /categories теперь ведёт на CategoryEditorModal
- Добавлен NewTransactionModal в дерево компонентов
- Статусы draft→updated для index-страниц разделов
- Добавлены секции Вопросы и противоречия на 4 страницы

## [2026-05-15] аудит | Повторный аудит — 4 пропущенных проблемы
- ТЗ.md: тип «неподтверждённая» не был исправлен в секции 3.1
- HoneyMoney_сайт.md: то же самое в «Влияние на требования»
- Требования/index.md: таблица статусов не обновлена (Черновик→Актуально)
- Компоненты.md: добавлено предупреждение о дубле /transactions/new vs NewTransactionModal

## [2026-05-15] дизайн | Внедрение ClickHouse Design System
- Установлена дизайн-система ClickHouse через `npx getdesign@latest add clickhouse`
- Создан корневой `DESIGN.md` (палитра, типографика, компоненты, отступы)
- Создана страница `wiki/Архитектура/Дизайн.md` с описанием и обоснованием выбора
- Палитра: electric yellow `#faff69` на near-black `#0a0a0a`
- Выбор обоснован: пчелиная гамма + data-dense + техническая точность

## [2026-05-15] дизайн | Light mode для ClickHouse design system
- Добавлена светлая тема через `@media (prefers-color-scheme: light)`
- Инвертированы canvas/surface/text, желтый акцент `#faff69` сохранён
- Шрифты Inter + JetBrains Mono через @fontsource (локально, без CDN)
- Обновлены DESIGN.md (colors-light), wiki/Дизайн.md (секция Light)

## [2026-05-16] аудит wiki — полный
- ТЗ.md: Alt+X → прогноз Резервов (было Net Worth); типы счетов → card/investment/cash (выводимые)
- Данные.md: добавлены includeInBalance, currency, sortOrder в модель Account; ссылки `../Архитектура/` → `./`
- Компоненты.md: ссылки `../Архитектура/` → `./`
- Дизайн.md: порядок секций исправлен (Вопросы → Связанные страницы)
- ФТ.md: AC-01 (chequing/savings → выводимые типы); секции перенумерованы 5→4,6→5,7→6,8→7; AN-05..07 → AN-02..04
- log.md: добавлен frontmatter
- index.md: %20 → пробел
- Источники/Справка: текст ссылок без лже-якорей

## [2026-05-16] аудит | Закрыты вопросы и противоречия
- Все 9 вопросов в wiki закрыты с решениями, оставлены для истории
- `description?` удалён из Account (dead code)
- TR-12: браузерный HTML5 DnD
- Transfer: `runTransaction` для атомарности
- Route vs modal: только модал
- Регулярные: ручные шаблоны в MVP
- Индексы: перенесены в to-do
- Данные.md: секция To-do для Firebase индексов

## [2026-05-16] аудит | Модели данных приведены к коду
- Account: `includeInBalance`, `currency`, `sortOrder` убраны из post-MVP (уже реализованы)
- Account: `color` удалён (нет в коде)
- UserProfile: заменён на реальную модель (email, без currency/displayName)
- Envelope/Transaction: помечены ⚠️ «Не реализовано», суммы исправлены на целые рубли
- Хранение сумм: добавлено предупреждение проверить копейки при реализации
- Добавлен вопрос про `description?` в Account (dead field)

## [2026-05-16] тестирование | Unit-тесты (vitest + testing-library)
- Установлены: vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom
- Созданы: vitest.config.ts, src/test/setup.ts
- Скрипты: `npm test`, `npm run test:watch`
- Тесты: 10 файлов, 76 тестов — все проходят
- CI: `npm test` добавлен в deploy.yml перед `npm run build`
- Покрытие: stores (authStore, accountStore), components (AccountCard, AccountGroup, AccountList, AccountModal, AuthGuard), pages (AccountsPage, LoginPage, RegisterPage)
- src/test исключён из tsconfig.app.json (build не проверяет тесты)
- Инфраструктура: vi.hoisted() для mock-переменных, глобальный afterEach(cleanup)

## [2026-05-16] реализация | Счета: CRUD, группировка, иконки
- Созданы: Account (type), accountService (Firestore CRUD), accountStore (Zustand)
- Созданы: AccountsPage, AccountCard, AccountGroup, AccountList, AccountModal, IconPicker
- Dashboard удалён, `/` редиректит на `/accounts`
- Тип счёта выводится из `creditLimit`, не хранится явно
- Баланс в целых рублях (без копеек)
- Wiki: Данные.md — модель Account приведена к реализации
- Wiki: Компоненты.md — ✅ для реализованных компонентов, AccountForm → AccountModal
- Wiki: Архитектура/index.md — добавлены решения 7-10

## [2026-05-16] аудит | Исправление найденных проблем
- index.md: добавлен `status: updated` в frontmatter
- index.md: добавлена ссылка на log.md в каталог
- index.md: счётчик обновлений исправлен с 6 на 9

## [2026-05-16] тестирование | AGENTS.md — секция unit-тестирования
- AGENTS.md: добавлен раздел `## Unit-тестирование` с правилами для агентов
- Best practices: приоритет запросов, userEvent, vi.hoisted(), without ESLint/Biome
- Паттерны моков: Firebase модули, Zustand stores через vi.mock + vi.hoisted(), сервисный слой
- Обязательный запуск `npm test` перед сдачей задачи

## [2026-05-16] e2e | Playwright — E2E тестирование
- Установлен @playwright/test, загружен Chromium
- Создан playwright.config.ts: два проекта (local с webServer, production против money.vitalik.dev)
- Созданы: e2e/models/LoginPage.ts (POM), e2e/models/RegisterPage.ts, e2e/fixtures.ts, e2e/auth.spec.ts (2 теста)
- Добавлены скрипты: test:e2e, test:e2e:prod, test:e2e:ui, test:e2e:headed
- AGENTS.md: добавлен раздел `## E2E-тестирование (Playwright)`
- Тестовый аккаунт: test@vitalik.dev / Pa$$w0rd

## [2026-05-16] e2e | Добавлены Accounts CRUD тесты
- Созданы: e2e/models/AccountsPage.ts, e2e/models/AccountModal.ts
- Написаны тесты: пустое состояние, create (minimal, credit, excluded, group), edit, delete
- Добавлены auth-тесты на ошибки: wrong credentials, password mismatch, short password
- production проект исключает accounts.spec.ts (страница Счетов только в dev)
- Всего E2E: 17 тестов (12 local + 5 production)

## [2026-05-15] инициализация | Настройка проекта и домена
- Инициализирован Vite + React + TS + Tailwind CSS v4
- Создан лендинг «В разработке» (градиент, адаптивно, без копирайта)
- Настроен GitHub Actions CI/CD деплой на GitHub Pages
- CNAME: money.vitalik.dev
- Wiki: добавлена информация о домене, GitHub Actions, CI/CD
- AGENTS.md: git workflow, no-copyright policy, автор vitalik.dev

## Связанные страницы
- [Каталог wiki](./index.md)
- [Обзор требований](./Требования/index.md)
- [Обзор архитектуры](./Архитектура/index.md)

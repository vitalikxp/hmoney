---
created: 2026-05-16
tags: [changelog, log]
status: updated
---

# Журнал изменений

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

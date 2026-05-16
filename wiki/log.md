---
created: 2026-05-15
tags: [changelog, log]
status: updated
---

# Журнал изменений

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

## [2026-05-15] инициализация | Настройка проекта и домена
- Инициализирован Vite + React + TS + Tailwind CSS v4
- Создан лендинг «В разработке» (градиент, адаптивно, без копирайта)
- Настроен GitHub Actions CI/CD деплой на GitHub Pages
- CNAME: money.vitalik.dev
- Wiki: добавлена информация о домене, GitHub Actions, CI/CD
- AGENTS.md: git workflow, no-copyright policy, автор vitalik.dev

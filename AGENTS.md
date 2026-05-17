# Проект hmoney — LLM Wiki Schema

## О проекте

Разрабатываем pet-project — упрощённый аналог HoneyMoney (https://hmbee.ru).
Приложение для ручного учёта личных финансов: транзакции, календарь, категории.
Домен: https://money.vitalik.dev

## Стек технологий

- **Язык**: TypeScript
- **Фреймворк**: React + Vite (SPA)
- **Хостинг**: GitHub Pages
- **Стили**: Tailwind CSS
- **База данных**: Firebase Firestore (free tier) или Supabase
- **Аутентификация**: Firebase Auth / Supabase Auth
- **PWA**: Да (vite-plugin-pwa)

## Архитектура вики (три уровня)

1. **Источники** (`wiki/Источники/`) — курируемая коллекция исходных документов: статьи, скриншоты, выдержки с сайтов. Неизменяемы — LLM только читает, никогда не редактирует.
2. **Вики** (`wiki/Требования/`, `wiki/Архитектура/`, `wiki/Исследования/`) — markdown-файлы, которые LLM создаёт и поддерживает: сводки, страницы сущностей, сравнения, синтез. LLM полностью владеет этим уровнем.
3. **Схема** (`AGENTS.md`) — конфигурационный файл, который объясняет LLM, как устроена вики и каких сценариев придерживаться.

## Структура wiki

```
wiki/
├── index.md              # Каталог всех страниц
├── log.md                # Журнал изменений (chronological)
├── Требования/           # Страницы требований
│   ├── index.md          # Обзор требований
│   ├── ТЗ.md             # Техническое задание
│   └── Функциональные_требования.md
├── Архитектура/          # Архитектура и решения
│   ├── index.md
│   ├── Стек.md           # Обоснование стека
│   ├── Данные.md         # Модели данных
│   ├── Компоненты.md     # UI компоненты
│   └── Дизайн.md         # Дизайн-система
├── Источники/            # Сырые источники (статьи, доки)
│   └── *.md
└── Исследования/         # Исследования и заметки
    └── *.md
```

## Соглашения по страницам

1. **Абсолютные ссылки** между страницами вики через относительные пути: `[текст](./Требования/ТЗ.md)`
2. **YAML frontmatter** на каждой странице: дата создания, теги, статус (draft/active/updated)
3. **Секция `## Связанные страницы`** в конце каждой страницы
4. **Секция `## Вопросы и противоречия`** если есть неясности
5. **Язык**: русский (основной), термины — на английском в `code`
6. **Авторские права**: не указывать. Если требуется указать разработчика — `vitalik.dev и opencode.ai`
7. **Технологии**: при перечислении стека на лендинге/в доке добавлять `opencode.ai`

## Сценарии работы

### Загрузка источника
Триггер: "загрузи источник", "загрузи статью", "загрузи ссылку", "загрузи в вики", "загрузи источники"
1. Прочитать источник (ссылку или текст даёт пользователь; если сказано "загрузи источники" — прочитать все файлы из `wiki/Источники/`, которые ещё не обработаны)
2. Обсудить с пользователем ключевые выводы
3. Создать страницу-сводку в `wiki/Источники/`
4. Обновить `wiki/index.md`
5. Добавить запись в `wiki/log.md`
6. Обновить связанные страницы в `wiki/Требования/` или `wiki/Архитектура/`

### Запрос/вопрос
1. Найти релевантные страницы через `wiki/index.md`
2. Прочитать их
3. Ответить с цитированием
4. Если ответ ценен — сохранить как новую страницу в `wiki/Исследования/`

### Аудит wiki
При запросе "проверь вики" или "аудит":
1. Проверить index.md на полноту
2. Найти страницы-сироты (без входящих ссылок)
3. Найти противоречия
4. Предложить улучшения

## Принципы

- LLM пишет вики — пользователь читает, направляет и утверждает
- Источники неизменяемы — LLM их только читает
- Wiki — постоянный накапливающийся артефакт
- Каждое изменение логируется в log.md
- **Никаких коммитов без явного разрешения пользователя** — LLM никогда не создаёт git-коммиты самостоятельно

## Git workflow

- Вся разработка ведётся в ветке `dev`
- Сливать `dev` в `master` и деплоить — **только по явному запросу пользователя** («слей в мастер» или «сделай деплой»)
- Пользователь сам управляет, когда изменения попадают в продакшен

## Визуальные компоненты и переиспользование вёрстки

**Правило:** перед созданием нового визуального компонента найди существующий с аналогичной структурой и скопируй его разметку дословно — не изобретай новые CSS-варианты для уже решённых паттернов.

### Установленные паттерны (обязательны к переиспользованию)

| Паттерн | Образец | Ключевые CSS-классы |
|---------|---------|---------------------|
| Сворачиваемая группа | `EnvelopeGroup`, `AccountGroup` | контейнер: `border border-hairline rounded-lg overflow-hidden`; заголовок: `w-full flex items-center justify-between px-4 py-2.5 bg-elevated/50 hover:bg-elevated transition-colors cursor-pointer` |
| Строка карточки | `EnvelopeCard`, `AccountCard` | `flex items-center gap-3 px-4 py-3 hover:bg-elevated/50 transition-colors border-b border-hairline last:border-b-0` |
| Иконка-кружок | `EnvelopeCard`, `AccountCard` | `w-8 h-8 rounded-full bg-elevated flex items-center justify-center text-sm shrink-0` |
| Бейдж-метка | `EnvelopeCard` (цель), `AccountCard` (исключён) | `text-xs text-muted shrink-0` |
| Кнопки действий (ред./удал.) | `EnvelopeCard`, `AccountCard` | `p-1.5 text-muted hover:text-ink hover:bg-elevated rounded transition-colors cursor-pointer` |
| Модальное окно | `EnvelopeModal`, `AccountModal` | оверлей `fixed inset-0 z-50`, карточка `bg-surface border border-hairline rounded-xl w-full max-w-md mx-4 p-6 shadow-2xl` |

### Как применять

1. Нужен список с заголовком и сворачиванием — используй структуру `EnvelopeGroup`/`AccountGroup` дословно.
2. Нужна новая карточка в списке — скопируй `flex items-center gap-3 px-4 py-3 ...` из `EnvelopeCard`.
3. Нужно новое модальное окно формы — скопируй обёртку из `EnvelopeModal`/`AccountModal`.
4. Токены дизайн-системы (цвета, отступы, шрифты) — смотри `wiki/Архитектура/Дизайн.md`.

## Unit-тестирование

### Обязательное правило

Перед сдачей любой задачи (написание кода, рефакторинг, исправление бага) агент **обязан** запустить `npm test`.
Если какие-то тесты упали — сначала починить их, только потом сообщать о завершении.

### Стек

- **Runner:** Vitest (через `vitest run` / `vitest`)
- **Рендер:** `@testing-library/react`
- **Матчеры:** `@testing-library/jest-dom/vitest` (`toBeInTheDocument`, `toHaveTextContent`)
- **События:** `@testing-library/user-event` (`user.click`, `user.type`)
- **Окружение:** `jsdom`
- **Запуск:** `npm test` (однократно), `npm run test:watch` (watch mode)
- **Конфиг:** `vitest.config.ts`, `src/test/setup.ts`

### Где лежат тесты

- Тесты располагаются рядом с исходным файлом: `src/stores/authStore.test.ts`, `src/pages/LoginPage.test.tsx`
- Фабрики тестовых данных: `src/test/mocks/account.ts`
- Общий setup (jest-dom, `afterEach(cleanup)`): `src/test/setup.ts`
- Тесты исключены из `tsconfig.app.json` (build не проверяет)

### Best practices

1. **Тестируй поведение, не реализацию.**  
   Пользователю всё равно, какой внутренний state у компонента.  
   ✅ `getByRole('button', { name: /сохранить/i })`  
   ❌ `getByTestId('submit-button')` или проверка `wrapper.find(Button).prop('disabled')`

2. **Приоритет запросов к DOM:**  
   `getByRole` → `getByLabelText` → `getByText` → `getByPlaceholderText` → `getByTitle` → `getByTestId`  
   `getByTestId` — только если никакой другой запрос не подходит.

3. **Используй `userEvent`, не `fireEvent`.**  
   `userEvent` симулирует реальные браузерные события (клик, набор текста, фокус, таб).  
   ✅ `user.click(btn)` / `user.type(input, 'text')`  
   ❌ `fireEvent.click(btn)` / `fireEvent.change(input, { target: { value: 'text' } })`

4. **Не вызывай `act()` напрямую.**  
   RTL и `userEvent` уже оборачивают действия в `act`.

5. **Заполняй все required-поля перед submit.**  
   Браузерная валидация (`required`) блокирует отправку формы, если поле пустое.

6. **Проверяй состояния компонента:** empty, loading, error — они часть UX.

7. **Не тестируй Tailwind-классы, CSS-стили, внутренний state.**  
   Тестируй то, что видит пользователь: текст, видимость элементов, вызовы колбэков.

8. **Один `describe` на компонент/стор/страницу.**  
   Внутри — изолированные тесты на каждое поведение.

9. **Имена тестов — на русском, описывают поведение:**  
   ✅ `it('показывает ошибку при пустом имени')`  
   ❌ `it('should render error when name is empty')`

10. **Не тестируй типы и интерфейсы.** TypeScript уже проверяет их на этапе компиляции.

### Паттерны моков для этого проекта

**Firebase/Auth/Firestore** — мокаются на уровне модулей. Подробнее — в `src/stores/authStore.test.ts`:
```ts
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn((_auth, cb) => { cb(null); return () => {} }),
  // ...
}))
vi.mock('firebase/firestore', () => ({
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => null),
  // ...
}))
```

**Zustand stores** — мокаются через `vi.mock` + `vi.hoisted()` (чтобы избежать TDZ):
```ts
const { mockUseAuthStore } = vi.hoisted(() => ({ mockUseAuthStore: vi.fn() }))
vi.mock('../stores/authStore', () => ({ useAuthStore: mockUseAuthStore }))
// в тесте:
mockUseAuthStore.mockReturnValue({ user: null, loading: false, login: vi.fn() })
```

**Сервисный слой** — мокается в store-тестах:
```ts
const { mockService } = vi.hoisted(() => ({
  mockService: { fetchAccounts: vi.fn(), createAccount: vi.fn() },
}))
vi.mock('../lib/accountService', () => mockService)
```

**Компоненты без внешних зависимостей** (AccountCard, AccountGroup) тестируются напрямую через props — без моков. Фабрика `createMockAccount()` создаёт Account с дефолтными полями:
```ts
render(<AccountCard account={createMockAccount({ name: 'Наличные' })} onEdit={fn} onDelete={fn} />)
```

**Компоненты с модалами** (AccountsPage) — модал мокается через `vi.mock` компонента, чтобы не рендерить его реальную форму.

### CI

`npm test` запускается перед `npm run build` в GitHub Actions (см. `.github/workflows/deploy.yml`). Если тесты падают — деплой блокируется.

## E2E-тестирование (Playwright)

### Обязательное правило

Перед сдачей задачи, которая добавляет новую страницу, раздел приложения или сквозной сценарий (логин, CRUD), агент **обязан** написать E2E-тесты для этого сценария и убедиться, что они проходят.

Запускать через `npm run test:e2e:full` — это прогоняет все тесты на localhost + запускает очистку тестовых пользователей.

### Стек

- **Runner:** Playwright Test (`@playwright/test`)
- **Браузер:** Chromium (только он, для скорости)
- **Конфиг:** `playwright.config.ts`
- **Тесты:** `e2e/*.spec.ts`
- **Page Objects:** `e2e/models/*.ts`
- **Фикстуры:** `e2e/fixtures.ts`

### Запуск

| Команда | Описание |
|---------|----------|
| `npm run test:e2e` | Все тесты на localhost (автозапуск `npm run dev` через `webServer`) |
| `npm run test:e2e:prod` | Все тесты против https://money.vitalik.dev |
| `npm run test:e2e:ui` | UI Mode (watch, time travel) |
| `npm run test:e2e:headed` | С видимым браузером (для отладки) |
| `npm run test:e2e:cleanup` | Удалить тестовых пользователей из Auth + Firestore |
| `npm run test:e2e:full` | Прогнать тесты на localhost, затем очистить пользователей |

### Структура

```
e2e/
├── models/
│   ├── LoginPage.ts       # Page Object Model для /login
│   ├── RegisterPage.ts    # Page Object Model для /register
│   ├── AccountsPage.ts    # Page Object Model для /accounts
│   └── AccountModal.ts    # Page Object Model для модала счёта
├── fixtures.ts            # Кастомные фикстуры (loginPage, accountsPage и т.д.)
├── auth.spec.ts           # Тесты аутентификации (5 тестов: redirect, register→logout→login, ошибки)
├── accounts.spec.ts       # Тесты счетов (7 тестов: empty, create, edit, delete)
└── *.spec.ts              # Остальные E2E-тесты
```

### Page Object Model

Каждая страница приложения — отдельный класс в `e2e/models/`. POM инкапсулирует локаторы и действия:

```ts
class LoginPage {
  readonly heading: Locator
  readonly emailInput: Locator

  constructor(page: Page) {
    this.heading = page.getByRole('heading', { name: /hmoney/i })
    this.emailInput = page.getByLabel(/email/i)
  }

  async goto() { await this.page.goto('/') }
  async login(email: string, password: string) { /* fill + click */ }
}
```

### Фикстуры

Общие объекты (POM) выносятся в фикстуры, чтобы не создавать в каждом тесте:

```ts
// e2e/fixtures.ts
import { test as base } from '@playwright/test'
import { LoginPage } from './models/LoginPage'

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page)
    await use(loginPage)
  },
})
```

### Аккаунт для тестов

- **Email:** `test@vitalik.dev`
- **Пароль:** `Pa$$w0rd`
- Используй один и тот же аккаунт для большинства тестов — так не плодятся пользователи в Firestore
- Если тест проверяет регистрацию, используй динамический email: `test-${Date.now()}@vitalik.dev`

### Особенности Firebase Auth

Firebase Auth хранит сессию в IndexedDB. Playwright не умеет сохранять IndexedDB через `storageState`, поэтому:
- Для анонимных тестов (редирект на `/login`) — авторизация не нужна
- Для авторизованных тестов — логин через UI в `beforeEach` или в фикстуре

### Best practices

1. **Тестируй поведение пользователя** — `getByRole`, `getByLabel`, `getByText`. Не используй CSS-классы или XPath.
2. **Web-first assertions** — `await expect(el).toBeVisible()` (ждёт и ретраит). Не используй `isVisible()` напрямую.
3. **Page Object Model** — каждый тест работает через POM, а не через сырые page.locator.
4. **Не тестируй внешние сервисы** — Firebase для E2E — реальный, это часть теста.
5. **Один тест — один сценарий** — не смешивай проверки логина и CRBA счетов в одном тесте.
6. **`.env.e2e`** — если нужны переменные, создай `e2e/.env.e2e` и загружай через `dotenv` в конфиге.

### Очистка тестовых пользователей

Каждый тест создаёт нового пользователя через регистрацию. После прогона пользователи удаляются через Firebase Admin SDK.

**Утилиты:**
- `e2e/cleanup.ts` — получает всех пользователей из Auth через Admin SDK, фильтрует по домену `@vitalik.dev`, удаляет из Firestore + Auth (рекурсивно)

**Команды:**
| Команда | Описание |
|---------|----------|
| `npm run test:e2e:cleanup` | Удалить всех записанных пользователей |
| `npm run test:e2e:full` | Прогнать тесты + очистка |

**Переменные окружения:**
- `FIREBASE_SERVICE_ACCOUNT` — полный JSON сервисного аккаунта Firebase Admin SDK (в `.env`)
- Сервисный аккаунт также может лежать в `firebase.private.json` (проектный корень, `.gitignore`) — cleanup.ts загружает его оттуда, если `FIREBASE_SERVICE_ACCOUNT` не задан

**Как работает:**
1. `cleanup.ts` запрашивает всех пользователей Firebase Auth через `listUsers(1000)`
2. Фильтрует по домену `@vitalik.dev` (все тестовые учётки, включая статическую `test@vitalik.dev`)
3. Для каждого совпадения:
   - Удаляет `users/{uid}` рекурсивно из Firestore (документ + подколлекции)
   - Удаляет пользователя из Auth
4. Файловый список (`test-users.json`) больше не используется — cleanup находит всех пользователей по домену

### CI

E2E-тесты на CI пока не добавлены (первый тест — ручной). Для добавления в CI:
- В `.github/workflows/deploy.yml` добавить шаг с Firestore эмулятором (или моком) для локального прогона
- Production-тесты запускать после деплоя с `--project=production`

### Когда использовать E2E вместо unit

- **E2E:** проверка сквозных сценариев (логин → создание счёта), взаимодействие с реальным Firebase, редиректы, защита роутов
- **Unit:** изолированные компоненты, сторы, сервисы. Firebase мокается. E2E не нужен

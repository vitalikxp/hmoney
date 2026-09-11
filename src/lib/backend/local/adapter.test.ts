import { describe, it, expect, beforeEach, vi } from 'vitest'
import { localAuth, localAccounts, localEnvelopes, createProfile } from './adapter'
import type { Account, CreateAccountInput } from '../../../types/account'
import type { CreateEnvelopeInput } from '../../../types/envelope'

function accountInput(overrides?: Partial<CreateAccountInput>): CreateAccountInput {
  return {
    name: 'Наличные',
    balance: 5000,
    includeInBalance: true,
    currency: 'RUB',
    sortOrder: 0,
    ...overrides,
  }
}

function envelopeInput(overrides?: Partial<CreateEnvelopeInput>): CreateEnvelopeInput {
  return {
    name: 'Продукты',
    balance: 0,
    isGoal: false,
    sortOrder: 0,
    ...overrides,
  }
}

describe('local adapter', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('auth', () => {
    it('register создаёт пользователя и восстанавливает сессию', async () => {
      const user = await localAuth.register('a@b.dev', 'Pa$$w0rd')

      expect(user.email).toBe('a@b.dev')
      expect(localStorage.getItem('hmoney:session')).toBe(user.uid)
    })

    it('register бросает ошибку при повторном email', async () => {
      await localAuth.register('a@b.dev', 'Pa$$w0rd')

      await expect(localAuth.register('a@b.dev', 'Pa$$w0rd')).rejects.toMatchObject({
        code: 'email-already-in-use',
      })
    })

    it('login с верным паролем возвращает пользователя', async () => {
      const registered = await localAuth.register('a@b.dev', 'Pa$$w0rd')
      localStorage.removeItem('hmoney:session')

      const user = await localAuth.login('a@b.dev', 'Pa$$w0rd')
      expect(user.uid).toBe(registered.uid)
      expect(localStorage.getItem('hmoney:session')).toBe(registered.uid)
    })

    it('login с неверным паролем бросает invalid-credential', async () => {
      await localAuth.register('a@b.dev', 'Pa$$w0rd')

      await expect(localAuth.login('a@b.dev', 'wrong')).rejects.toMatchObject({
        code: 'invalid-credential',
      })
    })

    it('logout очищает сессию', async () => {
      await localAuth.register('a@b.dev', 'Pa$$w0rd')
      await localAuth.logout()
      expect(localStorage.getItem('hmoney:session')).toBeNull()
    })

    it('subscribe восстанавливает сессию после перезагрузки', async () => {
      const registered = await localAuth.register('a@b.dev', 'Pa$$w0rd')

      const onChange = vi.fn()
      localAuth.subscribe(onChange)

      expect(onChange).toHaveBeenCalledWith({ uid: registered.uid, email: 'a@b.dev' })
    })

    it('subscribe возвращает null без сессии', () => {
      const onChange = vi.fn()
      localAuth.subscribe(onChange)

      expect(onChange).toHaveBeenCalledWith(null)
    })

    it('deleteUser удаляет пользователя и его данные', async () => {
      const { uid } = await localAuth.register('a@b.dev', 'Pa$$w0rd')
      await localAccounts.create(uid, accountInput())

      await localAuth.deleteUser(uid)

      expect(JSON.parse(localStorage.getItem('hmoney:users')!)).toHaveLength(0)
      expect(localStorage.getItem(`hmoney:data:${uid}:accounts`)).toBeNull()
      expect(localStorage.getItem('hmoney:session')).toBeNull()
    })
  })

  describe('accounts', () => {
    it('create + fetch возвращает счёт с id и timestamps', async () => {
      const { uid } = await localAuth.register('a@b.dev', 'Pa$$w0rd')

      const id = await localAccounts.create(uid, accountInput({ name: 'Карта' }))
      const accounts = await localAccounts.fetch(uid)

      expect(accounts).toHaveLength(1)
      expect(accounts[0]).toMatchObject({ id, name: 'Карта', balance: 5000 })
      expect(typeof accounts[0].createdAt).toBe('number')
    })

    it('fetch сортирует по createdAt', async () => {
      const { uid } = await localAuth.register('a@b.dev', 'Pa$$w0rd')
      await localAccounts.create(uid, accountInput({ name: 'Первый' }))
      await localAccounts.create(uid, accountInput({ name: 'Второй' }))

      const accounts = await localAccounts.fetch(uid)
      expect(accounts.map((a: Account) => a.name)).toEqual(['Первый', 'Второй'])
    })

    it('update меняет только целевой счёт', async () => {
      const { uid } = await localAuth.register('a@b.dev', 'Pa$$w0rd')
      const id = await localAccounts.create(uid, accountInput({ name: 'Карта' }))

      await localAccounts.update(uid, id, { balance: 999 })
      const accounts = await localAccounts.fetch(uid)

      expect(accounts[0].balance).toBe(999)
      expect(accounts[0].name).toBe('Карта')
    })

    it('delete удаляет счёт', async () => {
      const { uid } = await localAuth.register('a@b.dev', 'Pa$$w0rd')
      const id = await localAccounts.create(uid, accountInput())

      await localAccounts.delete(uid, id)
      expect(await localAccounts.fetch(uid)).toHaveLength(0)
    })
  })

  describe('envelopes', () => {
    it('create + fetch возвращает конверт', async () => {
      const { uid } = await localAuth.register('a@b.dev', 'Pa$$w0rd')

      await localEnvelopes.create(uid, envelopeInput({ name: 'Продукты' }))
      const envelopes = await localEnvelopes.fetch(uid)

      expect(envelopes).toHaveLength(1)
      expect(envelopes[0].name).toBe('Продукты')
    })
  })

  describe('createProfile', () => {
    it('в local-адаптере профиль уже существует — no-op', async () => {
      const { uid } = await localAuth.register('a@b.dev', 'Pa$$w0rd')

      await expect(createProfile(uid, 'a@b.dev')).resolves.toBeUndefined()
    })
  })
})

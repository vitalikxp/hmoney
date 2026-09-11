import { describe, it, expect } from 'vitest'
import { parseTransactionInput } from './parseTransactionInput'

describe('parseTransactionInput', () => {
  it('парсит сумму и описание', () => {
    expect(parseTransactionInput('500 молоко')).toEqual({ amount: 500, description: 'молоко' })
  })

  it('парсит умножение количества на цену', () => {
    expect(parseTransactionInput('5*250 яблоки')).toEqual({ amount: 1250, description: 'яблоки' })
  })

  it('парсит тройное умножение', () => {
    expect(parseTransactionInput('2*3*100 столовая')).toEqual({ amount: 600, description: 'столовая' })
  })

  it('игнорирует хвостовой комментарий в скобках', () => {
    expect(parseTransactionInput('5*250 яблоки (100 в скобках не учтётся)')).toEqual({
      amount: 1250,
      description: 'яблоки',
    })
  })

  it('принимает запятую как десятичный разделитель', () => {
    expect(parseTransactionInput('1,5*100 пирожок')).toEqual({ amount: 150, description: 'пирожок' })
  })

  it('не теряет описание без суммы', () => {
    expect(parseTransactionInput('молоко')).toEqual({ amount: null, description: 'молоко' })
  })

  it('возвращает null для пустой строки', () => {
    expect(parseTransactionInput('   ')).toEqual({ amount: null, description: '' })
  })

  it('возвращает null если после скобок ничего не осталось', () => {
    expect(parseTransactionInput('(комментарий)')).toEqual({ amount: null, description: '' })
  })

  it('возвращает null для нулевой суммы', () => {
    expect(parseTransactionInput('0 яблоки')).toEqual({ amount: null, description: 'яблоки' })
  })

  it('сжимает пробелы в описании', () => {
    expect(parseTransactionInput('100  два   слова')).toEqual({
      amount: 100,
      description: 'два слова',
    })
  })

  it('умножение без описания — описание пустое', () => {
    expect(parseTransactionInput('500')).toEqual({ amount: null, description: '500' })
  })
})

describe('parseTransactionInput: несколько позиций через запятую', () => {
  it('суммирует позиции: 89 + 120 = 209', () => {
    expect(parseTransactionInput('89 flash up, 120 gorilla mango')).toEqual({
      amount: 209,
      description: 'flash up, gorilla mango',
    })
  })

  it('суммирует умножения в позициях', () => {
    expect(parseTransactionInput('3*150 кофе, 2*200 пирожки')).toEqual({
      amount: 850,
      description: 'кофе, пирожки',
    })
  })

  it('позиция без суммы становится описанием', () => {
    expect(parseTransactionInput('100 кофе, чай')).toEqual({
      amount: 100,
      description: 'кофе, чай',
    })
  })

  it('скобки игнорируются в каждой позиции', () => {
    expect(parseTransactionInput('5*250 яблоки (х2), 2*200 чай (беру)')).toEqual({
      amount: 1650,
      description: 'яблоки, чай',
    })
  })

  it('пустые сегменты пропускаются', () => {
    expect(parseTransactionInput('100 кофе,, 200 чай')).toEqual({
      amount: 300,
      description: 'кофе, чай',
    })
  })

  it('текст без сумм в нескольких сегментах — amount null', () => {
    expect(parseTransactionInput('молоко, хлеб')).toEqual({
      amount: null,
      description: 'молоко, хлеб',
    })
  })
})

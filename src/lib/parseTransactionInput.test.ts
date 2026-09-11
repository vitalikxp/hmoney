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

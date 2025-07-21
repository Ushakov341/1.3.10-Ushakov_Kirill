// src/components/converter/Converter.test.tsx

import { screen, fireEvent } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { renderWithRedux } from '../../test/utils'
import Converter from './Converter'

describe('Currency Converter', () => {
  test('рендерит поля и валюты при первом запуске', () => {
    renderWithRedux(<Converter />)

    // 2 селекта для валют
    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBe(2)

    // 2 input'а: один доступный, один readOnly
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs.length).toBe(2)
    expect(inputs[0]).toHaveValue(100) // начальное значение
    expect(inputs[1]).toHaveAttribute('readOnly')
  })

  test('конвертация при изменении значения в левом поле', () => {
    renderWithRedux(<Converter />)

    const input = screen.getAllByRole('spinbutton')[0]
    fireEvent.change(input, { target: { value: '200' } })
    expect(input).toHaveValue(200)

    // проверим, что результат тоже изменился (не 100)
    const result = screen.getAllByRole('spinbutton')[1]
    expect(result).not.toHaveValue(100)
  })

  test('конвертация 1:1 при одинаковых валютах', () => {
    renderWithRedux(<Converter />)

    const selects = screen.getAllByRole('combobox')
    const from = selects[0]
    const to = selects[1]

    fireEvent.change(from, { target: { value: 'USD' } })
    fireEvent.change(to, { target: { value: 'USD' } })

    const input = screen.getAllByRole('spinbutton')[0]
    fireEvent.change(input, { target: { value: '123' } })

    const result = screen.getAllByRole('spinbutton')[1]
    expect(result).toHaveValue(123)
  })

  test('правое поле readOnly', () => {
    renderWithRedux(<Converter />)
    const rightInput = screen.getAllByRole('spinbutton')[1]
    expect(rightInput).toHaveAttribute('readOnly')
  })

  test('при выборе разных валют курс пересчитывается', () => {
    renderWithRedux(<Converter />)

    const [from, to] = screen.getAllByRole('combobox')

    fireEvent.change(from, { target: { value: 'USD' } })
    fireEvent.change(to, { target: { value: 'EUR' } })

    const input = screen.getAllByRole('spinbutton')[0]
    fireEvent.change(input, { target: { value: 100 } })

    const result = screen.getAllByRole('spinbutton')[1]
    expect(result).not.toHaveValue(100) // курс другой
  })

  test('можно выбрать любую из 6 валют', () => {
    renderWithRedux(<Converter />)
    const allOptions = screen.getAllByRole('option')
    // 6 в from и 6 в to = 12
    expect(allOptions.length).toBe(12)
  })

  test('левый input принимает только числа', () => {
    renderWithRedux(<Converter />)

    const input = screen.getAllByRole('spinbutton')[0]
    fireEvent.change(input, { target: { value: 'abc' } })

    // значение не меняется на нечисловое
    expect(input).not.toHaveValue('abc')
  })

  test('курс обновляется при смене валюты назначения', () => {
    renderWithRedux(<Converter />)

    const [from, to] = screen.getAllByRole('combobox')

    fireEvent.change(from, { target: { value: 'USD' } })
    fireEvent.change(to, { target: { value: 'JPY' } })

    const input = screen.getAllByRole('spinbutton')[0]
    fireEvent.change(input, { target: { value: 50 } })

    const result = screen.getAllByRole('spinbutton')[1]
    expect(result).not.toHaveValue(50)
  })
})

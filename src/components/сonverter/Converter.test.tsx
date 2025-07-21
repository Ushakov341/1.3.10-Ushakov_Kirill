import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithRedux } from '../../test/utils'
import Converter from './Converter'
import test, { describe } from 'node:test'

describe('Converter', () => {
  test('рендерит поля и валюты при первом запуске', () => {
    renderWithRedux(<Converter />)

    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBe(2)

    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs.length).toBe(2)

    expect(inputs[0].value).toBe('100') // left input value = "100"
    expect(inputs[1].hasAttribute('readOnly')).toBe(true) // right input readOnly
  })

  test('показывает корректные валюты в селектах', () => {
    renderWithRedux(<Converter />)

    const selectLeft = screen.getAllByRole('combobox')[0]
    const selectRight = screen.getAllByRole('combobox')[1]

    // В моке currencyResponse должно быть 6 валют, проверим хотя бы 1
    expect(selectLeft).not.toBeNull()
    expect(selectRight).not.toBeNull()
    expect(selectLeft.querySelectorAll('option').length).toBeGreaterThanOrEqual(6)
    expect(selectRight.querySelectorAll('option').length).toBeGreaterThanOrEqual(6)
  })

  test('если выбрать одинаковую валюту, курс равен 1', async () => {
    renderWithRedux(<Converter />)

    const selects = screen.getAllByRole('combobox')
    const inputLeft = screen.getAllByRole('spinbutton')[0]
    const inputRight = screen.getAllByRole('spinbutton')[1]

    // Выберем одинаковую валюту в левом и правом селекте
    fireEvent.change(selects[0], { target: { value: 'USD' } })
    fireEvent.change(selects[1], { target: { value: 'USD' } })

    // Введём значение в левый инпут
    fireEvent.change(inputLeft, { target: { value: '50' } })

    // Ждём обновления
    await waitFor(() => {
      expect(inputRight.value).toBe('50')
    })
  })

  test('конвертирует из одной валюты в другую', async () => {
    renderWithRedux(<Converter />)

    const selects = screen.getAllByRole('combobox')
    const inputLeft = screen.getAllByRole('spinbutton')[0]
    const inputRight = screen.getAllByRole('spinbutton')[1]

    // Выберем разные валюты
    fireEvent.change(selects[0], { target: { value: 'USD' } })
    fireEvent.change(selects[1], { target: { value: 'EUR' } })

    // Введём значение 100 в левый инпут
    fireEvent.change(inputLeft, { target: { value: '100' } })

    // Ожидаем, что значение правого инпута обновится
    await waitFor(() => {
      // Проверим, что результат не равен 100 (т.к. курс != 1)
      expect(inputRight.value).not.toBe('100')
      // И не пустое значение
      expect(inputRight.value).not.toBe('')
    })
  })

  test('правый инпут всегда readOnly', () => {
    renderWithRedux(<Converter />)
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[1].hasAttribute('readOnly')).toBe(true)
  })

  test('изменения в левом инпуте обновляют правый', async () => {
    renderWithRedux(<Converter />)

    const inputLeft = screen.getAllByRole('spinbutton')[0]
    const inputRight = screen.getAllByRole('spinbutton')[1]

    fireEvent.change(inputLeft, { target: { value: '200' } })

    await waitFor(() => {
      expect(inputRight.value).not.toBe('')
      expect(inputRight.value).not.toBe('100') // начальное значение правого инпута
    })
  })

  test('не позволяет вводить отрицательные значения', () => {
    renderWithRedux(<Converter />)

    const inputLeft = screen.getAllByRole('spinbutton')[0]

    fireEvent.change(inputLeft, { target: { value: '-50' } })

    // Ожидаем, что значение не будет отрицательным (зависит от реализации)
    // Например, либо пустая строка, либо 0, либо "50"
    // Если приложение запрещает отрицательные, проверь, что inputLeft.value не содержит '-'
    expect(inputLeft.value.includes('-')).toBe(false)
  })

  test('смена валют обновляет курс', async () => {
    renderWithRedux(<Converter />)

    const selects = screen.getAllByRole('combobox')
    const inputLeft = screen.getAllByRole('spinbutton')[0]
    const inputRight = screen.getAllByRole('spinbutton')[1]

    fireEvent.change(selects[0], { target: { value: 'EUR' } })
    fireEvent.change(selects[1], { target: { value: 'RUB' } })
    fireEvent.change(inputLeft, { target: { value: '100' } })

    await waitFor(() => {
      expect(inputRight.value).not.toBe('')
      expect(inputRight.value).not.toBe('100')
    })
  })
})

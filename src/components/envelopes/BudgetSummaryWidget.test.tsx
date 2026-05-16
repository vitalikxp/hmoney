import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BudgetSummaryWidget from './BudgetSummaryWidget';

describe('BudgetSummaryWidget', () => {
  it('отображает большие суммы и корректно форматирует их', () => {
    const largeNumber = 9999999;
    render(
      <BudgetSummaryWidget
        spendingBalance={largeNumber}
        reserveBalance={largeNumber}
        goalsBalance={largeNumber}
        total={largeNumber * 4}
      />
    );

    // Проверяем, что большие суммы отображаются и не ломают layout
    // Проверяем, что все 3 суммы есть
    expect(screen.getAllByText('9 999 999₽')).toHaveLength(3);
    // Проверяем, что итоговая сумма есть
    expect(screen.getByText('39 999 996₽')).toBeInTheDocument();
    // Снапшот для контроля верстки
    expect(document.body).toMatchSnapshot();
  });

  // Добавить другие тесты по мере необходимости для различных сценариев
});

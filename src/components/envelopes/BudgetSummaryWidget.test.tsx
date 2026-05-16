import { render, screen } from '@testing-library/react';
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

    // Verify that the large number is present and formatted (e.g., "9 999 999₽")
    expect(screen.getByText('9 999 999₽')).toBeInTheDocument();
    // Вы также можете добавить более конкретные проверки или снапшот-тест здесь.
    // expect(screen.debug()).toMatchSnapshot();
  });

  // Добавить другие тесты по мере необходимости для различных сценариев
});

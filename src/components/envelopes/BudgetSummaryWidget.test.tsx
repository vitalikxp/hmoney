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
        envelopesBalance={largeNumber}
        total={largeNumber * 4}
      />
    );

    expect(screen.getAllByText('9 999 999₽')).toHaveLength(3);
    expect(screen.getByText('39 999 996₽')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });

  it('показывает лейблы ХаниМани, Резервы, Конверты', () => {
    render(
      <BudgetSummaryWidget
        spendingBalance={1000}
        reserveBalance={2000}
        envelopesBalance={3000}
        total={6000}
      />
    );
    expect(screen.getByText('ХаниМани')).toBeInTheDocument();
    expect(screen.getByText('Резервы')).toBeInTheDocument();
    expect(screen.getByText('Конверты')).toBeInTheDocument();
    expect(screen.getByText('Всего')).toBeInTheDocument();
  });
});

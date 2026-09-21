import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import {
  ChartTooltip,
  ChartTooltipBody,
  ChartTooltipHeader,
  ChartTooltipRow,
} from '../ChartTooltip';

describe('ChartTooltip', () => {
  it('renders structured chart content', () => {
    render(
      <ChartTooltip>
        <ChartTooltipHeader title="Jul 13, 2026" value="42" />
        <ChartTooltipBody>
          <ChartTooltipRow
            label="Successful runs"
            value="38"
            markerColor="currentColor"
          />
          <ChartTooltipRow label="Total" value="42" variant="total" />
        </ChartTooltipBody>
      </ChartTooltip>
    );

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('Jul 13, 2026')).toBeInTheDocument();
    expect(screen.getByText('Successful runs')).toBeInTheDocument();
    expect(screen.getByText('38')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getAllByText('42')).toHaveLength(2);
  });

  it('renders row content and empty states', () => {
    const { rerender } = render(
      <ChartTooltipRow label="Errors" value="4" highlighted />
    );

    expect(screen.getByText('Errors')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();

    rerender(<ChartTooltipRow label="No data" />);
    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.queryByText('Errors')).not.toBeInTheDocument();
  });

  it('renders a divider above total rows', () => {
    render(<ChartTooltipRow label="Total" value="42" variant="total" />);

    const totalRow = screen.getByText('Total').parentElement;
    expect(totalRow?.previousElementSibling).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });
});

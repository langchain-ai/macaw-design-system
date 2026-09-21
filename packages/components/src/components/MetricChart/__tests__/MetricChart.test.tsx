import { createRef } from 'react';

import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../test-utils';
import { Text } from '../../Text';
import { MetricChart } from '../MetricChart';
import type { MetricChartSize } from '../MetricChart';

describe('MetricChart', () => {
  it('renders the fixed default value treatment and forwards div attributes', () => {
    const ref = createRef<HTMLDivElement>();
    render(<MetricChart ref={ref} value="$5.67" className="custom-class" />);

    const value = screen.getByText('$5.67');
    const metric = value.parentElement;
    expect(value).toBeVisible();
    expect(metric).toBe(ref.current);
    expect(metric).toHaveClass('custom-class', 'gap-space-1');
    expect(value).toHaveClass(
      'text-lg',
      'font-semibold',
      'text-primary',
      'tabular-nums',
      'break-words'
    );
  });

  it('lays out composed secondary content in a wrapping row', () => {
    render(
      <MetricChart
        value={42}
        secondaryContent={
          <>
            <Text variant="sm">17.5%</Text>
            <Text variant="sm">vs. prev week</Text>
          </>
        }
      />
    );

    const secondaryRow = screen.getByText('17.5%').parentElement;
    expect(secondaryRow).toHaveClass(
      'flex',
      'flex-wrap',
      'items-center',
      'gap-space-1'
    );
    expect(screen.getByText('vs. prev week')).toBeVisible();
  });

  it('centers values without changing the default font size', () => {
    render(<MetricChart layout="centered" value="1,234" />);

    const value = screen.getByText('1,234');
    const metric = value.parentElement;
    expect(metric).toHaveClass('items-center', 'justify-center', 'text-center');
    expect(value).toHaveClass('text-lg', 'text-center');
  });

  it.each<[Exclude<MetricChartSize, 'xl'>, string]>([
    ['sm', 'text-base'],
    ['md', 'text-lg'],
    ['lg', 'text-2xl'],
  ])(
    'renders the fixed %s size without changing alignment',
    (size, textClass) => {
      render(<MetricChart size={size} value="1,234" />);

      const value = screen.getByText('1,234');
      const metric = value.parentElement;
      expect(metric).not.toHaveClass(
        'items-center',
        'justify-center',
        'text-center',
        '@container'
      );
      expect(metric).toHaveClass('gap-space-1');
      expect(value).toHaveClass(textClass, 'break-words');
      expect(value).not.toHaveClass('text-center');
    }
  );

  it('scales the xl value to its available width without wrapping', () => {
    render(<MetricChart size="xl" value="1,234" />);

    const value = screen.getByText('1,234');
    const metric = value.parentElement;
    expect(metric).toHaveClass('@container', 'gap-space-2');
    expect(value).toHaveClass('whitespace-nowrap');
    expect(value).not.toHaveClass('break-words');
    expect(value).toHaveStyle({
      fontSize: 'min(80px, calc(40cqi - 9.6px))',
    });
  });
});

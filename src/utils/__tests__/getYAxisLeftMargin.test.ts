import { describe, expect, it, vi } from 'vitest';

import { getYAxisLeftMargin } from '../getYAxisLeftMargin';

// getStringWidth needs the DOM; approximate ~7px per character so widths are deterministic.
vi.mock('@visx/text', () => ({
  getStringWidth: (text: string) => text.length * 7,
}));

const identity = (value: number) => String(value);
const usd = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(value);

describe('getYAxisLeftMargin', () => {
  // Default offset: tickLength (4) + dx (0.25 * fontSize 12 = 3) = 7.
  const OFFSET = 7;

  it('sizes to the widest rendered tick label', () => {
    // ticks([0,100], 5) -> 0,20,40,60,80,100; widest "100" = 3 * 7 = 21
    expect(
      getYAxisLeftMargin({
        yDomain: [0, 100],
        formatTick: identity,
        fontSize: 12,
        numTicks: 5,
      })
    ).toBe(21 + OFFSET);
  });

  it('accounts for currency formatting width', () => {
    // ticks([0,1000], 5) -> ...,1000; "$1,000.00" = 9 * 7 = 63
    expect(
      getYAxisLeftMargin({
        yDomain: [0, 1000],
        formatTick: usd,
        fontSize: 12,
        numTicks: 5,
      })
    ).toBe(63 + OFFSET);
  });

  it('measures explicit tick values instead of generated ticks', () => {
    const customTick = 0.123456;
    const customLabel = 'Custom currency tick';

    expect(
      getYAxisLeftMargin({
        yDomain: [0, 1],
        formatTick: (value) =>
          value === customTick ? customLabel : String(value),
        fontSize: 12,
        numTicks: 5,
        tickValues: [customTick],
      })
    ).toBe(customLabel.length * 7 + OFFSET);
  });

  it('handles negative domains', () => {
    // ticks([-100,100], 5) -> -100,-50,0,50,100; widest "-100" = 4 * 7 = 28
    expect(
      getYAxisLeftMargin({
        yDomain: [-100, 100],
        formatTick: identity,
        fontSize: 12,
        numTicks: 5,
      })
    ).toBe(28 + OFFSET);
  });

  it('measures the niced top tick when nice=true (matching a niced y-scale)', () => {
    // raw [0,95] -> ticks 0,20,40,60,80; widest "80" = 2 * 7 = 14
    expect(
      getYAxisLeftMargin({
        yDomain: [0, 95],
        formatTick: identity,
        fontSize: 12,
        numTicks: 5,
        nice: false,
      })
    ).toBe(14 + OFFSET);
    // niced [0,95] -> [0,100]; adds "100" = 3 * 7 = 21
    expect(
      getYAxisLeftMargin({
        yDomain: [0, 95],
        formatTick: identity,
        fontSize: 12,
        numTicks: 5,
        nice: true,
      })
    ).toBe(21 + OFFSET);
  });

  it('scales the dx offset with fontSize', () => {
    // fontSize 11 -> offset = 4 + 0.25 * 11 = 6.75
    expect(
      getYAxisLeftMargin({
        yDomain: [0, 100],
        formatTick: identity,
        fontSize: 11,
        numTicks: 5,
      })
    ).toBe(21 + 4 + 0.25 * 11);
  });

  it('respects a custom tickLength', () => {
    expect(
      getYAxisLeftMargin({
        yDomain: [0, 100],
        formatTick: identity,
        fontSize: 12,
        numTicks: 5,
        tickLength: 8,
      })
    ).toBe(21 + 8 + 3);
  });

  it('handles a zero domain', () => {
    expect(
      getYAxisLeftMargin({
        yDomain: [0, 0],
        formatTick: identity,
        fontSize: 12,
        numTicks: 5,
      })
    ).toBeGreaterThanOrEqual(OFFSET);
  });
});

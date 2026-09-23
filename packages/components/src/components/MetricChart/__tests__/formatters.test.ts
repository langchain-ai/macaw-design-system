import { describe, expect, it } from 'vitest';

import {
  formatMetricCurrency,
  formatMetricDate,
  formatMetricDuration,
  formatMetricNumber,
  formatMetricTime,
  type MetricDateTimeFormatOptions,
} from '../formatters';

describe('MetricChart formatters', () => {
  it('formats large numbers compactly by default', () => {
    expect(formatMetricNumber(200_000_000)).toBe('200M');
    expect(formatMetricNumber(1_250_000)).toBe('1.3M');
  });

  it('allows standard number formatting', () => {
    expect(formatMetricNumber(200_000_000, { notation: 'standard' })).toBe(
      '200,000,000'
    );
  });

  it('formats compact currency with configurable currency codes', () => {
    expect(formatMetricCurrency(12_500)).toBe('$12.5K');
    expect(formatMetricCurrency(12_500, { currency: 'EUR' })).toBe('€12.5K');
  });

  it('formats dates and times with explicit timezone support', () => {
    const value = Date.UTC(2026, 0, 15, 17, 30);

    expect(formatMetricDate(value, { timeZone: 'UTC' })).toBe('Jan 15, 2026');
    expect(formatMetricTime(value, { timeZone: 'UTC' })).toBe('5:30 PM');
  });

  it('formats durations with an explicit unit', () => {
    expect(formatMetricDuration(842, { unit: 'millisecond' })).toBe('842 ms');
    expect(formatMetricDuration(1.5, { unit: 'second' })).toBe('1.5 sec');
  });

  it.each<[MetricDateTimeFormatOptions, string]>([
    [{ month: 'short', day: 'numeric' }, 'Jan 15'],
    [{ weekday: 'long', era: 'short', year: 'numeric' }, '2026 AD Thursday'],
    [{ hour: '2-digit', minute: '2-digit', hour12: false }, '17:30'],
    [{ second: 'numeric', fractionalSecondDigits: 3 }, '0.123'],
    [{ dayPeriod: 'long' }, 'in the afternoon'],
    [{ timeZoneName: 'short' }, '1/15/2026, UTC'],
  ])('accepts date and time components %j', (options, expected) => {
    const value = new Date(Date.UTC(2026, 0, 15, 17, 30, 0, 123));

    expect(formatMetricDate(value, { timeZone: 'UTC', ...options })).toBe(
      expected
    );
    expect(formatMetricTime(value, { timeZone: 'UTC', ...options })).toBe(
      expected
    );
  });

  it('preserves style overrides and locale options', () => {
    const value = Date.UTC(2026, 0, 15, 17, 30);

    expect(
      formatMetricDate(value, { dateStyle: 'short', timeZone: 'UTC' })
    ).toBe('1/15/26');
    expect(
      formatMetricTime(value, { timeStyle: 'medium', timeZone: 'UTC' })
    ).toBe('5:30:00 PM');
    expect(formatMetricDate(value, { locale: 'en-GB', timeZone: 'UTC' })).toBe(
      '15 Jan 2026'
    );
    expect(formatMetricTime(value, { locale: 'en-GB', timeZone: 'UTC' })).toBe(
      '17:30'
    );
  });

  it('keeps default styles when component options are undefined', () => {
    const value = Date.UTC(2026, 0, 15, 17, 30);

    expect(formatMetricDate(value, { month: undefined, timeZone: 'UTC' })).toBe(
      'Jan 15, 2026'
    );
    expect(formatMetricTime(value, { hour: undefined, timeZone: 'UTC' })).toBe(
      '5:30 PM'
    );
  });
});

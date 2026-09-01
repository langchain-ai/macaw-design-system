const DEFAULT_LOCALE = 'en-US';

interface MetricLocaleOptions {
  locale?: string;
}

export type MetricNumberFormatOptions = Omit<
  Intl.NumberFormatOptions,
  'currency' | 'style' | 'unit'
> &
  MetricLocaleOptions;

export type MetricCurrencyFormatOptions = Omit<
  Intl.NumberFormatOptions,
  'currency' | 'style' | 'unit'
> &
  MetricLocaleOptions & {
    currency?: string;
  };

export type MetricDateTimeFormatOptions = Intl.DateTimeFormatOptions &
  MetricLocaleOptions;

export type MetricDurationUnit =
  | 'millisecond'
  | 'second'
  | 'minute'
  | 'hour'
  | 'day';

export type MetricDurationFormatOptions = Omit<
  Intl.NumberFormatOptions,
  'currency' | 'style' | 'unit'
> &
  MetricLocaleOptions & {
    unit: MetricDurationUnit;
  };

export const formatMetricNumber = (
  value: number,
  { locale = DEFAULT_LOCALE, ...options }: MetricNumberFormatOptions = {}
) =>
  new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
    ...options,
  }).format(value);

export const formatMetricCurrency = (
  value: number,
  {
    locale = DEFAULT_LOCALE,
    currency = 'USD',
    ...options
  }: MetricCurrencyFormatOptions = {}
) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);

export const formatMetricDate = (
  value: Date | number,
  { locale = DEFAULT_LOCALE, ...options }: MetricDateTimeFormatOptions = {}
) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    ...options,
  }).format(value);

export const formatMetricTime = (
  value: Date | number,
  { locale = DEFAULT_LOCALE, ...options }: MetricDateTimeFormatOptions = {}
) =>
  new Intl.DateTimeFormat(locale, {
    timeStyle: 'short',
    ...options,
  }).format(value);

export const formatMetricDuration = (
  value: number,
  { locale = DEFAULT_LOCALE, unit, ...options }: MetricDurationFormatOptions
) =>
  new Intl.NumberFormat(locale, {
    style: 'unit',
    unit,
    unitDisplay: 'short',
    maximumFractionDigits: 1,
    ...options,
  }).format(value);

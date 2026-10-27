import { forwardRef, type JSX } from 'react';

import { cn } from '../../utils/cn';

type TextVariant =
  | '3xl'
  | '2xl'
  | 'xl'
  | 'lg-plus'
  | 'lg'
  | 'md'
  | 'sm'
  | 'xs'
  /** @deprecated Use a size variant and set `as="h1"` instead. */
  | 'h1'
  /** @deprecated Use a size variant and set `as="h2"` instead. */
  | 'h2'
  /** @deprecated Use a size variant and set `as="h3"` instead. */
  | 'h3'
  /** @deprecated Use a size variant and set `as="h4"` instead. */
  | 'h4'
  /** @deprecated Use a size variant and set `as="h5"` instead. */
  | 'h5'
  /** @deprecated Use a size variant and set `as="h6"` instead. */
  | 'h6'
  /** @deprecated Use `md` and set `as="p"` instead. */
  | 'body';

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  weight?: 'semibold' | 'medium' | 'normal';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label';
  color?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'quaternary'
    | 'placeholder'
    | 'error'
    | 'success';
  children: React.ReactNode;
  /** Only if using as="label" to attach the label to the input */
  htmlFor?: string;
}

const textVariantClasses: Record<NonNullable<TextProps['variant']>, string> = {
  '3xl': 'text-type-3xl tracking-normal',
  '2xl': 'text-type-2xl tracking-normal',
  xl: 'text-type-xl tracking-normal',
  'lg-plus': 'text-type-lg-plus tracking-normal',
  lg: 'text-type-lg tracking-normal',
  md: 'text-type-md tracking-tighter',
  sm: 'text-type-sm tracking-snug',
  xs: 'text-type-xs tracking-normal',
  h1: 'text-type-2xl font-medium tracking-tighter',
  h2: 'text-type-lg-plus font-medium tracking-tighter',
  h3: 'text-type-lg font-semibold tracking-tight',
  h4: 'text-type-md font-normal tracking-wide uppercase',
  h5: 'text-type-md font-normal tracking-tight',
  h6: 'text-type-md font-normal tracking-wide',
  body: 'text-type-md tracking-normal',
};

const Text = forwardRef<HTMLElement, TextProps>(
  (
    { variant = 'body', weight, as, className, children, color, ...props },
    ref
  ) => {
    // Default semantic mapping
    const defaultElement = {
      h1: 'h1',
      h2: 'h2',
      h3: 'h3',
      h4: 'h4',
      h5: 'h5',
      h6: 'h6',
      '3xl': 'span',
      '2xl': 'span',
      xl: 'span',
      'lg-plus': 'span',
      lg: 'span',
      md: 'span',
      sm: 'span',
      xs: 'span',
      body: 'p',
    }[variant] as keyof JSX.IntrinsicElements;

    const Component = (as || defaultElement) as React.ElementType;

    const variants = textVariantClasses;

    const weights = {
      semibold: 'font-semibold',
      medium: 'font-medium',
      normal: 'font-normal',
    };

    const colors = {
      primary: 'text-primary',
      secondary: 'text-secondary',
      tertiary: 'text-tertiary',
      quaternary: 'text-quaternary',
      placeholder: 'text-placeholder',
      error: 'text-error-secondary',
      success: 'text-success-secondary',
    };

    const weightClass = weight ? weights[weight] : '';

    return (
      <Component
        ref={ref}
        className={cn(
          variants[variant],
          weightClass,
          color ? colors[color] : '',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';

export { Text, textVariantClasses };
export type { TextProps };

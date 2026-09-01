import type { SVGProps } from 'react';

import { SpinnerGapIcon } from '@phosphor-icons/react/dist/ssr/SpinnerGap';

import { cn } from '../../utils/cn';

const SpinnerIcon = (props: SVGProps<SVGSVGElement>) => {
  const spinnerProps = {
    ...props,
    'aria-hidden': true,
    className: cn('animate-spin', props.className),
  };
  return <SpinnerGapIcon {...spinnerProps} weight="bold" />;
};

const Spinner = ({
  size = 'sm',
  className,
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}) => {
  const sizeClass = {
    xs: 'size-3',
    sm: 'size-4',
    md: 'size-6',
    lg: 'size-8',
  }[size];
  return <SpinnerIcon className={cn(sizeClass, className)} />;
};

export { Spinner, SpinnerIcon };

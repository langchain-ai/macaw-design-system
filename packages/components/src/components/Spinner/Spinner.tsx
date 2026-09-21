import type { SVGProps } from 'react';

import { SpinnerGapIcon } from '@phosphor-icons/react/dist/ssr/SpinnerGap';

import { cn } from '../../utils/cn';
import {
  VISUAL_ELEMENT_SIZES,
  type VisualElementSize,
} from '../../utils/componentSizes';
import type { IconWeight } from '../../utils/icon-types';

type SpinnerSize = VisualElementSize | 'lg';

const SPINNER_SIZE: Record<SpinnerSize, string> = {
  xxs: VISUAL_ELEMENT_SIZES.xxs.className,
  xs: VISUAL_ELEMENT_SIZES.xs.className,
  sm: VISUAL_ELEMENT_SIZES.sm.className,
  md: VISUAL_ELEMENT_SIZES.md.className,
  lg: 'size-8',
};

const SpinnerIcon = ({
  weight = 'regular',
  ...props
}: SVGProps<SVGSVGElement> & { weight?: IconWeight }) => {
  const spinnerProps = {
    ...props,
    'aria-hidden': true,
    className: cn('animate-spin', props.className),
  };
  return <SpinnerGapIcon {...spinnerProps} weight={weight} />;
};

const Spinner = ({
  size = 'sm',
  className,
}: {
  size?: SpinnerSize;
  className?: string;
}) => {
  return (
    <SpinnerIcon
      weight={size === 'xxs' || size === 'xs' ? 'bold' : 'regular'}
      className={cn(SPINNER_SIZE[size], className)}
    />
  );
};

export { Spinner, SpinnerIcon };

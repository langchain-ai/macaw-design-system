import { ArrowDownIcon as PhosphorArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowLeftIcon as PhosphorArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { ArrowRightIcon as PhosphorArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { ArrowUpIcon as PhosphorArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { CaretDoubleLeftIcon as PhosphorCaretDoubleLeftIcon } from '@phosphor-icons/react/dist/ssr/CaretDoubleLeft';
import { CaretDoubleRightIcon as PhosphorCaretDoubleRightIcon } from '@phosphor-icons/react/dist/ssr/CaretDoubleRight';
import { CaretDownIcon as PhosphorCaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { CaretLeftIcon as PhosphorCaretLeftIcon } from '@phosphor-icons/react/dist/ssr/CaretLeft';
import { CaretRightIcon as PhosphorCaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';
import { CaretUpIcon as PhosphorCaretUpIcon } from '@phosphor-icons/react/dist/ssr/CaretUp';
import { CheckIcon as PhosphorCheckIcon } from '@phosphor-icons/react/dist/ssr/Check';
import { DotsSixVerticalIcon as PhosphorDotsSixVerticalIcon } from '@phosphor-icons/react/dist/ssr/DotsSixVertical';
import { MinusIcon as PhosphorMinusIcon } from '@phosphor-icons/react/dist/ssr/Minus';
import { PlusIcon as PhosphorPlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { XIcon as PhosphorXIcon } from '@phosphor-icons/react/dist/ssr/X';

import type { IconComponent } from '../utils/icon-types';

const createPaddedIcon = (
  IconComponent: IconComponent,
  inset: number,
  displayName: string,
  extraBold = false
): IconComponent => {
  const viewBox = `${-inset} ${-inset} ${256 + inset * 2} ${256 + inset * 2}`;
  const PaddedIcon: IconComponent = ({
    color,
    stroke,
    strokeWidth,
    strokeLinecap,
    strokeLinejoin,
    weight,
    ...props
  }) => {
    const applyExtraBold = extraBold && weight === 'bold';
    return (
      <IconComponent
        {...props}
        color={color}
        stroke={
          stroke ?? (applyExtraBold ? color || 'currentColor' : undefined)
        }
        strokeWidth={strokeWidth ?? (applyExtraBold ? 8 : undefined)}
        strokeLinecap={strokeLinecap ?? (applyExtraBold ? 'round' : undefined)}
        strokeLinejoin={
          strokeLinejoin ?? (applyExtraBold ? 'round' : undefined)
        }
        weight={weight}
        viewBox={viewBox}
      />
    );
  };

  PaddedIcon.displayName = displayName;
  return PaddedIcon;
};

// These compact glyphs fill more of Phosphor's canvas than their Untitled UI
// counterparts. Expanded viewBoxes preserve the outer size while restoring the
// previous optical footprint.
export const ArrowDownIcon = /* @__PURE__ */ createPaddedIcon(
  PhosphorArrowDownIcon,
  32,
  'ArrowDownIcon'
);
export const ArrowLeftIcon = /* @__PURE__ */ createPaddedIcon(
  PhosphorArrowLeftIcon,
  32,
  'ArrowLeftIcon'
);
export const ArrowRightIcon = /* @__PURE__ */ createPaddedIcon(
  PhosphorArrowRightIcon,
  32,
  'ArrowRightIcon'
);
export const ArrowUpIcon = /* @__PURE__ */ createPaddedIcon(
  PhosphorArrowUpIcon,
  32,
  'ArrowUpIcon'
);
export const CaretDoubleRightIcon = /* @__PURE__ */ createPaddedIcon(
  PhosphorCaretDoubleRightIcon,
  64,
  'CaretDoubleRightIcon',
  true
);
export const CaretDoubleLeftIcon = /* @__PURE__ */ createPaddedIcon(
  PhosphorCaretDoubleLeftIcon,
  64,
  'CaretDoubleLeftIcon',
  true
);
export const CaretDownIcon = /* @__PURE__ */ createPaddedIcon(
  PhosphorCaretDownIcon,
  64,
  'CaretDownIcon',
  true
);
export const CaretLeftIcon = /* @__PURE__ */ createPaddedIcon(
  PhosphorCaretLeftIcon,
  64,
  'CaretLeftIcon',
  true
);
export const CaretRightIcon = /* @__PURE__ */ createPaddedIcon(
  PhosphorCaretRightIcon,
  64,
  'CaretRightIcon',
  true
);
export const CaretUpIcon = /* @__PURE__ */ createPaddedIcon(
  PhosphorCaretUpIcon,
  64,
  'CaretUpIcon',
  true
);
export const CheckIcon = /* @__PURE__ */ createPaddedIcon(
  PhosphorCheckIcon,
  32,
  'CheckIcon'
);
export const DotsSixVerticalIcon = /* @__PURE__ */ createPaddedIcon(
  PhosphorDotsSixVerticalIcon,
  48,
  'DotsSixVerticalIcon'
);
export const MinusIcon = /* @__PURE__ */ createPaddedIcon(
  PhosphorMinusIcon,
  40,
  'MinusIcon'
);
export const PlusIcon = /* @__PURE__ */ createPaddedIcon(
  PhosphorPlusIcon,
  40,
  'PlusIcon'
);
export const XCloseIcon = /* @__PURE__ */ createPaddedIcon(
  PhosphorXIcon,
  40,
  'XCloseIcon',
  true
);
export const XIcon = /* @__PURE__ */ createPaddedIcon(
  PhosphorXIcon,
  64,
  'XIcon',
  true
);

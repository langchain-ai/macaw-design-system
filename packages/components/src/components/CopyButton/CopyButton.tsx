import { type ReactNode, useState } from 'react';

import { CopySimpleIcon } from '@phosphor-icons/react/dist/ssr/CopySimple';

import { CheckIcon } from '../../icons/PaddedPhosphorIcons';
import { Button } from '../Button';
import { IconButton, type IconButtonProps } from '../IconButton';
import { Text } from '../Text';
import { useCopy } from './useCopy';

export interface CopyButtonProps {
  copy: string;
  variant?: 'full' | 'icon';
  className?: string;
  copyText?: string;
  disabled?: boolean;
  onCopy?: () => void;
}

export function CopyButton(props: CopyButtonProps) {
  const { copied, onCopy } = useCopy({ copy: props.copy });

  if (props.variant === 'icon') {
    return (
      <CopyIconButton
        copy={props.copy}
        copyText={props.copyText}
        className={props.className}
        disabled={props.disabled}
        onCopy={props.onCopy}
      />
    );
  }

  const CopyStatusIcon = copied ? CheckIcon : CopySimpleIcon;

  return (
    <Button
      size="sm"
      color="secondary"
      variant="outlined"
      aria-label={copied ? 'Copied' : (props.copyText ?? 'Copy')}
      onClick={(event) => {
        event.stopPropagation();
        onCopy();
        props.onCopy?.();
      }}
      className={props.className}
      disabled={props.disabled}
    >
      <span className="grid">
        {/* Both states rendered invisibly so the grid cell is always wide enough for either */}
        <Text
          as="span"
          variant="sm"
          weight="normal"
          className="invisible col-start-1 row-start-1 flex items-center gap-1 whitespace-nowrap"
          aria-hidden
        >
          <span aria-hidden className="inline-flex size-4 shrink-0">
            <CopySimpleIcon size="100%" weight="regular" />
          </span>
          {props.copyText ?? 'Copy'}
        </Text>
        <Text
          as="span"
          variant="sm"
          weight="normal"
          className="invisible col-start-1 row-start-1 flex items-center gap-1 whitespace-nowrap"
          aria-hidden
        >
          <span aria-hidden className="inline-flex size-4 shrink-0">
            <CheckIcon size="100%" weight="regular" />
          </span>
          Copied
        </Text>
        <Text
          as="span"
          variant="sm"
          weight="normal"
          className="col-start-1 row-start-1 flex items-center justify-center gap-1 whitespace-nowrap"
        >
          <span aria-hidden className="inline-flex size-4 shrink-0">
            <CopyStatusIcon size="100%" weight="regular" />
          </span>
          {copied ? 'Copied' : (props.copyText ?? 'Copy')}
        </Text>
      </span>
    </Button>
  );
}

export interface CopyIconButtonProps {
  copy: string;
  className?: string;
  iconClassName?: string;
  copyText?: ReactNode;
  label?: string;
  disabled?: boolean;
  color?: IconButtonProps['color'];
  size?: IconButtonProps['size'];
  variant?: IconButtonProps['variant'];
  onCopy?: () => void;
}

function getCopyLabel(copyText: ReactNode, label?: string) {
  if (label) return label;
  return typeof copyText === 'string' ? copyText : 'Copy';
}

export function CopyIconButton(props: CopyIconButtonProps) {
  const { copied, onCopy } = useCopy({ copy: props.copy });
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const copyLabel = getCopyLabel(props.copyText, props.label);
  const tooltipTitle = props.copyText ?? copyLabel;

  return (
    <IconButton
      onClick={(e) => {
        e.stopPropagation();
        onCopy();
        props.onCopy?.();
      }}
      disabled={props.disabled}
      icon={copied ? CheckIcon : CopySimpleIcon}
      label={copied ? 'Copied' : copyLabel}
      tooltipProps={{
        title: copied ? 'Copied' : tooltipTitle,
        side: 'top',
        open: tooltipOpen,
        onOpenChange: (open) => {
          if (open) setTooltipOpen(true);
        },
      }}
      variant={props.variant ?? 'plain'}
      color={props.color ?? 'secondary'}
      size={props.size ?? 'sm'}
      className={props.className}
      iconClassName={props.iconClassName}
      onMouseLeave={() => setTooltipOpen(false)}
      onBlur={() => setTooltipOpen(false)}
    />
  );
}

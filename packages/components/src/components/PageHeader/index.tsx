import type { ReactNode } from 'react';

import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';

import { Button, type ButtonProps } from '../Button';
import { Icon, type IconProps } from '../Icon';
import { IconButton, type IconButtonProps } from '../IconButton';
import { Text } from '../Text';

type PageHeaderAction = Pick<
  ButtonProps,
  'disabled' | 'loading' | 'onClick' | 'leftDecorator' | 'rightDecorator'
> & { label: string };

export interface PageHeaderProps {
  title: string;
  icon?: IconProps['icon'];
  backButton?: Pick<IconButtonProps, 'label' | 'disabled' | 'onClick'>;
  leftItems?: ReactNode;
  rightItems?: ReactNode;
  actions?: {
    secondary?: PageHeaderAction;
    additional?: PageHeaderAction;
    primary?: PageHeaderAction;
  };
}

export function PageHeader({
  title,
  icon,
  backButton,
  leftItems,
  rightItems,
  actions,
}: PageHeaderProps) {
  const { secondary, additional, primary } = actions ?? {};

  return (
    <header className="flex flex-wrap items-stretch justify-between gap-x-space-4 border-b border-subtle px-space-4">
      <div className="flex min-w-0 max-w-full flex-wrap items-stretch gap-x-space-4">
        <div className="flex min-h-12 min-w-0 items-center gap-space-2 py-space-2">
          {backButton && (
            <IconButton
              {...backButton}
              icon={ArrowLeftIcon}
              size="md"
              color="secondary"
              variant="plain"
            />
          )}
          {icon && (
            <Icon icon={icon} size="md" className="shrink-0" aria-hidden />
          )}
          <Text as="h1" variant="h3" className="min-w-0 truncate">
            {title}
          </Text>
        </div>
        {leftItems != null && (
          <div className="flex min-h-12 min-w-0 max-w-full items-stretch overflow-x-auto">
            {leftItems}
          </div>
        )}
      </div>
      {(rightItems != null || secondary || additional || primary) && (
        <div className="ms-auto flex min-w-0 flex-wrap items-center justify-end gap-space-2 py-space-2">
          {rightItems}
          {(['secondary', 'additional', 'primary'] as const).map((key) => {
            const action = actions?.[key];
            if (!action) return null;
            const { label, ...buttonProps } = action;
            return (
              <Button
                key={key}
                {...buttonProps}
                color={key === 'primary' ? 'primary' : 'secondary'}
                variant={key === 'primary' ? 'normal' : 'outlined'}
                size="md"
              >
                {label}
              </Button>
            );
          })}
        </div>
      )}
    </header>
  );
}

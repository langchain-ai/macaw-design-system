// Define styles for each specific combination
export const buttonStyleMap = {
  // Primary variants - enabled
  'primary-normal-enabled':
    'button-primary-bg button-primary-foreground before:border before:button-primary-border hover:before:border-transparent hover:button-primary-bg-hover dark:hover:button-primary-bg-hover dark:hover:before:border-transparent',
  'primary-outlined-enabled':
    'bg-transparent text-brand-secondary before:border before:border-brand-strong hover:text-brand-primary hover:bg-brand-muted dark:before:border-brand dark:hover:bg-brand-subtle dark:hover:before:button-primary-border dark:hover:text-brand-primary',
  'primary-plain-enabled':
    'bg-transparent text-brand-400 dark:text-brand-700 before:border before:border-transparent hover:text-brand-secondary dark:hover:text-brand-primary hover:bg-brand-muted/80',
  'primary-underlined-enabled':
    'bg-transparent button-primary-underlined-foreground before:border-b before:button-primary-underlined-border hover:before:button-primary-underlined-border-hover hover:button-primary-underlined-foreground-hover',

  // Primary variants - disabled
  'primary-normal-disabled':
    'bg-brand-muted before:border before:border-brand-disabled text-brand-disabled',
  'primary-outlined-disabled':
    'bg-brand-muted before:border before:border-transparent text-brand-disabled',
  'primary-plain-disabled':
    'bg-brand-muted before:border before:border-transparent text-brand-disabled',
  'primary-underlined-disabled':
    'bg-transparent text-brand-disabled before:border before:border-transparent',

  // Secondary variants - enabled
  'secondary-normal-enabled':
    'bg-elevated text-secondary before:border before:button-secondary-border hover:before:button-secondary-border-hover hover:bg-elevated-hover/80',
  'secondary-outlined-enabled':
    'bg-elevated text-secondary before:border before:button-secondary-border hover:before:button-secondary-border-hover hover:bg-elevated-hover/80',
  'secondary-plain-enabled':
    'bg-transparent text-secondary before:border before:border-transparent hover:bg-elevated-hover/80 dark:hover:bg-elevated-hover/40',
  'secondary-underlined-enabled':
    'text-secondary hover:text-secondary-hover before:border-b before:button-secondary-underlined-border hover:before:button-secondary-underlined-border-hover',

  // Secondary variants - disabled
  'secondary-normal-disabled':
    'bg-surface-level-1-hover dark:bg-disabled before:border before:border-transparent text-disabled',
  'secondary-outlined-disabled':
    'bg-surface-level-1-hover dark:bg-disabled before:border before:border-transparent text-disabled',
  'secondary-plain-disabled':
    'bg-surface-level-1-hover dark:bg-disabled before:border before:border-transparent text-disabled',
  'secondary-underlined-disabled':
    'text-disabled before:border before:border-transparent',

  // Error variants - enabled
  'error-normal-enabled':
    'bg-error-strong dark:bg-error-secondary text-white before:border before:button-error-border hover:button-error-bg-hover dark:hover:bg-error',
  'error-outlined-enabled':
    'bg-transparent text-error-secondary before:border before:button-error-outlined-border hover:bg-error',
  'error-plain-enabled':
    'bg-transparent text-error-secondary before:border before:border-transparent hover:bg-error/80',
  'error-underlined-enabled':
    'bg-transparent text-error-secondary before:border-b before:button-error-underlined-border hover:before:button-error-underlined-border-hover hover:button-error-underlined-foreground-hover',

  // Error variants - disabled
  'error-normal-disabled':
    'bg-error before:border before:border-transparent button-error-disabled-foreground',
  'error-outlined-disabled':
    'bg-transparent button-error-disabled-foreground before:border before:button-error-disabled-border',
  'error-plain-disabled':
    'bg-transparent button-error-disabled-foreground before:border before:border-transparent',
  'error-underlined-disabled':
    'bg-transparent button-error-disabled-foreground before:border before:border-transparent',
};

import type { ComponentType } from 'react';

import { sanitizeUrl } from '@braintree/sanitize-url';

import { cn } from '../../utils/cn';
import EngineBadgeDark from './EngineBadgeDark.svg?react';
import EngineBadgeLight from './EngineBadgeLight.svg?react';
import EngineIconLight from './EngineIconLight.svg?react';
import EngineLogoDark from './EngineLogoDark.svg?react';
import EngineLogoLight from './EngineLogoLight.svg?react';
import FleetLogoFull from './FleetLogoFull.svg?react';
import FleetLogoIcon from './FleetLogoIcon.svg?react';
import FleetLogoWord from './FleetLogoWord.svg?react';
import LangChainLogoFull from './LangChainLogoFull.svg?react';
import LangChainLogoIcon from './LangChainLogoIcon.svg?react';
import LangChainLogoWord from './LangChainLogoWord.svg?react';
import LangSmithLogoFull from './LangSmithLogoFull.svg?react';
import LangSmithLogoWord from './LangSmithLogoWord.svg?react';

export type LogoBrand = 'langsmith' | 'langchain' | 'fleet' | 'engine';
export type LogoVariant = 'logomark' | 'wordmark' | 'full';
export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

type LogoComponent = ComponentType<{ className?: string }>;

const SIZE_MAP = {
  logomark: {
    sm: 'size-5',
    md: 'size-6',
    lg: 'size-8',
    xl: 'size-10',
  },
  wordmark: {
    sm: 'h-4 w-auto',
    md: 'h-5 w-auto',
    lg: 'h-6 w-auto',
    xl: 'h-10 w-auto',
  },
  full: {
    sm: 'h-4 w-auto',
    md: 'h-5 w-auto',
    lg: 'h-6 w-auto',
    xl: 'h-10 w-auto',
  },
} as const satisfies Record<LogoVariant, Record<LogoSize, string>>;

export const EngineBadge = ({ className }: { className?: string }) => (
  <>
    <EngineBadgeLight className={cn(className, 'dark:hidden')} />
    <EngineBadgeDark className={cn(className, 'hidden dark:block')} />
  </>
);

const EngineLogo = ({ className }: { className?: string }) => (
  <>
    <EngineLogoLight className={cn(className, 'dark:hidden')} />
    <EngineLogoDark className={cn(className, 'hidden dark:block')} />
  </>
);

const LOGO_COMPONENTS = {
  langsmith: {
    logomark: LangChainLogoIcon,
    wordmark: LangSmithLogoWord,
    full: LangSmithLogoFull,
  },
  langchain: {
    logomark: LangChainLogoIcon,
    wordmark: LangChainLogoWord,
    full: LangChainLogoFull,
  },
  fleet: {
    logomark: FleetLogoIcon,
    wordmark: FleetLogoWord,
    full: FleetLogoFull,
  },
  engine: {
    logomark: EngineIconLight,
    wordmark: EngineLogo,
    full: EngineLogo,
  },
} as const satisfies Record<LogoBrand, Record<LogoVariant, LogoComponent>>;

export interface LogoProps {
  size?: LogoSize;
  className?: string;
  variant?: LogoVariant;
  brand?: LogoBrand;
  customLogoUrl?: string | null;
}

export function Logo(props: LogoProps) {
  const size = props.size ?? 'md';
  const variant = props.variant ?? 'full';

  if (props.customLogoUrl && !props.brand) {
    return (
      <img
        src={sanitizeUrl(props.customLogoUrl)}
        alt="Custom Logo"
        className={cn(
          'h-4 w-auto max-w-[7.5rem] shrink-0 object-contain',
          props.className
        )}
      />
    );
  }

  const brand = props.brand ?? 'langsmith';
  const LogoComponent = LOGO_COMPONENTS[brand][variant];

  return (
    <LogoComponent className={cn(SIZE_MAP[variant][size], props.className)} />
  );
}

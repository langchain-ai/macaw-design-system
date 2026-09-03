import type { ComponentProps, PropsWithChildren, ReactNode } from 'react';

import { MemoryRouter } from 'react-router-dom';

import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { RenderOptions, RenderResult } from '@testing-library/react';
import { render as rtlRender } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AppThemeProvider } from './hooks/AppThemeProvider';

export {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';

interface CustomRenderOptions extends RenderOptions {
  routerOptions?: ComponentProps<typeof MemoryRouter>;
  theme?: ComponentProps<typeof AppThemeProvider>['defaultMode'];
  withProviders?: boolean;
}

const createWrapper = ({
  routerOptions,
  theme = 'light',
  wrapper: CustomWrapper,
}: Pick<CustomRenderOptions, 'routerOptions' | 'theme' | 'wrapper'>) => {
  return function TestWrapper({ children }: PropsWithChildren) {
    const content = CustomWrapper ? (
      <CustomWrapper>{children}</CustomWrapper>
    ) : (
      children
    );

    return (
      <MemoryRouter {...routerOptions}>
        <TooltipProvider>
          <AppThemeProvider defaultMode={theme}>{content}</AppThemeProvider>
        </TooltipProvider>
      </MemoryRouter>
    );
  };
};

export const render = (
  ui: ReactNode,
  {
    routerOptions,
    theme,
    withProviders = true,
    wrapper,
    ...options
  }: CustomRenderOptions = {}
): RenderResult & { user: ReturnType<typeof userEvent.setup> } => {
  const result = rtlRender(ui, {
    wrapper: withProviders
      ? createWrapper({ routerOptions, theme, wrapper })
      : wrapper,
    ...options,
  });

  return { user: userEvent.setup(), ...result };
};

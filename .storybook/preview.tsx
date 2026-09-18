import React, { useEffect } from 'react';

import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { Preview } from '@storybook/react-vite';

import { AppThemeProvider } from '../src/hooks/AppThemeProvider';
import { useColorScheme } from '../src/hooks/useColorScheme';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/fira-code/400.css';
import '@fontsource/fira-code/500.css';
import '../src/styles/tokens.css';
import '../src/styles/base.css';
import '../src/styles/tailwind.css';

const BACKGROUNDS = { light: '#ffffff', dark: '#131316' } as const;

function isDarkBackground(background?: string) {
  return background === 'dark' || background === BACKGROUNDS.dark;
}

const ThemeSetter = ({
  background,
  children,
}: {
  background?: string;
  children: React.ReactNode;
}) => {
  const { setMode } = useColorScheme();

  useEffect(() => {
    if (isDarkBackground(background)) {
      setMode('dark');
    } else {
      setMode('light');
    }
  }, [background, setMode]);

  return <div className="text-primary">{children}</div>;
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        light: { name: 'Light', value: BACKGROUNDS.light },
        dark: { name: 'Dark', value: BACKGROUNDS.dark },
      },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: [
          'Welcome to Macaw Design System',
          'Foundations',
          'Components',
          [
            'Overview',
            'Buttons',
            ['Button', 'IconButton', 'ButtonGroup', 'Link', '*'],
            'Inputs',
            [
              'Input',
              'Textarea',
              'Checkbox',
              'RadioButton',
              'RadioGroup',
              'RadioCard',
              'Switch',
              'Slider',
              'Select',
              'TagInput',
              'Typeahead',
              '*',
            ],
            'Popovers',
            [
              'Tooltip',
              'HoverCard',
              'Popover',
              'DropdownMenu',
              'ContextMenu',
              'CommandMenu',
              '*',
            ],
            'Navigation',
            ['Tabs', 'GroupedTabs', '*'],
            'Layout',
            ['Divider', 'Dialog', 'Pane', 'SplitViewPane', '*'],
            'Display',
            ['Avatar', 'Badge', 'Icon', 'Logo', 'Kbd', 'CodeLite', 'Code', '*'],
            'Status',
            [
              'Banner',
              'Toast',
              'Spinner',
              'Skeleton',
              'LinearProgress',
              'ProgressBar',
              'CircularProgress',
              'EmptyState',
              'ErrorMessage',
              'ErrorState',
              '*',
            ],
            'Charts',
            [
              'Overview',
              'Colors',
              'BarChart',
              'LineChart',
              'DonutChart',
              'SparkLineChart',
              'MetricChart',
              'ChartCard',
              'ChartLegend',
              'ChartTooltip',
              '*',
            ],
            '*',
          ],
          '*',
        ],
      },
    },
  },
  decorators: [
    (Story, { globals }) => {
      return (
        <AppThemeProvider defaultMode="light" storageKey={null}>
          <TooltipProvider>
            <ThemeSetter background={globals?.backgrounds?.value}>
              <Story />
            </ThemeSetter>
          </TooltipProvider>
        </AppThemeProvider>
      );
    },
  ],
};

export default preview;

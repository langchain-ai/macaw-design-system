import { useMemo, useState } from 'react';

import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from '../components/Input';
import { Text } from '../components/Text';
import { phosphorCatalogEntries } from './phosphor-icon-catalog';

function IconCatalog() {
  const [query, setQuery] = useState('');
  const filteredIcons = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return phosphorCatalogEntries.filter(([legacyName, phosphorName]) => {
      if (!normalizedQuery) return true;

      return (
        phosphorName.toLowerCase().includes(normalizedQuery) ||
        legacyName.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query]);

  return (
    <main className="min-h-screen bg-surface-level-1 p-space-5 text-primary sm:p-space-8">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-space-6">
        <header className="flex flex-col gap-space-4 border-b border-subtle pb-space-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-space-2">
            <Text as="h1" variant="h1">
              Phosphor icon library
            </Text>
            <Text color="secondary">
              The curated Phosphor icons currently approved for Design System
              components and stories.
            </Text>
          </div>
          <div className="w-full lg:max-w-sm">
            <Input
              label="Search icons"
              value={query}
              onChange={setQuery}
              placeholder="Try arrow, chart, or search"
              leftDecorator={
                <MagnifyingGlassIcon aria-hidden size={16} weight="regular" />
              }
            />
          </div>
        </header>

        <Text aria-live="polite" color="secondary" variant="sm">
          {filteredIcons.length.toLocaleString()}{' '}
          {filteredIcons.length === 1 ? 'mapping' : 'mappings'}
        </Text>

        {filteredIcons.length > 0 ? (
          <ul className="grid grid-cols-2 gap-space-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {filteredIcons.map(
              ([legacyName, phosphorName, IconComponent, weight]) => (
                <li
                  key={legacyName}
                  className="flex min-w-0 flex-col items-center gap-space-3 rounded-lg border border-default bg-surface-level-1 p-space-4 text-center"
                >
                  <div className="text-icon-primary">
                    <IconComponent aria-hidden size={24} weight={weight} />
                  </div>
                  <div className="flex min-w-0 flex-col gap-space-1">
                    <Text
                      className="break-all font-mono"
                      variant="xs"
                      weight="medium"
                    >
                      {phosphorName}
                    </Text>
                    <Text
                      className="break-all font-mono"
                      color="quaternary"
                      variant="xs"
                    >
                      {legacyName}
                    </Text>
                    <Text color="tertiary" variant="xs">
                      {weight}
                    </Text>
                  </div>
                </li>
              )
            )}
          </ul>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center gap-space-2 rounded-lg border border-default bg-surface-level-2">
            <Text variant="h3">No icons found</Text>
            <Text color="secondary">Try a broader search term.</Text>
          </div>
        )}
      </div>
    </main>
  );
}

const meta = {
  title: 'Foundations/Icon Library',
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllIcons: Story = {
  render: () => <IconCatalog />,
};

import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { cn } from '../utils/cn';

type TokenSwatch = {
  name: string;
  className: string;
  usage: string;
};

type UtilityToken = {
  name: string;
  previewClassName: string;
  usage: string;
};

const DurationTokenSwatch = ({ className }: { className: string }) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div
      className="flex h-12 items-center rounded-sm border border-subtle bg-surface-level-2 p-space-2"
      onPointerEnter={() => setIsActive(true)}
      onPointerLeave={() => setIsActive(false)}
    >
      <div
        className={cn(
          'h-4 w-4 rounded-full bg-brand transition-transform',
          isActive && 'translate-x-8',
          className
        )}
      />
    </div>
  );
};

const surfaceTokens: TokenSwatch[] = [
  {
    name: 'bg-surface-level-1',
    className: 'bg-surface-level-1',
    usage: 'Root page or app shell background',
  },
  {
    name: 'bg-surface-level-1-hover',
    className: 'bg-surface-level-1-hover',
    usage: 'Hover on a level 1 surface',
  },
  {
    name: 'bg-surface-level-2',
    className: 'bg-surface-level-2',
    usage: 'Cards, panels, sidebars, table header groups',
  },
  {
    name: 'bg-surface-level-2-hover',
    className: 'bg-surface-level-2-hover',
    usage: 'Hover on a level 2 surface',
  },
  {
    name: 'bg-surface-level-3',
    className: 'bg-surface-level-3',
    usage: 'Nested table headers or grouped inner containers',
  },
  {
    name: 'bg-surface-level-4',
    className: 'bg-surface-level-4',
    usage: 'Deepest neutral fill for additional separation',
  },
  {
    name: 'bg-disabled',
    className: 'bg-disabled',
    usage: 'Disabled input or control fill',
  },
  {
    name: 'bg-elevated',
    className: 'bg-elevated',
    usage: 'Popovers, dropdowns, tooltips, context menus',
  },
  {
    name: 'bg-elevated-hover',
    className: 'bg-elevated-hover',
    usage: 'Hover on elevated surfaces',
  },
  {
    name: 'bg-elevated-selected',
    className: 'bg-elevated-selected',
    usage: 'Selected item on elevated surfaces',
  },
  {
    name: 'bg-overlay',
    className: 'bg-overlay',
    usage: 'Modal backdrop or scrim',
  },
];

const brandTokens: TokenSwatch[] = [
  {
    name: 'bg-brand',
    className: 'bg-brand',
    usage: 'Primary CTA fill or strong brand element',
  },
  {
    name: 'bg-brand-hover',
    className: 'bg-brand-hover',
    usage: 'Hover on a brand-filled element',
  },
  {
    name: 'bg-brand-subtle',
    className: 'bg-brand-subtle',
    usage: 'Tinted brand surface',
  },
  {
    name: 'bg-brand-subtle-gradient',
    className: 'bg-brand-subtle-gradient',
    usage: 'Tinted brand gradient surface, currently for info banners',
  },
  {
    name: 'bg-brand-subtle-hover',
    className: 'bg-brand-subtle-hover',
    usage: 'Hover on a tinted brand surface',
  },
  {
    name: 'bg-brand-illustration',
    className: 'bg-brand-illustration',
    usage: 'Backdrop for branded illustrations or media',
  },
  {
    name: 'bg-brand-muted',
    className: 'bg-brand-muted',
    usage: 'Faintest brand tint',
  },
  {
    name: 'bg-icon-brand-background',
    className: 'bg-icon-brand-background',
    usage: 'Background color for brand-mark icons',
  },
  {
    name: 'bg-purple',
    className: 'bg-purple',
    usage: 'Purple-tinted surface',
  },
];

const intentTokens: TokenSwatch[] = [
  {
    name: 'bg-success',
    className: 'bg-success',
    usage: 'Success tint',
  },
  {
    name: 'bg-success-subtle',
    className: 'bg-success-subtle',
    usage: 'Faint success tint',
  },
  {
    name: 'bg-success-strong',
    className: 'bg-success-strong',
    usage: 'Filled success indicator',
  },
  {
    name: 'bg-error',
    className: 'bg-error',
    usage: 'Error tint',
  },
  {
    name: 'bg-error-subtle',
    className: 'bg-error-subtle',
    usage: 'Faint error tint',
  },
  {
    name: 'bg-error-strong',
    className: 'bg-error-strong',
    usage: 'Filled error indicator',
  },
  {
    name: 'bg-warning',
    className: 'bg-warning',
    usage: 'Warning tint',
  },
  {
    name: 'bg-warning-subtle',
    className: 'bg-warning-subtle',
    usage: 'Faint warning tint',
  },
  {
    name: 'bg-warning-strong',
    className: 'bg-warning-strong',
    usage: 'Filled warning indicator',
  },
];

const controlTokens: TokenSwatch[] = [
  {
    name: 'bg-control-active',
    className: 'bg-control-active',
    usage: 'Checked or on control fill',
  },
  {
    name: 'bg-control-active-hover',
    className: 'bg-control-active-hover',
    usage: 'Hover while checked or on',
  },
  {
    name: 'bg-control-thumb',
    className: 'bg-control-thumb',
    usage: 'Knob or handle surface',
  },
  {
    name: 'bg-control-disabled',
    className: 'bg-control-disabled',
    usage: 'Disabled control fill',
  },
  {
    name: 'bg-selected',
    className: 'bg-selected',
    usage: 'Persistently selected row or item',
  },
  {
    name: 'bg-selected-hover',
    className: 'bg-selected-hover',
    usage: 'Selected item while hovered',
  },
];

const borderTokens: TokenSwatch[] = [
  {
    name: 'border-default',
    className: 'border-default',
    usage: 'Default input, card, or container border',
  },
  {
    name: 'border-subtle',
    className: 'border-subtle',
    usage: 'Subtle divider',
  },
  {
    name: 'border-muted',
    className: 'border-muted',
    usage: 'Very subtle divider',
  },
  {
    name: 'border-faint',
    className: 'border-faint',
    usage: 'Hairline separator',
  },
  {
    name: 'border-strong',
    className: 'border-strong',
    usage: 'High-contrast border',
  },
  {
    name: 'border-focus',
    className: 'border-focus',
    usage: 'Focus ring or focus border',
  },
  {
    name: 'border-disabled',
    className: 'border-disabled',
    usage: 'Disabled control border',
  },
  {
    name: 'border-error',
    className: 'border-error',
    usage: 'Error state border',
  },
  {
    name: 'border-error-strong',
    className: 'border-error-strong',
    usage: 'High-emphasis error border',
  },
  {
    name: 'border-brand',
    className: 'border-brand',
    usage: 'Brand-accented border',
  },
  {
    name: 'border-brand-strong',
    className: 'border-brand-strong',
    usage: 'High-emphasis brand border',
  },
  {
    name: 'border-brand-subtle',
    className: 'border-brand-subtle',
    usage: 'Low-emphasis brand border',
  },
  {
    name: 'border-warning',
    className: 'border-warning',
    usage: 'Warning state border',
  },
  {
    name: 'border-success',
    className: 'border-success',
    usage: 'Success state border',
  },
  {
    name: 'border-purple',
    className: 'border-purple',
    usage: 'Purple-accented border',
  },
];

const textTokens: TokenSwatch[] = [
  {
    name: 'text-primary',
    className: 'text-primary',
    usage: 'Primary body text',
  },
  {
    name: 'text-secondary',
    className: 'text-secondary',
    usage: 'Secondary text or labels',
  },
  {
    name: 'text-secondary-hover',
    className: 'text-secondary-hover',
    usage: 'Hover state for secondary text',
  },
  {
    name: 'text-tertiary',
    className: 'text-tertiary',
    usage: 'Lower-emphasis text',
  },
  {
    name: 'text-tertiary-hover',
    className: 'text-tertiary-hover',
    usage: 'Hover state for tertiary text',
  },
  {
    name: 'text-quaternary',
    className: 'text-quaternary',
    usage: 'Lowest-emphasis text',
  },
  {
    name: 'text-disabled',
    className: 'text-disabled',
    usage: 'Disabled text',
  },
  {
    name: 'text-placeholder',
    className: 'text-placeholder',
    usage: 'Placeholder text',
  },
  {
    name: 'text-control-active-foreground',
    className:
      'rounded-sm bg-control-active px-space-2 py-space-1 text-control-active-foreground',
    usage: 'Checkmark or glyph on active control fill',
  },
  {
    name: 'text-link',
    className: 'text-link',
    usage: 'Inline link',
  },
  {
    name: 'text-link-hover',
    className: 'text-link-hover',
    usage: 'Hover state for inline links',
  },
  {
    name: 'text-error-primary',
    className: 'text-error-primary',
    usage: 'High-emphasis error copy',
  },
  {
    name: 'text-error-secondary',
    className: 'text-error-secondary',
    usage: 'Error copy',
  },
  {
    name: 'text-error-tertiary',
    className: 'text-error-tertiary',
    usage: 'Lower-emphasis error copy',
  },
  {
    name: 'text-warning-primary',
    className: 'text-warning-primary',
    usage: 'High-emphasis warning copy',
  },
  {
    name: 'text-warning-secondary',
    className: 'text-warning-secondary',
    usage: 'Warning copy',
  },
  {
    name: 'text-warning-tertiary',
    className: 'text-warning-tertiary',
    usage: 'Lower-emphasis warning copy',
  },
  {
    name: 'text-success-primary',
    className: 'text-success-primary',
    usage: 'High-emphasis success copy',
  },
  {
    name: 'text-success-secondary',
    className: 'text-success-secondary',
    usage: 'Success copy',
  },
  {
    name: 'text-success-tertiary',
    className: 'text-success-tertiary',
    usage: 'Lower-emphasis success copy',
  },
  {
    name: 'text-brand-primary',
    className: 'text-brand-primary',
    usage: 'Primary brand text',
  },
  {
    name: 'text-brand-secondary',
    className: 'text-brand-secondary',
    usage: 'Secondary brand text',
  },
  {
    name: 'text-brand-tertiary',
    className: 'text-brand-tertiary',
    usage: 'Lower-emphasis brand text',
  },
  {
    name: 'text-brand-disabled',
    className: 'text-brand-disabled',
    usage: 'Disabled brand text',
  },
  {
    name: 'text-brand-on-fill',
    className: 'text-brand-on-fill bg-brand',
    usage: 'Text or icon on a brand-filled non-Button surface',
  },
  {
    name: 'text-purple',
    className: 'text-purple',
    usage: 'Purple-accented text',
  },
];

const iconTokens: TokenSwatch[] = [
  {
    name: 'text-icon-primary',
    className: 'text-icon-primary',
    usage: 'Default icon',
  },
  {
    name: 'text-icon-secondary',
    className: 'text-icon-secondary',
    usage: 'Secondary icon',
  },
  {
    name: 'text-icon-tertiary',
    className: 'text-icon-tertiary',
    usage: 'Low-emphasis icon',
  },
  {
    name: 'text-icon-disabled',
    className: 'text-icon-disabled',
    usage: 'Disabled icon',
  },
  {
    name: 'text-icon-brand',
    className: 'text-icon-brand',
    usage: 'Brand icon',
  },
  {
    name: 'text-icon-brand-fill',
    className: 'text-icon-brand-fill',
    usage: 'Foreground color for brand-mark icons',
  },
  {
    name: 'text-icon-error',
    className: 'text-icon-error',
    usage: 'Error icon',
  },
  {
    name: 'text-icon-success',
    className: 'text-icon-success',
    usage: 'Success icon',
  },
  {
    name: 'text-icon-warning',
    className: 'text-icon-warning',
    usage: 'Warning icon',
  },
];

const tokenRows = [
  {
    name: '--bg-surface-level-1',
    className: 'bg-surface-level-1',
    category: 'bg',
    role: 'surface',
    variant: 'level-1',
    state: '-',
  },
  {
    name: '--text-link-hover',
    className: 'text-link-hover',
    category: 'text',
    role: 'link',
    variant: '-',
    state: 'hover',
  },
  {
    name: '--border-focus',
    className: 'border-focus',
    category: 'border',
    role: '-',
    variant: '-',
    state: 'focus',
  },
  {
    name: '--icon-brand',
    className: 'text-icon-brand',
    category: 'icon',
    role: 'brand',
    variant: '-',
    state: '-',
  },
  {
    name: '--radius-md',
    className: 'rounded-md',
    category: 'radius',
    role: '-',
    variant: 'md',
    state: '-',
  },
];

const statusTextTokens: TokenSwatch[] = [
  {
    name: 'text-status-green',
    className: 'text-status-green',
    usage: 'Successful run or positive status text',
  },
  {
    name: 'text-status-orange',
    className: 'text-status-orange',
    usage: 'Orange run or intermediate status text',
  },
  {
    name: 'text-status-yellow',
    className: 'text-status-yellow',
    usage: 'Yellow run or warning-adjacent status text',
  },
  {
    name: 'text-status-red',
    className: 'text-status-red',
    usage: 'Failed run or negative status text',
  },
];

const statusBorderTokens: TokenSwatch[] = [
  {
    name: 'border-status-green',
    className: 'border-status-green',
    usage: 'Successful run or positive status border',
  },
  {
    name: 'border-status-orange',
    className: 'border-status-orange',
    usage: 'Orange run or intermediate status border',
  },
  {
    name: 'border-status-yellow',
    className: 'border-status-yellow',
    usage: 'Yellow run or warning-adjacent status border',
  },
  {
    name: 'border-status-red',
    className: 'border-status-red',
    usage: 'Failed run or negative status border',
  },
];

const shadowTokens: UtilityToken[] = [
  {
    name: 'shadow-sm',
    previewClassName: 'shadow-sm',
    usage: 'Low elevation for floating controls or interaction states',
  },
  {
    name: 'shadow-md',
    previewClassName: 'shadow-md',
    usage: 'Medium popover or raised surface shadow',
  },
  {
    name: 'shadow-lg',
    previewClassName: 'shadow-lg',
    usage: 'High-elevation overlay shadow',
  },
];

const radiusTokens: UtilityToken[] = [
  {
    name: 'rounded-none',
    previewClassName: 'rounded-none',
    usage: 'No corner radius at all',
  },
  {
    name: 'rounded-xs',
    previewClassName: 'rounded-xs',
    usage: 'Compact labels and tag-style badges',
  },
  {
    name: 'rounded-sm',
    previewClassName: 'rounded-sm',
    usage: 'Small inputs and icon buttons',
  },
  {
    name: 'rounded-md',
    previewClassName: 'rounded-md',
    usage: 'Default buttons and most form controls',
  },
  {
    name: 'rounded-lg',
    previewClassName: 'rounded-lg',
    usage: 'Cards, dialogs, and larger content panels',
  },
  {
    name: 'rounded-xl',
    previewClassName: 'rounded-xl',
    usage: 'Sheets and large overlay surfaces',
  },
  {
    name: 'rounded-full',
    previewClassName: 'rounded-full',
    usage: 'Pills, default badges, avatars, and dots',
  },
];

const durationTokens: UtilityToken[] = [
  {
    name: 'duration-fast',
    previewClassName: 'duration-fast',
    usage: '100ms micro-interactions',
  },
  {
    name: 'duration-normal',
    previewClassName: 'duration-normal',
    usage: '200ms default hover and focus transitions',
  },
  {
    name: 'duration-slow',
    previewClassName: 'duration-slow',
    usage: '300ms panel expansion or layout shifts',
  },
  {
    name: 'duration-slower',
    previewClassName: 'duration-slower',
    usage: '500ms entrance animations',
  },
];

const selectedRows = [
  {
    id: 'dataset-runs',
    name: 'Dataset runs',
    detail: 'Persistent selected row',
  },
  {
    id: 'annotation-queue',
    name: 'Annotation queue',
    detail: 'Hover and selected are separate states',
  },
  {
    id: 'project-traces',
    name: 'Project traces',
    detail: 'Selected survives after click',
  },
];

const TokenSection = ({
  title,
  description,
  tokens,
  kind = 'background',
}: {
  title: string;
  description: string;
  tokens: TokenSwatch[];
  kind?: 'background' | 'border' | 'text';
}) => (
  <section className="flex flex-col gap-space-3">
    <div>
      <h2 className="text-base font-semibold text-primary">{title}</h2>
      <p className="max-w-3xl text-sm text-secondary">{description}</p>
    </div>
    <div className="grid grid-cols-1 gap-space-3 md:grid-cols-2 xl:grid-cols-3">
      {tokens.map((token) => (
        <div
          key={token.name}
          className="grid grid-cols-[4.5rem,minmax(0,1fr)] gap-space-3 rounded-md border border-subtle bg-surface-level-1 p-space-3"
        >
          {kind === 'background' && (
            <div
              className={cn(
                'h-12 rounded-sm border border-subtle',
                token.className
              )}
            />
          )}
          {kind === 'border' && (
            <div
              className={cn(
                'h-12 rounded-sm border-2 bg-surface-level-2',
                token.className
              )}
            />
          )}
          {kind === 'text' && (
            <div className="flex h-12 items-center justify-center rounded-sm border border-subtle bg-surface-level-2">
              <span className={cn('text-lg font-semibold', token.className)}>
                Aa
              </span>
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate font-mono text-xs text-primary">
              {token.name}
            </div>
            <p className="mt-space-1 text-xs text-secondary">{token.usage}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const UtilityTokenSection = ({
  title,
  description,
  tokens,
  kind,
}: {
  title: string;
  description: string;
  tokens: UtilityToken[];
  kind: 'shadow' | 'radius' | 'duration';
}) => (
  <section className="flex flex-col gap-space-3">
    <div>
      <h2 className="text-base font-semibold text-primary">{title}</h2>
      <p className="max-w-3xl text-sm text-secondary">{description}</p>
    </div>
    <div className="grid grid-cols-1 gap-space-3 md:grid-cols-2 xl:grid-cols-3">
      {tokens.map((token) => (
        <div
          key={token.name}
          className="grid grid-cols-[4.5rem,minmax(0,1fr)] gap-space-3 rounded-md border border-subtle bg-surface-level-1 p-space-3"
        >
          {kind === 'shadow' && (
            <div
              className={cn(
                'h-12 rounded-md border border-subtle bg-elevated',
                token.previewClassName
              )}
            />
          )}
          {kind === 'radius' && (
            <div
              className={cn(
                'h-12 border border-brand bg-brand-subtle',
                token.previewClassName
              )}
            />
          )}
          {kind === 'duration' && (
            <DurationTokenSwatch className={token.previewClassName} />
          )}
          <div className="min-w-0">
            <div className="truncate font-mono text-xs text-primary">
              {token.name}
            </div>
            <p className="mt-space-1 text-xs text-secondary">{token.usage}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const NamingConvention = () => (
  <section className="flex flex-col gap-space-3">
    <div>
      <h2 className="text-base font-semibold text-primary">
        Naming Convention
      </h2>
      <p className="max-w-3xl text-sm text-secondary">
        Note that token names are different from tailwind utility names. For
        example, the `icon-brand` token will be used as `text-icon-brand` in
        code.
      </p>
    </div>
    <div className="rounded-md border border-subtle bg-surface-level-1 p-space-4">
      <div className="font-mono text-sm text-primary">
        --{'{category}'}-{'{role?}'}-{'{variant?}'}-{'{state?}'}
      </div>
      <div className="mt-space-4 grid gap-space-3 md:grid-cols-4">
        <div>
          <div className="text-xs font-semibold uppercase text-tertiary">
            Category
          </div>
          <p className="mt-space-1 text-sm text-secondary">
            The CSS property family: bg (background), text, border, icon,
            shadow, radius, duration. These are token categories, not utility
            prefixes; icon uses the text- prefix (text-icon-*) and radius uses
            rounded-.
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase text-tertiary">
            Role
          </div>
          <p className="mt-space-1 text-sm text-secondary">
            The job inside the category: surface, error, brand, control,
            overlay, link.
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase text-tertiary">
            Variant
          </div>
          <p className="mt-space-1 text-sm text-secondary">
            A planned option within the role: level-1, strong, subtle, muted.
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase text-tertiary">
            State
          </div>
          <p className="mt-space-1 text-sm text-secondary">
            A UI condition: hover, focus, active, selected, disabled.
          </p>
        </div>
      </div>
    </div>
    <div className="overflow-hidden rounded-md border border-subtle">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-surface-level-2 text-xs uppercase text-tertiary">
          <tr>
            <th className="px-space-3 py-space-2 font-semibold">
              Token (CSS variable)
            </th>
            <th className="px-space-3 py-space-2 font-semibold">
              Tailwind class
            </th>
            <th className="px-space-3 py-space-2 font-semibold">Category</th>
            <th className="px-space-3 py-space-2 font-semibold">Role</th>
            <th className="px-space-3 py-space-2 font-semibold">Variant</th>
            <th className="px-space-3 py-space-2 font-semibold">State</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary bg-surface-level-1">
          {tokenRows.map((token) => (
            <tr key={token.name}>
              <td className="px-space-3 py-space-2 font-mono text-xs text-primary">
                {token.name}
              </td>
              <td className="px-space-3 py-space-2 font-mono text-xs text-primary">
                {token.className}
              </td>
              <td className="px-space-3 py-space-2 text-secondary">
                {token.category}
              </td>
              <td className="px-space-3 py-space-2 text-secondary">
                {token.role}
              </td>
              <td className="px-space-3 py-space-2 text-secondary">
                {token.variant}
              </td>
              <td className="px-space-3 py-space-2 text-secondary">
                {token.state}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

const SelectedTokenDemo = () => {
  const [selectedId, setSelectedId] = useState(selectedRows[0].id);

  return (
    <section className="flex flex-col gap-space-3">
      <div>
        <h2 className="text-base font-semibold text-primary">
          Selected State Demo
        </h2>
        <p className="max-w-3xl text-sm text-secondary">
          Use selected for durable choice. Use active for momentary press
          feedback, hover for pointer feedback, and selected-hover when the
          durable selected item is also hovered.
        </p>
      </div>
      <div className="grid gap-space-4 lg:grid-cols-[minmax(0,1fr),20rem]">
        <div className="overflow-hidden rounded-md border border-subtle">
          <div className="grid grid-cols-[minmax(0,1fr),10rem] bg-surface-level-2 px-space-3 py-space-2 text-xs font-semibold uppercase text-tertiary">
            <div>Name</div>
            <div>State</div>
          </div>
          <div className="divide-y divide-secondary bg-surface-level-1">
            {selectedRows.map((row) => {
              const isSelected = row.id === selectedId;
              return (
                // eslint-disable-next-line react/forbid-elements
                <button
                  key={row.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedId(row.id)}
                  className={cn(
                    'grid w-full grid-cols-[minmax(0,1fr),10rem] items-center px-space-3 py-space-3 text-left transition-colors',
                    isSelected
                      ? 'bg-selected hover:bg-selected-hover'
                      : 'hover:bg-surface-level-2 active:bg-surface-level-3'
                  )}
                >
                  <span>
                    <span className="block text-sm font-medium text-primary">
                      {row.name}
                    </span>
                    <span className="block text-xs text-secondary">
                      {row.detail}
                    </span>
                  </span>
                  <span className="text-xs text-tertiary">
                    {isSelected ? 'selected' : 'not selected'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="rounded-md border border-subtle bg-surface-level-1 p-space-4">
          <div className="text-xs font-semibold uppercase text-tertiary">
            Applied classes
          </div>
          <div className="mt-space-3 space-y-space-2 font-mono text-xs text-secondary">
            <div>default: hover:bg-surface-level-2</div>
            <div>active: active:bg-surface-level-3</div>
            <div>selected: bg-selected</div>
            <div>selected + hover: hover:bg-selected-hover</div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TokenDocumentation = () => (
  <div className="min-h-screen bg-surface-level-1 p-space-5 text-primary">
    <div className="mx-auto flex max-w-7xl flex-col gap-space-6">
      <header className="flex flex-col gap-space-2">
        <div className="text-xs font-semibold uppercase text-tertiary">
          Design System
        </div>
        <h1 className="text-2xl font-semibold tracking-normal text-primary">
          Semantic Tokens
        </h1>
        <p className="max-w-3xl text-sm text-secondary">
          Our tokens are semantically named, meaning they describe intent rather
          than appearance. Components should use semantic Tailwind classes
          instead of raw color values or primitive CSS variables.
        </p>
      </header>

      <NamingConvention />
      <TokenSection
        title="Surface Tokens"
        description="Use surface levels for neutral hierarchy. Use the lowest level that creates enough separation."
        tokens={surfaceTokens}
      />
      <TokenSection
        title="Brand Tokens"
        description="Use brand tokens for product identity, calls to action, and brand-tinted surfaces."
        tokens={brandTokens}
      />
      <TokenSection
        title="Intent Tokens"
        description="Use intent tokens for feedback semantics. Strong means filled; subtle is the lightest tint."
        tokens={intentTokens}
      />
      <TokenSection
        title="Control and Selected Tokens"
        description="Use control tokens inside form controls. Use selected tokens for persistent selection in rows, menus, and trees."
        tokens={controlTokens}
      />
      <SelectedTokenDemo />
      <TokenSection
        title="Border Tokens"
        description="Use border tokens for separation, focus, and validation states."
        tokens={borderTokens}
        kind="border"
      />
      <TokenSection
        title="Status Border Tokens"
        description="Use status border tokens for run-state and system-state accents."
        tokens={statusBorderTokens}
        kind="border"
      />
      <TokenSection
        title="Text Tokens"
        description="Use text tokens for readable copy and semantic text states."
        tokens={textTokens}
        kind="text"
      />
      <TokenSection
        title="Status Text Tokens"
        description="Use status text tokens for run-state and system-state copy."
        tokens={statusTextTokens}
        kind="text"
      />
      <TokenSection
        title="Icon Tokens"
        description="Use icon tokens when icon color needs to diverge from neighboring text. The underlying variables are named --icon-* but are applied via the text-icon-* classes shown on each swatch."
        tokens={iconTokens}
        kind="text"
      />
      <UtilityTokenSection
        title="Shadow Tokens"
        description="Use shadow tokens for elevation that adapts across light and dark mode."
        tokens={shadowTokens}
        kind="shadow"
      />
      <UtilityTokenSection
        title="Radius Tokens"
        description="Use radius tokens for consistent component shape. The underlying variables are named --radius-* but are applied via the rounded-* classes shown on each swatch."
        tokens={radiusTokens}
        kind="radius"
      />
      <UtilityTokenSection
        title="Duration Tokens"
        description="Use duration tokens for named motion timing decisions."
        tokens={durationTokens}
        kind="duration"
      />
    </div>
  </div>
);

const meta = {
  title: 'Foundations/Tokens',
  component: TokenDocumentation,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Naming strategy and semantic token catalog for LangSmith design system tokens.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TokenDocumentation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => <TokenDocumentation />,
};

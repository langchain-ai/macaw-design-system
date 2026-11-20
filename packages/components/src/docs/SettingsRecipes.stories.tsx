import { createContext, useContext, useId, useState } from 'react';
import type { ReactNode } from 'react';

import { FunnelSimpleIcon } from '@phosphor-icons/react/dist/ssr/FunnelSimple';
import { LockSimpleIcon } from '@phosphor-icons/react/dist/ssr/LockSimple';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { ProhibitIcon } from '@phosphor-icons/react/dist/ssr/Prohibit';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from '../components/Badge';
import { Button } from '../components/Button/Button';
import { ChartCard } from '../components/ChartCard';
import { Dialog, DialogContent } from '../components/Dialog';
import { EmptyState } from '../components/EmptyState';
import { GroupedTabs } from '../components/GroupedTabs/GroupedTabs';
import { IconButton } from '../components/IconButton';
import { Input } from '../components/Input/Input';
import { LinearProgress } from '../components/LinearProgress';
import { Link } from '../components/Link';
import { MetricChart } from '../components/MetricChart';
import { Select } from '../components/Select';
import { Switch } from '../components/Switch';
import { TabGroup, TabLabel, TabList } from '../components/Tabs';
import { Text } from '../components/Text/Text';
import { PlusIcon } from '../icons/PaddedPhosphorIcons';
import { cn } from '../utils/cn';

/**
 * Recipes for LangSmith settings pages, one per layout.
 *
 * The `Settings*` components below are story-only copies of the real
 * primitives in the LangSmith app (Macaw can't import app code). Their class names match the app so the spacing here is the
 * spacing there. When building a page, import the real primitive named in each
 * recipe, not these copies.
 */
const meta: Meta<RecipeArgs> = {
  title: 'Recipes/Settings Pages',
  tags: ['a11y-test'],
  parameters: { layout: 'fullscreen', a11y: { test: 'error' } },
  args: { frame: 'modal' },
  argTypes: {
    frame: {
      control: 'inline-radio',
      options: ['modal', 'page'],
      description:
        'Settings modal (the default home for settings) or a full app page.',
    },
  },
};

export default meta;

type RecipeArgs = { frame: 'modal' | 'page' };
type Story = StoryObj<RecipeArgs>;

const noop = () => {};

// ---------------------------------------------------------------------------
// Frames
// ---------------------------------------------------------------------------

/** True inside the settings modal frame (the app's `useInSettingsFrame`). */
const SettingsFrameContext = createContext(false);

const NAV_GROUPS = [
  {
    heading: 'Organization',
    items: ['General', 'Members', 'Roles', 'API Keys', 'Usage Limits'],
  },
  { heading: 'Workspace', items: ['Webhooks', 'Secrets', 'Data Planes'] },
];

/**
 * The settings modal: sidebar on the left, a padded content pane on the right.
 * `fill` pages bound themselves to the pane so only their table scrolls, and
 * drop the pane's bottom padding so pagination sits on the modal's edge.
 */
function SettingsModalFrame({
  active,
  fill,
  loading,
  children,
}: {
  active: string;
  fill?: boolean;
  loading?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex h-dvh min-h-[40rem] bg-primary p-space-5">
      <div className="flex min-h-0 flex-1 overflow-hidden rounded-lg border border-default bg-surface-level-1 shadow-lg dark:border-subtle">
        <nav
          aria-label="Settings"
          className="flex w-56 shrink-0 flex-col gap-space-4 overflow-y-auto border-r border-subtle bg-sidebar px-space-2 py-space-4 dark:border-muted"
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.heading} className="flex flex-col gap-space-1">
              <Text
                variant="xs"
                color="tertiary"
                weight="medium"
                className="px-space-2"
              >
                {group.heading}
              </Text>
              {group.items.map((item) => (
                <span
                  key={item}
                  aria-current={item === active ? 'page' : undefined}
                  className={cn(
                    'flex h-[26px] items-center rounded-md px-space-2 text-sm',
                    item === active
                      ? 'bg-brand-subtle text-primary'
                      : 'text-secondary'
                  )}
                >
                  {item}
                </span>
              ))}
            </div>
          ))}
        </nav>
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          {loading && (
            <div
              role="status"
              aria-label="Loading"
              className="absolute inset-x-0 top-0"
            >
              <LinearProgress aria-label="Loading" />
            </div>
          )}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto [scrollbar-gutter:stable]">
            <div
              className={cn(
                'flex min-h-full min-w-0 flex-col px-space-4 pt-space-3 @container',
                fill ? 'flex-1' : 'shrink-0 pb-space-7'
              )}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FullPageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-primary p-space-6 @container">
      <div className="mx-auto flex max-w-5xl flex-col">{children}</div>
    </div>
  );
}

function Frame({
  frame,
  active,
  fill,
  loading,
  children,
}: RecipeArgs & {
  active: string;
  fill?: boolean;
  loading?: boolean;
  children: ReactNode;
}) {
  if (frame === 'page')
    return (
      <SettingsFrameContext.Provider value={false}>
        <FullPageFrame>
          {loading && (
            <div role="status" aria-label="Loading">
              <LinearProgress aria-label="Loading" />
            </div>
          )}
          {children}
        </FullPageFrame>
      </SettingsFrameContext.Provider>
    );
  return (
    <SettingsFrameContext.Provider value>
      <SettingsModalFrame active={active} fill={fill} loading={loading}>
        {children}
      </SettingsModalFrame>
    </SettingsFrameContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Primitives (copies of the app's Settings components)
// ---------------------------------------------------------------------------

/** `SettingsPageLayout` in SettingsPage.tsx: header, then content. */
function SettingsPageLayout({
  fill,
  children,
}: {
  fill?: boolean;
  children: ReactNode;
}) {
  const inFrame = useContext(SettingsFrameContext);
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col',
        inFrame ? 'gap-space-3' : 'gap-space-5',
        fill && 'min-h-0 flex-1'
      )}
    >
      {children}
    </div>
  );
}

/**
 * `SettingsPageHeader` in SettingsPage.tsx. In the modal the title and
 * description stack, and one row under them leads with the page's actions,
 * then its toolbar (`SettingsToolbar`). On a full page the actions sit to the
 * right of the title.
 */
function SettingsPageHeader({
  title,
  description,
  docsHref,
  actions,
  toolbar,
  chips,
}: {
  title: string;
  description?: string;
  docsHref?: string;
  actions?: ReactNode;
  toolbar?: ReactNode;
  chips?: ReactNode;
}) {
  const inFrame = useContext(SettingsFrameContext);
  if (inFrame)
    return (
      <div className="flex min-w-0 flex-col gap-space-4">
        <div className="flex min-w-0 flex-col gap-space-1">
          <Text as="h2" variant="h2" className="min-w-0 truncate">
            {title}
          </Text>
          {(description || docsHref) && (
            <Text as="p" variant="sm" color="tertiary">
              {description}
              {description && docsHref && ' '}
              {docsHref && (
                <Link href={docsHref} target="_blank" rel="noreferrer">
                  View docs
                </Link>
              )}
            </Text>
          )}
        </div>
        {(actions || toolbar || chips) && (
          <div className="flex min-w-0 flex-col gap-space-1">
            <div className="flex min-h-7 min-w-0 flex-wrap items-start gap-space-2">
              {actions}
              {toolbar}
            </div>
            {chips && (
              <div className="flex min-w-0 flex-wrap items-center gap-space-2">
                {chips}
              </div>
            )}
          </div>
        )}
      </div>
    );
  return (
    <div className="flex min-w-0 flex-col gap-space-3">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-space-4 gap-y-space-3">
        <div className="flex min-w-0 flex-1 basis-80 flex-col gap-space-1">
          <Text as="h2" variant="h2">
            {title}
          </Text>
          {description && (
            <Text as="p" variant="sm" color="tertiary">
              {description}
            </Text>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-space-2">
            {actions}
          </div>
        )}
      </div>
      {toolbar && (
        <div className="flex min-w-0 flex-wrap items-center gap-space-2">
          {toolbar}
        </div>
      )}
      {chips && (
        <div className="flex min-w-0 flex-wrap items-center gap-space-2">
          {chips}
        </div>
      )}
    </div>
  );
}

/** `SettingsSection` in SettingsPage.tsx: a titled block, one level down. */
function SettingsSection({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className="flex min-w-0 flex-col gap-space-3"
    >
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-space-4 gap-y-space-2">
        <div className="flex min-w-0 flex-1 basis-80 flex-col gap-space-1">
          <Text id={titleId} variant="h3">
            {title}
          </Text>
          {description && (
            <Text as="div" variant="sm" color="tertiary">
              {description}
            </Text>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-space-2">
            {actions}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}

/** `SettingsRowList` in SettingsSwitchRow.tsx: one card of divided rows. */
function SettingsRowList({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col divide-y divide-subtle rounded-lg border border-subtle">
      {children}
    </div>
  );
}

/** `SettingsRow` in SettingsSwitchRow.tsx: name left, control right. */
function SettingsRow({
  label,
  description,
  control,
  controlId,
  labelId,
}: {
  label: ReactNode;
  description?: ReactNode;
  control: ReactNode;
  controlId?: string;
  labelId?: string;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-space-4 gap-y-space-2 p-space-4">
      <div className="flex min-w-0 flex-1 basis-60 flex-col gap-space-1">
        {controlId ? (
          <label htmlFor={controlId} id={labelId}>
            <Text as="span" variant="sm" weight="medium">
              {label}
            </Text>
          </label>
        ) : (
          <Text as="div" id={labelId} variant="sm" weight="medium">
            {label}
          </Text>
        )}
        {description && (
          <Text as="div" variant="sm" color="tertiary">
            {description}
          </Text>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-space-2">{control}</div>
    </div>
  );
}

/** `SettingsSwitchRow` in SettingsSwitchRow.tsx. Saves when toggled. */
function SettingsSwitchRow({
  label,
  description,
  defaultChecked = false,
  disabledReason,
}: {
  label: string;
  description?: ReactNode;
  defaultChecked?: boolean;
  disabledReason?: ReactNode;
}) {
  const id = useId();
  const labelId = `${id}-label`;
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <SettingsRow
      label={label}
      description={
        disabledReason ? (
          <>
            {description && <span className="block">{description}</span>}
            <span className="block">{disabledReason}</span>
          </>
        ) : (
          description
        )
      }
      controlId={id}
      labelId={labelId}
      control={
        <Switch
          id={id}
          aria-labelledby={labelId}
          checked={checked}
          onChange={setChecked}
          disabled={Boolean(disabledReason)}
          size="sm"
        />
      }
    />
  );
}

/** `SettingsPageTabList` in SettingsTabs.tsx: underlined tabs for sub-pages. */
function SettingsPageTabList({
  tabs,
  actions,
}: {
  tabs: string[];
  actions?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 max-w-full shrink-0">
      <div className="min-w-0 max-w-full flex-1 shrink-0 overflow-x-auto">
        <TabList className="h-8 min-w-max gap-space-5 border-subtle dark:border-muted">
          {tabs.map((tab) => (
            <TabLabel
              key={tab}
              label={
                <Text
                  as="span"
                  variant="sm"
                  weight="medium"
                  className="whitespace-nowrap"
                >
                  {tab}
                </Text>
              }
              className="h-full shrink-0 rounded-xs pb-0 text-secondary hover:text-primary data-[focus]:ring-2 data-[focus]:ring-focus data-[focus]:ring-inset data-[selected]:text-primary"
            />
          ))}
        </TabList>
      </div>
      {actions && (
        <div className="flex h-8 shrink-0 items-end gap-space-2 border-b border-subtle pb-space-1 pl-space-2 dark:border-muted">
          {actions}
        </div>
      )}
    </div>
  );
}

/** `SettingsUnavailable` in SettingsUnavailable.tsx. */
function SettingsUnavailable({
  reason,
  title,
  description,
}: {
  reason: 'enterprise' | 'permission' | 'unavailable';
  title: string;
  description?: ReactNode;
}) {
  return (
    <EmptyState
      icon={reason === 'unavailable' ? ProhibitIcon : LockSimpleIcon}
      variant={reason === 'enterprise' ? 'brand' : 'neutral'}
      title={title}
      description={description}
      action={
        reason === 'enterprise' && <Button size="sm">Contact sales</Button>
      }
    />
  );
}

/** `SettingsTermsList` in SettingsTermsList.tsx: long terms under labels. */
function SettingsTermsList({
  terms,
}: {
  terms: { label: string; content: ReactNode }[];
}) {
  return (
    <dl className="flex min-w-0 flex-col gap-space-3 p-space-4">
      {terms.map(({ label, content }) => (
        <div
          key={label}
          className="grid min-w-0 gap-x-space-5 gap-y-space-1 @xl:grid-cols-[6rem_minmax(0,1fr)]"
        >
          <dt>
            <Text as="div" variant="sm" weight="medium">
              {label}
            </Text>
          </dt>
          <dd className="m-0 min-w-0">
            <Text as="div" variant="sm" color="secondary">
              {content}
            </Text>
          </dd>
        </div>
      ))}
    </dl>
  );
}

// ---------------------------------------------------------------------------
// Table (stands in for DataGridV2 with the settings compact defaults)
// ---------------------------------------------------------------------------

type KeyRow = {
  description: string;
  type: 'Personal' | 'Service';
  workspace: string;
  createdBy: string;
  created: string;
};

const KEY_ROWS: KeyRow[] = [
  {
    description: 'CI deploy key',
    type: 'Service',
    workspace: 'Production',
    createdBy: 'ada@example.com',
    created: 'Nov 3, 2026',
  },
  {
    description: 'Local notebook',
    type: 'Personal',
    workspace: 'Default',
    createdBy: 'grace@example.com',
    created: 'Oct 28, 2026',
  },
  {
    description: 'Eval runner',
    type: 'Service',
    workspace: 'Staging',
    createdBy: 'ada@example.com',
    created: 'Oct 12, 2026',
  },
  {
    description: 'Support tooling',
    type: 'Personal',
    workspace: 'Default',
    createdBy: 'linus@example.com',
    created: 'Sep 30, 2026',
  },
];

const KEY_COLUMNS = [
  'Description',
  'Type',
  'Workspace',
  'Created by',
  'Created',
];

/**
 * Settings tables are DataGridV2 with `DataGridBodyDefaults` compact: cell
 * text `xs`, badges `Badge size="sm" rounded="xs"`, row actions as plain icon
 * buttons, and `SettingsCell` so badges don't add row height. In a `fill`
 * page the header sticks and the pagination footer sits on the pane's edge.
 */
function SettingsKeyTable({
  rows,
  empty,
}: {
  rows: KeyRow[];
  empty?: ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-subtle">
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[40rem] border-collapse text-left">
          <thead className="sticky top-0 bg-surface-level-1">
            <tr className="border-b border-subtle">
              {KEY_COLUMNS.map((column) => (
                <th key={column} scope="col" className="h-8 px-space-2">
                  <Text as="span" variant="xs" color="tertiary">
                    {column}
                  </Text>
                </th>
              ))}
              <th scope="col" className="h-8 w-16 px-space-2">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.description}
                className="h-9 border-b border-subtle last:border-b-0 hover:bg-surface-level-2"
              >
                <td className="px-space-2">
                  <Text as="span" variant="xs">
                    {row.description}
                  </Text>
                </td>
                <td className="px-space-2">
                  <Badge size="sm" rounded="xs" color="secondary">
                    {row.type}
                  </Badge>
                </td>
                <td className="px-space-2">
                  <Text as="span" variant="xs">
                    {row.workspace}
                  </Text>
                </td>
                <td className="px-space-2">
                  <Text as="span" variant="xs">
                    {row.createdBy}
                  </Text>
                </td>
                <td className="px-space-2">
                  <Text as="span" variant="xs" color="secondary">
                    {row.created}
                  </Text>
                </td>
                <td className="px-space-2">
                  <IconButton
                    icon={TrashIcon}
                    label={`Delete ${row.description}`}
                    variant="plain"
                    color="secondary"
                    size="xs"
                    onClick={noop}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && empty}
      </div>
      {rows.length > 0 && (
        <div className="flex shrink-0 items-center justify-between border-t border-subtle px-space-3 py-space-2">
          <Text variant="xs" color="tertiary">
            1-{rows.length} of {rows.length}
          </Text>
          <div className="flex gap-space-1">
            <Button size="xs" variant="outlined" color="secondary" disabled>
              Previous
            </Button>
            <Button size="xs" variant="outlined" color="secondary" disabled>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SearchInput({ label }: { label: string }) {
  const [value, setValue] = useState('');
  return (
    <Input
      size="sm"
      aria-label={label}
      placeholder="Search"
      leftIcon={MagnifyingGlassIcon}
      value={value}
      onChange={setValue}
      className="w-48"
    />
  );
}

/** Chip for an active filter: one per field, opens that field's checklist. */
function FilterChip({ children }: { children: string }) {
  return (
    <Button size="xs" variant="outlined" color="secondary">
      {children}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Recipes
// ---------------------------------------------------------------------------

/**
 * **CTA + table.** One primary action first in the header (`sm`, noun-only
 * label in Title Case with a plus icon: "API Key", not "Add API key"), then the toolbar:
 * search, then one Filter popover when the table has 2+ filter fields
 * (`SettingsFilterBar`). Active filters show as chips on their own row.
 * `SettingsPageLayout fill` so only the table scrolls.
 *
 * Real primitives: `SettingsPageLayout`, `SettingsPageHeader` (`actions`),
 * `SettingsToolbar`, `SettingsFilterBar`, DataGridV2 + `SettingsCell`.
 */
export const CtaTable: Story = {
  name: 'CTA + table',
  parameters: {
    // Macaw Link's text-link (#0078f1) is 4.23:1 on white at 14px, under
    // 4.5:1. Token issue; skip only the link, keep the check everywhere else.
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', selector: '*:not(.text-link)' }],
      },
    },
  },
  render: ({ frame }) => (
    <Frame frame={frame} active="API Keys" fill>
      <SettingsPageLayout fill>
        <SettingsPageHeader
          title="API Keys"
          description="You can only see a key when you create it. If you lose one, create a new one."
          docsHref="https://docs.langchain.com"
          actions={
            <Button size="sm" leftDecorator={PlusIcon}>
              API Key
            </Button>
          }
          toolbar={
            <>
              <SearchInput label="Search API keys" />
              <Button
                size="sm"
                variant="outlined"
                color="secondary"
                leftDecorator={FunnelSimpleIcon}
              >
                Filter
              </Button>
            </>
          }
          chips={<FilterChip>Type is Service</FilterChip>}
        />
        <SettingsKeyTable rows={KEY_ROWS} />
      </SettingsPageLayout>
    </Frame>
  ),
};

const RETENTION_OPTIONS = [
  { value: 'base', label: 'Base (default)' },
  { value: 'extended', label: 'Extended' },
];

function WorkspaceNameRow() {
  const id = useId();
  const [name, setName] = useState('LangSmith');
  return (
    <SettingsRow
      label="Organization name"
      description="Shown to members and on invoices."
      controlId={id}
      control={
        <Input
          id={id}
          size="sm"
          value={name}
          onChange={setName}
          className="w-60"
        />
      }
    />
  );
}

function RetentionRow() {
  const [value, setValue] = useState<string | undefined>('base');
  return (
    <SettingsRow
      label="Default retention tier"
      description="Applies to new traces in every workspace."
      control={
        <Select
          size="sm"
          aria-label="Default retention tier"
          options={RETENTION_OPTIONS}
          value={value}
          onChange={setValue}
          hideSearch
          triggerClassName="w-60"
        />
      }
    />
  );
}

/**
 * **Form (rows).** Settings as divided cards, label and description on the
 * left, one `sm` control on the right (selects and inputs `w-60`). Every row
 * saves on its own: switches and selects on change, short inputs on Enter or
 * blur. No Save button. Groups get a `SettingsSection` heading and space, no
 * divider between groups (`gap-space-7`). The column is left-aligned at
 * `max-w-2xl`. Prefer a
 * dropdown over radios.
 *
 * Exception: sets of values and security- or cost-sensitive values use an
 * explicit Save inside the card, shown only when dirty.
 *
 * Real primitives: `SettingsSection`, `SettingsRowList`, `SettingsRow`,
 * `SettingsSwitchRow`, `SettingsTermsList`.
 */
export const FormRows: Story = {
  name: 'Form (rows)',
  render: ({ frame }) => (
    <Frame frame={frame} active="General">
      <SettingsPageLayout>
        <SettingsPageHeader
          title="General"
          description="Organization details and defaults."
        />
        <div className="flex w-full min-w-0 max-w-2xl flex-col gap-space-7">
          <SettingsSection title="Organization">
            <SettingsRowList>
              <WorkspaceNameRow />
              <SettingsSwitchRow
                label="Public sharing"
                description="Members can share traces and datasets with a public link."
                defaultChecked
              />
              <SettingsSwitchRow
                label="Personal access tokens"
                description="Members can create keys tied to their own account."
                disabledReason="Turned off by your SSO policy."
              />
            </SettingsRowList>
          </SettingsSection>
          <SettingsSection title="Data Retention">
            <SettingsRowList>
              <RetentionRow />
              <SettingsTermsList
                terms={[
                  { label: 'Base', content: '14 days. Included in your plan.' },
                  {
                    label: 'Extended',
                    content:
                      '400 days. Billed per trace. Upgrading existing traces asks for confirmation.',
                  },
                ]}
              />
            </SettingsRowList>
          </SettingsSection>
        </div>
      </SettingsPageLayout>
    </Frame>
  ),
};

/**
 * **Stacked sections.** A page made of independent blocks, each a
 * `SettingsSection` with its own heading, optional `sm` actions, and a card.
 * Sections are separated by space (`gap-space-7`), not dividers.
 */
export const StackedSections: Story = {
  render: ({ frame }) => (
    <Frame frame={frame} active="Data Planes">
      <SettingsPageLayout>
        <SettingsPageHeader
          title="Data Planes"
          description="Where your workspaces store and process trace data."
          actions={
            <Button size="sm" leftDecorator={PlusIcon}>
              Data Plane
            </Button>
          }
        />
        <div className="flex w-full min-w-0 max-w-2xl flex-col gap-space-7">
          <SettingsSection
            title="Active"
            description="Workspaces send new data here."
          >
            <SettingsRowList>
              {['us-east-1', 'eu-west-1'].map((region) => (
                <SettingsRow
                  key={region}
                  label={region}
                  description="3 workspaces"
                  control={
                    <Button size="sm" variant="outlined" color="secondary">
                      Settings
                    </Button>
                  }
                />
              ))}
            </SettingsRowList>
          </SettingsSection>
          <SettingsSection title="Time to Live">
            <SettingsRowList>
              <SettingsSwitchRow
                label="Expire idle data planes"
                description="Delete a data plane after 30 days without traffic."
              />
            </SettingsRowList>
          </SettingsSection>
        </div>
      </SettingsPageLayout>
    </Frame>
  ),
};

/**
 * **Tabs (sub-pages).** A settings group whose pages share one title. The
 * group title sits above underlined tabs; each tab is its own page with its
 * own description and actions under the tab row. Tabs mean sub-pages: don't
 * put tabs inside a table page to filter it.
 *
 * Real primitives: `SettingsGroupedPage`, with
 * `SettingsPageTabList`.
 */
export const GroupedTabsPage: Story = {
  name: 'Tabs (sub-pages)',
  render: ({ frame }) => (
    <Frame frame={frame} active="Webhooks" fill>
      <SettingsPageLayout fill>
        <TabGroup className="flex min-h-0 flex-1 flex-col gap-space-3">
          <div className="flex min-w-0 flex-col gap-space-4">
            <Text as="h2" variant="h2">
              Webhooks
            </Text>
            <SettingsPageTabList tabs={['Destinations', 'Configurations']} />
          </div>
          <div className="flex min-w-0 flex-col gap-space-4">
            <Text as="p" variant="sm" color="tertiary">
              Endpoints that receive events from this workspace.
            </Text>
            <div className="flex flex-wrap items-start gap-space-2">
              <Button size="sm" leftDecorator={PlusIcon}>
                Webhook
              </Button>
              <SearchInput label="Search webhooks" />
            </div>
          </div>
          <SettingsKeyTable rows={KEY_ROWS.slice(0, 2)} />
        </TabGroup>
      </SettingsPageLayout>
    </Frame>
  ),
};

/**
 * **Views.** One page whose content splits into views of the same thing
 * (Usage Limits by Organization / Workspaces / Projects). Stored in `?view=`.
 * Segmented `GroupedTabs` when the page already sits under a tab list,
 * underlined tabs otherwise. A single filter with a small fixed set of values
 * also uses `GroupedTabs`; a single long list uses a labelled dropdown.
 *
 * Real primitives: `SettingsViewTabs`, `useSettingsView`.
 */
export const Views: Story = {
  render: function Render({ frame }) {
    const [view, setView] = useState('organization');
    return (
      <Frame frame={frame} active="Usage Limits">
        <SettingsPageLayout>
          <SettingsPageHeader
            title="Monthly Usage Limits"
            actions={
              <GroupedTabs
                size="sm"
                value={view}
                onChange={setView}
                options={[
                  { value: 'organization', display: 'Organization' },
                  { value: 'workspaces', display: 'Workspaces' },
                  { value: 'projects', display: 'Projects' },
                ]}
              />
            }
          />
          <div className="flex w-full min-w-0 max-w-2xl flex-col gap-space-7">
            <SettingsRowList>
              <SettingsRow
                label="Default trace limit"
                description="Applies to workspaces without their own limit."
                control={
                  <Input
                    size="sm"
                    aria-label="Default trace limit"
                    value="1,000,000"
                    onChange={noop}
                    className="w-60"
                  />
                }
              />
            </SettingsRowList>
          </div>
        </SettingsPageLayout>
      </Frame>
    );
  },
};

function EditProviderDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [url, setUrl] = useState('https://idp.example.com/metadata');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Edit identity provider"
        description="Changes apply the next time members sign in."
      >
        <Input
          size="sm"
          label="SAML metadata URL"
          value={url}
          onChange={setUrl}
        />
        <div className="flex items-center gap-space-2">
          <Button size="sm" variant="plain" color="error">
            Delete
          </Button>
          <div className="flex-1" />
          <Button
            size="sm"
            variant="outlined"
            color="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * **Row + dialog.** A multi-field object (an identity provider, a GitLab
 * connection) is one row in the card with an Edit or Set up button. The dialog
 * has one Save, sends only changed fields, and puts Delete on the left of the
 * footer. Inside a Dialog or Pane, show loading with `LinearProgress`, not
 * `SettingsPageLoading` (it portals to the page and lands behind the overlay).
 *
 * Real primitives: `SettingsRow` + Macaw `Dialog`; side panes use
 * `SettingsPane` / `SettingsDetailPane`.
 */
export const RowDialog: Story = {
  name: 'Row + dialog',
  render: function Render({ frame }) {
    const [open, setOpen] = useState(false);
    return (
      <Frame frame={frame} active="General">
        <SettingsPageLayout>
          <SettingsPageHeader title="SSO" />
          <div className="flex w-full min-w-0 max-w-2xl flex-col gap-space-7">
            <SettingsSection title="Identity Provider">
              <SettingsRowList>
                <SettingsRow
                  label="Okta (SAML)"
                  description="idp.example.com"
                  control={
                    <Button
                      size="sm"
                      variant="outlined"
                      color="secondary"
                      leftDecorator={PencilSimpleIcon}
                      onClick={() => setOpen(true)}
                    >
                      Edit
                    </Button>
                  }
                />
                <SettingsSwitchRow
                  label="Groups sync"
                  description="Assign roles from identity provider groups."
                />
              </SettingsRowList>
            </SettingsSection>
          </div>
          <EditProviderDialog open={open} onOpenChange={setOpen} />
        </SettingsPageLayout>
      </Frame>
    );
  },
};

/**
 * **Stats.** Several stats or charts form one continuous card: ChartCards edge
 * to edge, `border-l-0` on later cards in a row, `border-t-0` on a chart
 * below. Use Macaw `ChartCard` + `MetricChart`; don't build a stat primitive.
 * Don't add totals or claims the API doesn't return.
 */
export const Stats: Story = {
  render: ({ frame }) => (
    <Frame frame={frame} active="Usage Limits">
      <SettingsPageLayout>
        <SettingsPageHeader
          title="Credit Usage"
          description="Usage for the current billing period."
        />
        <div className="grid min-w-0 @xl:grid-cols-3">
          {[
            { title: 'Traces', value: '1,248,392' },
            { title: 'Deployments', value: '12' },
            { title: 'Sandboxes', value: '3,402' },
          ].map((stat, index) => (
            <ChartCard
              key={stat.title}
              title={stat.title}
              className={cn(
                'rounded-none first:rounded-l-lg last:rounded-r-lg',
                index > 0 && '@xl:border-l-0'
              )}
            >
              <MetricChart value={stat.value} className="flex-1" />
            </ChartCard>
          ))}
        </div>
      </SettingsPageLayout>
    </Frame>
  ),
};

/**
 * **Empty.** The page keeps its header and CTA; the table area shows a
 * centered `EmptyState` (`SettingsPageLayout fill` centers it in the pane).
 * Name the thing: "No API keys yet".
 */
export const Empty: Story = {
  render: ({ frame }) => (
    <Frame frame={frame} active="API Keys" fill>
      <SettingsPageLayout fill>
        <SettingsPageHeader
          title="API Keys"
          description="You can only see a key when you create it. If you lose one, create a new one."
          actions={
            <Button size="sm" leftDecorator={PlusIcon}>
              API Key
            </Button>
          }
        />
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            title="No API keys yet"
            description="Create a key to send traces from your code."
          />
        </div>
      </SettingsPageLayout>
    </Frame>
  ),
};

/**
 * **Loading.** `SettingsPageLoading` pins a `LinearProgress` to the top edge of
 * the modal's content pane, clear of the padding; on a full page it renders in
 * place. Keep the header visible while the body loads.
 */
export const Loading: Story = {
  render: ({ frame }) => (
    <Frame frame={frame} active="Members" loading>
      <SettingsPageLayout>
        <SettingsPageHeader
          title="Members"
          description="People in this organization and their roles."
        />
      </SettingsPageLayout>
    </Frame>
  ),
};

/**
 * **Unavailable.** `SettingsUnavailable` replaces the page's content under its
 * own header, so the title still says where the viewer is.
 * `enterprise`: plan doesn't include it (brand, Contact sales).
 * `permission`: role can't see it; say who can grant access.
 * `unavailable`: deployment doesn't support it, such as self-hosted.
 */
export const Unavailable: Story = {
  render: ({ frame }) => (
    <Frame frame={frame} active="Roles">
      <SettingsPageLayout>
        <SettingsPageHeader
          title="Roles"
          description="Custom roles control what members can do in each workspace."
        />
        <div className="flex flex-col gap-space-6">
          <SettingsUnavailable
            reason="enterprise"
            title="Custom roles are on Enterprise"
            description="Create roles with exactly the permissions each team needs."
          />
          <SettingsUnavailable
            reason="permission"
            title="You don't have access to roles"
            description="Ask an organization admin for access."
          />
          <SettingsUnavailable
            reason="unavailable"
            title="Roles aren't available on this deployment"
          />
        </div>
      </SettingsPageLayout>
    </Frame>
  ),
};

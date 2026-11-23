import { createContext, useContext, useId, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { CaretUpDownIcon } from '@phosphor-icons/react/dist/ssr/CaretUpDown';
import { CopySimpleIcon } from '@phosphor-icons/react/dist/ssr/CopySimple';
import { DatabaseIcon } from '@phosphor-icons/react/dist/ssr/Database';
import { FunnelSimpleIcon } from '@phosphor-icons/react/dist/ssr/FunnelSimple';
import { KeyIcon } from '@phosphor-icons/react/dist/ssr/Key';
import { LockSimpleIcon } from '@phosphor-icons/react/dist/ssr/LockSimple';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { ProhibitIcon } from '@phosphor-icons/react/dist/ssr/Prohibit';
import { SignOutIcon } from '@phosphor-icons/react/dist/ssr/SignOut';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { BarChart, type BarChartSeries } from '../components/BarChart';
import { Button } from '../components/Button/Button';
import { ChartCard } from '../components/ChartCard';
import { Checkbox } from '../components/Checkbox';
import { Dialog, DialogContent } from '../components/Dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/DropdownMenu';
import { EmptyState } from '../components/EmptyState';
import { GroupedTabs } from '../components/GroupedTabs/GroupedTabs';
import { Icon } from '../components/Icon';
import { IconButton } from '../components/IconButton';
import { Input } from '../components/Input/Input';
import { LinearProgress } from '../components/LinearProgress';
import { LineChart, type LineChartSeries } from '../components/LineChart';
import { Link } from '../components/Link';
import { MetricChart } from '../components/MetricChart';
import { Popover, PopoverContent, PopoverTrigger } from '../components/Popover';
import { Select } from '../components/Select';
import { Switch } from '../components/Switch';
import { TabGroup, TabLabel, TabList } from '../components/Tabs';
import { Text } from '../components/Text/Text';
import { Textarea } from '../components/Textarea/Textarea';
import {
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  PlusIcon,
  XIcon,
} from '../icons/PaddedPhosphorIcons';
import { cn } from '../utils/cn';

/**
 * Recipes for LangSmith settings pages, one per layout. Each story shows the
 * settings modal by default; switch `frame` to see the same page full screen.
 *
 * The `Settings*` components here are story-only copies of the app's settings
 * components (Macaw can't import app code). Their class names match the app,
 * so the spacing here is the spacing there. Build pages with the real ones.
 */
const meta: Meta<RecipeArgs> = {
  title: 'Foundations/Settings Pages',
  tags: ['a11y-test'],
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
      // Two contrast gaps come from tokens, not the recipes: Macaw Link's
      // text-link (#0078f1) is 4.23:1 on white, and the app's quaternary nav
      // headings are 4.3:1 on bg-sidebar. Skip only those; check the rest.
      config: {
        rules: [
          {
            id: 'color-contrast',
            selector: '*:not(.text-link):not(.recipe-nav-heading)',
          },
        ],
      },
    },
  },
  args: { frame: 'modal' },
  argTypes: {
    frame: {
      control: 'inline-radio',
      options: ['modal', 'page'],
      description: 'Settings modal (where settings live) or a full app page.',
    },
  },
};

export default meta;

type RecipeArgs = {
  frame: 'modal' | 'page';
  filterFields?: 'Several fields' | 'One small set';
  emptyKind?: 'First run' | 'No matches';
  reason?: 'enterprise' | 'permission' | 'unavailable';
};
type Story = StoryObj<RecipeArgs>;

const noop = () => {};

// ---------------------------------------------------------------------------
// Recipe note: when to use the layout, shown above every recipe
// ---------------------------------------------------------------------------

function RecipeNote({ children }: { children: string }) {
  return (
    <Text as="p" variant="sm" color="secondary" className="shrink-0">
      {children}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Settings modal frame (sidebar + content pane)
// ---------------------------------------------------------------------------

/** True inside the settings modal frame (the app's `useInSettingsFrame`). */
const SettingsFrameContext = createContext(false);

type NavGroup = { heading?: string; items: string[] };

const ORGANIZATION_NAV: NavGroup[] = [
  {
    heading: 'Access and Security',
    items: [
      'API Keys',
      'Members',
      'Roles',
      'Access Policies',
      'Security Policies',
      'SSO',
    ],
  },
  { heading: 'Infrastructure', items: ['Data Planes'] },
  { heading: 'Billing', items: ['Plans and Pricing', 'Credit Usage'] },
  { heading: 'Usage', items: ['Usage Limits', 'Data Retention'] },
];

const WORKSPACE_NAV: NavGroup[] = [
  {
    heading: 'Configuration',
    items: ['General', 'Resource Tags', 'Shared Links'],
  },
  { heading: 'Integrations', items: ['Webhooks', 'MCP Servers'] },
];

/** Nav row: `OrgSettingsTabLink` with the app's `navItemClasses`. */
function NavItem({
  active,
  leading,
  children,
}: {
  active?: boolean;
  leading?: ReactNode;
  children: string;
}) {
  return (
    <span
      aria-current={active ? 'page' : undefined}
      className={cn(
        '-mx-space-2 flex h-[1.625rem] min-w-0 items-center gap-space-2 rounded-sm px-space-2',
        active
          ? 'bg-brand-subtle text-brand-primary'
          : 'text-primary hover:bg-sidebar-hover dark:hover:bg-brand-muted dark:hover:text-brand-primary'
      )}
    >
      {leading}
      <Text as="span" variant="xs" weight="medium" className="min-w-0 truncate">
        {children}
      </Text>
    </span>
  );
}

/** The settings modal sidebar: search, scope switch, org picker, links, profile. */
function SettingsSidebar({ active }: { active: string }) {
  const inWorkspace = WORKSPACE_NAV.some((group) =>
    group.items.includes(active)
  );
  const [scope, setScope] = useState<'Organization' | 'Workspace'>(
    inWorkspace ? 'Workspace' : 'Organization'
  );
  const [query, setQuery] = useState('');
  const groups = scope === 'Workspace' ? WORKSPACE_NAV : ORGANIZATION_NAV;
  return (
    <div className="flex min-h-0 w-64 shrink-0 flex-col overflow-hidden border-r border-subtle bg-sidebar max-md:w-48 dark:border-muted">
      <nav
        aria-label="Settings"
        className="flex min-h-0 flex-1 flex-col items-stretch overflow-hidden text-xs"
      >
        <div className="shrink-0 px-space-4 pt-space-3">
          <Input
            size="sm"
            aria-label="Search settings"
            placeholder="Search..."
            leftIcon={MagnifyingGlassIcon}
            value={query}
            onChange={setQuery}
          />
        </div>
        <div
          role="group"
          aria-label="Settings scope"
          className="shrink-0 px-space-4 pt-space-3"
        >
          <GroupedTabs<'Organization' | 'Workspace'>
            size="sm"
            className="w-full"
            value={scope}
            onChange={setScope}
            options={[
              {
                value: 'Organization',
                display: 'Organization',
                className: 'min-w-0 flex-1 justify-center',
              },
              {
                value: 'Workspace',
                display: 'Workspace',
                className: 'min-w-0 flex-1 justify-center',
              },
            ]}
          />
        </div>
        <div className="shrink-0 px-space-4 pt-space-2">
          <div className="-ml-space-2 flex min-w-0 items-center gap-space-2">
            <button
              type="button"
              className="flex h-8 min-w-0 flex-1 items-center justify-between gap-space-2 rounded-sm px-space-2 hover:bg-sidebar-hover dark:hover:bg-brand-muted"
            >
              <span className="flex min-w-0 flex-1 items-center gap-space-2">
                <span aria-hidden className="flex">
                  <Avatar
                    size="sm"
                    shape="square"
                    label={
                      scope === 'Organization' ? 'LangChain' : 'Production'
                    }
                  />
                </span>
                <Text
                  as="span"
                  variant="sm"
                  weight="semibold"
                  className="min-w-0 truncate"
                >
                  <span className="sr-only">
                    Select {scope.toLowerCase()}:{' '}
                  </span>
                  {scope === 'Organization' ? 'LangChain' : 'Production'}
                </Text>
              </span>
              <Icon
                icon={CaretUpDownIcon}
                size="sm"
                className="flex-none text-icon-tertiary"
              />
            </button>
            <IconButton
              icon={CopySimpleIcon}
              label={`Copy ${scope.toLowerCase()} ID`}
              variant="plain"
              color="secondary"
              size="sm"
              onClick={noop}
            />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-space-5 overflow-y-auto px-space-4 pb-space-4 pt-space-5">
          {groups.map((group) => (
            <div
              key={group.heading}
              role="group"
              aria-label={group.heading}
              className="flex flex-col items-stretch gap-space-1"
            >
              {group.heading && (
                <Text
                  as="h3"
                  variant="xs"
                  weight="normal"
                  color="quaternary"
                  className="recipe-nav-heading"
                >
                  {group.heading}
                </Text>
              )}
              {group.items.map((item) => (
                <NavItem key={item} active={item === active}>
                  {item}
                </NavItem>
              ))}
            </div>
          ))}
        </div>
      </nav>
      <nav
        aria-label="Personal settings"
        className="flex h-[2.5625rem] shrink-0 items-center gap-space-2 border-t border-subtle px-space-4"
      >
        <div className="min-w-0 flex-1">
          <NavItem
            active={active === 'My Account'}
            leading={<Avatar size="sm" shape="circle" label="Ada Lovelace" />}
          >
            Ada Lovelace
          </NavItem>
        </div>
        <IconButton
          icon={SignOutIcon}
          label="Log out"
          variant="plain"
          color="secondary"
          size="sm"
          onClick={noop}
        />
      </nav>
    </div>
  );
}

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
    <div className="flex min-h-0 flex-1 overflow-hidden rounded-lg border border-default bg-surface-level-1 shadow-lg dark:border-subtle">
      <SettingsSidebar active={active} />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        {loading && (
          <div className="absolute inset-x-0 top-0">
            <LinearProgress aria-label="Loading" />
          </div>
        )}
        <div className="mt-space-3 flex min-h-6 shrink-0 items-center gap-space-1 px-space-4">
          <IconButton
            icon={CaretLeftIcon}
            label="Back"
            variant="plain"
            color="secondary"
            size="xs"
            onClick={noop}
          />
          <IconButton
            icon={CaretRightIcon}
            label="Forward"
            variant="plain"
            color="secondary"
            size="xs"
            disabled
            onClick={noop}
          />
          <div className="flex-1" />
          <div className="-mr-space-1 flex shrink-0">
            <IconButton
              icon={XIcon}
              label="Close settings"
              variant="plain"
              color="secondary"
              size="xs"
              onClick={noop}
            />
          </div>
        </div>
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
  );
}

function Frame({
  frame,
  active,
  fill,
  loading,
  note,
  children,
}: Pick<RecipeArgs, 'frame'> & {
  active: string;
  fill?: boolean;
  loading?: boolean;
  note: ReactNode;
  children: ReactNode;
}) {
  if (frame === 'page')
    return (
      <SettingsFrameContext.Provider value={false}>
        <div className="flex min-h-dvh flex-col gap-space-5 bg-primary p-space-5">
          {note}
          <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col @container">
            {loading && <LinearProgress aria-label="Loading" />}
            {children}
          </div>
        </div>
      </SettingsFrameContext.Provider>
    );
  return (
    <SettingsFrameContext.Provider value>
      <div className="flex h-dvh min-h-[44rem] flex-col gap-space-3 bg-primary p-space-5">
        {note}
        <SettingsModalFrame active={active} fill={fill} loading={loading}>
          {children}
        </SettingsModalFrame>
      </div>
    </SettingsFrameContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Page primitives (copies of the app's Settings components)
// ---------------------------------------------------------------------------

/** `SettingsPageLayout`: header, then content. */
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
 * `SettingsPageHeader`. In the modal the title and description stack, and one
 * row under them leads with the page actions, then the toolbar; filter chips
 * get their own row. On a full page the actions sit right of the title.
 */
function SettingsPageHeader({
  title,
  description,
  docsHref,
  actions,
  toolbar,
  chips,
}: {
  title?: string;
  description?: string;
  docsHref?: string;
  actions?: ReactNode;
  toolbar?: ReactNode;
  chips?: ReactNode;
}) {
  const inFrame = useContext(SettingsFrameContext);
  const intro = (description || docsHref) && (
    <Text as="p" variant="sm" color="tertiary">
      {description}
      {description && docsHref && ' '}
      {docsHref && (
        <Link href={docsHref} target="_blank" rel="noreferrer" variant="sm">
          View docs
        </Link>
      )}
    </Text>
  );
  if (inFrame)
    return (
      <div className="flex min-w-0 flex-col gap-space-4">
        {(title || intro) && (
          <div className="flex min-w-0 flex-col gap-space-1">
            {title && (
              <Text as="h2" variant="h2" className="min-w-0 truncate">
                {title}
              </Text>
            )}
            {intro}
          </div>
        )}
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
          {title && (
            <Text as="h2" variant="h2">
              {title}
            </Text>
          )}
          {intro}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-space-2">
            {actions}
          </div>
        )}
      </div>
      {(toolbar || chips) && (
        <div className="flex min-w-0 flex-wrap items-center gap-space-2">
          {toolbar}
          {chips}
        </div>
      )}
    </div>
  );
}

/** `SettingsSection`: a titled block one heading level below the page. */
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

/** `SettingsRowList`: one card of divided rows. */
function SettingsRowList({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col divide-y divide-subtle rounded-lg border border-subtle">
      {children}
    </div>
  );
}

/** `SettingsRow`: name and description left, controls right. */
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

/** `SettingsSwitchRow`: saves when toggled. */
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

/** `SettingsPageTabList`: underlined tabs on their own row. */
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

/** `SettingsTermsList`: long terms under short labels, inside a card. */
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

/** Centers a single state in the page's remaining height. */
function CenteredState({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-80 flex-1 items-center justify-center">
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table and filters
// ---------------------------------------------------------------------------

type KeyRow = {
  description: string;
  type: string;
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
  {
    description: 'Nightly backfill',
    type: 'Service',
    workspace: 'Production',
    createdBy: 'grace@example.com',
    created: 'Sep 12, 2026',
  },
];

type FilterKey = 'type' | 'workspace' | 'createdBy';
type FilterValues = Partial<Record<FilterKey, string[]>>;

const FILTER_FIELDS: { key: FilterKey; label: string; options: string[] }[] = [
  { key: 'type', label: 'Type', options: ['Personal', 'Service'] },
  {
    key: 'workspace',
    label: 'Workspace',
    options: ['Default', 'Production', 'Staging'],
  },
  {
    key: 'createdBy',
    label: 'Created by',
    options: ['ada@example.com', 'grace@example.com', 'linus@example.com'],
  },
];

function filterRows(rows: KeyRow[], values: FilterValues, query: string) {
  return rows.filter(
    (row) =>
      row.description.toLowerCase().includes(query.trim().toLowerCase()) &&
      FILTER_FIELDS.every(({ key }) => {
        const selected = values[key] ?? [];
        return selected.length === 0 || selected.includes(row[key]);
      })
  );
}

/**
 * The "Filter" popover (`SettingsFilterBar`): pick a field, then a value.
 * Picking applies the filter and closes the popover; there's no Apply button.
 */
function FilterButton({
  values,
  onChange,
}: {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
}) {
  const [open, setOpen] = useState(false);
  const [fieldKey, setFieldKey] = useState<FilterKey>('type');
  const field =
    FILTER_FIELDS.find(({ key }) => key === fieldKey) ?? FILTER_FIELDS[0];
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outlined"
          color="secondary"
          leftDecorator={FunnelSimpleIcon}
        >
          Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        aria-label="Add filter"
        className="w-auto min-w-60 max-w-[min(30rem,calc(100vw-2rem))]"
      >
        <div className="flex items-center gap-x-space-2">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outlined"
                color="secondary"
                rightDecorator={CaretDownIcon}
                aria-label={`Field: ${field.label}`}
                className="shrink-0"
              >
                {field.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {FILTER_FIELDS.map(({ key, label }) => (
                <DropdownMenuItem
                  key={key}
                  size="sm"
                  onSelect={() => setFieldKey(key)}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Text as="span" variant="sm" color="secondary">
            is
          </Text>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outlined"
                color="secondary"
                aria-label={`${field.label} value`}
                className="min-w-0 max-w-[12.5rem] text-tertiary"
              >
                Value
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {field.options.map((option) => (
                <DropdownMenuItem
                  key={option}
                  size="sm"
                  onSelect={() => {
                    const current = values[field.key] ?? [];
                    onChange({
                      ...values,
                      [field.key]: current.includes(option)
                        ? current
                        : [...current, option],
                    });
                    setOpen(false);
                  }}
                >
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * One chip per field: "Type is Service", or "Workspace is any of 2" with
 * several values. The chip opens a checklist of that field's values.
 */
function FilterChips({
  values,
  onChange,
}: {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
}) {
  return FILTER_FIELDS.map((field) => {
    const selected = values[field.key] ?? [];
    if (selected.length === 0) return null;
    const setSelected = (next: string[]) =>
      onChange({ ...values, [field.key]: next });
    return (
      <span
        key={field.key}
        className="inline-flex h-6 items-center rounded-sm border border-default bg-surface-level-1"
      >
        <Popover>
          <PopoverTrigger className="flex h-full items-center gap-space-1 rounded-l-sm pl-space-2 pr-space-1 hover:bg-surface-level-2">
            <Text as="span" variant="sm" color="secondary">
              {field.label} {selected.length > 1 ? 'is any of' : 'is'}
            </Text>
            <Text as="span" variant="sm" weight="medium">
              {selected.length > 1 ? selected.length : selected[0]}
            </Text>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            aria-label={`${field.label} values`}
            className="flex w-auto min-w-60 flex-col gap-space-2"
          >
            {field.options.map((option) => (
              <Checkbox
                key={option}
                label={option}
                checked={selected.includes(option)}
                onCheckedChange={(checked) =>
                  setSelected(
                    checked
                      ? [...selected, option]
                      : selected.filter((value) => value !== option)
                  )
                }
              />
            ))}
          </PopoverContent>
        </Popover>
        <IconButton
          icon={XIcon}
          label={`Remove ${field.label} filter`}
          variant="plain"
          color="secondary"
          size="xs"
          onClick={() => setSelected([])}
        />
      </span>
    );
  });
}

/**
 * Settings tables are DataGridV2 with the compact settings defaults: `xs` cell
 * text, `Badge size="sm" rounded="xs"`, plain icon-button row actions, a
 * sticky header, and a pagination footer on the pane's edge.
 */
function SettingsKeyTable({
  rows,
  empty,
}: {
  rows: KeyRow[];
  empty?: ReactNode;
}) {
  return (
    <div
      role="region"
      aria-label="API keys"
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-subtle"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        <table className="w-full min-w-[40rem] border-collapse text-left">
          <thead className="sticky top-0 bg-surface-level-1">
            <tr className="border-b border-subtle">
              {[
                'Description',
                'Type',
                'Workspace',
                'Created by',
                'Created',
              ].map((column) => (
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
                  <Text as="span" variant="xs" color="tertiary">
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

function SearchInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Input
      size="sm"
      aria-label={label}
      placeholder="Search"
      leftIcon={MagnifyingGlassIcon}
      value={value}
      onChange={onChange}
      className="w-48"
    />
  );
}

const API_KEYS_DESCRIPTION =
  'Keys are shown once, when created. Store them somewhere safe.';

function NoMatchingKeys({ onClear }: { onClear: () => void }) {
  return (
    <CenteredState>
      <EmptyState
        icon={MagnifyingGlassIcon}
        title="No matching API keys"
        description="Try a different search or filter."
        action={
          <Button
            size="sm"
            variant="outlined"
            color="secondary"
            onClick={onClear}
          >
            Clear filters
          </Button>
        }
      />
    </CenteredState>
  );
}

// ---------------------------------------------------------------------------
// Recipes
// ---------------------------------------------------------------------------

function CtaTableRecipe({ frame, filterFields }: RecipeArgs) {
  const [query, setQuery] = useState('');
  const [values, setValues] = useState<FilterValues>({});
  const [type, setType] = useState('all');
  const rows = useMemo(
    () =>
      filterRows(
        KEY_ROWS,
        filterFields === 'One small set'
          ? { type: type === 'all' ? [] : [type] }
          : values,
        query
      ),
    [filterFields, query, type, values]
  );
  const clear = () => {
    setQuery('');
    setValues({});
    setType('all');
  };
  return (
    <Frame
      frame={frame}
      active="API Keys"
      fill
      note={
        <RecipeNote>
          Use for a list people search, filter, or add to.
        </RecipeNote>
      }
    >
      <SettingsPageLayout fill>
        <SettingsPageHeader
          title="API Keys"
          description={API_KEYS_DESCRIPTION}
          docsHref="https://docs.langchain.com"
          actions={
            <Button size="sm" leftDecorator={PlusIcon}>
              API Key
            </Button>
          }
          toolbar={
            <>
              <SearchInput
                label="Search API keys"
                value={query}
                onChange={setQuery}
              />
              {filterFields === 'One small set' ? (
                <div role="group" aria-label="Filter by type">
                  <GroupedTabs
                    size="sm"
                    value={type}
                    onChange={setType}
                    options={[
                      { value: 'all', display: 'All' },
                      { value: 'Personal', display: 'Personal' },
                      { value: 'Service', display: 'Service' },
                    ]}
                  />
                </div>
              ) : (
                <FilterButton values={values} onChange={setValues} />
              )}
            </>
          }
          chips={
            filterFields === 'One small set' ? undefined : (
              <FilterChips values={values} onChange={setValues} />
            )
          }
        />
        <SettingsKeyTable
          rows={rows}
          empty={<NoMatchingKeys onClear={clear} />}
        />
      </SettingsPageLayout>
    </Frame>
  );
}

export const CtaTable: Story = {
  name: 'CTA + table',
  args: { filterFields: 'Several fields' },
  argTypes: {
    filterFields: {
      control: 'inline-radio',
      options: ['Several fields', 'One small set'],
      description:
        '2+ filter fields use the Filter popover; one small set uses segmented tabs.',
    },
  },
  render: (args) => <CtaTableRecipe {...args} />,
};

/**
 * The explicit-save exception, as on the app's LLM Auth Proxy page: the mode
 * is a row that saves on change; custom patterns sit under the card, and
 * Cancel / Save appear only after an edit.
 */
function AllowedUrls() {
  const saved = 'api.openai.com\n*.example.com';
  const [mode, setMode] = useState<string | undefined>('custom');
  const [draft, setDraft] = useState(saved);
  const [value, setValue] = useState(saved);
  const dirty = draft !== value;
  return (
    <>
      <SettingsRowList>
        <SettingsRow
          label="Allowed URLs"
          description="Where the proxy may send requests."
          control={
            <Select
              size="sm"
              aria-label="Allowed URLs"
              hideSearch
              value={mode}
              onChange={setMode}
              triggerClassName="w-60 max-w-full"
              options={[
                { value: 'all', label: 'Allow all' },
                { value: 'custom', label: 'Custom' },
              ]}
            />
          }
        />
      </SettingsRowList>
      {mode === 'custom' && (
        <div className="flex min-w-0 flex-col gap-space-2">
          <Textarea
            aria-label="Allowed URL Patterns"
            value={draft}
            rows={4}
            hintText="One pattern per line. Use *.domain for subdomains."
            onChange={setDraft}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setDraft(value);
              if ((event.metaKey || event.ctrlKey) && event.key === 'Enter')
                setValue(draft);
            }}
          />
          {dirty && (
            <div className="flex justify-end gap-space-2">
              <Button
                size="sm"
                variant="plain"
                color="secondary"
                onClick={() => setDraft(value)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={() => setValue(draft)}>
                Save patterns
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function MaxExpiryRow() {
  const [value, setValue] = useState<string | undefined>('90');
  return (
    <SettingsRow
      label="Maximum Key Expiry"
      description="New keys can't outlive this."
      control={
        <Select
          size="sm"
          aria-label="Maximum Key Expiry"
          hideSearch
          value={value}
          onChange={setValue}
          triggerClassName="w-60 max-w-full"
          options={[
            { value: '30', label: '30 days' },
            { value: '90', label: '90 days' },
            { value: 'never', label: 'No limit' },
          ]}
        />
      }
    />
  );
}

export const FormRows: Story = {
  name: 'Form (rows)',
  render: ({ frame }) => (
    <Frame
      frame={frame}
      active="Security Policies"
      note={
        <RecipeNote>Use for settings that each save on their own.</RecipeNote>
      }
    >
      <SettingsPageLayout>
        <SettingsPageHeader
          title="Security Policies"
          description="Rules that apply to every member of this organization."
        />
        <div className="flex w-full min-w-0 max-w-2xl flex-col gap-space-7">
          <SettingsSection title="Sharing">
            <SettingsRowList>
              <SettingsSwitchRow
                label="Public Sharing"
                description="Members can share traces and datasets with a public link."
                defaultChecked
              />
              <SettingsSwitchRow
                label="Personal Access Tokens"
                description="Members can create keys tied to their own account."
                disabledReason="Turned off by your SSO policy."
              />
            </SettingsRowList>
          </SettingsSection>
          <SettingsSection title="API Keys">
            <SettingsRowList>
              <MaxExpiryRow />
              <SettingsTermsList
                terms={[
                  {
                    label: 'Existing',
                    content: 'Keys created before a change keep their expiry.',
                  },
                ]}
              />
            </SettingsRowList>
          </SettingsSection>
          <SettingsSection
            title="LLM Auth Proxy"
            description="Model requests from this organization go through the proxy."
          >
            <AllowedUrls />
          </SettingsSection>
        </div>
      </SettingsPageLayout>
    </Frame>
  ),
};

const DATA_PLANES = [
  { name: 'us-east-1', provider: 'AWS', workspaces: 3, status: 'Active' },
  { name: 'eu-west-1', provider: 'AWS', workspaces: 2, status: 'Active' },
  {
    name: 'westeurope',
    provider: 'Azure',
    workspaces: 0,
    status: 'Provisioning',
  },
];

export const ItemList: Story = {
  name: 'Item list',
  render: ({ frame }) => (
    <Frame
      frame={frame}
      active="Data Planes"
      note={
        <RecipeNote>
          Use for a few items, each with a status and an action.
        </RecipeNote>
      }
    >
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
        <div className="flex w-full min-w-0 max-w-2xl flex-col">
          <SettingsRowList>
            {DATA_PLANES.map((plane) => (
              <SettingsRow
                key={plane.name}
                label={
                  <span className="flex items-center gap-space-2">
                    <Icon
                      icon={DatabaseIcon}
                      size="sm"
                      className="text-icon-tertiary"
                    />
                    {plane.name}
                    <Badge size="sm" rounded="xs" color="secondary">
                      {plane.status}
                    </Badge>
                  </span>
                }
                description={`${plane.provider}, ${plane.workspaces} workspaces`}
                control={
                  <>
                    <Button size="sm" variant="outlined" color="secondary">
                      Settings
                    </Button>
                    <IconButton
                      icon={TrashIcon}
                      label={`Delete ${plane.name}`}
                      variant="plain"
                      color="secondary"
                      size="sm"
                      onClick={noop}
                    />
                  </>
                }
              />
            ))}
          </SettingsRowList>
        </div>
      </SettingsPageLayout>
    </Frame>
  ),
};

export const GroupedTabsPage: Story = {
  name: 'Tabs (sub-pages)',
  render: function Render({ frame }) {
    const [query, setQuery] = useState('');
    return (
      <Frame
        frame={frame}
        active="Webhooks"
        fill
        note={
          <RecipeNote>
            Use when sibling pages share one name and each needs its own URL.
          </RecipeNote>
        }
      >
        <SettingsPageLayout fill>
          <TabGroup className="flex min-h-0 flex-1 flex-col gap-space-3">
            <div className="flex min-w-0 flex-col gap-space-4">
              <Text as="h2" variant="h2">
                Webhooks
              </Text>
              <SettingsPageTabList tabs={['Destinations', 'Configurations']} />
            </div>
            <SettingsPageHeader
              description="Endpoints that receive events from this workspace."
              docsHref="https://docs.langchain.com"
              actions={
                <Button size="sm" leftDecorator={PlusIcon}>
                  Webhook
                </Button>
              }
              toolbar={
                <SearchInput
                  label="Search webhooks"
                  value={query}
                  onChange={setQuery}
                />
              }
            />
            <SettingsKeyTable
              rows={filterRows(KEY_ROWS.slice(0, 2), {}, query)}
            />
          </TabGroup>
        </SettingsPageLayout>
      </Frame>
    );
  },
};

const USAGE_VIEWS = ['Organization', 'Workspaces', 'Projects'];

export const Views: Story = {
  render: function Render({ frame }) {
    const [index, setIndex] = useState(0);
    return (
      <Frame
        frame={frame}
        active="Usage Limits"
        note={
          <RecipeNote>
            Use when one page shows the same data at different scopes.
          </RecipeNote>
        }
      >
        <SettingsPageLayout>
          <SettingsPageHeader
            title="Monthly Usage Limits"
            description="Cap traces per month so usage can't run past your budget."
          />
          <TabGroup selectedIndex={index} onChange={setIndex}>
            <SettingsPageTabList tabs={USAGE_VIEWS} />
          </TabGroup>
          {index === 0 ? (
            <div className="flex w-full min-w-0 max-w-2xl flex-col">
              <SettingsRowList>
                <SettingsRow
                  label="Default Trace Limit"
                  description="Applies to workspaces without their own limit."
                  control={
                    <Input
                      size="sm"
                      aria-label="Default Trace Limit"
                      value="1,000,000"
                      onChange={noop}
                      className="w-60 max-w-full"
                    />
                  }
                />
              </SettingsRowList>
            </div>
          ) : (
            <CenteredState>
              <EmptyState
                title={`No ${USAGE_VIEWS[index].toLowerCase()} limits yet`}
                description="Add a limit to cap one of them below the default."
                action={
                  <Button size="sm" leftDecorator={PlusIcon}>
                    Limit
                  </Button>
                }
              />
            </CenteredState>
          )}
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
        title="Edit Identity Provider"
        description="Changes apply the next time members sign in."
      >
        <Input label="SAML Metadata URL" value={url} onChange={setUrl} />
        <div className="flex items-center gap-space-2">
          <Button variant="plain" color="error">
            Delete
          </Button>
          <div className="flex-1" />
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const RowDialog: Story = {
  name: 'Row + dialog',
  render: function Render({ frame }) {
    const [open, setOpen] = useState(false);
    return (
      <Frame
        frame={frame}
        active="SSO"
        note={
          <RecipeNote>
            Use when one setting has several fields that are edited together.
          </RecipeNote>
        }
      >
        <SettingsPageLayout>
          <SettingsPageHeader
            title="SSO"
            description="Let members sign in with your identity provider."
          />
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
                  label="Groups Sync"
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

const MONTHS = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];

const usageSeries: readonly LineChartSeries[] = [
  {
    id: 'traces',
    label: 'Traces',
    points: [620, 710, 680, 840, 960, 1248].map((y, x) => ({ x, y })),
  },
];

const spendSeries: readonly BarChartSeries[] = [
  {
    id: 'traces',
    label: 'Traces',
    data: [1.8, 2.1, 2.0, 2.6, 3.1, 3.8].map((value, index) => ({
      category: MONTHS[index],
      value,
    })),
  },
  {
    id: 'deployments',
    label: 'Deployments',
    data: [0.4, 0.4, 0.5, 0.6, 0.6, 0.7].map((value, index) => ({
      category: MONTHS[index],
      value,
    })),
  },
];

export const Stats: Story = {
  render: ({ frame }) => (
    <Frame
      frame={frame}
      active="Credit Usage"
      note={<RecipeNote>Use when the page reports numbers.</RecipeNote>}
    >
      <SettingsPageLayout>
        <SettingsPageHeader
          title="Credit Usage"
          description="Usage and spend for the current contract."
          actions={
            <Button size="sm" variant="outlined" color="secondary">
              Export
            </Button>
          }
        />
        <div className="flex min-w-0 flex-col">
          <div className="grid min-w-0 @xl:grid-cols-3">
            {[
              { title: 'Traces', value: '1,248,392' },
              { title: 'Deployments', value: '12' },
              { title: 'Spend', value: '$3,842' },
            ].map((stat, index) => (
              <ChartCard
                key={stat.title}
                title={stat.title}
                className={cn(
                  'rounded-none',
                  index === 0 && 'rounded-tl-lg',
                  index === 2 && 'rounded-tr-lg',
                  index > 0 && '@xl:border-l-0'
                )}
              >
                <MetricChart value={stat.value} className="flex-1" />
              </ChartCard>
            ))}
          </div>
          <ChartCard title="Monthly Traces" className="rounded-none border-t-0">
            <div className="h-56 min-h-0 w-full">
              <LineChart
                aria-label="Monthly traces"
                series={usageSeries}
                showLegend={false}
                xScale="band"
                formatXValue={(value) => MONTHS[value] ?? ''}
              />
            </div>
          </ChartCard>
          <ChartCard
            title="Monthly Spend (Thousands)"
            className="rounded-none rounded-b-lg border-t-0"
          >
            <div className="h-56 min-h-0 w-full">
              <BarChart
                aria-label="Monthly spend by product"
                series={spendSeries}
              />
            </div>
          </ChartCard>
        </div>
      </SettingsPageLayout>
    </Frame>
  ),
};

export const Empty: Story = {
  args: { emptyKind: 'First run' },
  argTypes: {
    emptyKind: {
      control: 'inline-radio',
      options: ['First run', 'No matches'],
      description:
        'Nothing created yet, or a search/filter that matches nothing.',
    },
  },
  render: ({ frame, emptyKind }) => (
    <Frame
      frame={frame}
      active="API Keys"
      fill
      note={
        <RecipeNote>
          Use when the feature works but there's nothing to show yet.
        </RecipeNote>
      }
    >
      <SettingsPageLayout fill>
        <SettingsPageHeader
          title="API Keys"
          description={API_KEYS_DESCRIPTION}
          actions={
            <Button size="sm" leftDecorator={PlusIcon}>
              API Key
            </Button>
          }
          toolbar={
            emptyKind === 'No matches' ? (
              <SearchInput
                label="Search API keys"
                value="prod"
                onChange={noop}
              />
            ) : undefined
          }
        />
        {emptyKind === 'No matches' ? (
          <NoMatchingKeys onClear={noop} />
        ) : (
          <CenteredState>
            <EmptyState
              icon={KeyIcon}
              title="No API keys yet"
              description="Create a key to send traces from your code."
            />
          </CenteredState>
        )}
      </SettingsPageLayout>
    </Frame>
  ),
};

export const Loading: Story = {
  render: ({ frame }) => (
    <Frame
      frame={frame}
      active="Members"
      loading
      note={<RecipeNote>Use while the page's data loads.</RecipeNote>}
    >
      <SettingsPageLayout>
        <SettingsPageHeader
          title="Members"
          description="People in this organization and their roles."
        />
      </SettingsPageLayout>
    </Frame>
  ),
};

const UNAVAILABLE_COPY = {
  enterprise: {
    title: 'Access policies are an Enterprise feature',
    description: 'Control access with rules based on resource attributes.',
  },
  permission: {
    title: "You can't view access policies",
    description: 'Ask an organization admin to give you access.',
  },
  unavailable: {
    title: "Access policies aren't available here",
    description: 'This deployment doesn’t support attribute-based access.',
  },
} as const;

export const Unavailable: Story = {
  args: { reason: 'enterprise' },
  argTypes: {
    reason: {
      control: 'inline-radio',
      options: ['enterprise', 'permission', 'unavailable'],
      description:
        'Plan (offers Contact sales), role (says who can grant it), or deployment.',
    },
  },
  render: ({ frame, reason = 'enterprise' }) => (
    <Frame
      frame={frame}
      active="Access Policies"
      fill
      note={
        <RecipeNote>
          Use when the person's plan, role, or deployment blocks the feature.
        </RecipeNote>
      }
    >
      <SettingsPageLayout fill>
        <SettingsPageHeader
          title="Access Policies"
          description="Rules that decide who can reach which resources."
        />
        <CenteredState>
          <EmptyState
            icon={reason === 'unavailable' ? ProhibitIcon : LockSimpleIcon}
            variant={reason === 'enterprise' ? 'brand' : 'neutral'}
            title={UNAVAILABLE_COPY[reason].title}
            description={UNAVAILABLE_COPY[reason].description}
            action={
              reason === 'enterprise' && (
                <Button size="sm">Contact sales</Button>
              )
            }
          />
        </CenteredState>
      </SettingsPageLayout>
    </Frame>
  ),
};

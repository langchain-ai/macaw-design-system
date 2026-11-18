import { useState, type ReactNode } from 'react';

import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { ArrowSquareOutIcon } from '@phosphor-icons/react/dist/ssr/ArrowSquareOut';
import { BookOpenIcon } from '@phosphor-icons/react/dist/ssr/BookOpen';
import { CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { ChatsCircleIcon } from '@phosphor-icons/react/dist/ssr/ChatsCircle';
import { CopyIcon } from '@phosphor-icons/react/dist/ssr/Copy';
import { DatabaseIcon } from '@phosphor-icons/react/dist/ssr/Database';
import { DotsThreeIcon } from '@phosphor-icons/react/dist/ssr/DotsThree';
import { DownloadSimpleIcon } from '@phosphor-icons/react/dist/ssr/DownloadSimple';
import { GearIcon } from '@phosphor-icons/react/dist/ssr/Gear';
import { InfoIcon } from '@phosphor-icons/react/dist/ssr/Info';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { RobotIcon } from '@phosphor-icons/react/dist/ssr/Robot';
import { RocketLaunchIcon } from '@phosphor-icons/react/dist/ssr/RocketLaunch';
import { ShareNetworkIcon } from '@phosphor-icons/react/dist/ssr/ShareNetwork';
import { SparkleIcon } from '@phosphor-icons/react/dist/ssr/Sparkle';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from '../components/Badge';
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbPage,
} from '../components/Breadcrumb';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { Input } from '../components/Input';
import { Link } from '../components/Link';
import { Logo } from '../components/Logo';
import { PageHeader } from '../components/PageHeader';
import { Skeleton } from '../components/Skeleton';
import {
  TabGroup,
  TabLabel,
  TabList,
  TabPanel,
  TabPanels,
} from '../components/Tabs';
import { Text } from '../components/Text';
import { cn } from '../utils/cn';
import {
  headerSources,
  settingsHeaders,
  type SettingsHeaderExample,
} from './PageHeader.inventory';

// Product-specific content composes the shared start/end layout.
const row = 'flex min-w-0 flex-wrap items-center gap-space-2';

function Actions({ children }: { children: ReactNode }) {
  return <div className={cn(row, 'ml-auto justify-end')}>{children}</div>;
}

function Secondary({ children }: { children: ReactNode }) {
  return (
    <Button size="sm" variant="outlined" color="secondary">
      {children}
    </Button>
  );
}

function More() {
  return (
    <IconButton
      icon={DotsThreeIcon}
      label="More actions"
      size="sm"
      color="secondary"
      variant="plain"
    />
  );
}

function Id() {
  return (
    <Button
      size="xs"
      color="secondary"
      variant="plain"
      leftDecorator={CopyIcon}
    >
      ID
    </Button>
  );
}

function Tabs({ labels }: { labels: string[] }) {
  return (
    <TabGroup className="min-w-0 max-w-full">
      <TabList
        className="max-w-full overflow-x-auto"
        aria-label="Page sections"
      >
        {labels.map((label) => (
          <TabLabel key={label} label={label} className="whitespace-nowrap" />
        ))}
      </TabList>
      <TabPanels className="sr-only">
        {labels.map((label) => (
          <TabPanel key={label}>{label} content</TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
}

function Trail({ labels }: { labels: string[] }) {
  return (
    <Breadcrumb>
      {labels.map((label, index) =>
        index === labels.length - 1 ? (
          <BreadcrumbPage key={label}>{label}</BreadcrumbPage>
        ) : (
          <BreadcrumbLink key={label} href="#page-header-gallery">
            {label}
          </BreadcrumbLink>
        )
      )}
    </Breadcrumb>
  );
}

function ShellHeader({
  labels = ['Tracing'],
  loading = false,
  children,
}: {
  labels?: string[];
  loading?: boolean;
  children?: ReactNode;
}) {
  return (
    <PageHeader
      className="flex-nowrap px-space-4 py-space-1"
      start={
        loading ? (
          <Skeleton className="h-4 w-32 max-w-full" />
        ) : (
          <Trail labels={labels} />
        )
      }
      end={
        <>
          {children}
          <IconButton
            icon={MagnifyingGlassIcon}
            label="Search workspace"
            color="secondary"
            variant="plain"
            size="sm"
          />
          <Badge size="sm" color="secondary">
            US
          </Badge>
          <IconButton
            icon={SparkleIcon}
            label="Ask Polly"
            color="secondary"
            variant="plain"
            size="sm"
          />
        </>
      }
    />
  );
}

function ResourceHeader({
  title,
  tabs,
  children,
  icon = true,
  loading = false,
}: {
  title: string;
  tabs: string[];
  children?: ReactNode;
  icon?: boolean;
  loading?: boolean;
}) {
  return (
    <PageHeader
      className="items-start border-muted px-space-4 pb-0 pt-space-5"
      start={
        <div className="flex min-w-0 w-full flex-wrap items-start gap-x-space-6 gap-y-space-4">
          <div className={cn(row, 'min-h-8 max-w-full pb-space-2')}>
            {icon && (
              <DatabaseIcon
                aria-hidden
                size={16}
                weight="regular"
                className="shrink-0 text-icon-primary"
              />
            )}
            {loading ? (
              <Skeleton className="h-6 w-40 max-w-full" />
            ) : (
              <Text variant="h3" className="min-w-0 truncate">
                {title}
              </Text>
            )}
            <Id />
            <IconButton
              icon={InfoIcon}
              label="Description"
              size="xxs"
              color="secondary"
              variant="plain"
            />
          </div>
          <Tabs labels={tabs} />
        </div>
      }
      end={
        children ? (
          <div className={cn(row, 'pb-space-2')}>{children}</div>
        ) : undefined
      }
    />
  );
}

function Intro({
  title,
  description,
  children,
  badge,
  badgeColor = 'secondary',
  embedded = false,
}: {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  badge?: string;
  badgeColor?: 'primary' | 'secondary';
  embedded?: boolean;
}) {
  return (
    <PageHeader
      className="min-h-0 items-start gap-y-space-3 border-0 bg-transparent p-0"
      start={
        <div className="flex min-w-0 flex-col gap-space-1">
          <div className={row}>
            <Text variant={embedded ? 'h3' : 'h2'}>{title}</Text>
            {badge && (
              <Badge size="sm" color={badgeColor}>
                {badge}
              </Badge>
            )}
          </div>
          {description && (
            <Text variant="sm" as="p" color="secondary">
              {description}
            </Text>
          )}
        </div>
      }
      end={children}
    />
  );
}

function SettingsHeader({
  example,
  frame = false,
}: {
  example: SettingsHeaderExample;
  frame?: boolean;
}) {
  const actions = (
    <>
      {example.actions.map((label) => (
        <Button key={label} size="sm" leftDecorator={PlusIcon}>
          {label}
        </Button>
      ))}
    </>
  );
  const trailing = (
    <>
      {example.trailing === 'export' && (
        <IconButton
          icon={DownloadSimpleIcon}
          label="Export"
          size="sm"
          color="secondary"
          variant="outlined"
        />
      )}
      {example.trailing === 'data-plane' && <Secondary>Data plane</Secondary>}
      {example.trailing === 'unshare' && <Secondary>Unshare all</Secondary>}
      {example.trailing === 'health' && (
        <Secondary>Download health bundle</Secondary>
      )}
    </>
  );
  return (
    <div className="flex flex-col gap-space-4 p-space-5">
      <Intro
        title={example.title}
        description={
          frame ? (
            <>
              {example.description}
              {example.docs && (
                <>
                  {' '}
                  <Link
                    variant="sm"
                    href="https://docs.langchain.com/langsmith/home"
                  >
                    View docs
                  </Link>
                </>
              )}
            </>
          ) : (
            example.description
          )
        }
        badge={example.badge}
        badgeColor={example.badgeColor}
      >
        {!frame && (
          <>
            {trailing}
            {example.docs && (
              <Button
                size="sm"
                color="secondary"
                variant="outlined"
                leftDecorator={BookOpenIcon}
              >
                Docs
              </Button>
            )}
            {actions}
          </>
        )}
      </Intro>
      {frame && (
        <div className={row}>
          {actions}
          <Secondary>Search and filters</Secondary>
          {trailing}
        </div>
      )}
    </div>
  );
}

type Family = 'Navigation' | 'Resources' | 'Settings' | 'Product';
interface Specimen {
  id: string;
  name: string;
  family: Family;
  note: string;
  sources: string[];
  content: ReactNode;
}

const apiKeysExample: SettingsHeaderExample = {
  title: 'API Keys',
  description:
    'API keys can’t be viewed after creation. Store them somewhere safe.',
  actions: ['API Key'],
  docs: true,
  trailing: 'export',
  sources: ['Pages/Settings/OrganizationApiKeys.tsx:219'],
};

const coreSpecimens: Specimen[] = [
  {
    id: 'shell',
    name: 'Shared Breadcrumb Bar',
    family: 'Navigation',
    note: 'The common 48px top bar. Unified navigation portals the trail and actions into LayoutTopBar; classic navigation renders it in place.',
    sources: [
      'components/LayoutBreadcrumbs.tsx:119',
      'components/LayoutTopBar.tsx:54',
    ],
    content: <ShellHeader />,
  },
  {
    id: 'trail',
    name: 'Detail Breadcrumb Bar',
    family: 'Navigation',
    note: 'Nested resources extend the trail. This is separate from the resource title and tabs below it.',
    sources: [
      'Pages/Dataset/index.tsx:717',
      'Pages/Project/Project.tsx:1269',
      'Pages/Example/index.tsx:371',
    ],
    content: (
      <ShellHeader
        labels={['Datasets & Experiments', 'Support Questions', 'Example']}
      />
    ),
  },
  {
    id: 'shell-actions',
    name: 'Breadcrumb Bar with Page Actions',
    family: 'Navigation',
    note: 'Overview adds an invitation action; evaluator views add navigation controls; Gateway adds a data-plane selector.',
    sources: [
      'Pages/Overview/Overview.tsx:41',
      'Pages/Evaluators/index.tsx:74',
      'Pages/Gateway/GatewayPage.tsx:266',
    ],
    content: (
      <ShellHeader labels={['Overview']}>
        <Secondary>Invite members</Secondary>
      </ShellHeader>
    ),
  },
  {
    id: 'list',
    name: 'List Page and Separate Toolbar',
    family: 'Navigation',
    note: 'Tracing, datasets, prompts, context, annotation queues, deployments, simulations, and custom apps reuse the shell. Creation and table controls belong to the row below.',
    sources: [
      'Pages/Projects/ProjectsHome.tsx:112',
      'Pages/Datasets/index.tsx:148',
      'Pages/Prompts/index.tsx:98',
      'Pages/Context/index.tsx:94',
      'Pages/AnnotationQueues/index.tsx:86',
      'Pages/HostProjects/HostProjects.tsx:189',
      'Pages/Simulations/SimulationsPage.tsx:66',
      'Pages/CustomApps/index.tsx:338',
    ],
    content: (
      <>
        <ShellHeader labels={['Datasets & Experiments']} />
        <div className={cn(row, 'p-space-4')}>
          <Button size="sm" leftDecorator={PlusIcon}>
            Dataset
          </Button>
          <Button size="sm" variant="outlined" leftDecorator={PlusIcon}>
            Experiment
          </Button>
          <Actions>
            <Secondary>Search datasets</Secondary>
          </Actions>
        </div>
      </>
    ),
  },
  {
    id: 'back',
    name: 'Fleet Back Navigation',
    family: 'Navigation',
    note: 'Templates and related Fleet pages use a 56px back button and chevron trail with an optional right slot.',
    sources: [
      'Pages/AgentBuilder/components/Templates/components/PageHeader.tsx:42',
    ],
    content: (
      <div className={cn(row, 'min-h-14 px-space-5')}>
        <IconButton
          icon={ArrowLeftIcon}
          label="Back"
          variant="plain"
          color="secondary"
        />
        <Trail labels={['Templates', 'Research Assistant']} />
        <Actions>
          <Button size="sm">Use template</Button>
        </Actions>
      </div>
    ),
  },
  {
    id: 'shell-loading',
    name: 'Loading Breadcrumb',
    family: 'Navigation',
    note: 'The shell keeps its height while the route trail resolves.',
    sources: [
      'components/LayoutBreadcrumbs.tsx:97',
      'Pages/Organization/AgentOrganizationLayout.tsx:446',
    ],
    content: <ShellHeader loading />,
  },
  {
    id: 'dataset',
    name: 'Dataset Detail',
    family: 'Resources',
    note: 'ResourceDetailLayout combines an icon, title, copyable ID, description, tabs, and a trailing action slot in one wrapping row.',
    sources: [
      'components/ResourceDetailTabLayout/ResourceDetailTabLayout.tsx:61',
      'Pages/Dataset/index.tsx:717',
    ],
    content: (
      <ResourceHeader
        title="Support Questions"
        tabs={['Examples', 'Experiments', 'Versions']}
      >
        <Secondary>Evaluate</Secondary>
        <More />
      </ResourceHeader>
    ),
  },
  {
    id: 'project',
    name: 'Tracing Project Detail',
    family: 'Resources',
    note: 'The same resource layout accommodates a longer tab set and project-specific actions.',
    sources: ['Pages/Project/Project.tsx:1269'],
    content: (
      <ResourceHeader
        title="Support Agent"
        tabs={[
          'Runs',
          'Threads',
          'Evaluators',
          'Automations',
          'Alerts',
          'Insights',
        ]}
      >
        <More />
      </ResourceHeader>
    ),
  },
  {
    id: 'prompt',
    name: 'Prompt and Context Repository',
    family: 'Resources',
    note: 'Repository headers add visibility, version and repository actions; draft directories share the title layout.',
    sources: [
      'Pages/HubRepo/index.tsx:306',
      'Pages/HubRepo/DraftDirectoryPage.tsx:307',
      'Pages/HubRepo/RepoHeader.tsx:177',
    ],
    content: (
      <div className="p-space-4">
        <Intro
          title="support / answer-prompt"
          description="Answer questions using the supplied context."
        >
          <Badge size="sm" color="secondary">
            Private
          </Badge>
          <Secondary>Fork</Secondary>
          <More />
        </Intro>
        <div className="pt-space-4">
          <Tabs labels={['Prompt', 'Commits', 'Settings']} />
        </div>
      </div>
    ),
  },
  {
    id: 'evaluator',
    name: 'Evaluator Detail',
    family: 'Resources',
    note: 'Evaluator and session-evaluator routes reuse the resource title and tabs with their own content and actions.',
    sources: [
      'Pages/EvaluatorDetails/EvaluatorDetailsPage.tsx:172',
      'Pages/Evaluators/EvaluatorDetails/EvaluatorDetails.tsx:110',
      'Pages/SessionEvaluatorDetails/SessionEvaluatorDetailsPage.tsx:217',
    ],
    content: (
      <ResourceHeader
        title="Answer Correctness"
        tabs={['Overview', 'Configuration']}
      >
        <Secondary>Edit</Secondary>
        <More />
      </ResourceHeader>
    ),
  },
  {
    id: 'simulation',
    name: 'Simulation Detail without an Icon',
    family: 'Resources',
    note: 'Simulation detail explicitly hides the resource icon and keeps the ID, tabs and actions.',
    sources: ['Pages/Simulations/SimulationPage.tsx:166'],
    content: (
      <ResourceHeader
        title="Support Scenarios"
        icon={false}
        tabs={['Tasks', 'Runs']}
      >
        <Button size="sm">Run simulation</Button>
      </ResourceHeader>
    ),
  },
  {
    id: 'example',
    name: 'Example Detail',
    family: 'Resources',
    note: 'Examples use DetailPageTitle directly, with a resource prefix and an ID, outside the tabbed layout.',
    sources: ['Pages/Example/index.tsx:219', 'components/PageTitle.tsx:85'],
    content: (
      <div className={cn(row, 'p-space-4')}>
        <DatabaseIcon aria-hidden size={16} weight="regular" />
        <Text variant="h3">Example: Refund Request</Text>
        <Id />
        <Actions>
          <More />
        </Actions>
      </div>
    ),
  },
  {
    id: 'experiments',
    name: 'Experiment Comparison',
    family: 'Resources',
    note: 'Dataset comparison adds a compact PageTitle below the shell; multiple experiments use the taller title treatment.',
    sources: [
      'Pages/DatasetExperiments/index.tsx:736',
      'Pages/DatasetExperiments/index.tsx:754',
    ],
    content: (
      <>
        <ShellHeader
          labels={['Datasets & Experiments', 'Support Questions', 'Compare']}
        />
        <div className={cn(row, 'p-space-4')}>
          <Text variant="h2">Compare Experiments</Text>
          <Badge size="sm" color="secondary">
            3 experiments
          </Badge>
          <Actions>
            <Secondary>Display</Secondary>
            <More />
          </Actions>
        </div>
      </>
    ),
  },
  {
    id: 'resource-loading',
    name: 'Loading Resource Title',
    family: 'Resources',
    note: 'DetailPageTitle replaces the title with a skeleton while tabs retain their layout.',
    sources: [
      'components/PageTitle.tsx:143',
      'components/ResourceDetailTabLayout/ResourceDetailTabLayout.tsx:66',
    ],
    content: (
      <ResourceHeader title="" loading tabs={['Examples', 'Experiments']} />
    ),
  },
  {
    id: 'settings-inline',
    name: 'Standalone Settings',
    family: 'Settings',
    note: 'Title and description lead; documentation and actions align at the right and wrap below when necessary.',
    sources: ['Pages/Settings/components/SettingsPage.tsx:233'],
    content: <SettingsHeader example={apiKeysExample} />,
  },
  {
    id: 'settings-frame',
    name: 'Settings Modal Frame',
    family: 'Settings',
    note: 'In the modal, the intro stacks above a row leading with page actions and followed by toolbar controls. Documentation follows the description.',
    sources: [
      'Pages/Settings/components/SettingsPage.tsx:158',
      'Pages/Settings/SettingsModalLayout.tsx:330',
    ],
    content: <SettingsHeader frame example={apiKeysExample} />,
  },
  {
    id: 'settings-grouped',
    name: 'Grouped Settings',
    family: 'Settings',
    note: 'The group supplies the title above its tabs. The selected page suppresses its duplicate heading and retains its description and actions.',
    sources: [
      'Pages/Settings/SettingsGroupedPage.tsx:50',
      'Pages/Settings/components/SettingsPage.tsx:182',
    ],
    content: (
      <div className="flex flex-col gap-space-4 p-space-5">
        <Text variant="h2">Models</Text>
        <Tabs
          labels={[
            'Configurations',
            'Feature Access',
            'Credentials',
            'Pricing',
          ]}
        />
        <Text as="p" variant="sm" color="secondary">
          Choose the providers, models, and default model each feature can use.
        </Text>
      </div>
    ),
  },
  {
    id: 'settings-embedded',
    name: 'Embedded Settings Section',
    family: 'Settings',
    note: 'Combined pages lower the embedded title to h3. Badges and action placement are preserved.',
    sources: [
      'Pages/Settings/components/SettingsPage.tsx:248',
      'Pages/Settings/OrganizationAiFeatures.tsx:67',
    ],
    content: (
      <div className="p-space-5">
        <Intro
          title="AI Search"
          embedded
          badge="Beta"
          description="Find traces by topic in natural language, using LangChain-managed inference."
        />
      </div>
    ),
  },
  {
    id: 'home',
    name: 'Home Welcome Header',
    family: 'Product',
    note: 'Organization avatar, organization/workspace names, ID control and a second-line Build/Trace/Test prompt. The verb is frozen here.',
    sources: [
      'Pages/Home/HomeV3/components/WelcomeHeader.tsx:39',
      'Pages/Home/HomeV3/components/HomeHeaderRow.tsx:13',
    ],
    content: (
      <div className="flex flex-col gap-space-2 p-space-5">
        <div className={row}>
          <span className="flex size-8 items-center justify-center rounded-md bg-brand-subtle text-primary">
            <RobotIcon aria-hidden size={16} weight="regular" />
          </span>
          <Text variant="h2" weight="semibold">
            Demo Organization
          </Text>
          <Text variant="h2" color="secondary">
            Development
          </Text>
          <Id />
        </div>
        <Text as="p" variant="md" color="secondary">
          What will your team{' '}
          <Badge size="sm" color="primary">
            Build
          </Badge>{' '}
          today?
        </Text>
      </div>
    ),
  },
  {
    id: 'agent',
    name: 'Agent Profile',
    family: 'Product',
    note: 'Agent name, ID, source badge and ownership share the first row. Usage and resource links form a second row.',
    sources: ['Pages/AgentOverview/components/AgentOverviewHeader.tsx:129'],
    content: (
      <div className="flex flex-col gap-space-4 p-space-5">
        <div className={row}>
          <Text as="h2" variant="h2" weight="semibold">
            Research Assistant
          </Text>
          <Id />
          <Badge size="sm" color="secondary">
            LangSmith Deployment
          </Badge>
          <Text variant="sm" color="secondary">
            Created by you
          </Text>
          <Actions>
            <More />
          </Actions>
        </div>
        <div className={row}>
          <Text variant="sm" color="secondary">
            Usage
          </Text>
          <Link href="#page-header-gallery" variant="sm">
            Tracing
          </Link>
          <Link href="#page-header-gallery" variant="sm">
            Engine
          </Link>
          <Link href="#page-header-gallery" variant="sm">
            Deployments
          </Link>
        </div>
      </div>
    ),
  },
  {
    id: 'monitoring',
    name: 'Monitoring Dashboard',
    family: 'Product',
    note: 'Dashboard selector/title and time range precede an action cluster. A second sticky band hosts section navigation and filters.',
    sources: [
      'Pages/Dashboards/DashboardHeader.tsx:26',
      'Pages/Dashboards/DashboardPage.tsx:294',
    ],
    content: (
      <div className="px-space-6">
        <div className={cn(row, 'pt-space-4')}>
          <Button
            color="secondary"
            variant="plain"
            size="sm"
            rightDecorator={CaretDownIcon}
          >
            Production Overview
          </Button>
          <Secondary>Last 7 days</Secondary>
          <Actions>
            <Secondary>Edit dashboard</Secondary>
            <More />
          </Actions>
        </div>
        <div className={cn(row, 'py-space-4')}>
          <Tabs labels={['Runs', 'Latency', 'Cost']} />
          <Actions>
            <Secondary>Filters</Secondary>
          </Actions>
        </div>
      </div>
    ),
  },
  {
    id: 'deployment',
    name: 'Deployment Detail',
    family: 'Product',
    note: 'Environment-aware deployment identity sits beside live status. Settings, Studio and deployment actions align on the right.',
    sources: ['Pages/HostProject/HostProject.tsx:345'],
    content: (
      <div className={cn(row, 'p-space-5')}>
        <RocketLaunchIcon
          aria-hidden
          size={20}
          weight="regular"
          className="text-icon-primary"
        />
        <Text variant="h2">Support Agent</Text>
        <Secondary>Production</Secondary>
        <Badge size="sm" color="success">
          Healthy
        </Badge>
        <Actions>
          <IconButton
            icon={GearIcon}
            label="Deployment settings"
            variant="outlined"
            color="secondary"
          />
          <Secondary>Studio</Secondary>
          <Button size="sm">Deploy</Button>
        </Actions>
      </div>
    ),
  },
  {
    id: 'revision',
    name: 'Revision and Log Header',
    family: 'Product',
    note: 'Revisions have a resource title and status/update metadata. The newer log viewer uses a compact title bar.',
    sources: [
      'Pages/HostRevision/HostRevision.tsx:424',
      'Pages/HostRevision/components/RevisionLogsTitleBar.tsx:55',
    ],
    content: (
      <div className="flex flex-col gap-space-4 p-space-5">
        <div className={row}>
          <RocketLaunchIcon aria-hidden size={20} weight="regular" />
          <Text variant="h2">revision-demo</Text>
        </div>
        <div className={cn(row, 'gap-space-6')}>
          <div>
            <Text as="p" variant="xs" color="secondary">
              STATUS
            </Text>
            <Badge size="sm" color="success">
              Deployed
            </Badge>
          </div>
          <div>
            <Text as="p" variant="xs" color="secondary">
              LAST UPDATED
            </Text>
            <Text variant="sm">Nov 17, 2026, 10:24 AM</Text>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'thread',
    name: 'Thread and Conversation',
    family: 'Product',
    note: 'Thread identity, copy control and run statistics precede Studio/actions and a Turn View / Trace View switcher.',
    sources: ['Pages/Conversation/ConversationHeader.tsx:82'],
    content: (
      <div className="flex flex-col gap-space-4 border-b border-subtle p-space-4">
        <div className={row}>
          <ChatsCircleIcon aria-hidden size={16} weight="regular" />
          <Text variant="h3">Thread</Text>
          <Text variant="sm" className="min-w-0 truncate">
            support-conversation-demo
          </Text>
          <Id />
          <Badge size="sm" color="secondary">
            12 runs
          </Badge>
          <Text variant="sm" color="secondary">
            3.2s · $0.004
          </Text>
          <Actions>
            <Secondary>Studio</Secondary>
            <More />
          </Actions>
        </div>
        <Tabs labels={['Turn View', 'Trace View']} />
      </div>
    ),
  },
  {
    id: 'trace',
    name: 'Run and Trace Detail',
    family: 'Product',
    note: 'A compact typed run icon and title sit alongside copyable IDs, turn/user metadata and responsive actions. Public runs reuse this family.',
    sources: [
      'Pages/Run/components-next/RunHeaderNext.tsx:113',
      'Pages/PublicRun/index.tsx:107',
      'components/RunsTable/components/RunPanelHeader.tsx',
    ],
    content: (
      <div className={cn(row, 'p-space-4')}>
        <span className="rounded-sm bg-brand-subtle p-space-1">
          <RobotIcon aria-hidden size={14} weight="regular" />
        </span>
        <Text variant="h3">Support Agent</Text>
        <Id />
        <Badge size="sm" color="secondary">
          Turn 3
        </Badge>
        <Actions>
          <IconButton
            icon={ShareNetworkIcon}
            label="Share trace"
            color="secondary"
            variant="plain"
          />
          <IconButton
            icon={ArrowSquareOutIcon}
            label="Open in Studio"
            color="secondary"
            variant="plain"
          />
          <More />
        </Actions>
      </div>
    ),
  },
  {
    id: 'playground',
    name: 'Playground',
    family: 'Product',
    note: 'PageTitle supplies a title and descriptive second line. Evaluation alignment replaces it with Evaluator Playground and omits the description.',
    sources: [
      'Pages/Playground/components/PlaygroundHeader.tsx:14',
      'Pages/EvaluatorPlayground/EvaluatorPlaygroundMain.tsx:444',
    ],
    content: (
      <div className="p-space-4">
        <Intro title="Playground" description="Iterate on and test prompts.">
          <Secondary>Docs</Secondary>
          <Secondary>Settings</Secondary>
        </Intro>
      </div>
    ),
  },
  {
    id: 'tools',
    name: 'Tools Intro',
    family: 'Product',
    note: 'Classic navigation includes LangSmith Tools above the description; unified navigation suppresses that duplicate title. Identity-provider settings sit at the right.',
    sources: ['Pages/Tools/ToolsPage.tsx:415'],
    content: (
      <div className="p-space-4">
        <Intro
          title="LangSmith Tools"
          description="Centralized control plane for all your company’s tools."
        >
          <Secondary>Identity provider</Secondary>
        </Intro>
        <div className="pt-space-6">
          <Tabs labels={['Tool Kits', 'MCP Servers']} />
        </div>
      </div>
    ),
  },
  {
    id: 'gateway',
    name: 'LLM Gateway',
    family: 'Product',
    note: 'A resource-style title carries a Beta badge. Unified navigation moves this identity into the shared shell.',
    sources: [
      'Pages/Gateway/Home/components/GatewaySectionHeader.tsx:6',
      'Pages/Gateway/GatewayPage.tsx:320',
    ],
    content: (
      <div className={cn(row, 'p-space-5')}>
        <DatabaseIcon aria-hidden size={16} weight="regular" />
        <Text variant="h3">LLM Gateway</Text>
        <Badge size="sm" color="primary">
          Beta
        </Badge>
      </div>
    ),
  },
  {
    id: 'insights',
    name: 'Insights',
    family: 'Product',
    note: 'A full intro with an explanatory paragraph and a create action. Individual reports use their name and report controls.',
    sources: [
      'Pages/OnlineInsights/OnlineInsights.tsx:360',
      'Pages/OnlineInsights/ConfigReport.tsx:293',
      'Pages/InsightsJobConfig/InsightsJobConfiguration.tsx:588',
    ],
    content: (
      <div className="px-space-6 py-space-5">
        <Intro
          title="Insights"
          description="Understand your agent’s usage patterns, common behaviors, and failure modes by continuously analyzing your traces."
        >
          <Button size="sm" leftDecorator={PlusIcon}>
            New insight
          </Button>
        </Intro>
      </div>
    ),
  },
  {
    id: 'sandbox',
    name: 'Sandbox and Browser Detail',
    family: 'Product',
    note: 'Sandboxes have an inline title, status, region and controls; browser details use the same compact title treatment.',
    sources: [
      'Pages/Sandboxes/SandboxDetail.tsx:170',
      'Pages/Sandboxes/SandboxBrowserDetail.tsx:249',
      'Pages/Sandboxes/SandboxBrowsers.tsx:34',
    ],
    content: (
      <div className={cn(row, 'p-space-5')}>
        <Text variant="h2">research-sandbox</Text>
        <Badge size="sm" color="success">
          Running
        </Badge>
        <Badge size="sm" color="secondary">
          us-east-1
        </Badge>
        <Actions>
          <Secondary>Connect</Secondary>
          <More />
        </Actions>
      </div>
    ),
  },
  {
    id: 'workspace-agents',
    name: 'Workspace Agents',
    family: 'Product',
    note: 'The legacy workspace-agent page pairs PageTitle with documentation and a create action.',
    sources: [
      'Pages/AgentBuilder/components/WorkspaceAgents/WorkspaceAgentsPage.tsx:80',
    ],
    content: (
      <div className="p-space-4">
        <Intro title="Workspace Agents">
          <IconButton
            icon={BookOpenIcon}
            label="Documentation"
            size="md"
            variant="outlined"
            color="secondary"
          />
          <Button size="md" leftDecorator={PlusIcon}>
            New Agent
          </Button>
        </Intro>
      </div>
    ),
  },
  {
    id: 'app-editor',
    name: 'Custom App Editor',
    family: 'Product',
    note: 'A compact 44px editor bar uses Preview / Code tabs and a right-hand action slot.',
    sources: [
      'components/CustomApp/CustomAppEditorHeader.tsx:22',
      'Pages/CustomApps/CustomAppDetail.tsx:100',
    ],
    content: (
      <div
        className={cn(
          row,
          'min-h-11 border-b border-subtle px-space-3 py-space-1'
        )}
      >
        <Tabs labels={['Preview', 'Code']} />
        <Actions>
          <Secondary>Share</Secondary>
          <More />
        </Actions>
      </div>
    ),
  },
  {
    id: 'public',
    name: 'Public Dataset and Hub',
    family: 'Product',
    note: 'Public datasets retain PageTitle with an icon and description. Hub search/owner pages use a plain title; anonymous Hub adds a login action.',
    sources: [
      'Pages/PublicDataset/index.tsx:46',
      'Pages/Hub/HubLayout.tsx:30',
      'Pages/HubSearch/index.tsx:18',
      'Pages/HubTenant/index.tsx:12',
    ],
    content: (
      <div className={cn(row, 'p-space-4')}>
        <DatabaseIcon aria-hidden size={20} weight="regular" />
        <div className="min-w-0 flex-1">
          <Intro
            title="Public Support Questions"
            description="Example questions for evaluating a support agent."
          />
        </div>
        <Actions>
          <Secondary>Log in</Secondary>
        </Actions>
      </div>
    ),
  },
];

const specimens: Specimen[] = [
  ...coreSpecimens,
  {
    id: 'fleet-editor',
    name: 'Fleet Agent Editor',
    family: 'Product',
    note: 'Back navigation and an agent avatar precede editable name/description fields, status and visibility badges. Save and testing actions sit at the right.',
    sources: ['Pages/AgentBuilder/features/editor/AgentBuilderEditor.tsx:2488'],
    content: (
      <div className={cn(row, 'p-space-4')}>
        <IconButton
          icon={ArrowLeftIcon}
          label="Back to agents"
          color="secondary"
          variant="outlined"
          size="md"
        />
        <RobotIcon aria-hidden size={24} weight="regular" />
        <div className="flex min-w-0 flex-1 flex-col gap-space-1">
          <div className={row}>
            <Text variant="md" weight="medium">
              Research Assistant
            </Text>
            <Badge size="sm" color="primary">
              Draft
            </Badge>
            <Badge size="sm" color="secondary">
              Private
            </Badge>
          </div>
          <Text variant="sm" color="secondary">
            Research a topic and prepare a report.
          </Text>
        </div>
        <Actions>
          <Secondary>Test</Secondary>
          <Button size="sm">Save</Button>
        </Actions>
      </div>
    ),
  },
  {
    id: 'build',
    name: 'Build an Agent',
    family: 'Product',
    note: 'The builder uses a compact heading with save state below it and Cancel / Studio / Create or Save actions. Edit mode reads Agent configuration.',
    sources: ['Pages/BuildPage/components/BuildEditor.tsx:178'],
    content: (
      <div className="px-space-5 py-space-4">
        <Intro
          title="Build an agent"
          embedded
          description="Nothing is created until you click Create Agent."
        >
          <Secondary>Cancel</Secondary>
          <Button size="sm">Create Agent</Button>
        </Intro>
      </div>
    ),
  },
  {
    id: 'templates',
    name: 'Fleet Templates',
    family: 'Product',
    note: 'Templates use a larger page heading with a compact description, inside a centered content column.',
    sources: ['Pages/AgentBuilder/components/Templates/TemplatesPage.tsx:58'],
    content: (
      <div className="mx-auto flex max-w-4xl flex-col gap-space-1 px-space-5 py-space-6">
        <Text as="h2" variant="h1">
          Templates
        </Text>
        <Text variant="sm" color="secondary">
          Pre-configured agents you can create and customize for your workspace.
        </Text>
      </div>
    ),
  },
  {
    id: 'integrations',
    name: 'Fleet Integrations',
    family: 'Product',
    note: 'An introductory title and description precede tabs for servers, toolsets and apps.',
    sources: [
      'Pages/AgentBuilder/components/Integrations/FleetIntegrationsPage.tsx:93',
    ],
    content: (
      <div className="flex flex-col gap-space-6 p-space-4">
        <Intro
          title="Integrations"
          description="Connect servers to give your agents, people, and MCP clients access to tools."
        />
        <Tabs labels={['Servers', 'Toolsets', 'Apps']} />
      </div>
    ),
  },
  {
    id: 'engine',
    name: 'Engine Project Header',
    family: 'Product',
    note: 'EngineLayout supplies the shell, then an optional compact Engine title, project switcher and trailing controls. Some routes suppress the redundant title or the entire second band.',
    sources: ['Pages/ForgeIssueBoards/components/EngineLayout.tsx:23'],
    content: (
      <>
        <ShellHeader labels={['Engine']} />
        <div
          className={cn(row, 'border-b border-subtle px-space-4 py-space-3')}
        >
          <Text variant="h3">Engine</Text>
          <Secondary>Support Agent</Secondary>
          <Actions>
            <Secondary>Settings</Secondary>
          </Actions>
        </div>
      </>
    ),
  },
  {
    id: 'issue',
    name: 'Engine Issue Detail',
    family: 'Product',
    note: 'Issue titles wrap alongside severity and status controls, followed by evidence metadata chips.',
    sources: ['Pages/ForgeIssueBoards/ForgeIssueBoards.tsx:2154'],
    content: (
      <div className="flex flex-col gap-space-3 border-b border-subtle px-space-5 py-space-4">
        <Intro title="Agent repeats a tool call after a timeout">
          <Badge size="sm" color="warning">
            High
          </Badge>
          <Secondary>Open</Secondary>
          <More />
        </Intro>
        <div className={row}>
          <Badge size="sm" color="secondary">
            12 traces
          </Badge>
          <Text variant="sm" color="secondary">
            First seen 2 hours ago
          </Text>
        </div>
      </div>
    ),
  },
  {
    id: 'goal',
    name: 'Engine Goal Detail',
    family: 'Product',
    note: 'A goal name is paired with its status and health badges, plus a compact overflow action.',
    sources: [
      'Pages/ForgeIssueBoards/goals/components/GoalDetail.tsx:96',
      'Pages/ForgeIssueBoards/goals/components/GeneralOverview.tsx:24',
    ],
    content: (
      <div className={cn(row, 'p-space-5')}>
        <SparkleIcon aria-hidden size={20} weight="regular" />
        <Text variant="h2">Improve Answer Accuracy</Text>
        <Badge size="sm" color="secondary">
          Active
        </Badge>
        <Badge size="sm" color="success">
          On track
        </Badge>
        <Actions>
          <More />
        </Actions>
      </div>
    ),
  },
  {
    id: 'explore',
    name: 'Explore SQL Workspace',
    family: 'Product',
    note: 'Explore uses an h3 title, usage instructions, a persistence notice, project selection and a table-schema toggle.',
    sources: ['Pages/Explore/ExplorePage.tsx:40'],
    content: (
      <div className="flex flex-col gap-space-3 border-b border-subtle px-space-5 py-space-4">
        <Intro
          title="Explore"
          embedded
          description="Query your tracing data with SQL. Queries over runs need a start_time filter. Press ⌘/Ctrl + Enter to run."
        />
        <Text
          as="p"
          variant="sm"
          className="rounded-md bg-surface-level-2 p-space-3"
        >
          Nothing here is saved. Queries and results are cleared when you leave
          this page.
        </Text>
        <div className={row}>
          <Secondary>Support Agent</Secondary>
          <Actions>
            <Secondary>Show tables</Secondary>
          </Actions>
        </div>
      </div>
    ),
  },
  {
    id: 'studio',
    name: 'Studio Graph and Thread Controls',
    family: 'Product',
    note: 'Graph selection, environment and connection controls occupy the graph band; thread selection, render mode and thread actions occupy the adjacent thread band.',
    sources: [
      'Pages/Graph/src/components/site/StudioHeaderControls.tsx:49',
      'Pages/Graph/src/components/site/StudioHeaderControls.tsx:107',
    ],
    content: (
      <div className="flex flex-col divide-y divide-subtle">
        <div className={cn(row, 'min-h-14 p-space-2')}>
          <Text variant="h3">Studio</Text>
          <Secondary>Support Agent</Secondary>
          <Secondary>Development</Secondary>
          <Actions>
            <Secondary>Deploy</Secondary>
            <IconButton
              icon={GearIcon}
              label="Connection settings"
              variant="plain"
              color="secondary"
            />
          </Actions>
        </div>
        <div className={cn(row, 'p-space-2')}>
          <Secondary>Thread: support-demo</Secondary>
          <Tabs labels={['Graph', 'Chat']} />
          <Actions>
            <Button size="sm" leftDecorator={PlusIcon}>
              New thread
            </Button>
          </Actions>
        </div>
      </div>
    ),
  },
  {
    id: 'sandbox-lists',
    name: 'Sandbox Lists',
    family: 'Product',
    note: 'Sandboxes, Browsers, Registries and Snapshots share the sandbox shell. Browsers adds a compact PageTitle and description above its table.',
    sources: [
      'Pages/Sandboxes/SandboxLayout.tsx:136',
      'Pages/Sandboxes/SandboxBrowsers.tsx:34',
      'constants/pageTitlesAndDescriptionConstants.ts:44',
    ],
    content: (
      <div className="flex flex-col gap-space-4 p-space-5">
        <Tabs labels={['Sandboxes', 'Browsers', 'Registries', 'Snapshots']} />
        <Intro
          title="Browsers"
          description="Browsers your agents drive, where you log in and take over when needed."
        />
      </div>
    ),
  },
  {
    id: 'revision-compact',
    name: 'Compact Revision Logs',
    family: 'Product',
    note: 'The newer log viewer uses a compact Revision logs title, shortened revision-ID copy chip and share-link control.',
    sources: ['Pages/HostRevision/components/RevisionLogsTitleBar.tsx:51'],
    content: (
      <div className={cn(row, 'px-space-4 py-space-2')}>
        <Text variant="h3">Revision logs</Text>
        <Button
          size="xs"
          color="secondary"
          variant="plain"
          rightDecorator={CopyIcon}
        >
          demo1234
        </Button>
        <Actions>
          <IconButton
            icon={ShareNetworkIcon}
            label="Copy link"
            variant="outlined"
            color="secondary"
          />
        </Actions>
      </div>
    ),
  },
  {
    id: 'auth',
    name: 'Authentication and Password Pages',
    family: 'Product',
    note: 'Authentication uses a centered heading inside a branded frame. Welcome back, Update password, Reset your password and verification states share this family.',
    sources: [
      'Pages/Auth/Auth.tsx:1913',
      'Pages/Auth/Auth.tsx:1802',
      'Pages/ResetPassword/index.tsx:94',
      'Pages/Auth/components/AuthLayout.tsx:15',
    ],
    content: (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-space-6 p-space-5">
        <Logo brand="langsmith" variant="wordmark" size="lg" />
        <Text as="h2" variant="h1" className="text-center">
          Welcome back
        </Text>
      </div>
    ),
  },
  {
    id: 'onboarding',
    name: 'Evaluation Onboarding',
    family: 'Product',
    note: 'Onboarding uses an eyebrow, a larger display heading, a language switcher and supporting copy. Confirm-account pages use the responsive logo and step rail.',
    sources: [
      'Pages/Onboarding/components/SetupEvaluation.tsx:192',
      'Pages/Onboarding/components/EvaluationNextSteps.tsx:78',
      'Pages/Onboarding/OnboardingLayout.tsx:87',
    ],
    content: (
      <div className="flex flex-col gap-space-4 p-space-5">
        <Text variant="h4" as="p" color="secondary">
          Get started with evaluation
        </Text>
        <div className={row}>
          <Text as="h2" variant="h1" className="text-5xl font-normal">
            Run an experiment
          </Text>
          <Actions>
            <Tabs labels={['Python', 'TypeScript']} />
          </Actions>
        </div>
        <Text variant="md" as="p" color="secondary">
          Build more reliable AI applications with evaluations.
        </Text>
      </div>
    ),
  },
];

const families: Family[] = ['Navigation', 'Resources', 'Settings', 'Product'];

function SourceList({ sources }: { sources: string[] }) {
  return (
    <ul className="flex flex-col gap-space-1">
      {sources.map((source) => (
        <li
          key={source}
          className="break-words font-mono text-xxs text-secondary"
        >
          {source}
        </li>
      ))}
    </ul>
  );
}

function ExampleCard({ specimen }: { specimen: Specimen }) {
  return (
    <section
      aria-label={specimen.name}
      className="min-w-0 overflow-hidden rounded-lg border border-subtle bg-surface-level-1"
    >
      <div className="flex flex-col gap-space-1 border-b border-subtle bg-surface-level-2 px-space-5 py-space-4">
        <Text as="h2" variant="h3">
          {specimen.name}
        </Text>
        <Text as="p" variant="sm" color="secondary">
          {specimen.note}
        </Text>
      </div>
      <div className="min-w-0 py-space-4">{specimen.content}</div>
      <details className="border-t border-subtle px-space-5 py-space-3">
        <summary className="cursor-pointer text-xs text-secondary">
          Source references ({specimen.sources.length})
        </summary>
        <div className="pt-space-2">
          <SourceList sources={specimen.sources} />
        </div>
      </details>
    </section>
  );
}

function Gallery({
  family,
  includeSettings = true,
}: {
  family?: Family;
  includeSettings?: boolean;
}) {
  const [selectedFamily, setSelectedFamily] = useState<Family | 'All'>(
    family ?? 'All'
  );
  const [query, setQuery] = useState('');
  const matches = (value: string) =>
    value.toLowerCase().includes(query.trim().toLowerCase());
  const visible = specimens.filter(
    (item) =>
      (selectedFamily === 'All' || item.family === selectedFamily) &&
      matches([item.name, item.note, ...item.sources].join(' '))
  );
  const settings =
    includeSettings &&
    (selectedFamily === 'All' || selectedFamily === 'Settings')
      ? settingsHeaders.filter((item) =>
          matches([item.title, item.description, ...item.sources].join(' '))
        )
      : [];

  return (
    <main
      id="page-header-gallery"
      className="mx-auto flex max-w-7xl flex-col gap-space-6 p-space-5 sm:p-space-6"
    >
      <div className="flex flex-col gap-space-3">
        <div className={row}>
          <Badge size="sm" color="secondary">
            LangSmith header inventory
          </Badge>
          <Text variant="xs" color="secondary">
            Source snapshot · 9fe14ad5780
          </Text>
        </div>
        <Text as="h1" variant="h1">
          PageHeader
        </Text>
        <Text as="p" variant="body" color="secondary" className="max-w-3xl">
          Page header compositions collected from Langchain Plus. Compare the
          shared navigation shell, resource titles, settings contexts, and
          product-specific headers in one place.
        </Text>
        <Text as="p" variant="sm" color="secondary" className="max-w-3xl">
          Recreated from a source audit of the route tree and 2,756 page files.
          Layout families are represented below, with the settings title
          inventory and shared-header callsites at the end. Examples use Macaw
          primitives and fictional data; product controls are illustrative.
          Filters and tabs work locally.
        </Text>
      </div>

      <div className="flex flex-col gap-space-3">
        <div className="max-w-md">
          <Input
            size="md"
            label="Find a header"
            placeholder="Search names, patterns, or source paths…"
            leftIcon={MagnifyingGlassIcon}
            value={query}
            onChange={setQuery}
          />
        </div>
        {!family && (
          <div className={row} role="group" aria-label="Header family">
            {(['All', ...families] as const).map((item) => (
              <Button
                key={item}
                size="sm"
                variant={selectedFamily === item ? 'normal' : 'outlined'}
                color={selectedFamily === item ? 'primary' : 'secondary'}
                aria-pressed={selectedFamily === item}
                onClick={() => setSelectedFamily(item)}
              >
                {item}
              </Button>
            ))}
          </div>
        )}
        <Text as="p" variant="sm" color="secondary" role="status">
          {visible.length} layout examples · {settings.length} settings headers
        </Text>
      </div>

      {visible.length === 0 && settings.length === 0 && (
        <Text as="p" color="secondary">
          No headers match. Try another name or source path.
        </Text>
      )}
      <div className="flex min-w-0 flex-col gap-space-5">
        {visible.map((specimen) => (
          <ExampleCard key={specimen.id} specimen={specimen} />
        ))}
      </div>

      {settings.length > 0 && (
        <section
          aria-label="Settings title inventory"
          className="flex min-w-0 flex-col gap-space-4"
        >
          <div className="flex flex-col gap-space-2">
            <Text as="h2" variant="h2">
              Settings Title Inventory
            </Text>
            <Text as="p" variant="sm" color="secondary">
              Titles, descriptions and badges from SettingsPageHeader callsites,
              including conditional titles and repeated loading/error variants.
              Shown in the standalone arrangement; compare the four contexts
              above. Representative actions are static.
            </Text>
          </div>
          {settings.map((example, index) => (
            <div
              key={`${example.title}-${index}`}
              className="min-w-0 overflow-hidden rounded-lg border border-subtle bg-surface-level-1"
            >
              <SettingsHeader example={example} />
              <details className="border-t border-subtle px-space-5 py-space-3">
                <summary className="cursor-pointer text-xs text-secondary">
                  Source references
                </summary>
                <div className="pt-space-2">
                  <SourceList sources={example.sources} />
                </div>
              </details>
            </div>
          ))}
        </section>
      )}

      <details className="rounded-lg border border-subtle p-space-5">
        <summary className="cursor-pointer text-sm font-medium">
          Shared Header Callsite Index ({headerSources.length})
        </summary>
        <div className="flex flex-col gap-space-3 pt-space-4">
          <Text as="p" variant="sm" color="secondary">
            Paths are relative to langchainplus/smith-frontend/src. This index
            includes shared header consumers, alternate states, and public
            routes. The visual examples group repeated implementations. Modal
            titles, table column headers, section headings and markdown headings
            are outside this page-header inventory.
          </Text>
          {headerSources
            .filter((item) => matches(`${item.component} ${item.source}`))
            .map((item) => (
              <div
                key={`${item.source}-${item.component}`}
                className="flex min-w-0 flex-col gap-space-1"
              >
                <Text variant="xs" weight="medium">
                  {item.component}
                </Text>
                <SourceList sources={[item.source]} />
              </div>
            ))}
        </div>
      </details>
    </main>
  );
}

const meta = {
  title: 'Patterns/PageHeader',
  tags: [
    'autodocs',
    'page header',
    'page title',
    'inventory',
    'breadcrumb',
    'layout',
  ],
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: {
      description: {
        component:
          'A source-based inventory of Langchain Plus page headers. Shared shell, resource and intro compositions use PageHeader with start/end slots; custom specimens show additional product layouts. Use All Headers for the complete gallery, or a focused family below. See Components/Layout/PageHeader for the public component API. Switch the Storybook background to inspect either theme.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllHeaders: Story = { render: () => <Gallery /> };
export const Navigation: Story = {
  render: () => <Gallery family="Navigation" includeSettings={false} />,
};
export const ResourceDetails: Story = {
  render: () => <Gallery family="Resources" includeSettings={false} />,
};
export const Settings: Story = { render: () => <Gallery family="Settings" /> };
export const ProductHeaders: Story = {
  render: () => <Gallery family="Product" includeSettings={false} />,
};

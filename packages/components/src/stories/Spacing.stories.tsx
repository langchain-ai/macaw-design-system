import { ArticleIcon } from '@phosphor-icons/react/dist/ssr/Article';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../components/Button/Button';
import { ChartCard } from '../components/ChartCard';
import { Checkbox } from '../components/Checkbox';
import { GroupedTabs } from '../components/GroupedTabs/GroupedTabs';
import { Input } from '../components/Input/Input';
import { MetricChart } from '../components/MetricChart';
import { Text } from '../components/Text/Text';
import { Textarea } from '../components/Textarea/Textarea';
import { PlusIcon } from '../icons/PaddedPhosphorIcons';
import { SPACE_SCALE_PX, SPACE_STEPS } from '../utils/spacing';
import type { SpaceStep } from '../utils/spacing';

const meta: Meta = {
  title: 'Foundations/Spacing',
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj;

type SpacingRelationship = {
  relationship: string;
  step: SpaceStep;
  utility: string;
  guidance: string;
};

const relationshipGuidelines: SpacingRelationship[] = [
  // — Intra-cluster (things that read as a single unit) —
  {
    relationship: 'Title ↔ description (header block)',
    step: 1,
    utility: 'gap-space-1',
    guidance: 'Use inside page and section heading groups.',
  },
  {
    relationship: 'Label ↔ control (within a field)',
    step: 1,
    utility: 'gap-space-1',
    guidance: 'Keep field labels close to their controls.',
  },
  {
    relationship: 'Control ↔ helper/error text',
    step: 1,
    utility: 'gap-space-1',
    guidance: 'Helper and validation text belongs to the field cluster.',
  },
  {
    relationship: 'Inline icon ↔ label',
    step: 2,
    utility: 'gap-space-2',
    guidance: 'Default inline gap for icon plus text labels.',
  },
  {
    relationship: 'Action buttons ↔ each other',
    step: 2,
    utility: 'gap-space-2',
    guidance: 'Gap between buttons in an action or footer row.',
  },
  // — Within a section —
  {
    relationship: 'Section header ↔ section body',
    step: 3,
    utility: 'gap-space-3',
    guidance:
      'Separates the section explanation from the content it introduces.',
  },
  {
    relationship: 'Field / card ↔ field / card (within a section)',
    step: 4,
    utility: 'gap-space-4',
    guidance: 'Default rhythm for related fields, cards, or controls.',
  },
  {
    relationship: 'Header copy ↔ action area',
    step: 4,
    utility: 'gap-space-4',
    guidance:
      'Between heading copy and the action group before responsive wrapping.',
  },
  {
    relationship: 'Header block ↔ tabs / filter bar',
    step: 4,
    utility: 'gap-space-4',
    guidance: 'Between a page header block and the tab or filter bar below it.',
  },
  // — Region-level (page) —
  {
    relationship: 'Section ↔ section',
    step: 6,
    utility: 'gap-space-6',
    guidance: 'Default distance between major content groups.',
  },
  {
    relationship: 'Page header ↔ content',
    step: 6,
    utility: 'gap-space-6',
    guidance: 'Use between the top page heading and the first major section.',
  },
  {
    relationship: 'Form body ↔ actions row (page)',
    step: 6,
    utility: 'gap-space-6',
    guidance: 'Separate a page-level form body from its footer actions.',
  },
  // — Region-level (modal — one step denser than a page) —
  {
    relationship: 'Modal region gap (header / body / footer)',
    step: 5,
    utility: 'gap-space-5',
    guidance: 'Tighter region rhythm for modals and dialogs than full pages.',
  },
  // — Insets & container padding —
  {
    relationship: 'Page horizontal inset',
    step: 5,
    utility: 'px-space-5',
    guidance: 'Default horizontal inset for settings-style content panels.',
  },
  {
    relationship: 'Page top inset',
    step: 5,
    utility: 'pt-space-5',
    guidance: 'Default top inset between the page chrome and content.',
  },
  {
    relationship: 'Card / panel / modal padding',
    step: 5,
    utility: 'p-space-5',
    guidance: 'Padding inside cards, panels, dialogs, and bordered containers.',
  },
  {
    relationship: 'List / table row padding',
    step: 5,
    utility: 'px-space-5 py-space-4',
    guidance: '24px horizontal, 16px vertical inside list and table rows.',
  },
];

const noop = () => undefined;

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-semibold text-primary">{children}</h2>
);

const remLabel = (px: number) => (px === 0 ? '0' : `${px / 16}rem`);

const ScaleHeader = () => (
  <div className="flex items-center gap-space-4 border-b border-default py-space-2 text-xs font-medium uppercase text-tertiary">
    <span className="w-24 shrink-0">Token</span>
    <span className="w-16 shrink-0">px</span>
    <span className="w-20 shrink-0">rem</span>
    <span className="w-28 shrink-0">Tailwind</span>
    <span className="flex-1">Preview</span>
  </div>
);

const ScaleRow = ({ step, px }: { step: number; px: number }) => (
  <div className="flex items-center gap-space-4 border-b border-faint py-space-2">
    <code className="w-24 shrink-0 text-sm text-primary">space-{step}</code>
    <span className="w-16 shrink-0 text-sm text-tertiary">{px}px</span>
    <span className="w-20 shrink-0 text-sm text-tertiary">{remLabel(px)}</span>
    <code className="w-28 shrink-0 text-xs text-tertiary">gap-{px / 4}</code>
    <div className="flex-1">
      <div className="h-4 rounded-xs bg-brand" style={{ width: px }} />
    </div>
  </div>
);

const Do = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-space-2">
    <span className="text-success-secondary">✓</span>
    <span className="text-sm text-secondary">{children}</span>
  </li>
);

const Dont = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-space-2">
    <span className="text-error-secondary">✗</span>
    <span className="text-sm text-secondary">{children}</span>
  </li>
);

const RecipeCard = ({
  children,
  code,
  title,
}: {
  children: React.ReactNode;
  code: string;
  title: string;
}) => (
  <div className="grid gap-space-3 rounded-lg border border-subtle bg-surface-level-2 p-space-5">
    <Text variant="h3" as="h3">
      {title}
    </Text>
    <div className="rounded-lg border border-subtle bg-primary p-space-5">
      {children}
    </div>
    <pre className="overflow-x-auto rounded-md bg-secondary p-space-3 text-xs text-tertiary">
      <code>{code}</code>
    </pre>
  </div>
);

const FieldPreview = ({
  children,
  description,
  htmlFor,
  label,
}: {
  children: React.ReactNode;
  description?: string;
  htmlFor?: string;
  label: string;
}) => (
  <div className="flex flex-col gap-space-1">
    <Text
      as={htmlFor ? 'label' : 'div'}
      htmlFor={htmlFor}
      variant="sm"
      weight="medium"
    >
      {label}
    </Text>
    {children}
    {description && (
      <Text variant="xs" color="tertiary">
        {description}
      </Text>
    )}
  </div>
);

/**
 * The ordinal 4pt scale and baseline usage guidance.
 */
export const ScaleAndGuidelines: Story = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-space-8">
      <div className="flex flex-col gap-space-3">
        <div className="flex flex-col gap-space-2">
          <SectionHeading>Spacing scale</SectionHeading>
          <p className="text-sm text-secondary">
            An ordinal 4-point scale, <code>space-1</code> …{' '}
            <code>space-9</code>. The step number is "the next size up", not a
            pixel value to memorize. Use it through the Tailwind property
            prefix: <code>gap-space-4</code>, <code>px-space-6</code>,{' '}
            <code>mt-space-2</code>, and so on.
          </p>
          <p className="text-sm text-tertiary">
            The Tailwind column is the equivalent raw utility. Note the numbers
            diverge above <code>space-4</code>: <code>space-5</code> (24px) is
            Tailwind's <code>gap-6</code>, not <code>gap-5</code>, which is why
            you should reach for the token, not the raw number.
          </p>
        </div>
        <div className="flex flex-col">
          <ScaleHeader />
          {SPACE_STEPS.map((step) => (
            <ScaleRow key={step} step={step} px={SPACE_SCALE_PX[step]} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-space-3">
        <SectionHeading>Layout spacing</SectionHeading>
        <p className="text-sm text-secondary">
          Use spacing tokens for layout <em>between</em> components: gaps in a
          stack/row and section padding. Example:
        </p>
        <div className="flex flex-col gap-space-3 rounded-md border border-subtle bg-surface-level-2 p-space-5">
          <div className="flex items-center justify-between gap-space-4">
            <Text variant="sm" weight="medium">
              Usage by workspace
            </Text>
            <Text variant="xs" color="tertiary">
              Last 30 days
            </Text>
          </div>
          <div className="flex h-1 overflow-hidden rounded-full bg-secondary">
            <div className="w-1/2 bg-brand-700" />
            <div className="w-1/3 bg-brand-300" />
            <div className="flex-1 bg-brand-50" />
          </div>
          <div className="flex flex-wrap gap-space-4">
            <span className="inline-flex items-center gap-space-2 text-xs text-tertiary">
              <span className="size-2 rounded-full bg-brand-700" />
              Production
            </span>
            <span className="inline-flex items-center gap-space-2 text-xs text-tertiary">
              <span className="size-2 rounded-full bg-brand-300" />
              Support
            </span>
            <span className="inline-flex items-center gap-space-2 text-xs text-tertiary">
              <span className="size-2 rounded-full bg-brand-50" />
              Sandbox
            </span>
          </div>
        </div>
        <code className="text-xs text-tertiary">
          flex flex-col gap-space-3 p-space-5
        </code>
      </div>

      <div className="flex flex-col gap-space-3">
        <SectionHeading>Don't use inside components</SectionHeading>
        <p className="text-sm text-secondary">
          The internal padding of small components (badges, pills, inputs) is
          optically tuned and is <strong>not</strong> required to sit on the 4pt
          scale. Half-step padding utilities like <code>px-1.5</code> /{' '}
          <code>py-0.5</code> stay as-is; the lint rule does not flag them.
        </p>
      </div>

      <div className="flex flex-col gap-space-3">
        <SectionHeading>Don't use for width/height</SectionHeading>
        <p className="text-sm text-secondary">
          The scale governs spacing only. Width and height (<code>w-*</code>,{' '}
          <code>h-*</code>, <code>max-w-*</code>) are sizing. There is no{' '}
          <code>w-space-*</code>. Keep using the Tailwind sizing utilities for
          element dimensions.
        </p>
      </div>

      <div className="flex flex-col gap-space-3">
        <SectionHeading>Do / Don't</SectionHeading>
        <ul className="flex flex-col gap-space-2">
          <Do>
            Use a token for layout gaps and section padding:{' '}
            <code>gap-space-4</code>, <code>p-space-5</code>.
          </Do>
          <Do>
            Keep optical micro-padding inside small components:{' '}
            <code>px-1.5</code>, <code>py-0.5</code>.
          </Do>
          <Dont>
            Don't use arbitrary spacing values: <code>gap-[18px]</code>,{' '}
            <code>px-[10px]</code>.
          </Dont>
          <Dont>
            Don't use off-grid half-step gaps: <code>gap-1.5</code>,{' '}
            <code>gap-2.5</code>.
          </Dont>
        </ul>
      </div>
    </div>
  ),
};

/**
 * Relationship-based defaults for applying the scale consistently.
 */
export const Relationships: Story = {
  render: () => (
    <div className="flex max-w-5xl flex-col gap-space-6">
      <div className="flex max-w-3xl flex-col gap-space-2">
        <SectionHeading>Spacing relationship example</SectionHeading>
        <p className="text-sm text-secondary">
          These are not strict rules; Use this table as an example instruction
          when coding with agents.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-subtle">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-secondary text-xs uppercase text-tertiary">
            <tr>
              <th className="px-space-4 py-space-3 font-medium">
                Relationship
              </th>
              <th className="w-24 whitespace-nowrap px-space-4 py-space-3 font-medium">
                Token
              </th>
              <th className="w-20 whitespace-nowrap px-space-4 py-space-3 font-medium">
                px
              </th>
              <th className="w-44 whitespace-nowrap px-space-4 py-space-3 font-medium">
                Utility
              </th>
              <th className="px-space-4 py-space-3 font-medium">Guidance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary">
            {relationshipGuidelines.map((item) => (
              <tr key={item.relationship} className="bg-primary">
                <td className="px-space-4 py-space-3 text-primary">
                  {item.relationship}
                </td>
                <td className="w-24 whitespace-nowrap px-space-4 py-space-3">
                  <code className="text-primary">space-{item.step}</code>
                </td>
                <td className="w-20 whitespace-nowrap px-space-4 py-space-3 text-tertiary">
                  {SPACE_SCALE_PX[item.step]}px
                </td>
                <td className="w-44 whitespace-nowrap px-space-4 py-space-3">
                  <code className="text-tertiary">{item.utility}</code>
                </td>
                <td className="px-space-4 py-space-3 text-secondary">
                  {item.guidance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ),
};

/**
 * Copy-pasteable recipes for common Settings layout relationships.
 */
export const Examples: Story = {
  render: () => (
    <div className="flex max-w-5xl flex-col gap-space-6">
      <div className="flex max-w-3xl flex-col gap-space-2">
        <SectionHeading>Examples</SectionHeading>
        <p className="text-sm text-secondary">
          These examples show how to combine spacing tokens into consistent page
          headers, sections, forms, dialogs, and metric-card groups.
        </p>
      </div>

      <div className="grid gap-space-6">
        <RecipeCard
          title="API Keys page header"
          code={`<div className="flex flex-col gap-space-6">
  <header className="flex flex-col gap-space-4">
    <div className="flex flex-col gap-space-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex max-w-2xl flex-col gap-space-1">
        <Text variant="h2">API Keys</Text>
        <Text variant="sm" color="tertiary">
          You can only access an API key when you first create it. If you lost one,
          you will need to create a new one.
        </Text>
      </div>

      <div className="flex shrink-0 items-center gap-space-2">
        <Button size="md" variant="outlined" color="secondary" leftDecorator={ArticleIcon}>
          API docs
        </Button>
        <Button size="md" leftDecorator={PlusIcon}>API Key</Button>
      </div>
    </div>

    <GroupedTabs
      value={tab}
      onChange={setTab}
      options={[
        { value: 'pat', display: 'Personal' },
        { value: 'service', display: 'Service' },
      ]}
      size="md"
    />
  </header>

  <div>{/* page content */}</div>
</div>`}
        >
          <div className="flex flex-col gap-space-6">
            <header className="flex flex-col gap-space-4">
              <div className="flex flex-row items-start justify-between gap-space-4">
                <div className="flex max-w-2xl flex-col gap-space-1">
                  <Text variant="h2">API Keys</Text>
                  <Text variant="sm" color="tertiary">
                    You can only access an API key when you first create it. If
                    you lost one, you will need to create a new one.
                  </Text>
                </div>
                <div className="flex shrink-0 items-center gap-space-2">
                  <Button
                    size="md"
                    variant="outlined"
                    color="secondary"
                    leftDecorator={ArticleIcon}
                  >
                    API docs
                  </Button>
                  <Button size="md" leftDecorator={PlusIcon}>
                    API Key
                  </Button>
                </div>
              </div>
              <GroupedTabs
                value="pat"
                onChange={noop}
                options={[
                  { value: 'pat', display: 'Personal' },
                  { value: 'service', display: 'Service' },
                ]}
                size="md"
              />
            </header>
            <div className="overflow-hidden rounded-lg border border-secondary">
              <div className="border-b border-secondary px-space-5 py-space-4">
                <div className="h-8 max-w-sm rounded-md bg-surface-level-2" />
              </div>
              <div className="divide-y divide-secondary">
                <div className="grid grid-cols-[1fr_1fr_auto] gap-space-4 px-space-5 py-space-4">
                  <div className="h-4 rounded-sm bg-surface-level-2" />
                  <div className="h-4 rounded-sm bg-surface-level-2" />
                  <div className="h-4 w-16 rounded-sm bg-surface-level-2" />
                </div>
                <div className="grid grid-cols-[1fr_1fr_auto] gap-space-4 px-space-5 py-space-4">
                  <div className="h-4 rounded-sm bg-surface-level-2" />
                  <div className="h-4 rounded-sm bg-surface-level-2" />
                  <div className="h-4 w-16 rounded-sm bg-surface-level-2" />
                </div>
              </div>
            </div>
          </div>
        </RecipeCard>

        <RecipeCard
          title="Section header and body"
          code={`<section className="flex flex-col gap-space-3 rounded-lg border border-secondary p-space-5">
  <div className="flex flex-col gap-space-1">
    <Text variant="h3">Key expiry settings</Text>
    <Text variant="sm" color="tertiary">Set maximum expiry durations.</Text>
  </div>
  <div className="flex flex-col gap-space-4">{/* section body */}</div>
</section>`}
        >
          <section className="flex flex-col gap-space-3 rounded-lg border border-secondary p-space-5">
            <div className="flex flex-col gap-space-1">
              <Text variant="h3">Key expiry settings</Text>
              <Text variant="sm" color="tertiary">
                Set maximum expiry durations.
              </Text>
            </div>
            <div className="grid gap-space-4">
              <div className="h-10 rounded-md bg-surface-level-2" />
              <div className="h-10 rounded-md bg-surface-level-2" />
            </div>
          </section>
        </RecipeCard>

        <RecipeCard
          title="Form field stack"
          code={`<form className="flex flex-col gap-space-6">
  <div className="flex flex-col gap-space-4">
    <div className="flex flex-col gap-space-1">
      <Text as="label" htmlFor="workspace-name" variant="sm" weight="medium">Workspace name</Text>
      <Input id="workspace-name" value="LangSmith" onChange={onChange} />
      <Text variant="xs" color="tertiary">Shown to members of this workspace.</Text>
    </div>
  </div>
  <div className="flex justify-end gap-space-2">{/* actions */}</div>
</form>`}
        >
          <form className="flex flex-col gap-space-6">
            <div className="flex flex-col gap-space-4">
              <div className="flex flex-col gap-space-1">
                <Text
                  as="label"
                  htmlFor="workspace-name"
                  variant="sm"
                  weight="medium"
                >
                  Workspace name
                </Text>
                <Input id="workspace-name" value="LangSmith" onChange={noop} />
                <Text variant="xs" color="tertiary">
                  Shown to members of this workspace.
                </Text>
              </div>
              <div className="flex flex-col gap-space-1">
                <Text
                  as="label"
                  htmlFor="workspace-slug"
                  variant="sm"
                  weight="medium"
                >
                  Workspace slug
                </Text>
                <Input id="workspace-slug" value="langsmith" onChange={noop} />
                <Text variant="xs" color="tertiary">
                  Used in generated workspace URLs.
                </Text>
              </div>
            </div>
            <div className="flex justify-end gap-space-2">
              <Button variant="outlined" color="secondary">
                Cancel
              </Button>
              <Button>Save changes</Button>
            </div>
          </form>
        </RecipeCard>

        <RecipeCard
          title="Create API key modal"
          code={`{/* Modals run one step denser than full pages: regions gap-space-5 (24px). */}
<div className="flex flex-col gap-space-5 rounded-lg p-space-5">
  <div className="flex flex-col gap-space-1">
    <Text variant="h3">Create API key</Text>
    <Text variant="sm" color="tertiary">Give the key a description and choose when it expires.</Text>
  </div>

  <div className="flex flex-col gap-space-4">
    <Field label="Description" description="Helps you identify this key later.">{/* input */}</Field>
    <Field label="Expires in">{/* select */}</Field>
  </div>

  <div className="flex justify-end gap-space-2">{/* actions */}</div>
</div>`}
        >
          <div className="flex flex-col gap-space-5 rounded-lg border border-secondary bg-primary p-space-5">
            <div className="flex flex-col gap-space-1">
              <Text variant="h3">Create API key</Text>
              <Text variant="sm" color="tertiary">
                Give the key a description and choose when it expires.
              </Text>
            </div>
            <div className="flex flex-col gap-space-4">
              <FieldPreview
                label="Description"
                description="Helps you identify this key later."
                htmlFor="api-key-description"
              >
                <Input
                  id="api-key-description"
                  value="CI deploy key"
                  onChange={noop}
                />
              </FieldPreview>
              <FieldPreview label="Expires in">
                <div className="flex h-9 items-center rounded-md border border-secondary bg-primary px-space-3 text-sm text-secondary">
                  90 days
                </div>
              </FieldPreview>
            </div>
            <div className="flex justify-end gap-space-2">
              <Button variant="outlined" color="secondary">
                Cancel
              </Button>
              <Button>Create key</Button>
            </div>
          </div>
        </RecipeCard>

        <RecipeCard
          title="Granular usage metric cards"
          code={`<section className="flex flex-col gap-space-3">
  <div className="flex flex-col gap-space-1">
    <Text variant="h3">Usage summary</Text>
    <Text variant="sm" color="tertiary">
      High-level usage metrics for the selected time range.
    </Text>
  </div>

  <div className="grid gap-space-4 md:grid-cols-3">
    <ChartCard title="Total Traces">
      <MetricChart className="flex-1 justify-center" value="1,248,392" secondaryContent={<Text variant="sm" color="tertiary">Across all workspaces</Text>} />
    </ChartCard>
    <ChartCard title="Total Nodes">
      <MetricChart className="flex-1 justify-center" value="8,402,118" secondaryContent={<Text variant="sm" color="tertiary">Billable trace nodes</Text>} />
    </ChartCard>
    <ChartCard title="Estimated Cost">
      <MetricChart className="flex-1 justify-center" value="$3,842" secondaryContent={<Text variant="sm" color="tertiary">Current billing period</Text>} />
    </ChartCard>
  </div>
</section>`}
        >
          <section className="flex flex-col gap-space-3">
            <div className="flex flex-col gap-space-1">
              <Text variant="h3">Usage summary</Text>
              <Text variant="sm" color="tertiary">
                High-level usage metrics for the selected time range.
              </Text>
            </div>
            <div className="grid gap-space-4 md:grid-cols-3">
              <ChartCard title="Total Traces">
                <MetricChart
                  value="1,248,392"
                  className="flex-1 justify-center"
                  secondaryContent={
                    <Text variant="sm" color="tertiary">
                      Across all workspaces
                    </Text>
                  }
                />
              </ChartCard>
              <ChartCard title="Total Nodes">
                <MetricChart
                  value="8,402,118"
                  className="flex-1 justify-center"
                  secondaryContent={
                    <Text variant="sm" color="tertiary">
                      Billable trace nodes
                    </Text>
                  }
                />
              </ChartCard>
              <ChartCard title="Estimated Cost">
                <MetricChart
                  value="$3,842"
                  className="flex-1 justify-center"
                  secondaryContent={
                    <Text variant="sm" color="tertiary">
                      Current billing period
                    </Text>
                  }
                />
              </ChartCard>
            </div>
          </section>
        </RecipeCard>

        <RecipeCard
          title="Dense SSO configuration form"
          code={`<form className="flex max-w-2xl flex-col gap-space-6">
  <section className="flex flex-col gap-space-3">
    <div className="flex flex-col gap-space-1">
      <Text variant="h3">SAML metadata</Text>
      <Text variant="sm" color="tertiary">Connect your identity provider.</Text>
    </div>

    <div className="flex flex-col gap-space-4">
      <Field label="SAML metadata type">{/* tabs */}</Field>
      <Field label="SAML metadata URL">{/* input + helper text */}</Field>
    </div>
  </section>

  <section className="flex flex-col gap-space-3 border-t border-secondary pt-space-5">
    <div className="flex flex-col gap-space-1">
      <Text variant="h3">Defaults and access</Text>
      <Text variant="sm" color="tertiary">Choose defaults for users created through SSO.</Text>
    </div>

    <div className="flex flex-col gap-space-4">
      <Field label="Default workspace role">{/* role select */}</Field>
      <Field label="Default workspaces">{/* workspace selector */}</Field>
      <Field label="Login policy">{/* checkbox + helper text */}</Field>
    </div>
  </section>

  <div className="flex justify-end gap-space-2">{/* actions */}</div>
</form>`}
        >
          <form className="flex max-w-2xl flex-col gap-space-6">
            <section className="flex flex-col gap-space-3">
              <div className="flex flex-col gap-space-1">
                <Text variant="h3">SAML metadata</Text>
                <Text variant="sm" color="tertiary">
                  Connect your identity provider.
                </Text>
              </div>
              <div className="flex flex-col gap-space-4">
                <FieldPreview label="SAML metadata type">
                  <GroupedTabs
                    value="url"
                    onChange={noop}
                    options={[
                      { value: 'url', display: 'URL' },
                      { value: 'xml', display: 'XML' },
                    ]}
                  />
                </FieldPreview>
                <FieldPreview
                  label="SAML metadata URL"
                  description="Enter the SAML endpoint URL for authentication."
                  htmlFor="saml-metadata-url"
                >
                  <Input
                    id="saml-metadata-url"
                    value="https://domain.com/sso/saml/metadata"
                    onChange={noop}
                  />
                </FieldPreview>
                <FieldPreview
                  label="SAML metadata XML"
                  description="Use XML when your identity provider does not expose a metadata URL."
                  htmlFor="saml-metadata-xml"
                >
                  <Textarea
                    id="saml-metadata-xml"
                    value="<EntityDescriptor>...</EntityDescriptor>"
                    onChange={noop}
                    rows={4}
                  />
                </FieldPreview>
              </div>
            </section>

            <section className="flex flex-col gap-space-3 border-t border-secondary pt-space-5">
              <div className="flex flex-col gap-space-1">
                <Text variant="h3">Defaults and access</Text>
                <Text variant="sm" color="tertiary">
                  Choose defaults for users created through SSO.
                </Text>
              </div>
              <div className="flex flex-col gap-space-4">
                <FieldPreview
                  label="Default workspace role"
                  description="Users provisioned through SSO receive this role by default."
                >
                  <div className="flex h-9 items-center rounded-md border border-secondary bg-primary px-space-3 text-sm text-secondary">
                    Viewer
                  </div>
                </FieldPreview>
                <FieldPreview
                  label="Default workspaces"
                  description="At least one default workspace is required."
                >
                  <div className="flex min-h-9 flex-wrap items-center gap-space-2 rounded-md border border-secondary bg-primary px-space-3 py-space-2">
                    <span className="rounded-sm bg-secondary px-space-2 py-0.5 text-xs text-secondary">
                      Production
                    </span>
                    <span className="rounded-sm bg-secondary px-space-2 py-0.5 text-xs text-secondary">
                      Support
                    </span>
                  </div>
                </FieldPreview>
                <FieldPreview
                  label="Login policy"
                  description="Only allow SSO login for this organization and no other login methods."
                >
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => undefined}
                    label="Login via SSO only"
                  />
                </FieldPreview>
              </div>
            </section>

            <section className="flex flex-col gap-space-3 border-t border-secondary pt-space-5">
              <div className="flex flex-col gap-space-1">
                <Text variant="h3">SSO groups sync</Text>
                <Text variant="sm" color="tertiary">
                  Automatically assign workspace roles based on SSO token group
                  membership.
                </Text>
              </div>
              <div className="flex flex-col gap-space-4">
                <FieldPreview
                  label="Groups claim field"
                  htmlFor="groups-claim-field"
                >
                  <Input
                    id="groups-claim-field"
                    value="groups"
                    onChange={noop}
                  />
                </FieldPreview>
                <FieldPreview
                  label="Group sync behavior"
                  description="Keep related checkboxes close to the setting they modify."
                >
                  <div className="flex flex-col gap-space-2">
                    <Checkbox
                      size="sm"
                      checked
                      onCheckedChange={() => undefined}
                      label="Sync workspace/role assignments"
                    />
                    <Checkbox
                      size="sm"
                      checked={false}
                      onCheckedChange={() => undefined}
                      label="Require matching group to sign in"
                    />
                  </div>
                </FieldPreview>
              </div>
            </section>

            <div className="flex justify-end gap-space-2">
              <Button variant="outlined" color="secondary">
                Delete
              </Button>
              <Button>Save</Button>
            </div>
          </form>
        </RecipeCard>
      </div>
    </div>
  ),
};

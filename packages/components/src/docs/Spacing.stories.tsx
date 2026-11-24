import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '../components/Text/Text';
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
          <tbody className="*:not-first:border-t *:border-secondary">
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

import { CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { GearIcon } from '@phosphor-icons/react/dist/ssr/Gear';
import { InfoIcon } from '@phosphor-icons/react/dist/ssr/Info';
import { MinusCircleIcon } from '@phosphor-icons/react/dist/ssr/MinusCircle';
import { SparkleIcon } from '@phosphor-icons/react/dist/ssr/Sparkle';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';
import { XCircleIcon } from '@phosphor-icons/react/dist/ssr/XCircle';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Icon } from './Icon';

const meta: Meta<typeof Icon> = {
  title: 'Components/Display/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Icon is a presentation wrapper around a glyph from Foundations → Icon Library. Named sizes are intrinsic for plain icons. Decorated icons use corresponding outer boxes: xxs=12px, xs=16px, sm=20px, md=24px, lg=36px, and xl=48px.',
      },
    },
  },
  tags: ['autodocs', 'glyph', 'symbol', 'tooltip', 'icon'],
  argTypes: {
    color: {
      control: 'select',
      options: [
        undefined,
        'neutral',
        'brand',
        'success',
        'info',
        'warning',
        'error',
        'special',
      ],
    },
    size: {
      control: 'select',
      options: ['xxs', 'xs', 'sm', 'md', 'lg', 'xl'],
    },
    rounded: {
      control: 'boolean',
    },
    label: {
      control: 'text',
    },
    icon: {
      control: 'select',
      options: [
        'InfoIcon',
        'CheckCircleIcon',
        'MinusCircleIcon',
        'WarningCircleIcon',
        'XCircleIcon',
        'GearIcon',
        'SparkleIcon',
      ],
      mapping: {
        InfoIcon: InfoIcon,
        CheckCircleIcon,
        MinusCircleIcon,
        WarningCircleIcon: WarningCircleIcon,
        XCircleIcon,
        GearIcon: GearIcon,
        SparkleIcon: SparkleIcon,
      },
    },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: InfoIcon,
  },
  parameters: {
    docs: {
      description: {
        story: 'Legacy intrinsic presentation retained for existing consumers.',
      },
    },
  },
};

export const Brand: Story = {
  args: {
    icon: InfoIcon,
    color: 'brand',
    rounded: true,
  },
};

export const WithLabel: Story = {
  args: {
    icon: InfoIcon,
    label: 'Information',
  },
};

export const AllColors: Story = {
  render: () => (
    <div className="flex items-center gap-space-4">
      <div className="flex flex-col items-center gap-space-2">
        <Icon icon={InfoIcon} />
        <span className="text-xs text-secondary">Default</span>
      </div>
      <div className="flex flex-col items-center gap-space-2">
        <Icon icon={InfoIcon} color="neutral" />
        <span className="text-xs text-secondary">Neutral</span>
      </div>
      <div className="flex flex-col items-center gap-space-2">
        <Icon icon={CheckCircleIcon} color="success" />
        <span className="text-xs text-secondary">Success</span>
      </div>
      <div className="flex flex-col items-center gap-space-2">
        <Icon icon={InfoIcon} color="info" />
        <span className="text-xs text-secondary">Info</span>
      </div>
      <div className="flex flex-col items-center gap-space-2">
        <Icon icon={MinusCircleIcon} color="warning" />
        <span className="text-xs text-secondary">Warning</span>
      </div>
      <div className="flex flex-col items-center gap-space-2">
        <Icon icon={XCircleIcon} color="error" />
        <span className="text-xs text-secondary">Error</span>
      </div>
      <div className="flex flex-col items-center gap-space-2">
        <Icon icon={SparkleIcon} color="special" />
        <span className="text-xs text-secondary">Special</span>
      </div>
    </div>
  ),
};

export const Rounded: Story = {
  render: () => (
    <div className="flex items-center gap-space-4">
      <div className="flex flex-col items-center gap-space-2">
        <Icon icon={InfoIcon} color="neutral" rounded={false} />
        <span className="text-xs text-secondary">Square</span>
      </div>
      <div className="flex flex-col items-center gap-space-2">
        <Icon icon={InfoIcon} color="neutral" rounded={true} />
        <span className="text-xs text-secondary">Rounded</span>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-space-4">
      <Icon icon={InfoIcon} color="info" size="xxs" />
      <Icon icon={InfoIcon} color="info" size="xs" />
      <Icon icon={InfoIcon} color="info" size="sm" />
      <Icon icon={InfoIcon} color="info" size="md" />
      <Icon icon={InfoIcon} color="info" size="lg" />
      <Icon icon={InfoIcon} color="info" size="xl" />
    </div>
  ),
};

export const WithTooltips: Story = {
  render: () => (
    <div className="flex items-center gap-space-4">
      <Icon icon={InfoIcon} label="Default tooltip" />
      <Icon icon={InfoIcon} color="neutral" label="Neutral tooltip" />
      <Icon icon={CheckCircleIcon} color="success" label="Success tooltip" />
      <Icon icon={InfoIcon} color="info" label="Info tooltip" />
      <Icon icon={MinusCircleIcon} color="warning" label="Warning tooltip" />
      <Icon icon={WarningCircleIcon} color="error" label="Error tooltip" />
      <Icon icon={SparkleIcon} color="special" label="Special tooltip" />
    </div>
  ),
};

export const SolidIcons: Story = {
  render: () => (
    <div className="space-y-space-6">
      <div className="space-y-space-4">
        <h3 className="text-lg font-semibold">Line vs Solid</h3>
        <div className="flex flex-wrap gap-space-6">
          {[
            { icon: InfoIcon, label: 'Info' },
            { icon: CheckCircleIcon, label: 'Check' },
            { icon: MinusCircleIcon, label: 'Minus' },
            { icon: WarningCircleIcon, label: 'Alert' },
            { icon: XCircleIcon, label: 'X' },
            { icon: GearIcon, label: 'Settings' },
            { icon: SparkleIcon, label: 'Stars' },
          ].map(({ icon: IconComponent, label }) => (
            <div key={label} className="flex flex-col items-center gap-space-2">
              <div className="flex items-center gap-space-2">
                <Icon icon={IconComponent} weight="regular" />
                <Icon icon={IconComponent} weight="fill" />
              </div>
              <span className="text-xs text-secondary">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-space-4">
        <h3 className="text-lg font-semibold">Solid with Colors</h3>
        <div className="flex flex-wrap gap-space-4">
          <Icon icon={InfoIcon} color="neutral" weight="fill" />
          <Icon icon={CheckCircleIcon} color="success" weight="fill" />
          <Icon icon={InfoIcon} color="info" weight="fill" />
          <Icon icon={MinusCircleIcon} color="warning" weight="fill" />
          <Icon icon={XCircleIcon} color="error" weight="fill" />
          <Icon icon={SparkleIcon} color="special" weight="fill" />
        </div>
      </div>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-space-6">
      {/* Default (no background) */}
      <div className="space-y-space-4">
        <h3 className="text-lg font-semibold">Default (No Background)</h3>
        <div className="flex flex-wrap items-center gap-space-4">
          <Icon icon={InfoIcon} size="sm" />
          <Icon icon={InfoIcon} size="md" />
          <Icon icon={InfoIcon} size="lg" />
        </div>
      </div>

      {/* Colors with square backgrounds */}
      <div className="space-y-space-4">
        <h3 className="text-lg font-semibold">Square Backgrounds</h3>
        <div className="flex flex-wrap gap-space-4">
          <Icon icon={InfoIcon} color="neutral" />
          <Icon icon={CheckCircleIcon} color="success" />
          <Icon icon={InfoIcon} color="info" />
          <Icon icon={MinusCircleIcon} color="warning" />
          <Icon icon={XCircleIcon} color="error" />
          <Icon icon={SparkleIcon} color="special" />
        </div>
      </div>

      {/* Colors with rounded backgrounds */}
      <div className="space-y-space-4">
        <h3 className="text-lg font-semibold">Rounded Backgrounds</h3>
        <div className="flex flex-wrap gap-space-4">
          <Icon icon={InfoIcon} color="neutral" rounded />
          <Icon icon={CheckCircleIcon} color="success" rounded />
          <Icon icon={InfoIcon} color="info" rounded />
          <Icon icon={MinusCircleIcon} color="warning" rounded />
          <Icon icon={XCircleIcon} color="error" rounded />
          <Icon icon={SparkleIcon} color="special" rounded />
        </div>
      </div>

      {/* Different sizes */}
      <div className="space-y-space-4">
        <h3 className="text-lg font-semibold">Sizes Comparison</h3>
        <div className="flex flex-wrap items-center gap-space-4">
          <Icon icon={GearIcon} color="neutral" size="xxs" />
          <Icon icon={GearIcon} color="neutral" size="xs" />
          <Icon icon={GearIcon} color="neutral" size="sm" />
          <Icon icon={GearIcon} color="neutral" size="md" />
          <Icon icon={GearIcon} color="neutral" size="lg" />
          <Icon icon={GearIcon} color="neutral" size="xl" />
        </div>
      </div>

      {/* With labels (tooltips) */}
      <div className="space-y-space-4">
        <h3 className="text-lg font-semibold">
          With Labels (hover for tooltip)
        </h3>
        <div className="flex flex-wrap gap-space-4">
          <Icon icon={InfoIcon} label="Default information" />
          <Icon icon={InfoIcon} color="neutral" label="Neutral information" />
          <Icon
            icon={CheckCircleIcon}
            color="success"
            label="Operation successful"
          />
          <Icon icon={InfoIcon} color="info" label="Accented information" />
          <Icon icon={MinusCircleIcon} color="warning" label="Pending status" />
          <Icon
            icon={WarningCircleIcon}
            color="error"
            label="An error occurred"
          />
          <Icon
            icon={SparkleIcon}
            color="special"
            label="Special AI feature"
            rounded
          />
        </div>
      </div>

      {/* Complete matrix */}
      <div className="space-y-space-4">
        <h3 className="text-lg font-semibold">Complete Matrix</h3>
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="p-space-2 text-left text-sm">Color</th>
              <th className="p-space-2 text-center text-sm">SM</th>
              <th className="p-space-2 text-center text-sm">MD</th>
              <th className="p-space-2 text-center text-sm">LG</th>
              <th className="p-space-2 text-center text-sm">SM Rounded</th>
              <th className="p-space-2 text-center text-sm">MD Rounded</th>
              <th className="p-space-2 text-center text-sm">LG Rounded</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-space-2 text-sm">Default</td>
              <td className="p-space-2">
                <Icon icon={InfoIcon} size="sm" />
              </td>
              <td className="p-space-2">
                <Icon icon={InfoIcon} size="md" />
              </td>
              <td className="p-space-2">
                <Icon icon={InfoIcon} size="lg" />
              </td>
              <td className="p-space-2 text-center text-xs text-tertiary">—</td>
              <td className="p-space-2 text-center text-xs text-tertiary">—</td>
              <td className="p-space-2 text-center text-xs text-tertiary">—</td>
            </tr>
            <tr>
              <td className="p-space-2 text-sm">Neutral</td>
              <td className="p-space-2">
                <Icon icon={InfoIcon} color="neutral" size="sm" />
              </td>
              <td className="p-space-2">
                <Icon icon={InfoIcon} color="neutral" size="md" />
              </td>
              <td className="p-space-2">
                <Icon icon={InfoIcon} color="neutral" size="lg" />
              </td>
              <td className="p-space-2">
                <Icon icon={InfoIcon} color="neutral" size="sm" rounded />
              </td>
              <td className="p-space-2">
                <Icon icon={InfoIcon} color="neutral" size="md" rounded />
              </td>
              <td className="p-space-2">
                <Icon icon={InfoIcon} color="neutral" size="lg" rounded />
              </td>
            </tr>
            <tr>
              <td className="p-space-2 text-sm">Success</td>
              <td className="p-space-2">
                <Icon icon={CheckCircleIcon} color="success" size="sm" />
              </td>
              <td className="p-space-2">
                <Icon icon={CheckCircleIcon} color="success" size="md" />
              </td>
              <td className="p-space-2">
                <Icon icon={CheckCircleIcon} color="success" size="lg" />
              </td>
              <td className="p-space-2">
                <Icon
                  icon={CheckCircleIcon}
                  color="success"
                  size="sm"
                  rounded
                />
              </td>
              <td className="p-space-2">
                <Icon
                  icon={CheckCircleIcon}
                  color="success"
                  size="md"
                  rounded
                />
              </td>
              <td className="p-space-2">
                <Icon
                  icon={CheckCircleIcon}
                  color="success"
                  size="lg"
                  rounded
                />
              </td>
            </tr>
            <tr>
              <td className="p-space-2 text-sm">Info</td>
              <td className="p-space-2">
                <Icon icon={InfoIcon} color="info" size="sm" />
              </td>
              <td className="p-space-2">
                <Icon icon={InfoIcon} color="info" size="md" />
              </td>
              <td className="p-space-2">
                <Icon icon={InfoIcon} color="info" size="lg" />
              </td>
              <td className="p-space-2">
                <Icon icon={InfoIcon} color="info" size="sm" rounded />
              </td>
              <td className="p-space-2">
                <Icon icon={InfoIcon} color="info" size="md" rounded />
              </td>
              <td className="p-space-2">
                <Icon icon={InfoIcon} color="info" size="lg" rounded />
              </td>
            </tr>
            <tr>
              <td className="p-space-2 text-sm">Warning</td>
              <td className="p-space-2">
                <Icon icon={MinusCircleIcon} color="warning" size="sm" />
              </td>
              <td className="p-space-2">
                <Icon icon={MinusCircleIcon} color="warning" size="md" />
              </td>
              <td className="p-space-2">
                <Icon icon={MinusCircleIcon} color="warning" size="lg" />
              </td>
              <td className="p-space-2">
                <Icon
                  icon={MinusCircleIcon}
                  color="warning"
                  size="sm"
                  rounded
                />
              </td>
              <td className="p-space-2">
                <Icon
                  icon={MinusCircleIcon}
                  color="warning"
                  size="md"
                  rounded
                />
              </td>
              <td className="p-space-2">
                <Icon
                  icon={MinusCircleIcon}
                  color="warning"
                  size="lg"
                  rounded
                />
              </td>
            </tr>
            <tr>
              <td className="p-space-2 text-sm">Error</td>
              <td className="p-space-2">
                <Icon icon={XCircleIcon} color="error" size="sm" />
              </td>
              <td className="p-space-2">
                <Icon icon={XCircleIcon} color="error" size="md" />
              </td>
              <td className="p-space-2">
                <Icon icon={XCircleIcon} color="error" size="lg" />
              </td>
              <td className="p-space-2">
                <Icon icon={XCircleIcon} color="error" size="sm" rounded />
              </td>
              <td className="p-space-2">
                <Icon icon={XCircleIcon} color="error" size="md" rounded />
              </td>
              <td className="p-space-2">
                <Icon icon={XCircleIcon} color="error" size="lg" rounded />
              </td>
            </tr>
            <tr>
              <td className="p-space-2 text-sm">Special</td>
              <td className="p-space-2">
                <Icon icon={SparkleIcon} color="special" size="sm" />
              </td>
              <td className="p-space-2">
                <Icon icon={SparkleIcon} color="special" size="md" />
              </td>
              <td className="p-space-2">
                <Icon icon={SparkleIcon} color="special" size="lg" />
              </td>
              <td className="p-space-2">
                <Icon icon={SparkleIcon} color="special" size="sm" rounded />
              </td>
              <td className="p-space-2">
                <Icon icon={SparkleIcon} color="special" size="md" rounded />
              </td>
              <td className="p-space-2">
                <Icon icon={SparkleIcon} color="special" size="lg" rounded />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  ),
};

import type { ReactNode } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Logo } from '../Logo';
import type { LogoBrand, LogoSize, LogoVariant } from '../Logo';
import { Text } from '../Text';

const logoBrands: LogoBrand[] = ['langsmith', 'langchain', 'fleet', 'engine'];
const logoVariants: LogoVariant[] = ['logomark', 'wordmark', 'full'];
const logoSizes: LogoSize[] = ['sm', 'md', 'lg', 'xl'];

const LogoStorySurface = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-32 w-full items-center justify-center bg-surface-level-1 p-space-5 text-primary">
    {children}
  </div>
);

const meta = {
  title: 'Components/Display/Logo',
  component: Logo,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: logoSizes,
    },
    variant: {
      control: 'select',
      options: logoVariants,
    },
    brand: {
      control: 'select',
      options: logoBrands,
    },
    className: {
      control: 'text',
    },
  },
  args: {
    size: 'md',
    variant: 'full',
    brand: 'langsmith',
    className: 'text-primary',
  },
  render: (args) => (
    <LogoStorySurface>
      <Logo {...args} />
    </LogoStorySurface>
  ),
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LangSmith: Story = {};

export const LangChain: Story = {
  args: {
    brand: 'langchain',
  },
};

export const Fleet: Story = {
  args: {
    brand: 'fleet',
  },
};

export const Engine: Story = {
  args: {
    brand: 'engine',
  },
};

export const Sizes: Story = {
  parameters: {
    layout: 'padded',
  },
  render: () => (
    <div className="bg-surface-level-1 p-space-5 text-primary">
      <div className="flex flex-col gap-space-6">
        {logoBrands.map((brand) => (
          <div key={brand} className="flex flex-col gap-space-4">
            <Text className="capitalize text-secondary">{brand}</Text>
            <div className="flex flex-col gap-space-5">
              {logoVariants.map((variant) => (
                <div key={variant} className="flex flex-col gap-space-2">
                  <Text variant="xs" className="capitalize text-tertiary">
                    {variant}
                  </Text>
                  <div className="flex flex-wrap items-end gap-space-6">
                    {logoSizes.map((size) => (
                      <div
                        key={size}
                        className="flex flex-col items-center gap-space-2"
                      >
                        <div className="flex h-12 items-end">
                          <Logo
                            brand={brand}
                            variant={variant}
                            size={size}
                            className="text-primary"
                          />
                        </div>
                        <Text variant="xs" className="text-tertiary">
                          {size}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

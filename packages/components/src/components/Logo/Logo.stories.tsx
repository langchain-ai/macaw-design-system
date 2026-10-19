import type { ReactNode } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Logo } from '.';
import type { LogoBrand, LogoSize, LogoVariant } from '.';
import { Text } from '../Text';

const logoBrands: LogoBrand[] = ['langsmith', 'langchain', 'fleet', 'engine'];
const logoVariants: LogoVariant[] = ['logomark', 'wordmark', 'full'];
const logoSizes: LogoSize[] = ['sm', 'md', 'lg', 'xl'];

const LogoStorySurface = ({ children }: { children: ReactNode }) => (
  <div className="bg-surface-level-1 p-space-5 text-primary flex min-h-32 w-full items-center justify-center">
    {children}
  </div>
);

const meta = {
  title: 'Components/Display/Logo',
  component: Logo,
  parameters: {
    layout: 'fullscreen',
  },
  tags: [
    'autodocs',
    'logo',
    'brand',
    'wordmark',
    'logomark',
    'product identity',
  ],
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

export const LangSmith: Story = {
  name: 'LangSmith',
};

export const LangChain: Story = {
  name: 'LangChain',
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
      <div className="gap-space-6 flex flex-col">
        {logoBrands.map((brand) => (
          <div key={brand} className="gap-space-4 flex flex-col">
            <Text className="text-secondary capitalize">{brand}</Text>
            <div className="gap-space-5 flex flex-col">
              {logoVariants.map((variant) => (
                <div key={variant} className="gap-space-2 flex flex-col">
                  <Text variant="xs" className="text-tertiary capitalize">
                    {variant}
                  </Text>
                  <div className="gap-space-6 flex flex-wrap items-end">
                    {logoSizes.map((size) => (
                      <div
                        key={size}
                        className="gap-space-2 flex flex-col items-center"
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

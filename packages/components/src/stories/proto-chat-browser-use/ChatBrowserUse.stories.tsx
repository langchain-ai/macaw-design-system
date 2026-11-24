// PROTOTYPE - throwaway. Delete this folder once a direction is picked.
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Harness } from './Harness';

const meta = {
  title: 'POC/Chat browser use',
  component: Harness,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Harness>;

export default meta;

export const Explore: StoryObj<typeof meta> = {};

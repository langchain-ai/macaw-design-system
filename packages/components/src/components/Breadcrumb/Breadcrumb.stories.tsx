import { MemoryRouter, Link as RouterLink } from 'react-router-dom';

import { CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';
import { FolderIcon } from '@phosphor-icons/react/dist/ssr/Folder';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Skeleton } from '../Skeleton';
import { Breadcrumb, BreadcrumbLink, BreadcrumbPage } from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Navigation/Breadcrumb',
  component: Breadcrumb,
  tags: [
    'autodocs',
    'breadcrumb',
    'navigation',
    'hierarchy',
    'path',
    'router link',
  ],
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbLink href="#projects" leftDecorator={FolderIcon}>
        Projects
      </BreadcrumbLink>
      <BreadcrumbLink href="#project">Support Agent</BreadcrumbLink>
      <BreadcrumbPage>Trace Details</BreadcrumbPage>
    </Breadcrumb>
  ),
};

export const ChevronSeparator: Story = {
  render: () => (
    <Breadcrumb separator={<CaretRightIcon size={10} weight="regular" />}>
      <BreadcrumbLink href="#files" leftDecorator={FolderIcon}>
        Files
      </BreadcrumbLink>
      <BreadcrumbLink href="#skills">Skills</BreadcrumbLink>
      <BreadcrumbPage>Research</BreadcrumbPage>
    </Breadcrumb>
  ),
};

export const RouterLinks: Story = {
  render: () => (
    <MemoryRouter>
      <Breadcrumb>
        <BreadcrumbLink as={<RouterLink to="/projects" />}>
          Projects
        </BreadcrumbLink>
        <BreadcrumbPage>Support Agent</BreadcrumbPage>
      </Breadcrumb>
    </MemoryRouter>
  ),
};

export const Narrow: Story = {
  render: () => (
    <div className="w-64 max-w-full">
      <Breadcrumb>
        <BreadcrumbLink href="#projects" leftDecorator={FolderIcon}>
          Projects
        </BreadcrumbLink>
        <BreadcrumbLink href="#project">
          Support Agent With a Very Long Project Name
        </BreadcrumbLink>
        <BreadcrumbPage>A Very Long Trace Name That Truncates</BreadcrumbPage>
      </Breadcrumb>
    </div>
  ),
};

export const CurrentPageOnly: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbPage>Projects</BreadcrumbPage>
    </Breadcrumb>
  ),
};

export const Loading: Story = {
  render: () => (
    <Breadcrumb aria-busy="true">
      <BreadcrumbLink href="#projects">Projects</BreadcrumbLink>
      <span role="status" aria-label="Loading breadcrumb">
        <Skeleton className="h-3 w-24" />
      </span>
    </Breadcrumb>
  ),
};

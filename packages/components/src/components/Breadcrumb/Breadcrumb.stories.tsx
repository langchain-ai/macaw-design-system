import { MemoryRouter, Link as RouterLink } from 'react-router-dom';
import { expect, waitFor, within } from 'storybook/test';

import { CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';
import { FolderIcon } from '@phosphor-icons/react/dist/ssr/Folder';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button';
import { Skeleton } from '../Skeleton';
import { Text } from '../Text';
import { Breadcrumb, BreadcrumbLink, BreadcrumbPage } from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Navigation/Breadcrumb',
  component: Breadcrumb,
  subcomponents: { BreadcrumbLink, BreadcrumbPage },
  tags: [
    'autodocs',
    'a11y-test',
    'breadcrumb',
    'navigation',
    'hierarchy',
    'path',
    'router link',
    'truncation',
    'single line',
  ],
  parameters: {
    layout: 'padded',
    a11y: { test: 'error' },
    docs: {
      description: {
        component:
          'Compact navigation trail with native or router links and a noninteractive current page. Labels cap at 200px, or 148px when condensed, and reveal a tooltip only when clipped. Trails stay on one line and scroll horizontally when needed. Consumers own routing, layout decisions, data, and loading or error messages.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  render: (args) => (
    <Breadcrumb {...args}>
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
  play: async ({ canvas }) => {
    const navigation = canvas.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(navigation.scrollWidth).toBeLessThanOrEqual(
      navigation.clientWidth
    );
    const label = canvas.getByText(
      'Support Agent With a Very Long Project Name'
    );
    await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
    const items = canvas.getAllByRole('listitem');
    const firstTop = items[0].getBoundingClientRect().top;
    for (const item of items) {
      await expect(item.getBoundingClientRect().top).toBeCloseTo(firstTop, 0);
    }
  },
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

export const Condensed: Story = {
  play: async ({ canvas }) => {
    const standard = within(
      canvas.getByRole('navigation', { name: 'Standard breadcrumb' })
    ).getByText('A Very Long Current Page Label That Needs Truncation');
    const condensed = within(
      canvas.getByRole('navigation', { name: 'Condensed breadcrumb' })
    ).getByText('A Very Long Current Page Label That Needs Truncation');
    await expect(standard.getBoundingClientRect().width).toBeCloseTo(200, 0);
    await expect(condensed.getBoundingClientRect().width).toBeCloseTo(148, 0);
    await expect(standard.scrollWidth).toBeGreaterThan(standard.clientWidth);
    await expect(condensed.scrollWidth).toBeGreaterThan(condensed.clientWidth);
  },
  render: () => (
    <div className="flex flex-col gap-space-4">
      <Breadcrumb aria-label="Standard breadcrumb">
        <BreadcrumbLink href="#projects">Projects</BreadcrumbLink>
        <BreadcrumbPage>
          A Very Long Current Page Label That Needs Truncation
        </BreadcrumbPage>
      </Breadcrumb>
      <Breadcrumb aria-label="Condensed breadcrumb" condensed>
        <BreadcrumbLink href="#projects">Projects</BreadcrumbLink>
        <BreadcrumbPage>
          A Very Long Current Page Label That Needs Truncation
        </BreadcrumbPage>
      </Breadcrumb>
    </div>
  ),
};

export const DeepTrail: Story = {
  play: async ({ canvas, userEvent }) => {
    const navigation = canvas.getByRole('navigation', { name: 'Breadcrumb' });
    const links = canvas.getAllByRole('link');
    const bounds = navigation.getBoundingClientRect();
    links[0].focus();
    for (const [index, link] of links.entries()) {
      if (index > 0) await userEvent.tab();
      await expect(link).toHaveFocus();
      await expect(link.getBoundingClientRect().width).toBeGreaterThan(0);
      await expect(link.getBoundingClientRect().left).toBeGreaterThanOrEqual(
        bounds.left - 1
      );
      await expect(link.getBoundingClientRect().right).toBeLessThanOrEqual(
        bounds.right + 1
      );
    }
    const current = canvas
      .getByText('A Long Current Trace Label That Still Remains Reachable')
      .closest<HTMLElement>('[aria-current="page"]')!;
    await userEvent.tab();
    await expect(current).toHaveFocus();
    await waitFor(() => {
      expect(current.getBoundingClientRect().left).toBeGreaterThanOrEqual(
        bounds.left - 1
      );
      expect(current.getBoundingClientRect().right).toBeLessThanOrEqual(
        bounds.right + 1
      );
    });
    await expect(
      navigation.querySelectorAll('a a, a button, button a, button button')
    ).toHaveLength(0);
    await userEvent.keyboard('{Escape}');
  },
  render: () => (
    <div className="w-64 max-w-full">
      <Breadcrumb condensed>
        <BreadcrumbLink href="#organization" leftDecorator={FolderIcon}>
          Organization
        </BreadcrumbLink>
        <BreadcrumbLink href="#workspace">Workspace</BreadcrumbLink>
        <BreadcrumbLink href="#projects">Projects</BreadcrumbLink>
        <BreadcrumbLink href="#project">Support Agent</BreadcrumbLink>
        <BreadcrumbLink href="#sessions">Sessions</BreadcrumbLink>
        <BreadcrumbLink href="#session">Latest Session</BreadcrumbLink>
        <BreadcrumbPage>
          A Long Current Trace Label That Still Remains Reachable
        </BreadcrumbPage>
      </Breadcrumb>
    </div>
  ),
};

export const ClippedLabelTooltips: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    const link = canvas.getByRole('link', {
      name: 'Support Agent With a Very Long Project Name',
    });
    await userEvent.hover(link);
    await expect(await body.findByRole('tooltip')).toHaveTextContent(
      'Support Agent With a Very Long Project Name'
    );
    await userEvent.unhover(link);
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('tooltip')).not.toBeInTheDocument()
    );

    canvas.getByRole('link', { name: 'Projects' }).focus();
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(await body.findByRole('tooltip')).toHaveTextContent(
      'Support Agent With a Very Long Project Name'
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('tooltip')).not.toBeInTheDocument()
    );

    const current = canvas
      .getByText('A Very Long Current Page Name That Needs a Tooltip')
      .closest<HTMLElement>('[aria-current="page"]')!;
    await userEvent.tab();
    await expect(current).toHaveFocus();
    await expect(await body.findByRole('tooltip')).toHaveTextContent(
      'A Very Long Current Page Name That Needs a Tooltip'
    );
    await expect(current.tagName).toBe('SPAN');
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
  render: () => (
    <Breadcrumb>
      <BreadcrumbLink href="#projects">Projects</BreadcrumbLink>
      <BreadcrumbLink href="#project">
        Support Agent With a Very Long Project Name
      </BreadcrumbLink>
      <BreadcrumbPage>
        A Very Long Current Page Name That Needs a Tooltip
      </BreadcrumbPage>
    </Breadcrumb>
  ),
};

export const ShortCurrentPage: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Tab to an overflowing single-line trail and use the left and right arrow keys to scroll. A short current-page label remains outside the tab order even when it starts beyond the visible edge.',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    const list = canvas.getByRole('list');
    const label = canvas.getByText('Trace');
    const current = label.closest<HTMLElement>('[aria-current="page"]')!;
    await expect(label.scrollWidth).toBe(label.clientWidth);
    await expect(current).toHaveAttribute('tabindex', '-1');
    await waitFor(() => expect(list).toHaveAttribute('tabindex', '0'));
    list.focus();
    await expect(list).toHaveFocus();

    // Testing Library keyboard events cannot invoke native browser scrolling.
    // Exercise the actual scroll container here; arrow-key behavior is manual QA.
    list.scrollTo({ left: list.scrollWidth, behavior: 'smooth' });
    await waitFor(() => {
      const bounds = list.getBoundingClientRect();
      expect(current.getBoundingClientRect().left).toBeGreaterThanOrEqual(
        bounds.left - 1
      );
      expect(current.getBoundingClientRect().right).toBeLessThanOrEqual(
        bounds.right + 1
      );
    });

    list.scrollLeft = 0;
    for (const link of canvas.getAllByRole('link')) {
      await userEvent.tab();
      await expect(link).toHaveFocus();
    }
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Continue' })
    ).toHaveFocus();
  },
  render: () => (
    <div className="flex flex-col items-start gap-space-4">
      <div className="w-64 max-w-full">
        <Breadcrumb>
          <BreadcrumbLink href="#organization">Organization</BreadcrumbLink>
          <BreadcrumbLink href="#workspace">Workspace</BreadcrumbLink>
          <BreadcrumbLink href="#projects">Projects</BreadcrumbLink>
          <BreadcrumbLink href="#project">Support Agent</BreadcrumbLink>
          <BreadcrumbLink href="#sessions">Sessions</BreadcrumbLink>
          <BreadcrumbPage>Trace</BreadcrumbPage>
        </Breadcrumb>
      </div>
      <Button color="secondary" size="sm">
        Continue
      </Button>
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

export const UnavailableAncestor: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbLink href="#files" leftDecorator={FolderIcon}>
        Files
      </BreadcrumbLink>
      <Text as="span" variant="xs" weight="medium" color="quaternary">
        Unavailable Folder
      </Text>
      <BreadcrumbPage>Notes</BreadcrumbPage>
    </Breadcrumb>
  ),
};

export const KeyboardFocus: Story = {
  ...Default,
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Projects' })).toHaveFocus();
  },
};

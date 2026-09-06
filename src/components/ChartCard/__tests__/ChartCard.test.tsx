import { beforeEach, describe, expect, it, vi } from 'vitest';

import userEvent from '@testing-library/user-event';

import { fireEvent, render, screen } from '../../../test-utils';
import { Button } from '../../Button';
import { DropdownMenuItem } from '../../DropdownMenu';
import { Text } from '../../Text';
import { ChartCard } from '../ChartCard';

beforeEach(() => {
  const localStorageMock = {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: localStorageMock,
  });
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: localStorageMock,
  });
});

describe('ChartCard', () => {
  it('renders a labelled chart section without inactive actions', () => {
    render(
      <ChartCard title="Trace count" data-testid="chart-card">
        <div>Chart content</div>
      </ChartCard>
    );

    const card = screen.getByTestId('chart-card');
    expect(card).toHaveAccessibleName('Trace count');
    expect(screen.getByRole('region', { name: 'Trace count' })).toBe(card);
    expect(
      screen.getByRole('heading', { level: 3, name: 'Trace count' })
    ).toBeInTheDocument();
    expect(screen.getByText('Chart content')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Move chart' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Expand chart' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'More chart actions' })
    ).not.toBeInTheDocument();
  });

  it('renders feature-owned controls in the header action area', () => {
    render(
      <ChartCard
        title="Trace count"
        headerActions={<Button>Group by model</Button>}
      >
        <div>Chart content</div>
      </ChartCard>
    );

    const card = screen.getByRole('region', { name: 'Trace count' });
    const button = screen.getByRole('button', { name: 'Group by model' });
    expect(card).toContainElement(button);
    expect(
      button.compareDocumentPosition(screen.getByText('Chart content'))
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('forwards drag and expand interactions', async () => {
    const user = userEvent.setup();
    const onDragPointerDown = vi.fn();
    const onExpand = vi.fn();

    render(
      <ChartCard
        title="Trace count"
        isMovable
        dragHandleProps={{ onPointerDown: onDragPointerDown }}
        expandButtonProps={{ onClick: onExpand }}
      >
        <div>Chart content</div>
      </ChartCard>
    );

    const expandButton = screen.getByRole('button', { name: 'Expand chart' });
    expect(expandButton).toBeEnabled();

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Move chart' }));
    await user.click(expandButton);

    expect(onDragPointerDown).toHaveBeenCalledOnce();
    expect(onExpand).toHaveBeenCalledOnce();
  });

  it('uses isMovable to control the move handle independently of drag props', () => {
    const { rerender } = render(
      <ChartCard
        title="Trace count"
        dragHandleProps={{ onPointerDown: vi.fn() }}
      >
        <div>Chart content</div>
      </ChartCard>
    );

    expect(
      screen.queryByRole('button', { name: 'Move chart' })
    ).not.toBeInTheDocument();

    rerender(
      <ChartCard title="Trace count" isMovable>
        <div>Chart content</div>
      </ChartCard>
    );

    const moveButton = screen.getByRole('button', { name: 'Move chart' });
    expect(moveButton).toBeEnabled();
  });

  it('hides movement and exposes minimize behavior at full width', () => {
    render(
      <ChartCard
        title="Trace count"
        variant="full-width"
        isMovable
        dragHandleProps={{ onPointerDown: vi.fn() }}
        expandButtonProps={{ onClick: vi.fn() }}
        data-testid="chart-card"
      >
        <div>Chart content</div>
      </ChartCard>
    );

    expect(screen.getByTestId('chart-card')).toHaveClass('w-full');
    expect(
      screen.queryByRole('button', { name: 'Move chart' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Minimize chart' })
    ).toBeInTheDocument();
  });

  it('renders feature-owned items in the overflow menu', async () => {
    const user = userEvent.setup();

    render(
      <ChartCard
        title="Trace count"
        menuItems={
          <DropdownMenuItem>
            <Text as="span" variant="sm">
              Duplicate chart
            </Text>
          </DropdownMenuItem>
        }
      >
        <div>Chart content</div>
      </ChartCard>
    );

    await user.click(
      screen.getByRole('button', { name: 'More chart actions' })
    );

    expect(
      screen.getByRole('menuitem', { name: 'Duplicate chart' })
    ).toBeInTheDocument();
  });

  it('renders loading content and hides header actions', () => {
    render(
      <ChartCard
        title="Trace count"
        state="loading"
        headerActions={<Button>Group by model</Button>}
        isMovable
        expandButtonProps={{ onClick: vi.fn() }}
        menuItems={<DropdownMenuItem>Delete chart</DropdownMenuItem>}
        data-testid="chart-card"
      >
        <div>Chart content</div>
      </ChartCard>
    );

    expect(screen.getByTestId('chart-card')).toHaveAttribute(
      'aria-busy',
      'true'
    );
    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
    expect(screen.queryByText('Chart content')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders error content while retaining header actions', () => {
    render(
      <ChartCard
        title="Trace count"
        state="error"
        isMovable
        expandButtonProps={{ onClick: vi.fn() }}
      >
        <div>Chart content</div>
      </ChartCard>
    );

    expect(screen.getByRole('alert')).toBeVisible();
    expect(
      screen.getByRole('heading', {
        name: 'There was an error while loading the chart.',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Refresh the page to try again.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Chart content')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Move chart' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Expand chart' })
    ).toBeInTheDocument();
  });
});

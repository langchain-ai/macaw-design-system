import { createContext, useContext, useState } from 'react';

import { createPortal } from 'react-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Button, Textarea } from '../../../index';
import { act, fireEvent, render, screen } from '../../../test-utils';
import { Pane } from '../../Pane';
import { Popover, PopoverContent, PopoverTrigger } from '../../Popover';
import { SplitViewPane } from '../SplitViewPane';
import { HeaderTitleActionSlot } from '../SplitViewPaneHeader';

const HeaderName = createContext('');

function PaneWithHeader({ open }: { open: boolean }) {
  const headerName = useContext(HeaderName);

  return (
    <SplitViewPane open={open} onClose={() => {}}>
      <HeaderTitleActionSlot.Fill>{headerName}</HeaderTitleActionSlot.Fill>
    </SplitViewPane>
  );
}

function mockPaneBounds(element: HTMLElement) {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(
    DOMRect.fromRect({ x: 500, y: 0, width: 500, height: 800 })
  );
}

describe('SplitViewPane', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('fills viewports narrower than the minimum pane width', () => {
    vi.stubGlobal('innerWidth', 400);

    render(
      <SplitViewPane open title="Details" onClose={() => {}}>
        Pane content
      </SplitViewPane>
    );

    expect(screen.getByRole('region', { name: 'Details' })).toHaveStyle({
      left: '0px',
    });
  });

  it('resizes by keyboard and updates its bounds with the viewport', async () => {
    vi.stubGlobal('innerWidth', 1000);
    const { user } = render(
      <SplitViewPane open title="Details" onClose={() => {}}>
        Pane content
      </SplitViewPane>
    );
    const separator = screen.getByRole('separator', { name: 'Resize pane' });
    const initialLeft = Number(separator.getAttribute('aria-valuenow'));

    expect(separator).toHaveAttribute('aria-orientation', 'vertical');

    separator.focus();
    await user.keyboard('{ArrowRight}');
    expect(separator).toHaveAttribute(
      'aria-valuenow',
      String(initialLeft + 10)
    );

    await user.keyboard('{End}');
    expect(separator).toHaveAttribute('aria-valuenow', '500');

    await user.keyboard('{Home}{ArrowLeft}');
    expect(separator).toHaveAttribute('aria-valuenow', '100');
    vi.stubGlobal('innerWidth', 1200);
    // A viewport resize is a browser event that user-event cannot model.
    fireEvent(window, new Event('resize'));
    expect(separator).toHaveAttribute('aria-valuenow', '100');
    expect(separator).toHaveAttribute('aria-valuemax', '700');
  });

  it('reports the current position while dragging', async () => {
    vi.stubGlobal('innerWidth', 1000);
    const { user } = render(
      <SplitViewPane open title="Details" onClose={() => {}}>
        Pane content
      </SplitViewPane>
    );
    const separator = screen.getByRole('separator', { name: 'Resize pane' });
    await user.pointer([
      { target: separator, keys: '[MouseLeft>]' },
      { target: separator, coords: { clientX: 400 } },
    ]);
    expect(separator).toHaveAttribute('aria-valuenow', '400');
    await user.pointer({ keys: '[/MouseLeft]' });
    expect(screen.getByRole('region', { name: 'Details' })).toHaveStyle({
      left: '400px',
    });
  });

  it('keeps resize bounds and saved widths within the space beside docked chat', async () => {
    vi.stubGlobal('innerWidth', 1000);
    const observers = new Map<Element, () => void>();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(private callback: () => void) {}
        observe(element: Element) {
          observers.set(element, this.callback);
        }
        unobserve(element: Element) {
          observers.delete(element);
        }
        disconnect() {}
      }
    );
    const { user } = render(
      <SplitViewPane
        open
        title="Details"
        sidePaneId="docked-chat-test"
        onClose={() => {}}
      >
        Pane content
      </SplitViewPane>
    );
    const pane = screen.getByRole('region', { name: 'Details' });
    const separator = screen.getByRole('separator', { name: 'Resize pane' });
    // JSDOM cannot resolve CSS variables or deliver layout observations.
    // Model the resolved right inset as chat docks, grows, and undocks.
    const setChatWidth = (width: number) =>
      act(() => {
        pane.style.right = `${width}px`;
        observers.get(pane)?.();
      });

    setChatWidth(300);
    expect(separator).toHaveAttribute('aria-valuemax', '200');
    separator.focus();
    await user.keyboard('{End}');
    expect(pane).toHaveStyle({ left: '200px' });
    expect(
      Number(localStorage.getItem('SidePanelGroup:sizes:docked-chat-test'))
    ).toBeCloseTo(500 / 700);

    await user.pointer([
      { target: separator, keys: '[MouseLeft>]', coords: { clientX: 200 } },
      { target: separator, coords: { clientX: 500 } },
      { keys: '[/MouseLeft]' },
    ]);
    expect(separator).toHaveAttribute('aria-valuenow', '200');

    setChatWidth(600);
    expect(separator).toHaveAttribute('aria-valuemin', '0');
    expect(separator).toHaveAttribute('aria-valuemax', '0');
    expect(pane).toHaveStyle({ left: '0px' });

    setChatWidth(0);
    expect(separator).toHaveAttribute('aria-valuemax', '500');
    expect(pane).toHaveStyle({ left: '100px' });
  });

  it('closes when clicking outside the pane', () => {
    const onClose = vi.fn();
    render(
      <>
        <Button>Outside</Button>
        <SplitViewPane open onClose={onClose} dismissOnOutsideClick>
          Pane content
        </SplitViewPane>
      </>
    );
    mockPaneBounds(screen.getByTestId('split-view-pane'));

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Outside' }), {
      clientX: 100,
      clientY: 100,
    });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('preserves the pane while chatting and using portaled controls, but closes on an outside click', async () => {
    function Harness() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <Button>Outside</Button>
          <div data-split-view-pane-interaction-boundary>
            <Textarea aria-label="Chat message" onChange={() => {}} />
            <Popover>
              <PopoverTrigger asChild>
                <Button>Conversation history</Button>
              </PopoverTrigger>
              <PopoverContent data-split-view-pane-interaction-boundary>
                <Button>Previous conversation</Button>
              </PopoverContent>
            </Popover>
          </div>
          {open && (
            <SplitViewPane
              open
              title="Peeked run"
              onClose={() => setOpen(false)}
              dismissOnOutsideClick
            >
              Pane content
            </SplitViewPane>
          )}
        </>
      );
    }
    const { user } = render(<Harness />);
    mockPaneBounds(screen.getByRole('region', { name: 'Peeked run' }));

    await user.type(
      screen.getByRole('textbox', { name: 'Chat message' }),
      'Explain this run'
    );
    expect(screen.getByRole('textbox', { name: 'Chat message' })).toHaveValue(
      'Explain this run'
    );
    expect(screen.getByRole('region', { name: 'Peeked run' })).toBeVisible();

    await user.click(
      screen.getByRole('button', { name: 'Conversation history' })
    );
    await user.click(
      await screen.findByRole('button', { name: 'Previous conversation' })
    );
    expect(screen.getByRole('region', { name: 'Peeked run' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Outside' }));
    expect(
      screen.queryByRole('region', { name: 'Peeked run' })
    ).not.toBeInTheDocument();
  });

  it('does not close by default when clicking outside the pane', () => {
    const onClose = vi.fn();
    render(
      <SplitViewPane open onClose={onClose}>
        Pane content
      </SplitViewPane>
    );
    mockPaneBounds(screen.getByTestId('split-view-pane'));

    fireEvent.mouseDown(document, { clientX: 100, clientY: 100 });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('stays open when clicking a data grid row', () => {
    const onClose = vi.fn();
    render(
      <>
        <div className="data-grid-row-component">
          <Button>Another row</Button>
        </div>
        <SplitViewPane open onClose={onClose} dismissOnOutsideClick>
          Pane content
        </SplitViewPane>
      </>
    );
    mockPaneBounds(screen.getByTestId('split-view-pane'));

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Another row' }), {
      clientX: 100,
      clientY: 100,
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('stays open while interacting with a nested pane', () => {
    const onClose = vi.fn();
    render(
      <SplitViewPane open onClose={onClose} dismissOnOutsideClick>
        <Pane open onClose={() => {}} title="Add to dataset">
          <Button>View Raw</Button>
          {createPortal(<Button>JSON</Button>, document.body)}
        </Pane>
      </SplitViewPane>
    );
    mockPaneBounds(screen.getByTestId('split-view-pane'));

    fireEvent.mouseDown(screen.getByRole('button', { name: 'View Raw' }), {
      clientX: 100,
      clientY: 100,
    });
    fireEvent.mouseDown(screen.getByText('JSON'), {
      clientX: 100,
      clientY: 100,
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('stays open when grabbing the resize handle just outside the pane edge', () => {
    const onClose = vi.fn();
    render(
      <SplitViewPane open onClose={onClose} dismissOnOutsideClick>
        Pane content
      </SplitViewPane>
    );
    mockPaneBounds(screen.getByTestId('split-view-pane'));

    fireEvent.mouseDown(screen.getByTestId('split-view-pane-resize-handle'), {
      clientX: 494,
      clientY: 100,
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('stays open when clicking the pane on a subpixel edge', () => {
    const onClose = vi.fn();
    render(
      <SplitViewPane open onClose={onClose} dismissOnOutsideClick>
        <Button>Inside</Button>
      </SplitViewPane>
    );
    mockPaneBounds(screen.getByTestId('split-view-pane'));

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Inside' }), {
      clientX: 499,
      clientY: 100,
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('stays open when clicking inside the pane', () => {
    const onClose = vi.fn();
    render(
      <SplitViewPane open onClose={onClose} dismissOnOutsideClick>
        <Button>Inside</Button>
      </SplitViewPane>
    );
    mockPaneBounds(screen.getByTestId('split-view-pane'));

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Inside' }), {
      clientX: 600,
      clientY: 100,
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('retains header content while closing', () => {
    const { rerender } = render(
      <HeaderName.Provider value="Thread name">
        <PaneWithHeader open />
      </HeaderName.Provider>
    );

    rerender(
      <HeaderName.Provider value="">
        <PaneWithHeader open={false} />
      </HeaderName.Provider>
    );

    expect(screen.getByText('Thread name')).toBeVisible();
  });

  it('retains the expand button while closing', () => {
    const { rerender } = render(
      <SplitViewPane open onClose={() => {}} onExpand={() => {}}>
        Pane content
      </SplitViewPane>
    );

    rerender(
      <SplitViewPane open={false} onClose={() => {}}>
        Pane content
      </SplitViewPane>
    );

    expect(screen.getByRole('button', { name: 'Expand' })).toBeVisible();
  });

  it('stops handling outside clicks after it closes', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <SplitViewPane open onClose={onClose} dismissOnOutsideClick>
        Pane content
      </SplitViewPane>
    );
    mockPaneBounds(screen.getByTestId('split-view-pane'));

    rerender(
      <SplitViewPane open={false} onClose={onClose}>
        Pane content
      </SplitViewPane>
    );
    fireEvent.mouseDown(document, { clientX: 100, clientY: 100 });

    expect(onClose).not.toHaveBeenCalled();
  });
});

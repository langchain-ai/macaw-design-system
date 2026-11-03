import { createRef, type FocusEvent, type ReactNode } from 'react';

import { Link as RouterLink, MemoryRouter } from 'react-router-dom';

import { TooltipProvider } from '@radix-ui/react-tooltip';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Breadcrumb, BreadcrumbLink, BreadcrumbPage } from '../Breadcrumb';

const labelWidths = new Map<string, number>();
const resizeCallbacks = new Set<() => void>();

function Providers({ children }: { children: ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}

function resizeLabels() {
  act(() => {
    for (const callback of resizeCallbacks) callback();
  });
}

describe('Breadcrumb', () => {
  beforeEach(() => {
    labelWidths.clear();
    resizeCallbacks.clear();
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(100);
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(
      function (this: HTMLElement) {
        if (this.tagName === 'OL') return labelWidths.get('__trail__') ?? 100;
        return labelWidths.get(this.textContent ?? '') ?? 100;
      }
    );
    vi.stubGlobal(
      'ResizeObserver',
      class MockResizeObserver {
        private targets = new Set<Element>();
        private notify: () => void;

        constructor(callback: ResizeObserverCallback) {
          this.notify = () => {
            callback(
              [...this.targets].map(
                (target) =>
                  ({
                    target,
                    contentRect: { width: 100, height: 16 },
                  }) as ResizeObserverEntry
              ),
              this as unknown as ResizeObserver
            );
          };
        }

        observe(target: Element) {
          this.targets.add(target);
          resizeCallbacks.add(this.notify);
        }

        unobserve(target: Element) {
          this.targets.delete(target);
        }

        disconnect() {
          this.targets.clear();
          resizeCallbacks.delete(this.notify);
        }
      }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders ordered navigation with a noninteractive current page and hidden separators', async () => {
    render(
      <Breadcrumb separator=">">
        <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
        {false}
        {''}
        <BreadcrumbLink href="/projects/support">Support Agent</BreadcrumbLink>
        <BreadcrumbPage>Trace Details</BreadcrumbPage>
      </Breadcrumb>,
      { wrapper: Providers }
    );
    expect(
      screen.getByRole('navigation', { name: 'Breadcrumb' })
    ).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getAllByRole('link')).toHaveLength(2);
    const currentPage = screen
      .getByText('Trace Details')
      .closest('[aria-current]');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
    expect(currentPage?.tagName).toBe('SPAN');
    expect(currentPage).not.toHaveAttribute('href');
    for (const separator of screen.getAllByText('>'))
      expect(separator).toHaveAttribute('aria-hidden', 'true');
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Support Agent' })).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it('uses fixed-size decorative SVG separators by default', () => {
    render(
      <Breadcrumb>
        <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
        <BreadcrumbLink href="/projects/support">Support Agent</BreadcrumbLink>
        <BreadcrumbPage>Trace Details</BreadcrumbPage>
      </Breadcrumb>,
      { wrapper: Providers }
    );
    const separators = screen.getByRole('navigation').querySelectorAll('svg');
    expect(separators).toHaveLength(2);
    for (const separator of separators) {
      expect(separator).toHaveAttribute('width', '10');
      expect(separator).toHaveAttribute('height', '10');
      expect(separator.closest('[aria-hidden="true"]')).not.toBeNull();
    }
  });

  it('composes with router links and forwards refs and anchor attributes', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <MemoryRouter>
        <Breadcrumb aria-label="File path">
          <BreadcrumbLink
            as={
              <RouterLink
                to="/files"
                className="router-link"
                title="Open files"
              />
            }
            ref={ref}
            target="_blank"
            rel="noreferrer"
          >
            Files
          </BreadcrumbLink>
          <BreadcrumbPage>Notes</BreadcrumbPage>
        </Breadcrumb>
      </MemoryRouter>,
      { wrapper: Providers }
    );
    const link = screen.getByRole('link', { name: 'Files' });
    expect(link).toHaveAttribute('href', '/files');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
    expect(link).toHaveClass('router-link');
    expect(link).toHaveAttribute('title', 'Open files');
    expect(ref.current).toBe(link);
    expect(
      screen.getByRole('navigation', { name: 'File path' })
    ).toBeInTheDocument();
  });

  it('reveals clipped ancestor labels on hover and keyboard focus without native titles', async () => {
    const label = 'A long project name';
    labelWidths.set(label, 250);
    render(
      <Breadcrumb>
        <BreadcrumbLink href="/projects">{label}</BreadcrumbLink>
        <BreadcrumbPage>Trace Details</BreadcrumbPage>
      </Breadcrumb>,
      { wrapper: Providers }
    );
    const link = screen.getByRole('link', { name: label });
    expect(link).not.toHaveAttribute('title');
    const user = userEvent.setup();
    await user.hover(link);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(label);
    await user.unhover(link);
    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    );
    await user.tab();
    expect(link).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(label);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(link).toHaveFocus();
  });

  it('does not show tooltips or add a current-page tab stop for labels that fit', async () => {
    render(
      <Breadcrumb>
        <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
        <BreadcrumbPage>Trace Details</BreadcrumbPage>
      </Breadcrumb>,
      { wrapper: Providers }
    );
    const user = userEvent.setup();
    await user.hover(screen.getByRole('link'));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    await user.unhover(screen.getByRole('link'));
    await user.tab();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it('makes a clipped current page keyboard discoverable and preserves its node and focus after resizing', async () => {
    const label = 'A long trace name';
    labelWidths.set(label, 250);
    const pageRef = createRef<HTMLSpanElement>();
    render(
      <Breadcrumb>
        <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
        <BreadcrumbPage ref={pageRef}>{label}</BreadcrumbPage>
      </Breadcrumb>,
      { wrapper: Providers }
    );
    const page = pageRef.current;
    expect(page).toHaveAttribute('tabindex', '0');
    expect(page).toHaveAttribute('aria-current', 'page');
    expect(page).not.toHaveAttribute('title');
    const user = userEvent.setup();
    await user.tab();
    await user.tab();
    expect(page).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(label);

    labelWidths.set(label, 100);
    resizeLabels();
    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    );
    expect(pageRef.current).toBe(page);
    expect(page).toHaveFocus();
    expect(page).not.toHaveAttribute('tabindex', '0');
  });

  it('updates clipping when label content changes and honors an explicit current-page tabIndex', async () => {
    const label = 'A long trace name';
    labelWidths.set(label, 250);
    const { rerender } = render(
      <Breadcrumb>
        <BreadcrumbPage>{label}</BreadcrumbPage>
      </Breadcrumb>,
      { wrapper: Providers }
    );
    const page = screen.getByText(label).closest('[aria-current]');
    const user = userEvent.setup();
    await user.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(label);

    rerender(
      <Breadcrumb>
        <BreadcrumbPage>Short</BreadcrumbPage>
      </Breadcrumb>
    );
    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    );
    expect(screen.getByText('Short').closest('[aria-current]')).toBe(page);
    expect(page).toHaveFocus();
    expect(page).not.toHaveAttribute('tabindex', '0');

    rerender(
      <Breadcrumb>
        <BreadcrumbPage tabIndex={-1}>{label}</BreadcrumbPage>
      </Breadcrumb>
    );
    expect(page).toHaveAttribute('tabindex', '-1');
  });

  it('retains the ancestor link and its focus when resizing changes whether it is clipped', async () => {
    const label = 'Support Agent';
    const linkRef = createRef<HTMLAnchorElement>();
    render(
      <Breadcrumb>
        <BreadcrumbLink ref={linkRef} href="/projects/support">
          {label}
        </BreadcrumbLink>
        <BreadcrumbPage>Trace Details</BreadcrumbPage>
      </Breadcrumb>,
      { wrapper: Providers }
    );
    const user = userEvent.setup();
    const link = linkRef.current;
    await user.tab();
    expect(link).toHaveFocus();
    labelWidths.set(label, 250);
    resizeLabels();
    expect(linkRef.current).toBe(link);
    expect(link).toHaveFocus();
    await user.tab();
    await user.tab({ shift: true });
    expect(await screen.findByRole('tooltip')).toHaveTextContent(label);
    labelWidths.set(label, 100);
    resizeLabels();
    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    );
    expect(linkRef.current).toBe(link);
    expect(link).toHaveFocus();
  });

  it('adds a scroll-list tab stop only for overflowing single-line trails and preserves focus after resizing', async () => {
    const contents = [
      <BreadcrumbLink key="projects" href="/projects">
        Projects
      </BreadcrumbLink>,
      <BreadcrumbPage key="trace">Trace Details</BreadcrumbPage>,
    ];
    render(<Breadcrumb>{contents}</Breadcrumb>, { wrapper: Providers });
    const list = screen.getByRole('list');
    expect(list).toHaveAttribute('tabindex', '-1');
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole('link')).toHaveFocus();

    labelWidths.set('__trail__', 250);
    resizeLabels();
    expect(list).toHaveAttribute('tabindex', '0');
    await user.tab({ shift: true });
    expect(list).toHaveFocus();

    labelWidths.set('__trail__', 100);
    resizeLabels();
    expect(screen.getByRole('list')).toBe(list);
    expect(list).toHaveFocus();
    expect(list).toHaveAttribute('tabindex', '-1');
  });

  it.each([false, true])(
    'reveals the focused single-line current page unless the consumer prevents it (preventDefault=%s)',
    async (preventDefault) => {
      const label = 'A long current page';
      labelWidths.set(label, 250);
      const scrollIntoView = vi
        .spyOn(Element.prototype, 'scrollIntoView')
        .mockImplementation(() => {});
      scrollIntoView.mockClear();
      const onFocus = vi.fn((event: FocusEvent<HTMLSpanElement>) => {
        if (preventDefault) event.preventDefault();
      });
      render(
        <Breadcrumb>
          <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
          <BreadcrumbPage onFocus={onFocus}>{label}</BreadcrumbPage>
        </Breadcrumb>,
        { wrapper: Providers }
      );
      const page = screen.getByText(label).closest('[aria-current]');
      const user = userEvent.setup();
      await user.tab();
      await user.tab();
      expect(page).toHaveFocus();
      expect(onFocus).toHaveBeenCalledOnce();
      if (preventDefault) {
        expect(scrollIntoView).not.toHaveBeenCalled();
      } else {
        expect(scrollIntoView).toHaveBeenCalledExactlyOnceWith({
          block: 'nearest',
          inline: 'nearest',
        });
        expect(scrollIntoView.mock.contexts[0]).toBe(page);
      }
    }
  );

  it('supports standalone breadcrumb parts without requiring an external tooltip provider', async () => {
    const label = 'A long current page';
    labelWidths.set(label, 250);
    render(<BreadcrumbPage>{label}</BreadcrumbPage>);
    const user = userEvent.setup();
    await user.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(label);
  });

  it('renders no navigation for empty items and no separator for a single page', () => {
    const { rerender } = render(
      <Breadcrumb>{[null, false, undefined, '']}</Breadcrumb>,
      { wrapper: Providers }
    );
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    rerender(
      <Breadcrumb separator=">">
        <BreadcrumbPage>Projects</BreadcrumbPage>
      </Breadcrumb>
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.queryByText('>')).not.toBeInTheDocument();
  });
});

import { describe, expect, it, vi } from 'vitest';

import { TooltipProvider } from '@radix-ui/react-tooltip';
import { fireEvent, render } from '@testing-library/react';

import { Banner } from '../Banner';

const getRoot = (container: HTMLElement) => container.firstChild as HTMLElement;

describe('Banner', () => {
  it('renders rounded with a transparent border by default', () => {
    const { container } = render(<Banner title="Heads up" />);
    const root = getRoot(container);

    expect(root.className).toContain('rounded-md');
    expect(root.className).toContain('border-transparent');
  });

  it('renders flush without rounded corners', () => {
    const { container } = render(<Banner flush title="Heads up" />);
    const root = getRoot(container);

    expect(root.className).toContain('border-transparent');
    expect(root.className).not.toContain('rounded-md');
  });

  it('flush removes rounded corners', () => {
    const { container } = render(<Banner flush title="Heads up" />);
    expect(getRoot(container).className).not.toContain('rounded-md');
  });

  it('flush neutral keeps its background but drops the box border', () => {
    const { container } = render(
      <Banner flush intent="neutral" title="Heads up" />
    );
    const root = getRoot(container);

    expect(root.className).toContain('bg-elevated');
    expect(root.className).not.toContain('border-primary');
    expect(root.className).toContain('border-transparent');
  });

  it('uses warning styles by default', () => {
    const { container } = render(
      <Banner title="Heads up">Take care when continuing.</Banner>
    );
    const root = getRoot(container);

    expect(root.className).toContain('bg-warning');
    expect(root.className).toContain('rounded-md');
    expect(root.className).toContain('border-transparent');
  });

  it('preserves the semantic gradient for info banners', () => {
    const { container } = render(<Banner intent="info" title="Heads up" />);

    expect(getRoot(container).className).toContain('bg-brand-subtle-gradient');
  });

  it('renders string titles and content inline and allows them to wrap', () => {
    const { container, getByText } = render(
      <Banner title="A long warning that needs to wrap within its container">
        A detailed explanation that also needs to wrap within its container.
      </Banner>
    );

    const title = getByText(
      'A long warning that needs to wrap within its container'
    );
    const content = getByText(
      'A detailed explanation that also needs to wrap within its container.'
    );

    expect(title.className).toContain('whitespace-normal');
    expect(title.className).toContain('break-words');
    expect(title.className).toContain('mr-space-2');
    expect(content.className).toContain('whitespace-normal');
    expect(content.className).toContain('break-words');
    expect(title.className).not.toContain('truncate');
    expect(content.className).not.toContain('truncate');
    expect(title.tagName).toBe('SPAN');
    expect(content.tagName).toBe('SPAN');
    expect(title.parentElement).toBe(content.parentElement);
    expect(title.parentElement?.className).toContain('min-w-0');

    const icon = container.querySelector('svg');
    const iconWrapper = icon?.parentElement?.parentElement;
    expect(iconWrapper?.className).toContain('items-center');
    expect(getRoot(container).className).toContain('items-center');
    expect(iconWrapper?.parentElement).toBe(getRoot(container));
    expect(iconWrapper?.parentElement).not.toBe(title.parentElement);
  });

  it('dismisses and invokes onDismiss', () => {
    const onDismiss = vi.fn();
    const { getByRole, queryByText } = render(
      <TooltipProvider>
        <Banner title="Dismiss me" dismissible onDismiss={onDismiss} />
      </TooltipProvider>
    );

    fireEvent.click(getByRole('button', { name: 'Close' }));

    expect(queryByText('Dismiss me')).toBeNull();
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});

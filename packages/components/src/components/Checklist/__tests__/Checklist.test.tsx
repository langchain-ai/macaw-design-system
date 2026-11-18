import { vi } from 'vitest';

import { Checklist, ChecklistItem, ChecklistSection } from '..';
import { render, screen } from '../../../test-utils';

describe('Checklist', () => {
  it('names the panel and summarizes completion with a circular indicator', () => {
    render(<Checklist title="Setup" completed={3} total={6} />);
    expect(screen.getByRole('region', { name: 'Setup' })).toBeVisible();
    expect(screen.getByText('3 of 6 complete')).toBeVisible();
    expect(
      screen.getByRole('progressbar', { name: 'Setup completion' })
    ).toHaveAttribute('aria-valuenow', '50');
  });

  it.each([
    [0, 0, '0 of 0 complete', '0'],
    [9, 2, '2 of 2 complete', '100'],
    [-1, 2, '0 of 2 complete', '0'],
    [NaN, Infinity, '0 of 0 complete', '0'],
  ])('normalizes counts %s/%s', (completed, total, summary, percentage) => {
    render(<Checklist title="Setup" completed={completed} total={total} />);
    expect(screen.getByText(summary)).toBeVisible();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      percentage
    );
  });

  it('keeps completed titles readable and non-expandable rows informational', () => {
    render(<ChecklistItem title="Connect a repository" status="completed" />);
    expect(screen.getByText('Completed:')).toBeInTheDocument();
    expect(screen.getByText('Connect a repository')).not.toHaveClass(
      'line-through'
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('toggles a task by keyboard and preserves hidden form state', async () => {
    const { user } = render(
      <ChecklistItem title="Connect an agent">
        <input aria-label="Agent name" />
      </ChecklistItem>
    );
    const trigger = screen.getByRole('button', {
      name: 'Pending: Connect an agent',
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    await user.tab();
    await user.keyboard('{Enter}');
    const input = screen.getByRole('textbox', { name: 'Agent name' });
    await user.type(input, 'My agent');
    await user.click(trigger);
    expect(input).not.toBeVisible();
    trigger.focus();
    await user.tab();
    expect(input).not.toHaveFocus();
    await user.click(trigger);
    expect(screen.getByRole('textbox')).toHaveValue('My agent');
    expect(
      document.getElementById(trigger.getAttribute('aria-controls')!)
    ).toBeVisible();
  });

  it('includes visible summaries and section descriptions in trigger names', () => {
    render(
      <ChecklistSection
        title="Setup"
        description="Connect your tools"
        steps={[true, false]}
        defaultExpanded
      >
        <ChecklistItem
          title="Connect an agent"
          trailingContent={<span>Recommended</span>}
        >
          Details
        </ChecklistItem>
      </ChecklistSection>
    );
    expect(
      screen.getByRole('button', {
        name: 'Setup Connect your tools 1/2 complete',
      })
    ).toBeVisible();
    expect(
      screen.getByRole('button', {
        name: 'Pending: Connect an agent Recommended',
      })
    ).toBeVisible();
  });

  it('supports controlled expansion without overriding the host', async () => {
    const onExpandedChange = vi.fn();
    const { user, rerender } = render(
      <ChecklistItem
        title="Task"
        expanded={false}
        onExpandedChange={onExpandedChange}
      >
        Task content
      </ChecklistItem>
    );
    const trigger = screen.getByRole('button', { name: 'Pending: Task' });
    await user.click(trigger);
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    rerender(
      <ChecklistItem title="Task" expanded onExpandedChange={onExpandedChange}>
        Task content
      </ChecklistItem>
    );
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it.each([{ status: 'locked' as const }, { disabled: true }])(
    'blocks unavailable task content even when expanded: %s',
    async (props) => {
      const onExpandedChange = vi.fn();
      const { user } = render(
        <ChecklistItem
          title="Task"
          {...props}
          expanded
          onExpandedChange={onExpandedChange}
        >
          <button type="button">Save</button>
        </ChecklistItem>
      );
      const trigger = screen.getByRole('button', { name: /Task/ });
      expect(trigger).toBeDisabled();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(
        screen.queryByRole('button', { name: 'Save' })
      ).not.toBeInTheDocument();
      await user.click(trigger);
      expect(onExpandedChange).not.toHaveBeenCalled();
    }
  );

  it('tracks nonconsecutive section completion and collapses its tasks', async () => {
    const { user } = render(
      <ChecklistSection
        title="Get Started"
        steps={[true, false, false, true]}
        defaultExpanded
      >
        <ChecklistItem title="Task">
          <button type="button">Continue</button>
        </ChecklistItem>
      </ChecklistSection>
    );
    const trigger = screen.getByRole('button', {
      name: 'Get Started 2/4 complete',
    });
    const segments = trigger.querySelectorAll('.h-1');
    expect(
      [...segments].map((segment) => segment.classList.contains('bg-brand'))
    ).toEqual([true, false, false, true]);
    expect(screen.getByRole('button', { name: 'Pending: Task' })).toBeVisible();
    await user.click(trigger);
    expect(
      screen.queryByRole('button', { name: 'Pending: Task' })
    ).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});

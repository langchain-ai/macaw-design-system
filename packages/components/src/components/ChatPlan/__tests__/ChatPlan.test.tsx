import { ChatPlan, type ChatPlanItem } from '..';
import { render, screen, within } from '../../../test-utils';

const items: ChatPlanItem[] = [
  { id: '1', label: 'Read the docs', status: 'completed' },
  { id: '2', label: 'Draft the outline', status: 'in-progress' },
  { id: '3', label: 'Write the summary', status: 'pending' },
];

describe('ChatPlan', () => {
  it('summarizes progress and the current task while collapsed', () => {
    render(<ChatPlan items={items} />);
    const toggle = screen.getByRole('button', { name: /Plan/ });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveTextContent('Task 2 of 3');
    expect(toggle).toHaveTextContent('Draft the outline');
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('lists every task with its status when expanded', async () => {
    const { user } = render(<ChatPlan items={items} title="Research plan" />);

    await user.click(screen.getByRole('button', { name: /Research plan/ }));
    const list = screen.getByRole('list', { name: 'Research plan tasks' });
    const rows = within(list).getAllByRole('listitem');

    expect(rows.map((row) => row.textContent)).toEqual([
      'Read the docs (Completed)',
      'Draft the outline (In progress)',
      'Write the summary (Pending)',
    ]);
  });

  it.each([
    [
      [
        { id: '1', label: 'A', status: 'completed' },
        { id: '2', label: 'B', status: 'pending' },
      ],
      '1 of 2 done',
    ],
    [
      [
        { id: '1', label: 'A', status: 'completed' },
        { id: '2', label: 'B', status: 'completed' },
      ],
      'All 2 done',
    ],
  ] satisfies [ChatPlanItem[], string][])(
    'counts finished tasks when none is in progress',
    (planItems, summary) => {
      render(<ChatPlan items={planItems} />);
      expect(screen.getByRole('button', { name: /Plan/ })).toHaveTextContent(
        summary
      );
    }
  );

  it('renders nothing without tasks', () => {
    const { container } = render(<ChatPlan items={[]} />, {
      withProviders: false,
    });
    expect(container).toBeEmptyDOMElement();
  });
});

import { type ReactNode, useState } from 'react';

import { TooltipProvider } from '@radix-ui/react-tooltip';

import {
  ChatToolCall,
  ChatToolCallGroup,
  ChatToolCallReasoning,
  type ChatToolCallProps,
} from '..';
import { render, screen, within } from '../../../test-utils';
import { Button } from '../../Button';
import type {
  ChatToolCallModel,
  ChatToolCallStatus,
} from '../ChatToolCall.types';

const call: ChatToolCallModel = {
  id: 'ask-1',
  name: 'ask_user',
  status: 'input-required',
  args: { question: 'Which environment?' },
};

const variants: NonNullable<ChatToolCallProps['variant']>[] = [
  'default',
  'simple',
];

const renderOptions = { withProviders: false, wrapper: TooltipProvider };

function HostOwnedInspection() {
  const [inspecting, setInspecting] = useState(false);
  return (
    <>
      <ChatToolCall
        toolCall={call}
        variant="simple"
        onInspect={() => setInspecting(true)}
      >
        Tool details
      </ChatToolCall>
      {inspecting && (
        <section aria-label="Detailed trace">Host-owned trace pane</section>
      )}
      <Button>Next action</Button>
    </>
  );
}

describe('ChatToolCall', () => {
  it('keeps simple status-only even when summaries, details, and expansion are supplied', () => {
    const toolCall = { ...call, args: 'Fallback argument' };
    const { rerender } = render(
      <ChatToolCall
        toolCall={toolCall}
        variant="simple"
        summary="Host summary"
        defaultExpanded
      >
        Details
      </ChatToolCall>,
      renderOptions
    );
    expect(screen.queryByText('Host summary')).not.toBeInTheDocument();
    expect(screen.queryByText('Details')).not.toBeInTheDocument();

    rerender(
      <ChatToolCall toolCall={toolCall} variant="simple" expanded>
        Details
      </ChatToolCall>
    );
    expect(screen.queryByText('Fallback argument')).not.toBeInTheDocument();
    expect(screen.getByText('ask_user')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Needs input');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'ask_user details', hidden: true })
    ).not.toBeInTheDocument();
  });

  const summaryCases: {
    name: string;
    summary?: ReactNode;
    expected: string | null;
  }[] = [
    {
      name: 'host summary overrides the argument preview',
      summary: 'Host summary',
      expected: 'Host summary',
    },
    {
      name: 'host null omits the summary',
      summary: null,
      expected: null,
    },
    {
      name: 'undefined summary uses the argument preview',
      expected: 'Fallback argument',
    },
  ];

  it.each(summaryCases)('$name', ({ summary, expected }) => {
    render(
      <ChatToolCall
        toolCall={{ ...call, args: 'Fallback argument' }}
        summary={summary}
      >
        Details
      </ChatToolCall>,
      renderOptions
    );
    for (const label of ['Host summary', 'Fallback argument']) {
      if (label === expected) {
        expect(screen.getByText(label)).toBeVisible();
      } else {
        expect(screen.queryByText(label)).not.toBeInTheDocument();
      }
    }
    expect(
      screen.getByRole('button', { name: 'Details for ask_user' })
    ).toHaveAccessibleDescription(expected ?? '');
  });

  const detailsCases: {
    name: string;
    children?: ReactNode;
    expected: string | null;
  }[] = [
    {
      name: 'host details override the generic view',
      children: 'Host details',
      expected: 'Host details',
    },
    {
      name: 'host null omits details',
      children: null,
      expected: null,
    },
    {
      name: 'undefined details use the generic view',
      expected: 'No response provided',
    },
  ];

  it.each(detailsCases)('$name', ({ children, expected }) => {
    render(
      <ChatToolCall toolCall={call} defaultExpanded>
        {children}
      </ChatToolCall>,
      renderOptions
    );
    if (expected === null) {
      expect(
        screen.queryByRole('button', { name: 'Details for ask_user' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('region', { name: 'ask_user details' })
      ).not.toBeInTheDocument();
    } else {
      const details = screen.getByRole('region', { name: 'ask_user details' });
      expect(details).toBeVisible();
      expect(within(details).getByText(expected)).toBeVisible();
      for (const label of ['Host details', 'No response provided']) {
        if (label !== expected) {
          expect(within(details).queryByText(label)).not.toBeInTheDocument();
        }
      }
    }
  });

  const statuses: ChatToolCallStatus[] = [
    'pending',
    'running',
    'succeeded',
    'failed',
    'canceled',
    'input-required',
  ];
  it.each(statuses)(
    'uses compact status and shows seconds only while running (%s)',
    (status) => {
      render(
        <ChatToolCall toolCall={{ ...call, status, elapsedMs: 65_900 }} />,
        renderOptions
      );
      const announcement = screen.getByRole('status');
      expect(announcement).not.toBeEmptyDOMElement();
      expect(announcement).toHaveAttribute('aria-live', 'polite');
      if (status === 'running') {
        const timer = screen.getByRole('timer', { name: 'Elapsed time' });
        expect(timer).toBeVisible();
        expect(timer).toHaveTextContent('65s');
        expect(announcement).not.toContainElement(timer);
      } else {
        expect(screen.queryByRole('timer')).not.toBeInTheDocument();
      }
    }
  );

  it.each(variants)('hides seconds when paused or settled in %s', (variant) => {
    const { rerender } = render(
      <ChatToolCall
        variant={variant}
        toolCall={{ ...call, status: 'running', elapsedMs: 2_400 }}
      />,
      renderOptions
    );
    expect(screen.getByRole('timer')).toHaveTextContent('2s');

    rerender(
      <ChatToolCall
        variant={variant}
        toolCall={{ ...call, status: 'input-required', elapsedMs: 2_400 }}
      />
    );
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();

    rerender(
      <ChatToolCall
        variant={variant}
        toolCall={{ ...call, status: 'running', elapsedMs: 3_400 }}
      />
    );
    expect(screen.getByRole('timer')).toHaveTextContent('3s');

    rerender(
      <ChatToolCall
        variant={variant}
        toolCall={{ ...call, status: 'succeeded', elapsedMs: 3_400 }}
      />
    );
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  });

  it.each(['click', '{Enter}', ' '])(
    'lets the host inspect a simple row via %s without inline expansion',
    async (activation) => {
      const { user } = render(<HostOwnedInspection />, renderOptions);
      const row = screen.getByRole('button', {
        name: 'ask_user tool call: Click to view detailed trace',
      });
      expect(row).toBeVisible();
      expect(row).not.toHaveAttribute('aria-expanded');
      expect(screen.getByRole('status')).toHaveTextContent('Needs input');
      expect(
        screen.queryByRole('region', { name: 'Detailed trace' })
      ).not.toBeInTheDocument();

      if (activation === 'click') {
        await user.click(screen.getByText('ask_user'));
      } else {
        await user.tab();
        expect(row).toHaveFocus();
        await user.keyboard(activation);
      }

      expect(
        screen.getByRole('region', { name: 'Detailed trace' })
      ).toBeVisible();
      expect(screen.queryByText('Tool details')).not.toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    }
  );

  it('has one keyboard target and a row-level inspection tooltip', async () => {
    const { user } = render(<HostOwnedInspection />, renderOptions);
    await user.tab();
    expect(
      screen.getByRole('button', {
        name: 'ask_user tool call: Click to view detailed trace',
      })
    ).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Click to view detailed trace'
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'Next action' })).toHaveFocus();
  });

  it('inspects when clicking the status area of the row', async () => {
    const { user } = render(<HostOwnedInspection />, renderOptions);
    await user.click(screen.getByRole('group', { name: 'Needs input' }));
    expect(
      screen.getByRole('region', { name: 'Detailed trace' })
    ).toBeVisible();
  });

  it('lazily mounts and discloses request and response', async () => {
    const onInspect = vi.fn();
    const { user } = render(
      <ChatToolCall toolCall={call} onInspect={onInspect} />,
      renderOptions
    );
    const disclosure = screen.getByRole('button', {
      name: 'Details for ask_user',
    });
    expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('region', { name: 'ask_user details' })
    ).not.toBeInTheDocument();
    expect(screen.queryByText('No response provided')).not.toBeInTheDocument();
    await user.click(disclosure);
    expect(onInspect).not.toHaveBeenCalled();
    const details = screen.getByRole('region', { name: 'ask_user details' });
    expect(details).toBeVisible();
    expect(within(details).getByText('No response provided')).toBeVisible();
  });

  it('keeps code and plain text distinct in default details', async () => {
    render(
      <ChatToolCall
        toolCall={{
          ...call,
          status: 'succeeded',
          args: { query: 'Deployment instructions' },
          result: 'The deployment guide is ready.\nNo changes are needed.',
        }}
        defaultExpanded
      />,
      renderOptions
    );
    const request = screen.getByRole('region', { name: 'Request' });
    expect(await within(request).findByText('"query"')).toBeVisible();
    expect(request).toHaveTextContent('"query": "Deployment instructions"');
    expect(within(request).getByRole('table')).toBeVisible();
    const response = screen.getByRole('region', { name: 'Response' });
    expect(response).toHaveTextContent('The deployment guide is ready.');
    expect(response).toHaveTextContent('No changes are needed.');
    expect(within(response).queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('keeps highlighted previews bounded and unsafe content inert', async () => {
    const getter = vi.fn(() => 'secret');
    const toJSON = vi.fn(() => 'replacement');
    const result = {
      markup: '<img src="https://example.invalid">',
      toJSON,
      text: 'x'.repeat(20_000),
    };
    Object.defineProperty(result, 'secret', { get: getter, enumerable: true });
    render(
      <ChatToolCall
        toolCall={{ ...call, status: 'succeeded', result }}
        defaultExpanded
      />,
      renderOptions
    );
    const response = screen.getByRole('region', { name: 'Response' });
    expect(await within(response).findByText('"markup"')).toBeVisible();
    expect(within(response).getByRole('table')).toBeVisible();
    expect(response).toHaveTextContent('<img src=');
    expect(response).toHaveTextContent('https://example.invalid');
    expect(response).toHaveTextContent('[Preview truncated]');
    expect(response).toHaveTextContent('[Accessor omitted]');
    expect(response).toHaveTextContent('[Function omitted]');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(getter).not.toHaveBeenCalled();
    expect(toJSON).not.toHaveBeenCalled();
  });

  it('shows the failure reason in default details', async () => {
    render(
      <ChatToolCall
        toolCall={{
          ...call,
          status: 'failed',
          error: new Error('Connection timed out'),
        }}
        defaultExpanded
      />,
      renderOptions
    );
    const details = screen.getByRole('region', { name: 'ask_user details' });
    const error = within(details).getByRole('region', { name: 'Error' });
    expect(await within(error).findByText('"message"')).toBeVisible();
    expect(error).toBeVisible();
    expect(error).toHaveTextContent('Connection timed out');
  });

  it('renders unknown payloads as escaped text', async () => {
    const { rerender } = render(
      <ChatToolCall
        toolCall={{
          ...call,
          name: '__proto__',
          result: '<img src="https://example.invalid">',
        }}
        defaultExpanded
      />,
      renderOptions
    );
    expect(
      screen.getByText('<img src="https://example.invalid">')
    ).toBeVisible();
    expect(
      await within(screen.getByRole('region', { name: 'Request' })).findByText(
        '"question"'
      )
    ).toBeVisible();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    rerender(
      <ChatToolCall
        toolCall={{
          ...call,
          args: { question: 42 },
          result: '<script>alert(1)</script>',
        }}
        defaultExpanded
      />
    );
    expect(screen.getByText('<script>alert(1)</script>')).toBeVisible();
    expect(
      await within(screen.getByRole('region', { name: 'Request' })).findByText(
        '42'
      )
    ).toBeVisible();
  });

  it('supports controlled expansion and hides an intentionally omitted detail region', async () => {
    const onExpandedChange = vi.fn();
    const { user, rerender } = render(
      <ChatToolCall
        toolCall={call}
        expanded={false}
        onExpandedChange={onExpandedChange}
      />,
      renderOptions
    );
    await user.click(
      screen.getByRole('button', { name: 'Details for ask_user' })
    );
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(
      screen.queryByRole('region', { name: 'ask_user details' })
    ).not.toBeInTheDocument();
    rerender(
      <ChatToolCall
        toolCall={call}
        expanded
        onExpandedChange={onExpandedChange}
      />
    );
    expect(
      screen.getByRole('region', { name: 'ask_user details' })
    ).toBeVisible();
    rerender(
      <ChatToolCall
        toolCall={call}
        expanded
        onExpandedChange={onExpandedChange}
      >
        {null}
      </ChatToolCall>
    );
    expect(
      screen.queryByRole('button', { name: 'Details for ask_user' })
    ).not.toBeInTheDocument();
  });
});

describe('ChatToolCallGroup', () => {
  it('preserves a nested disclosure when the group is collapsed and reopened', async () => {
    const { user } = render(
      <ChatToolCallGroup label="1 tool call" defaultExpanded>
        <ChatToolCall toolCall={call} />
      </ChatToolCallGroup>,
      renderOptions
    );
    await user.click(
      screen.getByRole('button', { name: 'Details for ask_user' })
    );
    const groupTrigger = screen.getByRole('button', { name: '1 tool call' });
    await user.click(groupTrigger);
    expect(
      screen.queryByRole('region', { name: 'ask_user details' })
    ).not.toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(
      screen.getByRole('region', { name: 'ask_user details' })
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Details for ask_user' })
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('keeps simple rows inspectable after collapsing and reopening the outer group', async () => {
    const onInspect = vi.fn();
    const { user } = render(
      <ChatToolCallGroup label="1 tool call" defaultExpanded>
        <ChatToolCall toolCall={call} variant="simple" onInspect={onInspect} />
      </ChatToolCallGroup>,
      renderOptions
    );
    const groupTrigger = screen.getByRole('button', { name: '1 tool call' });
    await user.click(groupTrigger);
    expect(
      screen.queryByRole('button', {
        name: 'ask_user tool call: Click to view detailed trace',
      })
    ).not.toBeInTheDocument();
    await user.keyboard('{Enter}');
    const row = screen.getByRole('button', {
      name: 'ask_user tool call: Click to view detailed trace',
    });
    expect(row).toBeVisible();
    await user.click(row);
    expect(onInspect).toHaveBeenCalledOnce();
    expect(groupTrigger).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('ChatToolCallReasoning', () => {
  it.each(variants)(
    'shows reasoning seconds only while streaming in %s',
    (variant) => {
      const { rerender } = render(
        <ChatToolCallReasoning
          variant={variant}
          status="streaming"
          elapsedMs={2_400}
        >
          Public reasoning summary
        </ChatToolCallReasoning>,
        renderOptions
      );
      expect(screen.getByRole('timer')).toHaveTextContent('2s');

      rerender(
        <ChatToolCallReasoning
          variant={variant}
          status="completed"
          elapsedMs={2_400}
        >
          Public reasoning summary
        </ChatToolCallReasoning>
      );
      expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    }
  );

  it('uses compact status and starts default disclosed reasoning closed', async () => {
    const { user } = render(
      <ChatToolCallReasoning status="interrupted" elapsedMs={65_900}>
        <p>Public reasoning summary</p>
      </ChatToolCallReasoning>,
      renderOptions
    );
    const disclosure = screen.getByRole('button', {
      name: 'Reasoning summary',
    });
    expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByText('Public reasoning summary')
    ).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Interrupted' })).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Interrupted');
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByText('Public reasoning summary')).toBeVisible();
  });

  it('keeps simple reasoning status-only with host-owned inspection', async () => {
    const onInspect = vi.fn();
    const { user, rerender } = render(
      <ChatToolCallReasoning
        variant="simple"
        status="interrupted"
        expanded
        onInspect={onInspect}
      >
        Public reasoning summary
      </ChatToolCallReasoning>,
      renderOptions
    );
    expect(screen.getByText('Reasoning summary')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Interrupted');
    expect(
      screen.queryByText('Public reasoning summary')
    ).not.toBeInTheDocument();
    const row = screen.getByRole('button', {
      name: 'Reasoning summary: Click to view detailed trace',
    });
    expect(row).toBeVisible();
    await user.click(row);
    expect(onInspect).toHaveBeenCalledOnce();

    rerender(
      <ChatToolCallReasoning variant="simple" defaultExpanded>
        Public reasoning summary
      </ChatToolCallReasoning>
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Public reasoning summary')
    ).not.toBeInTheDocument();
  });
});

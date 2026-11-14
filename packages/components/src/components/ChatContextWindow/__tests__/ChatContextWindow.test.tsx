import { ChatContextWindow } from '..';
import { render, screen, within } from '../../../test-utils';
import {
  ChatComposer,
  ChatComposerAction,
  ChatComposerToolbar,
} from '../../ChatComposer';

describe('ChatContextWindow', () => {
  it('opens on keyboard focus, shows exact accessible usage, and dismisses with Escape', async () => {
    const { user } = render(
      <ChatContextWindow
        tokensUsed={65_800}
        contextWindow={200_000}
        model="Example model"
        totalCost="$0.25"
      />
    );
    const trigger = screen.getByRole('button', {
      name: 'Context window: 65,800 tokens used of 200,000, 33% used',
    });
    await user.tab();
    expect(trigger).toHaveFocus();
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('65.8K');
    expect(tooltip).toHaveTextContent('/ 200K tokens');
    expect(tooltip).toHaveTextContent('Example model');
    expect(tooltip).toHaveTextContent('$0.25 total');
    expect(tooltip).toHaveTextContent('Context window available');
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0.329'
    );
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it.each([
    [0, '0% used', 'Context window available'],
    [79, '79% used', 'Context window available'],
    [80, '80% used', 'Context window nearly full'],
    [99.9, '99% used', 'Context window nearly full'],
    [100, '100% used', 'Context window full'],
    [120, '120% used', 'Context window full'],
  ])(
    'reports usage %s without overstating remaining capacity',
    async (tokensUsed, percentage, status) => {
      const { user } = render(
        <ChatContextWindow tokensUsed={tokensUsed} contextWindow={100} />
      );
      await user.hover(screen.getByRole('button'));
      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip).toHaveTextContent(percentage);
      expect(tooltip).toHaveTextContent(status);
      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-valuenow',
        String(Math.min(tokensUsed / 100, 1))
      );
    }
  );

  it.each([undefined, null, 0, -1, NaN, Infinity])(
    'does not invent progress for an unknown limit (%s)',
    async (contextWindow) => {
      const { user } = render(
        <ChatContextWindow tokensUsed={65_800} contextWindow={contextWindow} />
      );
      await user.hover(
        screen.getByRole('button', {
          name: /65,800 tokens used, limit unknown/,
        })
      );
      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip).toHaveTextContent('The context limit was not reported');
      expect(tooltip).not.toHaveTextContent('%');
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    }
  );

  it.each([null, -1, NaN, Infinity])(
    'handles unavailable usage (%s)',
    async (tokensUsed) => {
      const { user } = render(
        <ChatContextWindow tokensUsed={tokensUsed} contextWindow={200_000} />
      );
      await user.hover(
        screen.getByRole('button', {
          name: 'Context window: usage unavailable',
        })
      );
      expect(await screen.findByRole('tooltip')).toHaveTextContent(
        'Token usage is unavailable.'
      );
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    }
  );

  it('opens on tap without submitting the composer or stopping generation', async () => {
    const onSubmit = vi.fn();
    const onStop = vi.fn();
    const { user } = render(
      <ChatComposer action="stop" onStop={onStop} onSubmit={onSubmit}>
        <ChatComposerToolbar
          actions={
            <>
              <ChatContextWindow tokensUsed={10} contextWindow={100} />
              <ChatComposerAction />
            </>
          }
        />
      </ChatComposer>
    );
    const trigger = screen.getByRole('button', { name: /Context window:/ });
    await user.pointer([
      { keys: '[TouchA>]', target: trigger },
      { keys: '[/TouchA]' },
    ]);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('10% used');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onStop).not.toHaveBeenCalled();
    await user.pointer([
      { keys: '[TouchB>]', target: document.body },
      { keys: '[/TouchB]' },
    ]);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('stays disabled without opening details', async () => {
    const { user } = render(<ChatContextWindow tokensUsed={0} disabled />);
    const trigger = screen.getByRole('button');
    expect(trigger).toBeDisabled();
    await user.hover(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(within(trigger).queryByRole('progressbar')).not.toBeInTheDocument();
  });
});

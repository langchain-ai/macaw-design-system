import { ChatContextWindow } from '..';
import { render, screen } from '../../../test-utils';
import { Button } from '../../Button';
import {
  ChatComposer,
  ChatComposerAction,
  ChatComposerToolbar,
} from '../../ChatComposer';

describe('ChatContextWindow', () => {
  it('opens from the keyboard, supports footer actions, and restores focus on Escape', async () => {
    const compact = vi.fn();
    const { user } = render(
      <ChatContextWindow
        tokensUsed={65_800}
        contextWindow={200_000}
        footer={<Button onClick={compact}>Compact conversation</Button>}
      />
    );
    const trigger = screen.getByRole('button', {
      name: 'Context window: 65,800 tokens used of 200,000, 33% used',
    });
    await user.tab();
    await user.keyboard('{Enter}');
    expect(
      await screen.findByRole('dialog', { name: 'Context window' })
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Compact conversation' })
    ).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(compact).toHaveBeenCalledOnce();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('keeps counts truthful as capacity changes or becomes unavailable', async () => {
    const { user, rerender } = render(
      <ChatContextWindow tokensUsed={999} contextWindow={1000} />
    );
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('dialog')).toHaveTextContent('99% used');
    rerender(<ChatContextWindow tokensUsed={999} contextWindow={500} />);
    expect(screen.getByRole('dialog')).toHaveTextContent('200% used');
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '1'
    );
    rerender(<ChatContextWindow tokensUsed={999} contextWindow={0} />);
    expect(screen.getByRole('dialog')).not.toHaveTextContent('%');
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    rerender(<ChatContextWindow tokensUsed={null} />);
    expect(screen.getByRole('dialog')).toHaveTextContent(
      'Token usage is unavailable.'
    );
  });

  it('opens on touch without submitting or stopping, and dismisses outside', async () => {
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
    expect(await screen.findByRole('dialog')).toHaveTextContent('10% used');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onStop).not.toHaveBeenCalled();
    await user.pointer([
      { keys: '[TouchB>]', target: document.body },
      { keys: '[/TouchB]' },
    ]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

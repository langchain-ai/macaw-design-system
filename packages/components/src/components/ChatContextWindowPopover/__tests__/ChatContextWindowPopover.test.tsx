import { ChatContextWindowPopover } from '..';
import { render, screen } from '../../../test-utils';
import {
  ChatComposer,
  ChatComposerAction,
  ChatComposerToolbar,
} from '../../ChatComposer';

describe('ChatContextWindowPopover', () => {
  it('keeps counts truthful as capacity changes or becomes unavailable', async () => {
    const { user, rerender } = render(
      <ChatContextWindowPopover tokensUsed={999} contextWindow={1000} />
    );
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('dialog')).toHaveTextContent('99% used');
    rerender(<ChatContextWindowPopover tokensUsed={999} contextWindow={500} />);
    expect(screen.getByRole('dialog')).toHaveTextContent('200% used');
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '1'
    );
    rerender(<ChatContextWindowPopover tokensUsed={999} contextWindow={0} />);
    expect(screen.getByRole('dialog')).not.toHaveTextContent('%');
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    rerender(<ChatContextWindowPopover tokensUsed={null} />);
    expect(screen.getByRole('dialog')).toHaveTextContent(
      'Token usage is unavailable.'
    );
  });

  it('opens on touch without submitting or stopping the composer', async () => {
    const onAction = vi.fn();
    const { user } = render(
      <ChatComposer action="stop" onStop={onAction} onSubmit={onAction}>
        <ChatComposerToolbar
          actions={
            <>
              <ChatContextWindowPopover tokensUsed={10} contextWindow={100} />
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
    expect(onAction).not.toHaveBeenCalled();
  });
});

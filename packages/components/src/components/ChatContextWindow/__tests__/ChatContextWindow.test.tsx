import { ChatContextWindow } from '..';
import { render, screen } from '../../../test-utils';
import {
  ChatComposer,
  ChatComposerAction,
  ChatComposerToolbar,
} from '../../ChatComposer';

describe('ChatContextWindow', () => {
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

  it('opens on touch without submitting or stopping the composer', async () => {
    const onAction = vi.fn();
    const { user } = render(
      <ChatComposer action="stop" onStop={onAction} onSubmit={onAction}>
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
    expect(onAction).not.toHaveBeenCalled();
  });
});

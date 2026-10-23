import { createRef, useState } from 'react';

import { SparkleIcon } from '@phosphor-icons/react/dist/ssr/Sparkle';
import { WrenchIcon } from '@phosphor-icons/react/dist/ssr/Wrench';

import { render, screen, within } from '../../../test-utils';
import { Button } from '../../Button';
import { Icon } from '../../Icon';
import {
  ChatMessage,
  ChatMessageActions,
  ChatMessageBody,
  ChatMessageHeader,
  ChatTurnDivider,
} from '../ChatMessage';
import type { ChatMessageModel, ChatMessageStatus } from '../ChatMessage.types';

const message: ChatMessageModel = {
  id: 'message',
  role: 'assistant',
  status: 'completed',
  content: [{ id: 'answer', type: 'text', text: 'Here is the answer.' }],
};

function ActionExample({
  status = 'completed',
  readOnly = false,
}: {
  status?: ChatMessageStatus;
  readOnly?: boolean;
}) {
  const [result, setResult] = useState('No action yet');
  return (
    <>
      <ChatMessage
        message={{
          ...message,
          status,
          readOnly,
        }}
        footer={
          <ChatMessageActions
            status={status}
            readOnly={readOnly}
            actions={{
              copy: { onClick: () => setResult('Copied') },
              edit: { onClick: () => setResult('Editing') },
              retry: { onClick: () => setResult('Retrying') },
            }}
          />
        }
      />
      <p role="status" aria-label="Action result">
        {result}
      </p>
    </>
  );
}

describe('ChatMessage', () => {
  it('preserves ordered mixed content and escapes plain text', () => {
    const untrustedText = '<img src=x onerror=alert(1) />';
    render(
      <ChatMessage
        message={{
          ...message,
          content: [
            { id: 'first', type: 'text', text: 'Before the tool' },
            { id: 'tool', type: 'custom', content: <p>Tool result</p> },
            { id: 'last', type: 'text', text: untrustedText },
          ],
        }}
      />
    );

    const article = screen.getByRole('article', { name: 'Assistant message' });
    expect(article).toHaveTextContent(
      `Before the toolTool result${untrustedText}`
    );
    expect(within(article).getByText(untrustedText)).toBeVisible();
    expect(within(article).queryByRole('img')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('group', { name: 'Message actions' })
    ).not.toBeInTheDocument();
  });

  it('forwards the message element ref and gives icon identities a text label', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ChatMessage
        ref={ref}
        showIdentity
        message={{
          ...message,
          identity: { name: 'Research assistant' },
        }}
        leading={
          <Icon
            icon={SparkleIcon}
            size="xs"
            weight="regular"
            aria-hidden="true"
          />
        }
      />
    );

    expect(screen.getByText('Research assistant')).toBeVisible();
    expect(ref.current).toBe(
      screen.getByRole('article', { name: 'Research assistant message' })
    );
  });

  it('supports a labeled icon when composing the header directly', () => {
    render(
      <ChatMessageHeader
        messageRole="tool"
        showIdentity
        leading={
          <Icon
            icon={WrenchIcon}
            size="xs"
            weight="regular"
            role="img"
            aria-label="File search"
          />
        }
      />
    );

    expect(screen.getByRole('img', { name: 'File search' })).toBeVisible();
    expect(screen.getByText('Tool')).toBeVisible();
  });

  it('supports host-owned copy, edit, and retry actions', async () => {
    const { user } = render(<ActionExample status="failed" />);

    expect(screen.getByText('Failed')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Copy message' }));
    expect(
      screen.getByRole('status', { name: 'Action result' })
    ).toHaveTextContent('Copied');
    await user.click(screen.getByRole('button', { name: 'Edit message' }));
    expect(
      screen.getByRole('status', { name: 'Action result' })
    ).toHaveTextContent('Editing');
    await user.click(screen.getByRole('button', { name: 'Retry message' }));
    expect(
      screen.getByRole('status', { name: 'Action result' })
    ).toHaveTextContent('Retrying');
  });

  it.each<ChatMessageStatus>(['queued', 'submitting', 'streaming'])(
    'restricts actions while %s',
    async (status) => {
      const { user, rerender } = render(<ActionExample status={status} />);

      if (status === 'streaming') {
        expect(
          screen.queryByRole('group', { name: 'Message actions' })
        ).not.toBeInTheDocument();
        rerender(<ActionExample status="completed" />);
        await user.click(screen.getByRole('button', { name: 'Copy message' }));
        expect(
          screen.getByRole('status', { name: 'Action result' })
        ).toHaveTextContent('Copied');
        return;
      }

      const edit = screen.getByRole('button', { name: 'Edit message' });
      const retry = screen.getByRole('button', { name: 'Retry message' });
      expect(edit).toBeDisabled();
      expect(retry).toBeDisabled();
      await user.click(edit);
      await user.click(retry);
      expect(
        screen.getByRole('status', { name: 'Action result' })
      ).toHaveTextContent('No action yet');
      await user.click(screen.getByRole('button', { name: 'Copy message' }));
      expect(
        screen.getByRole('status', { name: 'Action result' })
      ).toHaveTextContent('Copied');
    }
  );

  it('keeps read-only messages copyable while disabling mutations', async () => {
    const { user } = render(<ActionExample readOnly />);

    expect(screen.queryByText('Read-only')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit message' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Retry message' })
    ).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Copy message' }));
    expect(
      screen.getByRole('status', { name: 'Action result' })
    ).toHaveTextContent('Copied');
  });

  it('respects host-specific unavailability', () => {
    render(
      <ChatMessage
        message={message}
        footer={
          <ChatMessageActions
            actions={{
              copy: {
                onClick: () => {},
                disabledReason: 'The content is unavailable.',
              },
            }}
          />
        }
      />
    );
    expect(screen.getByRole('button', { name: 'Copy message' })).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'Edit message' })
    ).not.toBeInTheDocument();
  });

  it('preserves a custom block while surrounding text streams', async () => {
    function Disclosure() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(!open)}>Tool details</Button>
          {open && <p>Found three files</p>}
        </>
      );
    }

    const { user, rerender } = render(
      <ChatMessageBody
        blocks={[
          { id: 'tool', type: 'custom', content: <Disclosure /> },
          { id: 'text', type: 'text', text: 'Here' },
        ]}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Tool details' }));
    rerender(
      <ChatMessageBody
        blocks={[
          { id: 'intro', type: 'text', text: 'Search results' },
          { id: 'tool', type: 'custom', content: <Disclosure /> },
          { id: 'text', type: 'text', text: 'Here is the answer' },
        ]}
      />
    );
    expect(screen.getByText('Found three files')).toBeVisible();
    expect(screen.getByText('Here is the answer')).toBeVisible();
  });

  it('renders an accessible turn boundary', () => {
    render(<ChatTurnDivider label="Yesterday" />);
    expect(screen.getByRole('separator', { name: 'Yesterday' })).toBeVisible();
  });

  it('keeps the status announcer mounted outside the busy message body', () => {
    const { rerender } = render(
      <ChatMessage message={{ ...message, status: 'streaming' }} />
    );
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Assistant: Responding');
    expect(status.closest('[aria-busy="true"]')).toBeNull();

    rerender(<ChatMessage message={message} />);
    expect(screen.getByRole('status')).toBe(status);
    expect(status).toHaveTextContent('Assistant: Completed');
  });

  it('moves focus to the message when retry removes the focused footer', async () => {
    function RetryExample() {
      const [status, setStatus] = useState<ChatMessageStatus>('failed');
      return (
        <ChatMessage
          message={{ ...message, status }}
          footer={
            <ChatMessageActions
              status={status}
              actions={{ retry: { onClick: () => setStatus('streaming') } }}
            />
          }
        />
      );
    }
    const { user } = render(<RetryExample />);
    await user.click(screen.getByRole('button', { name: 'Retry message' }));
    expect(
      screen.getByRole('article', { name: 'Assistant message' })
    ).toHaveFocus();
  });
});

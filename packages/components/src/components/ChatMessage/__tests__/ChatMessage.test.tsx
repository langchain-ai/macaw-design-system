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

  it('keeps the status line after streaming ends', () => {
    const { rerender } = render(
      <ChatMessageHeader
        messageRole="assistant"
        status="streaming"
        data-testid="header"
      />
    );
    expect(screen.getByText('Responding')).toBeVisible();

    rerender(
      <ChatMessageHeader
        messageRole="assistant"
        status="completed"
        data-testid="header"
      />
    );
    expect(screen.getByTestId('header')).toBeEmptyDOMElement();
  });

  it('renders no header for a completed message without identity', () => {
    render(
      <ChatMessageHeader
        messageRole="assistant"
        status="completed"
        data-testid="header"
      />
    );
    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
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

  it('keeps the footer inert while streaming and restores it when complete', async () => {
    const { user, rerender } = render(<ActionExample status="streaming" />);

    const footer = screen.getByRole('group', {
      name: 'Message actions',
    }).parentElement;
    expect(footer).toHaveAttribute('inert');
    rerender(<ActionExample status="completed" />);
    expect(footer).not.toHaveAttribute('inert');
    await user.click(screen.getByRole('button', { name: 'Copy message' }));
    expect(
      screen.getByRole('status', { name: 'Action result' })
    ).toHaveTextContent('Copied');
  });

  it.each<ChatMessageStatus>(['queued', 'submitting'])(
    'hides edit and retry while %s',
    async (status) => {
      const { user } = render(<ActionExample status={status} />);

      expect(
        screen.queryByRole('button', { name: 'Edit message' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Retry message' })
      ).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Copy message' }));
      expect(
        screen.getByRole('status', { name: 'Action result' })
      ).toHaveTextContent('Copied');
    }
  );

  it('keeps read-only messages copyable while hiding edit and retry', async () => {
    const { user } = render(<ActionExample readOnly />);

    expect(screen.queryByText('Read-only')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Edit message' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Retry message' })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Copy message' }));
    expect(
      screen.getByRole('status', { name: 'Action result' })
    ).toHaveTextContent('Copied');
  });

  it('renders only the actions the host provides', () => {
    render(
      <ChatMessage
        message={message}
        footer={
          <ChatMessageActions actions={{ copy: { onClick: () => {} } }} />
        }
      />
    );
    expect(screen.getByRole('button', { name: 'Copy message' })).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Edit message' })
    ).not.toBeInTheDocument();
  });

  it('renders no action group when every action is unavailable', () => {
    render(
      <ChatMessageActions readOnly actions={{ edit: { onClick: () => {} } }} />
    );
    expect(
      screen.queryByRole('group', { name: 'Message actions' })
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
});

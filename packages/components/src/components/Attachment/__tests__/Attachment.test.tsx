import { createRef, Fragment, useState } from 'react';

import { describe, expect, it } from 'vitest';

import { Attachment, AttachmentList } from '..';
import { render, screen, within } from '../../../test-utils';
import { Button } from '../../Button';

function AttachmentDemo({
  variant = 'file',
}: {
  variant?: 'file' | 'thumbnail';
}) {
  const [action, setAction] = useState('No action');
  const [previewCount, setPreviewCount] = useState(0);
  return (
    <>
      <Attachment
        name="report.pdf"
        variant={variant}
        metadata="PDF · 7 MB"
        onOpen={() => {
          setAction('Preview opened');
          setPreviewCount((count) => count + 1);
        }}
        onRemove={() => setAction('Removed')}
        actions={
          <Button type="button" onClick={() => setAction('Downloaded')}>
            Download
          </Button>
        }
      />
      <output aria-label="Last action">{action}</output>
      <output aria-label="Previews opened">{previewCount}</output>
    </>
  );
}

function StatefulAttachment({ name }: { name: string }) {
  const [previewCount, setPreviewCount] = useState(0);
  return (
    <Attachment
      name={name}
      metadata={`${previewCount} previews`}
      onOpen={() => setPreviewCount((count) => count + 1)}
    />
  );
}

describe('Attachment', () => {
  it('exposes the attachment and list elements to consumers', () => {
    const attachmentRef = createRef<HTMLDivElement>();
    const listRef = createRef<HTMLUListElement>();
    render(
      <AttachmentList ref={listRef}>
        <Attachment ref={attachmentRef} name="report.pdf" />
      </AttachmentList>
    );
    expect(attachmentRef.current).toBe(
      screen.getByRole('group', { name: 'report.pdf' })
    );
    expect(listRef.current).toBe(
      screen.getByRole('list', { name: 'Attachments' })
    );
  });

  it.each<{ variant: 'file' | 'thumbnail' }>([
    { variant: 'file' },
    { variant: 'thumbnail' },
  ])(
    'opens the $variant card surface while isolating actions',
    async ({ variant }) => {
      const { user } = render(<AttachmentDemo variant={variant} />);
      const previewCount = screen.getByLabelText('Previews opened');

      // Padding, borders, and layout gaps target the card itself.
      await user.click(screen.getByRole('group', { name: 'report.pdf' }));
      expect(previewCount).toHaveTextContent('1');

      await user.click(screen.getByRole('button', { name: 'View report.pdf' }));
      expect(previewCount).toHaveTextContent('2');

      await user.keyboard('{Enter}');
      expect(previewCount).toHaveTextContent('3');

      await user.keyboard(' ');
      expect(previewCount).toHaveTextContent('4');

      await user.click(
        screen.getByRole('group', { name: 'Actions for report.pdf' })
      );
      expect(previewCount).toHaveTextContent('4');

      await user.click(screen.getByRole('button', { name: 'Download' }));
      expect(screen.getByLabelText('Last action')).toHaveTextContent(
        'Downloaded'
      );
      expect(previewCount).toHaveTextContent('4');

      await user.click(
        screen.getByRole('button', { name: 'Remove report.pdf' })
      );
      expect(screen.getByLabelText('Last action')).toHaveTextContent('Removed');
      expect(previewCount).toHaveTextContent('4');
    }
  );

  it('works without composer context and keeps actions independent from opening', async () => {
    const { user } = render(<AttachmentDemo />);
    expect(screen.getByText('PDF · 7 MB')).toBeVisible();

    await user.tab();
    expect(
      screen.getByRole('button', { name: 'View report.pdf' })
    ).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByLabelText('Last action')).toHaveTextContent(
      'Preview opened'
    );

    await user.click(screen.getByRole('button', { name: 'Download' }));
    expect(screen.getByLabelText('Last action')).toHaveTextContent(
      'Downloaded'
    );

    await user.click(screen.getByRole('button', { name: 'Remove report.pdf' }));
    expect(screen.getByLabelText('Last action')).toHaveTextContent('Removed');
  });

  it('renders inert files without introducing an open action', () => {
    render(<Attachment name="notes.txt" metadata="TXT" />);
    expect(screen.getByText('notes.txt')).toBeVisible();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('announces loading, uploading and failure statuses', () => {
    const { rerender } = render(
      <Attachment name="report.pdf" status="loading" />
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'report.pdf: Loading attachment…'
    );

    rerender(<Attachment name="report.pdf" status="uploading" />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'report.pdf: Uploading…'
    );

    rerender(<Attachment name="report.pdf" status="error" />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'report.pdf: Upload failed.'
    );
  });

  it('renders attachments as individual list items and hides the list when empty', () => {
    const { rerender } = render(
      <AttachmentList>
        <Attachment name="notes.txt" />
        <Attachment name="report.pdf" />
      </AttachmentList>
    );
    const list = screen.getByRole('list', { name: 'Attachments' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);

    rerender(<AttachmentList />);
    expect(
      screen.queryByRole('list', { name: 'Attachments' })
    ).not.toBeInTheDocument();
  });

  it('renders each attachment in nested fragments and arrays as a separate list item', () => {
    render(
      <AttachmentList>
        <>
          <Attachment name="a.txt" />
          <>
            {false}
            {[<Attachment key="b" name="b.txt" />]}
          </>
        </>
        <Attachment name="c.txt" />
      </AttachmentList>
    );

    const items = within(
      screen.getByRole('list', { name: 'Attachments' })
    ).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    items.forEach((item, index) => {
      expect(within(item).getAllByRole('group')).toHaveLength(1);
      expect(
        within(item).getByRole('group', {
          name: ['a.txt', 'b.txt', 'c.txt'][index],
        })
      ).toBeVisible();
    });
  });

  it('omits the list for fragments containing only empty children', () => {
    render(
      <AttachmentList>
        <>
          {null}
          <>
            {false}
            {[]}
          </>
        </>
      </AttachmentList>
    );

    expect(
      screen.queryByRole('list', { name: 'Attachments' })
    ).not.toBeInTheDocument();
  });

  it('preserves attachment state when keyed fragments and their children reorder', async () => {
    function GroupedAttachments({ reversed = false }) {
      const groups = reversed ? ['second', 'first'] : ['first', 'second'];
      const files = reversed ? ['b', 'a'] : ['a', 'b'];
      return (
        <AttachmentList>
          {groups.map((group) => (
            <Fragment key={group}>
              {files.map((file) => (
                <StatefulAttachment key={file} name={`${group}-${file}.txt`} />
              ))}
            </Fragment>
          ))}
        </AttachmentList>
      );
    }

    const { user, rerender } = render(<GroupedAttachments />);
    await user.click(screen.getByRole('button', { name: 'View first-a.txt' }));
    rerender(<GroupedAttachments reversed />);

    expect(
      within(screen.getByRole('group', { name: 'first-a.txt' })).getByText(
        '1 previews'
      )
    ).toBeVisible();
    expect(
      within(screen.getByRole('group', { name: 'second-a.txt' })).getByText(
        '0 previews'
      )
    ).toBeVisible();
  });
});

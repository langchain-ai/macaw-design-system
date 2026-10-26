import { useState } from 'react';

import { describe, expect, it } from 'vitest';

import { render, screen, within } from '../../../test-utils';
import { Button } from '../../Button';
import { ImagePreviewBlock } from '../ImagePreviewBlock';

function HostExample({ caption }: { caption?: string }) {
  const [saved, setSaved] = useState(false);
  return (
    <ImagePreviewBlock
      src="/workflow.png"
      alt="Engine workflow"
      caption={caption}
      actions={
        <Button disabled={saved} onClick={() => setSaved(true)}>
          {saved ? 'Saved' : 'Save image'}
        </Button>
      }
    />
  );
}

describe('ImagePreviewBlock', () => {
  it('names the figure from its caption and reads the caption before host actions', () => {
    render(<HostExample caption="Engine workflow illustration" />);
    const figure = screen.getByRole('figure', {
      name: 'Engine workflow illustration',
    });
    expect(
      within(figure).getByRole('img', { name: 'Engine workflow' })
    ).toBeVisible();
    expect(screen.getByText('Engine workflow illustration')).toAppearBefore(
      screen.getByRole('button', { name: 'Save image' })
    );
    expect(
      within(figure).queryByRole('button', { name: 'Save image' })
    ).not.toBeInTheDocument();
  });

  it('opens with the keyboard, hides the visible title by default, and restores focus after Escape', async () => {
    const { user } = render(
      <ImagePreviewBlock src="/workflow.png" alt="Engine workflow" />
    );
    const trigger = screen.getByRole('button', {
      name: 'Preview Engine workflow',
    });
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter}');
    const dialog = screen.getByRole('dialog', { name: 'Engine workflow' });
    expect(dialog).toBeVisible();
    expect(within(dialog).queryByRole('heading')).not.toBeInTheDocument();
    expect(
      within(dialog).queryByRole('button', { name: 'Download image' })
    ).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
  });

  it('supports an optional visible title and host download behavior', async () => {
    function Example() {
      const [downloaded, setDownloaded] = useState(false);
      return (
        <>
          <ImagePreviewBlock
            src="/workflow.png"
            alt="Engine workflow"
            previewTitle="Workflow Details"
            onDownload={() => setDownloaded(true)}
          />
          <output>{downloaded ? 'Download requested' : ''}</output>
        </>
      );
    }
    const { user } = render(<Example />);
    await user.click(
      screen.getByRole('button', { name: 'Preview Engine workflow' })
    );
    const dialog = screen.getByRole('dialog', { name: 'Workflow Details' });
    expect(
      within(dialog).getByRole('heading', { name: 'Workflow Details' })
    ).toBeVisible();
    await user.click(
      within(dialog).getByRole('button', { name: 'Download image' })
    );
    await user.click(
      within(dialog).getByRole('button', { name: 'Close preview' })
    );
    expect(screen.getByText('Download requested')).toBeVisible();
  });

  it('keeps host actions independent of image preview', async () => {
    const { user } = render(<HostExample />);
    expect(screen.getByRole('figure')).not.toHaveAccessibleName();
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Save image' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Saved' })).toBeDisabled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the selected image and returns focus to its own trigger', async () => {
    const { user } = render(
      <>
        <ImagePreviewBlock
          src="/engine.png"
          alt="Engine logo"
          caption="Engine"
        />
        <ImagePreviewBlock src="/fleet.png" alt="Fleet logo" caption="Fleet" />
      </>
    );
    expect(
      within(screen.getByRole('figure', { name: 'Engine' })).getByRole('img', {
        name: 'Engine logo',
      })
    ).toBeVisible();
    const trigger = screen.getByRole('button', { name: 'Preview Fleet logo' });
    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Fleet logo' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Close preview' }));
    expect(trigger).toHaveFocus();
  });
});

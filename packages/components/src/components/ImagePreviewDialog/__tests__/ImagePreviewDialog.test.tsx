import { useState } from 'react';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { ImagePreviewDialog } from '..';
import { fireEvent, render, screen, within } from '../../../test-utils';
import { Button } from '../../Button';

function PreviewExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Preview image</Button>
      <ImagePreviewDialog
        open={open}
        onOpenChange={setOpen}
        src="/workflow.png"
        altText="Engine workflow"
      />
    </>
  );
}

afterEach(() => vi.restoreAllMocks());

describe('ImagePreviewDialog', () => {
  it('keeps non-image data URLs and script URLs blocked', () => {
    const { rerender } = render(
      <ImagePreviewDialog
        open
        onOpenChange={() => {}}
        src="data:text/html,<script>alert(1)</script>"
        altText="Untrusted image"
      />
    );
    expect(screen.getByAltText('Untrusted image')).toHaveAttribute(
      'src',
      'about:blank'
    );
    rerender(
      <ImagePreviewDialog
        open
        onOpenChange={() => {}}
        src="javascript:alert(1)"
        altText="Untrusted image"
      />
    );
    expect(screen.getByAltText('Untrusted image')).toHaveAttribute(
      'src',
      'about:blank'
    );
  });

  it('fits, zooms, and resets when reopened', async () => {
    // jsdom does not lay out viewports or decode images.
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(800);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(600);
    const { user } = render(<PreviewExample />);
    await user.click(screen.getByRole('button', { name: 'Preview image' }));
    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeDisabled();
    const image = screen.getByAltText('Engine workflow');
    Object.defineProperties(image, {
      naturalWidth: { value: 1600 },
      naturalHeight: { value: 1200 },
    });
    fireEvent.load(image);
    expect(
      screen.getByRole('status', { name: 'Image zoom' })
    ).toHaveTextContent('Fit');
    await user.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(
      screen.getByRole('status', { name: 'Image zoom' })
    ).toHaveTextContent('63%');
    await user.click(screen.getByRole('button', { name: 'Fit image' }));
    expect(
      screen.getByRole('status', { name: 'Image zoom' })
    ).toHaveTextContent('Fit');
    await user.click(screen.getByRole('button', { name: 'Zoom out' }));
    expect(
      screen.getByRole('status', { name: 'Image zoom' })
    ).toHaveTextContent('40%');
    await user.click(screen.getByRole('button', { name: 'Close preview' }));
    expect(screen.getByRole('button', { name: 'Preview image' })).toHaveFocus();
    await user.keyboard('{Enter}');
    const reopened = screen.getByAltText('Engine workflow');
    Object.defineProperties(reopened, {
      naturalWidth: { value: 1600 },
      naturalHeight: { value: 1200 },
    });
    fireEvent.load(reopened);
    expect(
      screen.getByRole('status', { name: 'Image zoom' })
    ).toHaveTextContent('Fit');
  });

  it('zooms with trackpad pinch instead of the browser', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(800);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(600);
    const { user } = render(<PreviewExample />);
    await user.click(screen.getByRole('button', { name: 'Preview image' }));
    const image = screen.getByAltText('Engine workflow');
    Object.defineProperties(image, {
      naturalWidth: { value: 1600 },
      naturalHeight: { value: 1200 },
    });
    fireEvent.load(image);
    const viewport = screen.getByRole('region', { name: 'Image viewport' });
    const zoomStatus = screen.getByRole('status', { name: 'Image zoom' });

    // Plain wheel scrolling stays native.
    expect(fireEvent.wheel(viewport, { deltaY: -25 })).toBe(true);
    expect(zoomStatus).toHaveTextContent('Fit');

    // Chromium and Firefox pinch: ctrl+wheel.
    expect(fireEvent.wheel(viewport, { deltaY: -25, ctrlKey: true })).toBe(
      false
    );
    expect(zoomStatus).toHaveTextContent('64%');

    // Safari pinch: gesture events with a cumulative scale.
    fireEvent(viewport, new Event('gesturestart', { cancelable: true }));
    const gesture = Object.assign(
      new Event('gesturechange', { cancelable: true }),
      { scale: 2, clientX: 0, clientY: 0 }
    );
    fireEvent(viewport, gesture);
    expect(gesture.defaultPrevented).toBe(true);
    expect(zoomStatus).toHaveTextContent('128%');
  });

  it('shows a load failure, disables zoom, and starts fresh for a different source', () => {
    const { rerender } = render(
      <ImagePreviewDialog
        open
        onOpenChange={() => {}}
        src="/missing.png"
        altText="Missing image"
      />
    );
    // jsdom does not issue image load/error events.
    fireEvent.error(screen.getByAltText('Missing image'));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'The image could not be loaded.'
    );
    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeDisabled();
    rerender(
      <ImagePreviewDialog
        open
        onOpenChange={() => {}}
        src="/workflow.png"
        altText="Engine workflow"
      />
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Loading image…')).toBeVisible();
  });

  it('keeps the dialog named without a visible title or download action', async () => {
    const { user } = render(<PreviewExample />);
    await user.click(screen.getByRole('button', { name: 'Preview image' }));
    const dialog = screen.getByRole('dialog', { name: 'Engine workflow' });
    expect(dialog).toBeVisible();
    expect(dialog).toHaveFocus();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(
      within(dialog).queryByRole('button', { name: 'Download image' })
    ).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Preview image' })).toHaveFocus();
  });
});

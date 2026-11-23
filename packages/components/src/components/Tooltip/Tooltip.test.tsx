import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

import { render, screen } from '../../test-utils';
import { ZIndexProvider } from '../../utils/ZIndexContext';
import zIndices from '../../utils/zIndices';
import { IconButton } from '../IconButton';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { Tooltip } from './Tooltip';

describe('Tooltip layering', () => {
  it.each([
    zIndices.content,
    zIndices.pane,
    zIndices.popover,
    zIndices.dialogContent,
    zIndices.toast,
  ])(
    'keeps button tooltips above overlapping popovers and their ancestor at %i',
    async (ancestor) => {
      const { user } = render(
        <ZIndexProvider value={ancestor}>
          <Tooltip title="Connected to server">
            <button>Connection status</button>
          </Tooltip>
          <IconButton
            icon={MagnifyingGlassIcon}
            label="Find in loaded content"
          />
        </ZIndexProvider>
      );

      for (const [button, label] of [
        ['Connection status', 'Connected to server'],
        ['Find in loaded content', 'Find in loaded content'],
      ]) {
        const trigger = screen.getByRole('button', { name: button });
        await user.hover(trigger);
        const tooltip = await screen.findByRole('tooltip', { name: label });
        expect(tooltip).toBeVisible();
        const content = tooltip.closest<HTMLElement>('[data-state]');
        if (!content) throw new Error('Tooltip content not found');
        const layer = Number(window.getComputedStyle(content).zIndex);
        expect(layer).toBeGreaterThan(zIndices.popover);
        expect(layer).toBeGreaterThan(ancestor);
        if (ancestor < zIndices.dialogOverlay) {
          expect(layer).toBeLessThan(zIndices.dialogOverlay);
        }
        await user.unhover(trigger);
      }
    }
  );
});

describe('Tooltip focus', () => {
  it('opens for keyboard focus but not when a click moves focus to the trigger', async () => {
    const { user } = render(
      <Popover>
        <PopoverTrigger>Notifications</PopoverTrigger>
        <PopoverContent aria-label="Notifications">
          <IconButton icon={MagnifyingGlassIcon} label="Close" />
        </PopoverContent>
      </Popover>
    );
    const trigger = screen.getByRole('button', { name: 'Notifications' });

    await user.click(trigger);
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    expect(
      await screen.findByRole('tooltip', { name: 'Close' })
    ).toBeInTheDocument();
  });
});

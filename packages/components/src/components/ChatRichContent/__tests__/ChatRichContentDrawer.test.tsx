import { useRef, useState } from 'react';

import { describe, expect, it, vi } from 'vitest';

import {
  ChatRichContent,
  ChatRichContentChoices,
  type ChatRichContentChoicesValue,
  type ChatRichContentState,
} from '..';
import { render, screen } from '../../../test-utils';
import { ChatComposer, ChatComposerToolbar } from '../../ChatComposer';
import { Input } from '../../Input';

describe('ChatRichContent drawer', () => {
  it('identifies each question navigator by its owning card', () => {
    render(
      <>
        <ChatRichContent
          title="Choose a region"
          navigation={{ current: 1, total: 2, onChange: vi.fn() }}
        />
        <ChatRichContent
          presentation="drawer"
          title="Choose a model"
          navigation={{ current: 1, total: 3, onChange: vi.fn() }}
        />
      </>
    );

    expect(
      screen.getByRole('navigation', { name: 'Questions: Choose a region' })
    ).toBeVisible();
    expect(
      screen.getByRole('navigation', { name: 'Questions: Choose a model' })
    ).toBeVisible();
  });

  it('uses the composer form for submission without adding a second submit action', async () => {
    const onSubmit = vi.fn();
    const onDrawerSubmit = vi.fn();
    const { user } = render(
      <ChatComposer
        aria-label="Message composer"
        onSubmit={onSubmit}
        drawer={
          <ChatRichContent
            presentation="drawer"
            title="Choose a region"
            onSubmit={onDrawerSubmit}
          >
            {({ disabled }) => (
              <Input
                aria-label="Region"
                disabled={disabled}
                onChange={() => {}}
              />
            )}
          </ChatRichContent>
        }
      >
        <Input aria-label="Message" onChange={() => {}} />
        <ChatComposerToolbar />
      </ChatComposer>
    );

    expect(screen.getAllByRole('form')).toHaveLength(1);
    expect(
      screen.getByRole('region', { name: 'Choose a region' })
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Submit response' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Region' })).toBeEnabled();

    await user.type(
      screen.getByRole('textbox', { name: 'Region' }),
      'Europe{Enter}'
    );
    expect(onSubmit).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(onDrawerSubmit).not.toHaveBeenCalled();
  });

  it('inherits disabled state from the composer for fields, skip, and navigation', async () => {
    const onSkip = vi.fn();
    const onNavigate = vi.fn();
    const drawer = (disabled: boolean) => (
      <ChatComposer
        aria-label="Message composer"
        disabled={disabled}
        drawer={
          <ChatRichContent
            presentation="drawer"
            title="Choose a region"
            onSkip={onSkip}
            navigation={{ current: 1, total: 2, onChange: onNavigate }}
          >
            {({ disabled: fieldDisabled }) => (
              <Input
                aria-label="Region"
                disabled={fieldDisabled}
                onChange={() => {}}
              />
            )}
          </ChatRichContent>
        }
      >
        <Input aria-label="Message" onChange={() => {}} />
      </ChatComposer>
    );
    const { user, rerender } = render(drawer(true));

    expect(screen.getByRole('textbox', { name: 'Region' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Skip' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Next question' })
    ).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Skip' }));
    await user.click(screen.getByRole('button', { name: 'Next question' }));
    expect(onSkip).not.toHaveBeenCalled();
    expect(onNavigate).not.toHaveBeenCalled();

    rerender(drawer(false));
    expect(screen.getByRole('textbox', { name: 'Region' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Next question' }));
    expect(onNavigate).toHaveBeenCalledWith(2);
  });

  it('keeps collapsed fields mounted and announces saved status once', async () => {
    function Drawer() {
      const [value, setValue] = useState('');
      return (
        <ChatRichContent presentation="drawer" title="Choose a region">
          <Input
            aria-label="Region"
            value={value}
            onChange={setValue}
            debounceMs={0}
          />
        </ChatRichContent>
      );
    }
    const { user, rerender } = render(<Drawer />);
    const input = screen.getByRole('textbox', { name: 'Region' });
    await user.type(input, 'Europe');
    await user.click(screen.getByRole('button', { name: 'Collapse question' }));
    expect(input.closest('[inert]')).not.toBeNull();
    expect(input).toHaveValue('Europe');
    await user.click(screen.getByRole('button', { name: 'Expand question' }));
    expect(screen.getByRole('textbox', { name: 'Region' })).toHaveValue(
      'Europe'
    );
    expect(input.closest('[inert]')).toBeNull();

    rerender(
      <ChatRichContent
        presentation="drawer"
        title="Choose a region"
        state="submitted"
        defaultOpen={false}
      />
    );
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('Response submitted');
    expect(screen.getByRole('region')).toHaveAccessibleDescription(
      'Response submitted'
    );
  });

  it.each([
    'validation-error',
    'submission-failed',
  ] satisfies ChatRichContentState[])(
    'exposes %s even when controlled closed',
    (state) => {
      const onOpenChange = vi.fn();
      render(
        <ChatRichContent
          presentation="drawer"
          open={false}
          onOpenChange={onOpenChange}
          title="Choose a region"
          state={state}
          message="Choose an available region."
        >
          {({ disabled, isError, errorId }) => (
            <Input
              aria-label="Region"
              disabled={disabled}
              onChange={() => {}}
              isError={isError}
              aria-describedby={errorId}
            />
          )}
        </ChatRichContent>
      );
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Choose an available region.'
      );
      const input = screen.getByRole('textbox', { name: 'Region' });
      expect(input).toBeEnabled();
      expect(input).toBeInvalid();
      expect(input).toHaveAccessibleDescription('Choose an available region.');
      expect(input.closest('[inert]')).toBeNull();
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(
        screen.queryByRole('button', { name: /question$/ })
      ).not.toBeInTheDocument();
    }
  );

  it('lets an external custom answer focus the composer input without adding an inline field', async () => {
    function Composer() {
      const inputRef = useRef<HTMLInputElement>(null);
      const [value, setValue] = useState<ChatRichContentChoicesValue>({
        selected: ['europe'],
      });
      return (
        <ChatComposer
          drawer={
            <ChatRichContent presentation="drawer" title="Choose a region">
              {({ disabled }) => (
                <ChatRichContentChoices
                  aria-label="Region"
                  mode="single"
                  options={[{ value: 'europe', label: 'Europe' }]}
                  value={value}
                  onChange={setValue}
                  allowCustom
                  customInput="external"
                  onCustomSelect={() => inputRef.current?.focus()}
                  disabled={disabled}
                />
              )}
            </ChatRichContent>
          }
        >
          <Input ref={inputRef} aria-label="Message" onChange={() => {}} />
        </ChatComposer>
      );
    }
    const { user } = render(<Composer />);
    await user.click(screen.getByRole('radio', { name: 'Something else…' }));
    expect(screen.getByRole('radio', { name: 'Europe' })).not.toBeChecked();
    expect(
      screen.getByRole('radio', { name: 'Something else…' })
    ).toBeChecked();
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveFocus();
  });
});

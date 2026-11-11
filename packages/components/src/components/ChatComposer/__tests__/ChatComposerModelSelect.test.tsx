import { useState } from 'react';

import { describe, expect, it, vi } from 'vitest';

import {
  ChatComposer,
  ChatComposerInput,
  ChatComposerModelSelect,
  ChatComposerToolbar,
} from '..';
import type { ChatComposerModelGroup, ChatComposerModelOption } from '..';
import { render, screen, waitFor, within } from '../../../test-utils';

const TIERS: ChatComposerModelOption[] = [
  { value: 'fast', label: 'Fast model', description: 'Quick answers' },
  { value: 'balanced', label: 'Balanced model' },
  {
    value: 'max',
    label: 'Max model',
    disabled: true,
    badge: <span>Needs API key</span>,
  },
];

const PROVIDERS: ChatComposerModelGroup[] = [
  {
    heading: 'Anthropic',
    options: [
      {
        value: 'sonnet',
        label: 'Sonnet 5.5',
        icon: <svg data-testid="anthropic-mark" />,
      },
      { value: 'opus', label: 'Opus 5' },
      { value: 'haiku', label: 'Haiku 5' },
    ],
  },
  {
    heading: 'Google',
    options: [
      { value: 'gemini-pro', label: 'Gemini 4 Pro' },
      { value: 'gemini-flash', label: 'Gemini 4 Flash' },
    ],
  },
  {
    heading: 'OpenAI',
    options: [
      { value: 'gpt', label: 'GPT-6' },
      { value: 'gpt-mini', label: 'GPT-6 mini' },
      { value: 'o9', label: 'o9', keywords: ['reasoning'] },
    ],
  },
];

describe('ChatComposerModelSelect', () => {
  it('keeps its own selection from defaultValue and reports changes', async () => {
    const onChange = vi.fn();
    const { user } = render(
      <ChatComposerModelSelect
        options={TIERS}
        defaultValue="balanced"
        onChange={onChange}
      />
    );
    const trigger = screen.getByRole('combobox', { name: 'Model' });
    expect(trigger).toHaveTextContent('Balanced model');

    await user.click(trigger);
    expect(screen.getByText('Quick answers')).toBeVisible();
    await user.click(screen.getByRole('option', { name: /Fast model/ }));

    expect(onChange).toHaveBeenCalledExactlyOnceWith('fast');
    expect(trigger).toHaveTextContent('Fast model');
  });

  it('follows a controlled value and ignores choosing the current model', async () => {
    const onChange = vi.fn();
    const { user } = render(
      <ChatComposerModelSelect
        options={TIERS}
        value="balanced"
        onChange={onChange}
      />
    );
    const trigger = screen.getByRole('combobox', { name: 'Model' });

    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: /Balanced model/ }));
    expect(onChange).not.toHaveBeenCalled();

    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: /Fast model/ }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith('fast');
    expect(trigger).toHaveTextContent('Balanced model');
  });

  it('shows badges and keeps disabled models from being chosen', async () => {
    const onChange = vi.fn();
    const { user } = render(
      <ChatComposerModelSelect options={TIERS} onChange={onChange} />
    );

    await user.click(screen.getByRole('combobox', { name: 'Model' }));
    const max = screen.getByRole('option', { name: /Max model/ });
    expect(within(max).getByText('Needs API key')).toBeVisible();
    expect(max).toHaveAttribute('aria-disabled', 'true');
    await user.click(max);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('opens on the current model so Enter keeps it', async () => {
    const onChange = vi.fn();
    const { user } = render(
      <ChatComposerModelSelect
        options={TIERS}
        value="balanced"
        onChange={onChange}
      />
    );

    await user.tab();
    await user.keyboard('{Enter}');
    expect(
      screen.getByRole('option', { name: /Balanced model/, selected: true })
    ).toBeVisible();
    await user.keyboard('{ArrowUp}{Enter}');

    expect(onChange).toHaveBeenCalledExactlyOnceWith('fast');
  });

  it('shows the selected provider mark in the trigger', () => {
    render(<ChatComposerModelSelect groups={PROVIDERS} value="sonnet" />);

    const trigger = screen.getByRole('combobox', { name: 'Model' });
    expect(within(trigger).getByTestId('anthropic-mark')).toBeInTheDocument();
    expect(trigger).toHaveTextContent('Sonnet 5.5');
  });

  it('hides search for short lists', async () => {
    const { user } = render(<ChatComposerModelSelect options={TIERS} />);

    await user.click(screen.getByRole('combobox', { name: 'Model' }));
    expect(screen.getByRole('listbox')).toBeVisible();
    expect(screen.queryByPlaceholderText('Search models…')).toBeNull();
  });

  it('searches long lists by label, keyword, and group heading', async () => {
    const { user } = render(<ChatComposerModelSelect groups={PROVIDERS} />);

    await user.click(screen.getByRole('combobox', { name: 'Model' }));
    const search = screen.getByPlaceholderText('Search models…');

    await user.type(search, 'google');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Gemini 4 Pro',
      'Gemini 4 Flash',
    ]);

    await user.clear(search);
    await user.type(search, 'reasoning');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'o9',
    ]);

    await user.clear(search);
    await user.type(search, 'nothing like this');
    expect(screen.getByText('No models found.')).toBeVisible();
  });

  it('supports a controlled open state and a footer', async () => {
    const onOpenChange = vi.fn();
    const { user } = render(
      <ChatComposerModelSelect
        options={TIERS}
        open
        onOpenChange={onOpenChange}
        footer={<button type="button">Manage models</button>}
      />
    );

    expect(screen.getByRole('listbox')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Manage models' })).toBeVisible();
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('follows a disabled composer and returns to the message after a choice', async () => {
    function Harness({ disabled }: { disabled?: boolean }) {
      const [draft, setDraft] = useState('');
      return (
        <ChatComposer disabled={disabled}>
          <ChatComposerInput value={draft} onChange={setDraft} />
          <ChatComposerToolbar
            modelSelector={
              <ChatComposerModelSelect groups={PROVIDERS} defaultValue="opus" />
            }
          />
        </ChatComposer>
      );
    }
    const { user, rerender } = render(<Harness />);
    const input = await screen.findByRole('textbox', { name: 'Message' });
    const trigger = screen.getByRole('combobox', { name: 'Model' });

    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: /Haiku 5/ }));
    expect(trigger).toHaveTextContent('Haiku 5');
    await waitFor(() => expect(input).toHaveFocus());

    rerender(<Harness disabled />);
    expect(trigger).toBeDisabled();
  });
});

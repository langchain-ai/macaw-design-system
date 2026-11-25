import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';

import { CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { CheckIcon } from '@phosphor-icons/react/dist/ssr/Check';
import { CodeIcon } from '@phosphor-icons/react/dist/ssr/Code';
import { LinkSimpleIcon } from '@phosphor-icons/react/dist/ssr/LinkSimple';
import { TextBIcon } from '@phosphor-icons/react/dist/ssr/TextB';
import { TextItalicIcon } from '@phosphor-icons/react/dist/ssr/TextItalic';
import { posToDOMRect, type Editor } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import { useEditorState } from '@tiptap/react';

import { cn } from '../../utils/cn';
import { Button } from '../Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { IconButton } from '../IconButton';
import { Input } from '../Input';
import { Popover, PopoverAnchor, PopoverContent } from '../Popover';

const BLOCK_TYPES = [
  { type: 'paragraph', label: 'Text' },
  { type: 'bulletList', label: 'Bulleted list' },
  { type: 'orderedList', label: 'Numbered list' },
  { type: 'codeBlock', label: 'Code block' },
] as const;

type BlockType = (typeof BLOCK_TYPES)[number]['type'];

const SCHEME = /^[a-z][a-z\d+.-]*:/i;

function shortcut(key: string) {
  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad/.test(navigator.userAgent);
  return isMac ? `⌘${key}` : `Ctrl+${key}`;
}

function readSelection(editor: Editor) {
  const { selection } = editor.state;
  const { $from } = selection;
  let block: BlockType = 'paragraph';
  for (let depth = $from.depth; depth > 0; depth--) {
    const name = $from.node(depth).type.name;
    if (BLOCK_TYPES.some(({ type }) => type === name)) {
      block = name as BlockType;
      break;
    }
  }
  return {
    key: `${selection.from}:${selection.to}`,
    canFormat:
      !editor.isDestroyed &&
      editor.isEditable &&
      editor.isFocused &&
      !selection.empty &&
      !(selection instanceof NodeSelection) &&
      block !== 'codeBlock',
    bold: editor.isActive('bold'),
    italic: editor.isActive('italic'),
    code: editor.isActive('code'),
    link: editor.isActive('link'),
    canBold: editor.can().toggleBold(),
    canItalic: editor.can().toggleItalic(),
    block,
  };
}

export function ChatComposerFormattingMenu({ editor }: { editor: Editor }) {
  'use no memo';

  const selection = useEditorState({
    editor,
    selector: (ctx) => readSelection(ctx.editor),
  });
  const [selecting, setSelecting] = useState(false);
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const [linkMode, setLinkMode] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [blockMenuOpen, setBlockMenuOpen] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const linkInputId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);
  // Read lazily: the view mounts after this menu first renders and throws
  // once it unmounts, which can happen before the menu's last reposition.
  const anchorRef = useRef({
    getBoundingClientRect: () => {
      if (editor.isDestroyed) return new DOMRect();
      const { from, to } = editor.state.selection;
      return posToDOMRect(editor.view, from, to);
    },
    get contextElement() {
      return editor.isDestroyed ? undefined : editor.view.dom;
    },
  });

  // Wait for a pointer selection to finish so the menu does not chase the drag.
  useEffect(() => {
    const start = (event: PointerEvent) => {
      if (
        !editor.isDestroyed &&
        event.target instanceof Node &&
        editor.view.dom.contains(event.target)
      ) {
        setSelecting(true);
      }
    };
    const end = () => setSelecting(false);
    document.addEventListener('pointerdown', start, true);
    document.addEventListener('pointerup', end, true);
    return () => {
      document.removeEventListener('pointerdown', start, true);
      document.removeEventListener('pointerup', end, true);
    };
  }, [editor]);

  // A dismissal only holds while the same range stays selected.
  useEffect(() => {
    if (
      dismissedKey !== null &&
      (dismissedKey !== selection.key || !selection.canFormat)
    ) {
      setDismissedKey(null);
    }
  }, [dismissedKey, selection.key, selection.canFormat]);

  const open =
    linkMode ||
    blockMenuOpen ||
    focusWithin ||
    (selection.canFormat && !selecting && dismissedKey !== selection.key);
  openRef.current = open;

  const toolbarButtons = () =>
    Array.from(
      contentRef.current?.querySelectorAll<HTMLButtonElement>(
        'button:not(:disabled)'
      ) ?? []
    );

  const focusEditor = () => {
    if (!editor.isDestroyed) editor.view.focus();
  };

  // A focused item can unmount without a blur, such as a chosen block type,
  // so focus returning to the editor also ends focus within the menu.
  useEffect(() => {
    const onFocus = () => setFocusWithin(false);
    editor.on('focus', onFocus);
    return () => {
      editor.off('focus', onFocus);
    };
  }, [editor]);

  // Alt+F10 moves focus from the editor into the menu, as in other editors.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        !event.altKey ||
        event.key !== 'F10' ||
        !openRef.current ||
        editor.isDestroyed ||
        !(event.target instanceof Node) ||
        !editor.view.dom.contains(event.target)
      ) {
        return;
      }
      event.preventDefault();
      toolbarButtons()[0]?.focus();
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [editor]);

  const moveToolbarFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (linkMode) return;
    const buttons = toolbarButtons();
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (index === -1) return;
    const last = buttons.length - 1;
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % buttons.length
        : event.key === 'ArrowLeft'
          ? (index - 1 + buttons.length) % buttons.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    buttons[next]?.focus();
  };

  const closeLinkEntry = () => {
    setLinkMode(false);
    setLinkInvalid(false);
  };

  const applyLink = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // The menu renders in a portal, so the submit would otherwise reach the
    // composer form through the React tree and send the message.
    event.stopPropagation();
    const value = String(new FormData(event.currentTarget).get('href') ?? '');
    const trimmed = value.trim();
    if (!trimmed) return;
    const href = SCHEME.test(trimmed) ? trimmed : `https://${trimmed}`;
    const applied = editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href })
      .run();
    if (applied) closeLinkEntry();
    else setLinkInvalid(true);
  };

  const setBlock = (type: BlockType) => {
    const chain = editor.chain();
    if (type === 'paragraph') chain.clearNodes().run();
    else if (type === 'bulletList') chain.toggleBulletList().run();
    else if (type === 'orderedList') chain.toggleOrderedList().run();
    else chain.toggleCodeBlock().run();
  };

  const blockLabel =
    BLOCK_TYPES.find(({ type }) => type === selection.block)?.label ?? 'Text';

  const formatButton = (
    label: string,
    key: string | null,
    icon: typeof TextBIcon,
    active: boolean,
    run: () => void,
    disabled = false
  ) => (
    <IconButton
      icon={icon}
      label={label}
      color="secondary"
      variant="plain"
      size="sm"
      aria-pressed={active}
      disabled={disabled}
      tooltipProps={{
        title: label,
        description: key ? shortcut(key) : undefined,
      }}
      className={cn(active && 'bg-selected text-brand-primary')}
      iconWeight={active ? 'bold' : 'regular'}
      // Keep focus and the selection in the editor.
      onMouseDown={(event) => event.preventDefault()}
      onClick={run}
    />
  );

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) return;
        closeLinkEntry();
        setBlockMenuOpen(false);
        setDismissedKey(selection.key);
        if (linkMode || focusWithin) focusEditor();
      }}
    >
      <PopoverAnchor virtualRef={anchorRef} />
      <PopoverContent
        side="top"
        align="start"
        sideOffset={8}
        hideWhenDetached
        updatePositionStrategy="always"
        role={linkMode ? 'dialog' : 'toolbar'}
        aria-label={linkMode ? 'Add link' : 'Formatting'}
        ref={contentRef}
        className="flex w-auto items-center gap-space-0.5 p-space-1"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onFocus={() => setFocusWithin(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setFocusWithin(false);
          }
        }}
        onKeyDown={moveToolbarFocus}
        onEscapeKeyDown={(event) => {
          // Escape from inside the menu returns to the editor and keeps the
          // selection; from the editor it dismisses the menu.
          if (!linkMode && !focusWithin) return;
          event.preventDefault();
          closeLinkEntry();
          focusEditor();
        }}
        onInteractOutside={(event) => {
          // Selection changes in the editor decide whether the menu stays.
          if (
            !editor.isDestroyed &&
            event.target instanceof Node &&
            editor.view.dom.contains(event.target)
          ) {
            event.preventDefault();
            closeLinkEntry();
          }
        }}
      >
        {linkMode ? (
          <form className="flex items-center gap-space-1" onSubmit={applyLink}>
            <label htmlFor={linkInputId} className="sr-only">
              Link URL
            </label>
            <Input
              id={linkInputId}
              name="href"
              type="text"
              size="sm"
              variant="plain"
              placeholder="Paste or type a link"
              autoFocus
              isError={linkInvalid}
              onChange={() => setLinkInvalid(false)}
              debounceMs={0}
              className="w-56"
            />
            <IconButton
              type="submit"
              icon={CheckIcon}
              label="Apply link"
              color="secondary"
              variant="plain"
              size="sm"
            />
          </form>
        ) : (
          <>
            {formatButton(
              selection.link ? 'Remove link' : 'Add link',
              null,
              LinkSimpleIcon,
              selection.link,
              () => {
                if (selection.link) {
                  editor
                    .chain()
                    .focus()
                    .extendMarkRange('link')
                    .unsetLink()
                    .run();
                } else {
                  setLinkMode(true);
                }
              }
            )}
            {formatButton(
              'Bold',
              'B',
              TextBIcon,
              selection.bold,
              () => editor.chain().focus().toggleBold().run(),
              !selection.canBold
            )}
            {formatButton(
              'Italic',
              'I',
              TextItalicIcon,
              selection.italic,
              () => editor.chain().focus().toggleItalic().run(),
              !selection.canItalic
            )}
            {formatButton('Code', 'E', CodeIcon, selection.code, () =>
              editor.chain().focus().toggleCode().run()
            )}
            <DropdownMenu open={blockMenuOpen} onOpenChange={setBlockMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  color="secondary"
                  variant="plain"
                  rightDecorator={CaretDownIcon}
                  aria-label={`Block type: ${blockLabel}`}
                >
                  {blockLabel}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                onCloseAutoFocus={(event) => {
                  event.preventDefault();
                  focusEditor();
                }}
              >
                {BLOCK_TYPES.map(({ type, label }) => (
                  <DropdownMenuItem
                    key={type}
                    className="justify-between gap-space-4"
                    onSelect={() => setBlock(type)}
                  >
                    {label}
                    {selection.block === type && (
                      <CheckIcon size={14} weight="bold" aria-hidden />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

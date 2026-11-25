import { useEffect, useId, useRef, useState, type FormEvent } from 'react';

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
  const linkInputId = useId();
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

  const open =
    linkMode ||
    blockMenuOpen ||
    (selection.canFormat && !selecting && dismissedKey !== selection.key);

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
    const chain = editor.chain().focus();
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
        if (linkMode) editor.commands.focus();
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
        className="flex w-auto items-center gap-space-0.5 p-space-1"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => {
          if (!linkMode) return;
          event.preventDefault();
          closeLinkEntry();
          editor.commands.focus();
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
                onCloseAutoFocus={(event) => event.preventDefault()}
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

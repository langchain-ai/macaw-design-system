/**
 * Shared animation presets as Tailwind class strings.
 *
 * Usage: cn(animation.popoverEntry, 'other-classes')
 *
 * All durations follow the 12 Principles of Animation:
 * - User-initiated: ≤150ms (micro), ≤200ms (layout)
 * - Easing: ease-out for entrances, ease-in for exits
 * - No linear for motion (only progress indicators)
 */

export const animation = {
  fadeIn: 'animate-in fade-in duration-150',
  fadeOut: 'animate-out fade-out duration-100',

  scaleIn: 'animate-in fade-in zoom-in-95 duration-200 ease-out',
  scaleOut: 'animate-out fade-out duration-500 ease-out fill-mode-forwards',

  listItemEntry:
    'animate-in fade-in slide-in-from-bottom-1 duration-200 ease-out',

  popoverEntry: 'animate-in fade-in slide-in-from-top-1 duration-150',
  popoverEntryLeft: 'animate-in fade-in slide-in-from-left-1 duration-150',
  popoverEntryRight: 'animate-in fade-in slide-in-from-right-1 duration-150',
  popoverEntryBottom: 'animate-in fade-in slide-in-from-bottom-1 duration-150',

  collapseOpen: 'transition-[grid-template-rows] duration-150 ease-out',

  hoverReveal:
    'opacity-0 transition-opacity duration-100 ease-out group-hover:opacity-100 group-focus-within:opacity-100',

  bgTransition: 'transition-[background-color,opacity] duration-150 ease-out',
  colorTransition: 'transition-colors duration-150 ease-out',

  pressScale: 'transition-transform duration-100 ease-out active:scale-95',
  pressScaleSmall: 'transition-transform duration-100 ease-out active:scale-90',

  panelWidth: 'transition-[width] duration-200 ease-out',
  panelOpacity: 'transition-opacity duration-200 ease-out',

  contentResize: 'grid transition-[grid-template-rows] duration-200 ease-out',
  contentResizeWithOpacity:
    'grid transition-[grid-template-rows,opacity] duration-200 ease-out',
} as const;

export const motion = {
  titleRevealDurationMs: 280,
  titleRevealStaggerMs: 24,
  titleRevealMaxStaggeredLetters: 16,
  titleRevealEasing: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

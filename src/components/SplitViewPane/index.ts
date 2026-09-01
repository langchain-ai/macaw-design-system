// NOTE: SplitViewPane is intentionally not re-exported from the design-system
// barrel. It depends on @headlessui/react, which would increase the size of
// every chunk that imports from the barrel.
export {
  CustomHeaderSlot,
  HeaderTitleActionSlot,
  SplitViewPane,
} from './SplitViewPane';
export type { SplitViewPaneProps } from './SplitViewPane';

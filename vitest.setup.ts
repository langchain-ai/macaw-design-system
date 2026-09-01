import '@testing-library/jest-dom';
import { afterEach, beforeAll, vi } from 'vitest';
import failOnConsole from 'vitest-fail-on-console';

import { cleanup } from '@testing-library/react';

failOnConsole({
  shouldFailOnError: true,
  shouldFailOnWarn: true,
});

beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }

  window.scrollTo = vi.fn();
  Element.prototype.scrollIntoView ??= vi.fn();

  if (!Range.prototype.getClientRects) {
    Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
  }

  // jsdom does not implement pseudo-element styles; Radix only needs the
  // element styles during positioning.
  const originalGetComputedStyle = window.getComputedStyle;
  window.getComputedStyle = (element: Element) =>
    originalGetComputedStyle(element);

  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  globalThis.MutationObserver = class MutationObserver {
    observe() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
});

afterEach(() => {
  cleanup();
});

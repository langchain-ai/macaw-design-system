function isScrollable(element: Element): boolean {
  const hasScrollableContent = element.scrollHeight > element.clientHeight;
  const overflowYStyle = window.getComputedStyle(element).overflowY;
  const isOverflowHidden = overflowYStyle.indexOf('hidden') !== -1;

  return hasScrollableContent && !isOverflowHidden;
}

export function getScrollParent(element: Element | null): Element | null {
  if (!element) {
    return null;
  }

  if (element.tagName === 'BODY') {
    return element;
  }

  if (isScrollable(element)) {
    return element;
  }

  return getScrollParent(element.parentElement);
}

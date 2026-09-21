import { useEffect, useRef, useState } from 'react';

export const useResizeTextEditor = ({
  maxHeight,
  internalValue,
  textRef,
}: {
  maxHeight?: number | string;
  internalValue: string;
  textRef?: React.RefObject<HTMLTextAreaElement | null> | undefined;
}) => {
  const displayDivRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const actualTextRef = textRef ?? textareaRef;
  const [manuallyResized, setManuallyResized] = useState(false);
  const lastContentLength = useRef(internalValue.length);

  const maxHeightPx = maxHeight
    ? typeof maxHeight === 'number'
      ? `${maxHeight}px`
      : maxHeight
    : '300px';
  // Sync scroll position between textarea and display div
  useEffect(() => {
    const textarea = actualTextRef.current;
    const displayDiv = displayDivRef.current;

    if (!textarea) return;

    const syncScroll = () => {
      if (!displayDiv) return;
      displayDiv.scrollTop = textarea.scrollTop;
    };

    // Function to auto-resize the textarea based on content
    const autoResizeTextarea = () => {
      if (!textarea || manuallyResized) return;

      // Reset height temporarily to get the correct scrollHeight
      textarea.style.height = 'auto';

      // Calculate new height (limit to maxHeight)
      const newHeight = Math.min(textarea.scrollHeight, parseInt(maxHeightPx));

      // Apply the new height to both elements
      textarea.style.height = `${newHeight}px`;
      // Set overflow to auto only if content exceeds max height
      const shouldScroll = textarea.scrollHeight > parseInt(maxHeightPx);
      textarea.style.overflowY = shouldScroll ? 'auto' : 'hidden';
      if (displayDiv) {
        displayDiv.style.height = 'auto';
        displayDiv.style.height = `${newHeight}px`;
        // Only show scrollbar on textarea, hide it on display div
        displayDiv.style.overflowY = 'hidden';
      }
    };

    // Function to sync dimensions from textarea to display div
    const syncDimensions = () => {
      if (!displayDiv) return;
      const computedStyle = window.getComputedStyle(textarea);

      displayDiv.style.width = computedStyle.width;
      displayDiv.style.height = computedStyle.height;
      // Always hide scrollbar on display div, keep content scrollable
      displayDiv.style.overflowY = 'hidden';
    };

    // Run the auto-resize on mount
    if (!manuallyResized) {
      autoResizeTextarea();
    }

    // Set up resize observer to detect manual resizing
    const resizeObserver = new ResizeObserver(() => {
      const currentHeight = parseInt(window.getComputedStyle(textarea).height);
      const contentScrollHeight = textarea.scrollHeight;

      // If current height is different from what auto-resize would set
      // and it's not due to overflow, consider it a manual resize
      if (
        Math.abs(currentHeight - contentScrollHeight) > 5 &&
        currentHeight !== parseInt(maxHeightPx)
      ) {
        setManuallyResized(true);
      }

      syncDimensions();
    });

    // Input handler to check for content changes that might reset manual resize
    const handleInput = () => {
      const currentLength = textarea.value.length;
      // If content length changed dramatically, consider resetting manual resize
      if (Math.abs(currentLength - lastContentLength.current) > 20) {
        setManuallyResized(false);
        lastContentLength.current = currentLength;
      }

      if (!manuallyResized) {
        autoResizeTextarea();
      }
    };

    resizeObserver.observe(textarea);
    textarea.addEventListener('input', handleInput);
    textarea.addEventListener('scroll', syncScroll);

    return () => {
      textarea.removeEventListener('scroll', syncScroll);
      textarea.removeEventListener('input', handleInput);
      resizeObserver.disconnect();
    };
  }, [actualTextRef, maxHeightPx, manuallyResized, internalValue]);

  return {
    displayDivRef,
    textAreaRef: actualTextRef,
    maxHeight: manuallyResized ? 'none' : maxHeightPx,
  };
};

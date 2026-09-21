import type { CSSProperties, HTMLProps } from 'react';
import { forwardRef, useCallback, useMemo } from 'react';

import { Virtuoso } from 'react-virtuoso';

import { Text } from './Text';

type ItemProps = HTMLProps<HTMLDivElement>;

const Item = forwardRef<HTMLDivElement, ItemProps>((props, ref) => {
  const { color: _color, as: _as, children, ...rest } = props;
  return (
    <Text as="span" {...rest} ref={ref}>
      {children}
    </Text>
  );
});

// Memoize components object to prevent unnecessary re-renders
const VIRTUOSO_COMPONENTS = { Item };

export const TextVirtualizer = ({
  text,
  containerHeight,
  chunkSize = 5000,
  style = {},
  renderChunk,
}: {
  text: string;
  containerHeight: string;
  chunkSize?: number;
  style?: CSSProperties;
  renderChunk?: (chunk: string, index: number) => React.ReactNode;
}) => {
  // Create text chunks for virtualization
  const chunks = useMemo(() => {
    if (!text) return [];

    const result: string[] = [];
    let currentPosition = 0;

    while (currentPosition < text.length) {
      let endPosition = Math.min(currentPosition + chunkSize, text.length);

      if (endPosition < text.length) {
        const nextNewline = text.indexOf('\n', endPosition);

        // If a newline is reasonably close, use it as the break point
        if (
          nextNewline !== -1 &&
          nextNewline - currentPosition < chunkSize * 2
        ) {
          endPosition = nextNewline + 1;
        }
      }

      result.push(text.substring(currentPosition, endPosition));
      currentPosition = endPosition;
    }

    return result;
  }, [text, chunkSize]);

  // Memoize the render function to reduce closure retention
  const itemContent = useCallback(
    (index: number) => {
      const chunk = chunks[index] ?? '';
      return renderChunk ? renderChunk(chunk, index) : chunk;
    },
    [chunks, renderChunk]
  );

  return (
    <div
      style={{
        height: containerHeight,
        width: '100%',
        display: 'inline-block',
        ...style,
      }}
    >
      <Virtuoso
        totalCount={chunks.length}
        components={VIRTUOSO_COMPONENTS}
        itemContent={itemContent}
        increaseViewportBy={500}
      />
    </div>
  );
};

import { useMemo, useState } from 'react';

import { getScrollParent } from '../utils/get-closest-scroll-parent';
import { parseTextWithLinks } from '../utils/parseTextLinks';
import { Button } from './Button';
import { MAX_TEXT_LENGTH } from './Code/constants';
import { Text } from './Text';
import { TextVirtualizer } from './TextVirtualizer';

const TextWithLinksInner = ({
  text,
  useRawSpan,
}: {
  text: string;
  useRawSpan: boolean;
}) => {
  const textParts = useMemo(() => parseTextWithLinks(text ?? ''), [text]);
  return (
    <>
      {textParts.map((part, index) => {
        if (part.type === 'link') {
          const href = part.url?.startsWith('http')
            ? part.url
            : `https://${part.url}`;

          return (
            // oxlint-disable-next-line forbid-elements
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto text-link underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part.content}
            </a>
          );
        }
        return useRawSpan ? (
          <span key={index}>{part.content}</span>
        ) : (
          <Text key={index} variant="body" as="span">
            {part.content}
          </Text>
        );
      })}
    </>
  );
};

// Truncated version
export const TextWithLinks = (props: {
  text: string;
  containerHeight?: string;
  fullLength?: boolean;
  useRawSpan?: boolean;
}) => {
  const [isTruncated, setIsTruncated] = useState(true);
  const isTextLong = props.fullLength
    ? false
    : props.text.length > MAX_TEXT_LENGTH;
  const textToRender =
    isTextLong && isTruncated
      ? `${props.text.slice(0, MAX_TEXT_LENGTH)}...`
      : props.text;

  return (
    <>
      {props.containerHeight && isTextLong ? (
        <TextVirtualizer
          containerHeight={`calc(${props.containerHeight} - 35px)`}
          text={textToRender}
        />
      ) : (
        <TextWithLinksInner
          text={textToRender}
          useRawSpan={props.useRawSpan ?? false}
        />
      )}
      {isTextLong && (
        <Button
          variant="underlined"
          color="secondary"
          size="sm"
          onClick={(e) => {
            if (isTruncated) {
              // Shift the scroll container up by a tiny bit so
              // when showing rest of the text, the scroll is not at the end of
              // the container and user loses their place.
              const scrollParent = getScrollParent(e.currentTarget);
              scrollParent?.scrollTo({
                top: scrollParent.scrollTop - 1,
                behavior: 'instant',
              });
            }
            setIsTruncated(!isTruncated);
          }}
        >
          {isTruncated ? 'Show more' : 'Show less'}
        </Button>
      )}
    </>
  );
};

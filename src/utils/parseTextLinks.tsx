import LinkifyIt from 'linkify-it';

const COMMON_TLDS = [
  'com',
  'org',
  'net',
  'edu',
  'gov',
  'io',
  'co',
  'app',
  'dev',
  'me',
  'info',
  'blog',
  'ai',
];

const linkify = new LinkifyIt();
linkify.tlds(COMMON_TLDS);

type TextPart = {
  type: 'text' | 'link';
  content: string;
  url?: string;
};

export const parseTextWithLinks = (text: string): TextPart[] => {
  if (!text) return [];

  const parts: {
    type: 'text' | 'link';
    content: string;
    url?: string;
  }[] = [];
  const matches = linkify.match(text) || [];
  let lastIndex = 0;

  for (const match of matches) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    parts.push({
      type: 'link',
      content: match.text,
      url: match.url,
    });

    lastIndex = match.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return parts;
};

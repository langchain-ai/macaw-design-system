import { describe, expect, it } from 'vitest';

import type { SyntaxHighlighterRow } from '../types';
import { calculateTotalHeight, getMimeTypeFromDataUrl } from '../utils';

describe('calculateTotalHeight', () => {
  it('should return the correct total height', () => {
    const rows: SyntaxHighlighterRow[] = [
      // 1 row
      {
        type: 'element',
        tagName: 'span',
        properties: { className: [] },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: { className: [] },
            children: [
              {
                type: 'element',
                tagName: 'text',
                properties: {},
                children: [],
                value: 'const longText = ',
              },
            ],
          },
        ],
      },
      // spans 3 rows
      {
        type: 'element',
        tagName: 'span',
        properties: { className: [] },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['hljs-string'] },
            children: [
              {
                type: 'element',
                tagName: 'text',
                properties: {},
                children: [],
                value:
                  "'This is a really long text string that should wrap to the next line because it exceeds the row width of 80 characters defined in the constants file. Testing the wrapping behavior.'",
              },
            ],
          },
        ],
      },
      // 1 row
      {
        type: 'element',
        tagName: 'span',
        properties: { className: [] },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: { className: [] },
            children: [
              {
                type: 'element',
                tagName: 'text',
                properties: {},
                children: [],
                value: ';',
              },
            ],
          },
        ],
      },
    ];

    const totalHeight = calculateTotalHeight(rows);

    // 1 row span + 3 row span + 1 row span = 5 rows
    expect(totalHeight).toBe(5 * 20);
  });

  it('should calculate basic height for short rows', () => {
    const rows: SyntaxHighlighterRow[] = [
      {
        type: 'element',
        tagName: 'span',
        properties: { className: [] },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: { className: [] },
            children: [
              {
                type: 'element',
                tagName: 'text',
                properties: {},
                children: [],
                value: 'const x = 1;',
              },
            ],
          },
        ],
      },
      {
        type: 'element',
        tagName: 'span',
        properties: { className: [] },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: { className: [] },
            children: [
              {
                type: 'element',
                tagName: 'text',
                properties: {},
                children: [],
                value: 'const y = 2;',
              },
            ],
          },
        ],
      },
    ];

    const totalHeight = calculateTotalHeight(rows);

    // 2 rows * 20px row height = 40px
    expect(totalHeight).toBe(2 * 20);
  });
});

describe('getMimeTypeFromDataUrl', () => {
  it('returns mime type for valid data url with base64', () => {
    expect(
      getMimeTypeFromDataUrl('data:application/pdf;base64,JVBERi0xLjc=')
    ).toBe('application/pdf');
    expect(getMimeTypeFromDataUrl('data:audio/wav;base64,UklGRg==')).toBe(
      'audio/wav'
    );
  });

  it('returns null for non-data-url strings', () => {
    expect(getMimeTypeFromDataUrl('JVBERi0xLjc=')).toBeNull();
    expect(getMimeTypeFromDataUrl('https://example.com/file.pdf')).toBeNull();
  });

  it('returns null when mime type is missing', () => {
    expect(getMimeTypeFromDataUrl('data:;base64,JVBERi0xLjc=')).toBeNull();
  });
});

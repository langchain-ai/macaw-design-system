import { describe, expect, it } from 'vitest';

import { sanitizeImageSrc } from '../sanitizeImageSrc';

describe('sanitizeImageSrc', () => {
  it.each([
    'https://example.com/image.png',
    'http://example.com/image.png?size=2',
    '//cdn.example.com/image.png',
    '/assets/image.png',
    'image.png',
    'blob:https://example.com/0b9c4b3e-5d1f-4a3c-9a43-7f1f0c1d2e3f',
    'data:image/png;base64,iVBORw0KGgo=',
    'DATA:IMAGE/GIF;base64,R0lGODlhAQABAAAAACw=',
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E',
  ])('allows %s', (src) => {
    expect(sanitizeImageSrc(src)).toBe(src);
  });

  it.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    '  javascript:alert(1)',
    'java\tscript:alert(1)',
    'java\nscript:alert(1)',
    '\u0001javascript:alert(1)',
    'vbscript:msgbox(1)',
    'data:text/html,<script>alert(1)</script>',
    'data:image,<script>alert(1)</script>',
    'file:///etc/passwd',
    'http://[invalid',
  ])('blocks %j', (src) => {
    expect(sanitizeImageSrc(src)).toBe('about:blank');
  });
});

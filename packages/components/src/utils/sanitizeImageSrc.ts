const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'blob:']);
const IMAGE_DATA_URL = /^data:image\/[a-z0-9.+-]+[;,]/i;

/**
 * Allowlists sources that are safe to load as an image (`<img src>`, CSS
 * `url()`). Everything else becomes `about:blank`. Not for navigation links.
 */
export function sanitizeImageSrc(src: string): string {
  let url: URL;
  try {
    // Parsing strips the whitespace and control characters browsers ignore,
    // so `java\tscript:` is caught. Relative sources resolve to https.
    url = new URL(src, 'https://relative.invalid');
  } catch {
    return 'about:blank';
  }
  if (ALLOWED_PROTOCOLS.has(url.protocol)) return src;
  if (url.protocol === 'data:' && IMAGE_DATA_URL.test(url.href)) return src;
  return 'about:blank';
}

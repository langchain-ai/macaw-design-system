import { sanitizeUrl } from '@braintree/sanitize-url';

/** For native `<img>` sources only; do not use for navigation or downloads. */
export function sanitizeImageSrc(src: string): string {
  return /^data:image\/[a-z0-9.+-]+(?:;[^,]*)?,/i.test(src)
    ? src
    : sanitizeUrl(src);
}

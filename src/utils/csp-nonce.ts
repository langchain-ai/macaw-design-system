/**
 * Gets the nonce value from various sources:
 * 1. Meta tag with name="csp-nonce"
 * 2. Global variable (if set by the server)
 */
export function getNonce(): string | undefined {
  if (typeof document !== 'undefined') {
    const metaTag = document.querySelector('meta[name="csp-nonce"]');
    if (metaTag) {
      return metaTag.getAttribute('content') || undefined;
    }
  }

  return typeof window !== 'undefined' ? window.__CSP_NONCE__ : undefined;
}

declare global {
  interface Window {
    __CSP_NONCE__?: string;
  }
}

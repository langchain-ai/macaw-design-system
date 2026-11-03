export type DataAttributes = {
  readonly [key: `data-${string}`]: string | number | boolean | undefined;
};

/**
 * Keeps only `data-*` keys, so components can forward consumer data
 * attributes to the DOM without also forwarding stray props from untyped
 * callers.
 */
export function pickDataAttributes(props: object): DataAttributes {
  return Object.fromEntries(
    Object.entries(props).filter(([key]) => key.startsWith('data-'))
  );
}

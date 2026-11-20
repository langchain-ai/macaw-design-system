export type InputModality = 'keyboard' | 'pointer';

let lastInputModality: InputModality | null = null;

if (typeof document !== 'undefined') {
  document.addEventListener(
    'keydown',
    (event) => {
      if (!event.metaKey && !event.altKey && !event.ctrlKey) {
        lastInputModality = 'keyboard';
      }
    },
    true
  );
  document.addEventListener(
    'pointerdown',
    () => {
      lastInputModality = 'pointer';
    },
    true
  );
}

/** The last user input type, or null before any keyboard or pointer input. */
export function getLastInputModality(): InputModality | null {
  return lastInputModality;
}

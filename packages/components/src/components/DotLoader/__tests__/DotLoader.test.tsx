import { act, render, screen } from '@testing-library/react';

import { DotLoader } from '../DotLoader';

const context = {
  clearRect: vi.fn(),
  setTransform: vi.fn(),
  fillRect: vi.fn(),
  getImageData: () => ({ data: new Uint8ClampedArray([127, 200, 255, 255]) }),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  fillStyle: '',
};

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    context as unknown as CanvasRenderingContext2D
  );
  vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

it('announces loading, sizes the canvas, and cancels animation on unmount', () => {
  const { container, unmount } = render(
    <DotLoader width={320} height={64} label="Loading traces" />
  );
  expect(screen.getByRole('status')).toHaveAccessibleName('Loading traces');
  expect(screen.getByText('Loading traces')).toBeVisible();
  expect(container.querySelector('canvas')).toHaveStyle({
    width: '320px',
    height: '64px',
  });
  expect(window.requestAnimationFrame).toHaveBeenCalled();
  unmount();
  expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1);
});

it('draws a static frame and responds to reduced-motion changes', () => {
  let change = () => {};
  const media = {
    matches: true,
    addEventListener: vi.fn((_event, listener) => {
      change = listener;
    }),
    removeEventListener: vi.fn(),
  };
  vi.spyOn(window, 'matchMedia').mockReturnValue(
    media as unknown as MediaQueryList
  );
  const { unmount } = render(<DotLoader />);
  expect(screen.getByRole('status')).toHaveAccessibleName('Loading');
  expect(context.arc).toHaveBeenCalled();
  expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  media.matches = false;
  act(() => change());
  expect(window.requestAnimationFrame).toHaveBeenCalled();
  unmount();
  expect(media.removeEventListener).toHaveBeenCalledWith('change', change);
});

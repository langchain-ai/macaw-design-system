import { vi } from 'vitest';

import { ErrorReporterContext } from '../../contexts/ErrorReporterContext';
import { render, screen } from '../../test-utils';
import { ErrorBoundary } from '../ErrorBoundary';

const BrokenComponent = () => {
  throw new Error('render failed');
};

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports the React error through the configured reporter', () => {
    const reportError = vi.fn();
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    render(
      <ErrorReporterContext.Provider value={reportError}>
        <ErrorBoundary fallback={() => 'Could not load content'}>
          <BrokenComponent />
        </ErrorBoundary>
      </ErrorReporterContext.Provider>,
      { withProviders: false }
    );

    expect(screen.getByText('Could not load content')).toBeVisible();
    expect(reportError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'render failed' }),
      expect.objectContaining({
        componentStack: expect.stringContaining('BrokenComponent'),
      })
    );
    expect(consoleError).not.toHaveBeenCalledWith(
      'ErrorBoundary caught',
      expect.anything(),
      expect.anything()
    );
  });

  it('logs the React component stack when no reporter is configured', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    render(
      <ErrorBoundary fallback={() => 'Could not load content'}>
        <BrokenComponent />
      </ErrorBoundary>,
      { withProviders: false }
    );

    expect(consoleError).toHaveBeenCalledWith(
      'ErrorBoundary caught',
      expect.objectContaining({ message: 'render failed' }),
      {
        source: 'react-error-boundary',
        componentStack: expect.stringContaining('BrokenComponent'),
        route: '/',
      }
    );
  });
});

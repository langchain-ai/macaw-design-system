import type { ContextType, ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

import { ErrorReporterContext } from '../contexts/ErrorReporterContext';

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  /** When this value changes, any caught error is automatically cleared. */
  resetKey?: unknown;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  { error: Error | null; prevResetKey?: unknown }
> {
  static contextType = ErrorReporterContext;

  declare context: ContextType<typeof ErrorReporterContext>;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, prevResetKey: props.resetKey };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const context = {
      source: 'react-error-boundary',
      componentStack: errorInfo.componentStack,
      route:
        typeof window === 'undefined' ? undefined : window.location.pathname,
    };

    if (this.context) {
      this.context(error, errorInfo, { ux_impact: 'blocking' });
    } else {
      console.error('ErrorBoundary caught', error, context);
    }
  }

  static getDerivedStateFromProps(
    props: { resetKey?: unknown },
    state: { error: Error | null; prevResetKey?: unknown }
  ) {
    if (state.error && props.resetKey !== state.prevResetKey) {
      return { error: null, prevResetKey: props.resetKey };
    }
    if (props.resetKey !== state.prevResetKey) {
      return { prevResetKey: props.resetKey };
    }
    return null;
  }

  render() {
    if (this.state.error) {
      return this.props.fallback?.(this.state.error, () =>
        this.setState(() => ({ error: null }))
      );
    }

    return this.props.children;
  }
}

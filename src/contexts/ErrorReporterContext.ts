import { createContext, type ErrorInfo } from 'react';

export type ErrorReportContext = {
  ux_impact?: 'blocking';
};

export type ErrorReporter = (
  error: Error,
  errorInfo: ErrorInfo,
  context?: ErrorReportContext
) => void;

export const ErrorReporterContext = createContext<ErrorReporter | undefined>(
  undefined
);

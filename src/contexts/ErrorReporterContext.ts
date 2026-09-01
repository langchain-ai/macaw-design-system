import { createContext, type ErrorInfo } from 'react';

export type ErrorReporter = (error: Error, errorInfo: ErrorInfo) => void;

export const ErrorReporterContext = createContext<ErrorReporter | undefined>(
  undefined
);

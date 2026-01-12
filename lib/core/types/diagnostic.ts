/**
 * Diagnostic types for UCP Doctor
 */

export type CheckStatus = 'pass' | 'fail' | 'warn' | 'skip' | 'pending';

export interface CheckResult {
  id: string;
  name: string;
  description: string;
  status: CheckStatus;
  message: string;
  details?: Record<string, unknown>;
  duration: number;
  timestamp: Date;
}

export interface DiagnosticReport {
  id: string;
  target: string;
  startedAt: Date;
  completedAt: Date;
  duration: number;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    skipped: number;
  };
  checks: CheckResult[];
  profile?: unknown;
  errors: DiagnosticError[];
}

export interface DiagnosticError {
  code: string;
  message: string;
  check?: string;
  stack?: string;
}

export interface DiagnosticOptions {
  timeout?: number;
  checkEndpoints?: boolean;
  checkSchemas?: boolean;
  verbose?: boolean;
  checks?: string[];
}

export interface DiagnosticCallbacks {
  onCheckStart?: (check: { id: string; name: string }) => void | Promise<void>;
  onCheckComplete?: (result: CheckResult) => void | Promise<void>;
}

export const DEFAULT_OPTIONS: Required<DiagnosticOptions> = {
  timeout: 10000,
  checkEndpoints: true,
  checkSchemas: false,
  verbose: false,
  checks: [],
};

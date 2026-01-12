/**
 * Base check class for all diagnostic checks
 */

import type { CheckResult, CheckStatus, DiagnosticOptions } from '../types/index';
import type { UcpDiscoveryProfile } from '../types/index';

export interface CheckContext {
  target: string;
  options: DiagnosticOptions;
  results: Map<string, CheckResult>;
  data: Map<string, unknown>;
}

export abstract class BaseCheck {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;
  readonly dependencies: string[] = [];

  abstract run(context: CheckContext): Promise<CheckResult>;

  protected createResult(
    status: CheckStatus,
    message: string,
    details?: Record<string, unknown>
  ): CheckResult {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      status,
      message,
      details,
      duration: 0,
      timestamp: new Date(),
    };
  }

  protected pass(message: string, details?: Record<string, unknown>): CheckResult {
    return this.createResult('pass', message, details);
  }

  protected fail(message: string, details?: Record<string, unknown>): CheckResult {
    return this.createResult('fail', message, details);
  }

  protected warn(message: string, details?: Record<string, unknown>): CheckResult {
    return this.createResult('warn', message, details);
  }

  protected skip(message: string): CheckResult {
    return this.createResult('skip', message);
  }
}

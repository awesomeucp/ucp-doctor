/**
 * Diagnostic Engine - orchestrates all checks
 */

import type {
  DiagnosticOptions,
  DiagnosticReport,
  DiagnosticCallbacks,
  CheckResult,
  DiagnosticError,
} from '../types/index';
import { DEFAULT_OPTIONS } from '../types/index';
import { ALL_CHECKS, type BaseCheck, type CheckContext } from '../checks/index';

export class DiagnosticEngine {
  private checks: BaseCheck[];
  private options: Required<DiagnosticOptions>;

  constructor(options: DiagnosticOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.checks = this.initializeChecks();
  }

  private initializeChecks(): BaseCheck[] {
    if (this.options.checks && this.options.checks.length > 0) {
      const selectedIds = new Set(this.options.checks);
      return ALL_CHECKS.filter(check => selectedIds.has(check.id));
    }
    return ALL_CHECKS;
  }

  private createContext(target: string): CheckContext {
    return {
      target,
      options: this.options,
      results: new Map(),
      data: new Map(),
    };
  }

  private sortChecksByDependencies(): BaseCheck[] {
    const sorted: BaseCheck[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const checkMap = new Map(this.checks.map(c => [c.id, c]));

    const visit = (check: BaseCheck) => {
      if (visited.has(check.id)) return;
      if (visiting.has(check.id)) {
        throw new Error(`Circular dependency detected: ${check.id}`);
      }

      visiting.add(check.id);

      for (const depId of check.dependencies) {
        const dep = checkMap.get(depId);
        if (dep) visit(dep);
      }

      visiting.delete(check.id);
      visited.add(check.id);
      sorted.push(check);
    };

    for (const check of this.checks) {
      visit(check);
    }

    return sorted;
  }

  private checkDependenciesMet(check: BaseCheck, results: Map<string, CheckResult>): boolean {
    for (const depId of check.dependencies) {
      const depResult = results.get(depId);
      if (!depResult || depResult.status === 'fail') {
        return false;
      }
    }
    return true;
  }

  private createReport(
    target: string,
    results: CheckResult[],
    context: CheckContext,
    startTime: number,
    errors: DiagnosticError[]
  ): DiagnosticReport {
    const completedAt = new Date();

    const summary = {
      total: results.length,
      passed: results.filter(r => r.status === 'pass').length,
      failed: results.filter(r => r.status === 'fail').length,
      warnings: results.filter(r => r.status === 'warn').length,
      skipped: results.filter(r => r.status === 'skip').length,
    };

    return {
      id: crypto.randomUUID(),
      target,
      startedAt: new Date(startTime),
      completedAt,
      duration: completedAt.getTime() - startTime,
      summary,
      checks: results,
      profile: context.data.get('profile'),
      errors,
    };
  }

  async diagnose(
    target: string,
    callbacks?: DiagnosticCallbacks
  ): Promise<DiagnosticReport> {
    const startTime = Date.now();
    const context = this.createContext(target);
    const results: CheckResult[] = [];
    const errors: DiagnosticError[] = [];

    const sortedChecks = this.sortChecksByDependencies();

    for (const check of sortedChecks) {
      // Skip if dependencies failed
      if (!this.checkDependenciesMet(check, context.results)) {
        const result = {
          id: check.id,
          name: check.name,
          description: check.description,
          status: 'skip' as const,
          message: 'Skipped: dependencies not met',
          duration: 0,
          timestamp: new Date(),
        };
        results.push(result);
        context.results.set(check.id, result);
        await callbacks?.onCheckComplete?.(result);
        continue;
      }

      await callbacks?.onCheckStart?.({ id: check.id, name: check.name });

      const checkStart = Date.now();
      try {
        const result = await check.run(context);
        result.duration = Date.now() - checkStart;
        results.push(result);
        context.results.set(check.id, result);
        await callbacks?.onCheckComplete?.(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const result: CheckResult = {
          id: check.id,
          name: check.name,
          description: check.description,
          status: 'fail',
          message: `Check threw error: ${errorMessage}`,
          duration: Date.now() - checkStart,
          timestamp: new Date(),
        };
        results.push(result);
        context.results.set(check.id, result);
        errors.push({
          code: 'CHECK_ERROR',
          message: errorMessage,
          check: check.id,
          stack: error instanceof Error ? error.stack : undefined,
        });
        await callbacks?.onCheckComplete?.(result);
      }
    }

    return this.createReport(target, results, context, startTime, errors);
  }
}

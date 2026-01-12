/**
 * Connectivity check - verifies the domain is reachable
 */

import { BaseCheck, type CheckContext } from './base';
import type { CheckResult } from '../types/index';

export class ConnectivityCheck extends BaseCheck {
  readonly id = 'connectivity';
  readonly name = 'Connectivity';
  readonly description = 'Verifies the domain is reachable via HTTP';

  async run(context: CheckContext): Promise<CheckResult> {
    const { target, options } = context;

    try {
      const url = new URL(target);
      const baseUrl = `${url.protocol}//${url.host}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);

      const response = await fetch(baseUrl, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      context.data.set('baseUrl', baseUrl);

      return this.pass(
        `Domain is reachable (HTTP ${response.status})`,
        { url: baseUrl, status: response.status }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('abort')) {
        return this.fail(`Connection timed out after ${options.timeout}ms`, { error: 'timeout' });
      }

      return this.fail(`Failed to connect: ${errorMessage}`, { error: errorMessage });
    }
  }
}

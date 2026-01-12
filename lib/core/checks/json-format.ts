/**
 * JSON format check - verifies the response is valid JSON
 */

import { BaseCheck, type CheckContext } from './base';
import type { CheckResult } from '../types/index';

export class JsonFormatCheck extends BaseCheck {
  readonly id = 'json-format';
  readonly name = 'JSON Format';
  readonly description = 'Verifies the response is valid JSON';
  override readonly dependencies = ['discovery-endpoint'];

  async run(context: CheckContext): Promise<CheckResult> {
    const rawResponse = context.data.get('rawResponse') as string | undefined;

    if (!rawResponse) {
      return this.skip('No response data available');
    }

    try {
      const parsed = JSON.parse(rawResponse);
      context.data.set('parsedJson', parsed);

      return this.pass(
        'Response is valid JSON',
        { type: typeof parsed, isArray: Array.isArray(parsed) }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.fail(`Invalid JSON: ${errorMessage}`, { error: errorMessage });
    }
  }
}

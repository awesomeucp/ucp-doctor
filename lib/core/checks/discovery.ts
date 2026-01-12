/**
 * Discovery endpoint check - verifies /.well-known/ucp exists
 */

import { BaseCheck, type CheckContext } from './base';
import type { CheckResult } from '../types/index';

export class DiscoveryEndpointCheck extends BaseCheck {
  readonly id = 'discovery-endpoint';
  readonly name = 'Discovery Endpoint';
  readonly description = 'Verifies /.well-known/ucp endpoint exists and returns a response';
  override readonly dependencies = ['connectivity'];

  async run(context: CheckContext): Promise<CheckResult> {
    const { target, options } = context;

    try {
      const url = new URL(target);
      const discoveryUrl = `${url.protocol}//${url.host}/.well-known/ucp`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);

      const response = await fetch(discoveryUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return this.fail(
          `Discovery endpoint returned HTTP ${response.status}`,
          { url: discoveryUrl, status: response.status }
        );
      }

      const text = await response.text();
      context.data.set('discoveryUrl', discoveryUrl);
      context.data.set('rawResponse', text);

      return this.pass(
        `Discovery endpoint exists (HTTP ${response.status})`,
        { url: discoveryUrl, status: response.status, contentLength: text.length }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.fail(`Failed to fetch discovery endpoint: ${errorMessage}`, { error: errorMessage });
    }
  }
}

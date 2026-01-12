/**
 * Schema URLs reachability check
 */

import { BaseCheck, type CheckContext } from './base';
import type { CheckResult } from '../types/index';
import type { UcpDiscoveryProfile } from '../types/index';

export class SchemaUrlsCheck extends BaseCheck {
  readonly id = 'schema-urls';
  readonly name = 'Schema URLs';
  readonly description = 'Checks if referenced schema URLs are reachable';
  override readonly dependencies = ['schema-validation'];

  async run(context: CheckContext): Promise<CheckResult> {
    const profile = context.data.get('profile') as UcpDiscoveryProfile | undefined;
    const options = context.options;

    if (!options.checkSchemas) {
      return this.skip('Schema URL checking disabled (use --check-schemas to enable)');
    }

    if (!profile) {
      return this.skip('No profile available');
    }

    // Collect all schema URLs
    const schemaUrls = new Set<string>();

    // From services and their capabilities
    for (const service of Object.values(profile.ucp.services || {})) {
      if (service.spec) schemaUrls.add(service.spec);
      if (service.rest?.schema) schemaUrls.add(service.rest.schema);
      if (service.mcp?.schema) schemaUrls.add(service.mcp.schema);
      if (service.embedded?.schema) schemaUrls.add(service.embedded.schema);

      // Capabilities are nested inside each service
      for (const cap of service.capabilities || []) {
        if (cap.schema) schemaUrls.add(cap.schema);
        if (cap.spec) schemaUrls.add(cap.spec);
      }
    }

    // From payment handlers
    if (profile.payment?.handlers) {
      for (const handler of profile.payment.handlers) {
        if (handler.spec) schemaUrls.add(handler.spec);
        if (handler.config_schema) schemaUrls.add(handler.config_schema);
        for (const schema of handler.instrument_schemas || []) {
          schemaUrls.add(schema);
        }
      }
    }

    if (schemaUrls.size === 0) {
      return this.skip('No schema URLs to check');
    }

    const reachable: string[] = [];
    const unreachable: { url: string; error: string }[] = [];

    // Check URLs in parallel with concurrency limit
    const urlArray = Array.from(schemaUrls);
    const batchSize = 5;

    for (let i = 0; i < urlArray.length; i += batchSize) {
      const batch = urlArray.slice(i, i + batchSize);

      await Promise.all(batch.map(async (url) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);

          const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            reachable.push(url);
          } else {
            unreachable.push({ url, error: `HTTP ${response.status}` });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          unreachable.push({ url, error: errorMessage });
        }
      }));
    }

    if (unreachable.length > 0) {
      return this.warn(
        `${unreachable.length}/${schemaUrls.size} schema URL(s) unreachable`,
        { unreachable, reachable: reachable.length }
      );
    }

    return this.pass(
      `All ${schemaUrls.size} schema URL(s) are reachable`,
      { count: schemaUrls.size }
    );
  }
}

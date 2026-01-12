/**
 * URL validation checks - HTTPS enforcement and endpoint format
 */

import { BaseCheck, type CheckContext } from './base';
import type { CheckResult } from '../types/index';
import type { UcpDiscoveryProfile } from '../types/index';

/**
 * Collects all URLs from a UCP discovery profile
 */
function collectAllUrls(profile: UcpDiscoveryProfile): { url: string; source: string }[] {
  const urls: { url: string; source: string }[] = [];

  // From services
  for (const [name, service] of Object.entries(profile.ucp.services || {})) {
    if (service.spec) {
      urls.push({ url: service.spec, source: `service:${name}:spec` });
    }
    if (service.rest?.endpoint) {
      urls.push({ url: service.rest.endpoint, source: `service:${name}:rest.endpoint` });
    }
    if (service.rest?.schema) {
      urls.push({ url: service.rest.schema, source: `service:${name}:rest.schema` });
    }
    if (service.mcp?.endpoint) {
      urls.push({ url: service.mcp.endpoint, source: `service:${name}:mcp.endpoint` });
    }
    if (service.mcp?.schema) {
      urls.push({ url: service.mcp.schema, source: `service:${name}:mcp.schema` });
    }
    if (service.a2a?.endpoint) {
      urls.push({ url: service.a2a.endpoint, source: `service:${name}:a2a.endpoint` });
    }
    if (service.embedded?.schema) {
      urls.push({ url: service.embedded.schema, source: `service:${name}:embedded.schema` });
    }

    // Capabilities within services
    for (const cap of service.capabilities || []) {
      if (cap.spec) {
        urls.push({ url: cap.spec, source: `capability:${cap.name}:spec` });
      }
      if (cap.schema) {
        urls.push({ url: cap.schema, source: `capability:${cap.name}:schema` });
      }
    }
  }

  // From payment handlers
  for (const handler of profile.payment?.handlers || []) {
    if (handler.spec) {
      urls.push({ url: handler.spec, source: `payment:${handler.id}:spec` });
    }
    if (handler.config_schema) {
      urls.push({ url: handler.config_schema, source: `payment:${handler.id}:config_schema` });
    }
    for (const schema of handler.instrument_schemas || []) {
      urls.push({ url: schema, source: `payment:${handler.id}:instrument_schema` });
    }
  }

  return urls;
}

/**
 * Checks that all URLs use HTTPS protocol
 */
export class HttpsEnforcementCheck extends BaseCheck {
  readonly id = 'https-enforcement';
  readonly name = 'HTTPS Enforcement';
  readonly description = 'Validates all URLs use HTTPS protocol';
  override readonly dependencies = ['schema-validation'];

  async run(context: CheckContext): Promise<CheckResult> {
    const profile = context.data.get('profile') as UcpDiscoveryProfile | undefined;

    if (!profile) {
      return this.skip('No profile available');
    }

    const urls = collectAllUrls(profile);

    if (urls.length === 0) {
      return this.skip('No URLs to check');
    }

    const httpUrls: { url: string; source: string }[] = [];
    const localhostUrls: { url: string; source: string }[] = [];

    for (const { url, source } of urls) {
      try {
        const parsed = new URL(url);
        if (parsed.protocol === 'http:') {
          // Allow localhost for development
          if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
            localhostUrls.push({ url, source });
          } else {
            httpUrls.push({ url, source });
          }
        }
      } catch {
        // Invalid URL - will be caught by other checks
      }
    }

    if (httpUrls.length > 0) {
      return this.fail(
        `${httpUrls.length} URL(s) use HTTP instead of HTTPS`,
        {
          httpUrls,
          localhostUrls: localhostUrls.length > 0 ? localhostUrls : undefined,
          note: 'UCP requires HTTPS for all URLs in production'
        }
      );
    }

    if (localhostUrls.length > 0) {
      return this.warn(
        `${localhostUrls.length} localhost URL(s) detected (OK for development)`,
        { localhostUrls, totalUrls: urls.length }
      );
    }

    return this.pass(
      `All ${urls.length} URL(s) use HTTPS`,
      { count: urls.length }
    );
  }
}

/**
 * Checks that endpoints have proper format (no trailing slashes)
 */
export class EndpointFormatCheck extends BaseCheck {
  readonly id = 'endpoint-format';
  readonly name = 'Endpoint Format';
  readonly description = 'Validates endpoint URLs have proper format';
  override readonly dependencies = ['schema-validation'];

  async run(context: CheckContext): Promise<CheckResult> {
    const profile = context.data.get('profile') as UcpDiscoveryProfile | undefined;

    if (!profile) {
      return this.skip('No profile available');
    }

    const endpoints: { url: string; source: string }[] = [];

    // Collect all endpoints (not schema/spec URLs)
    for (const [name, service] of Object.entries(profile.ucp.services || {})) {
      if (service.rest?.endpoint) {
        endpoints.push({ url: service.rest.endpoint, source: `service:${name}:rest` });
      }
      if (service.mcp?.endpoint) {
        endpoints.push({ url: service.mcp.endpoint, source: `service:${name}:mcp` });
      }
      if (service.a2a?.endpoint) {
        endpoints.push({ url: service.a2a.endpoint, source: `service:${name}:a2a` });
      }
    }

    if (endpoints.length === 0) {
      return this.skip('No endpoints to check');
    }

    const trailingSlash: { url: string; source: string }[] = [];
    const invalidUrls: { url: string; source: string; error: string }[] = [];

    for (const { url, source } of endpoints) {
      try {
        const parsed = new URL(url);
        // Check for trailing slash (excluding root path)
        if (parsed.pathname !== '/' && parsed.pathname.endsWith('/')) {
          trailingSlash.push({ url, source });
        }
      } catch (error) {
        invalidUrls.push({
          url,
          source,
          error: error instanceof Error ? error.message : 'Invalid URL'
        });
      }
    }

    if (invalidUrls.length > 0) {
      return this.fail(
        `${invalidUrls.length} endpoint(s) have invalid URL format`,
        { invalidUrls, trailingSlash: trailingSlash.length > 0 ? trailingSlash : undefined }
      );
    }

    if (trailingSlash.length > 0) {
      return this.warn(
        `${trailingSlash.length} endpoint(s) have trailing slashes`,
        {
          trailingSlash,
          note: 'Endpoints should not have trailing slashes per UCP spec'
        }
      );
    }

    return this.pass(
      `All ${endpoints.length} endpoint(s) have valid format`,
      { count: endpoints.length }
    );
  }
}

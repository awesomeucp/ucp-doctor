/**
 * Service checks - definitions and endpoint reachability
 */

import { BaseCheck, type CheckContext } from './base';
import type { CheckResult } from '../types/index';
import type { UcpDiscoveryProfile } from '../types/index';

// Service naming pattern: reverse-domain notation (e.g., dev.ucp.shopping, com.example.payments)
const SERVICE_NAME_REGEX = /^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9_]*)+$/;

export class ServiceDefinitionsCheck extends BaseCheck {
  readonly id = 'service-definitions';
  readonly name = 'Service Definitions';
  readonly description = 'Validates service definitions have required fields and bindings';
  override readonly dependencies = ['schema-validation'];

  async run(context: CheckContext): Promise<CheckResult> {
    const profile = context.data.get('profile') as UcpDiscoveryProfile | undefined;

    if (!profile?.ucp?.services) {
      return this.skip('No services found');
    }

    const services = profile.ucp.services;
    const serviceNames = Object.keys(services);

    if (serviceNames.length === 0) {
      return this.warn('No services defined in discovery profile', { count: 0 });
    }

    const errors: { service: string; issue: string }[] = [];
    const warnings: { service: string; issue: string }[] = [];
    const invalidNames: { service: string }[] = [];

    for (const [name, service] of Object.entries(services)) {
      // Validate service naming convention (reverse-domain)
      if (!SERVICE_NAME_REGEX.test(name)) {
        invalidNames.push({ service: name });
      }

      // Required fields (strict mode)
      if (!service.version) {
        errors.push({ service: name, issue: 'Missing version (required)' });
      }
      if (!service.spec) {
        errors.push({ service: name, issue: 'Missing spec URL (required in strict mode)' });
      }

      // Must have at least one transport binding
      const hasTransport = service.rest || service.mcp || service.a2a || service.embedded;
      if (!hasTransport) {
        errors.push({ service: name, issue: 'No transport binding defined (rest, mcp, a2a, or embedded required)' });
      }

      // Transport-specific validation
      if (service.rest) {
        if (!service.rest.endpoint) {
          errors.push({ service: name, issue: 'REST binding missing endpoint' });
        }
        if (!service.rest.schema) {
          warnings.push({ service: name, issue: 'REST binding missing schema URL (recommended)' });
        }
      }

      if (service.mcp) {
        if (!service.mcp.endpoint) {
          errors.push({ service: name, issue: 'MCP binding missing endpoint' });
        }
        if (!service.mcp.schema) {
          warnings.push({ service: name, issue: 'MCP binding missing schema URL (recommended)' });
        }
      }

      if (service.a2a) {
        if (!service.a2a.endpoint) {
          errors.push({ service: name, issue: 'A2A binding missing endpoint' });
        }
      }

      if (service.embedded) {
        if (!service.embedded.schema) {
          errors.push({ service: name, issue: 'Embedded binding missing schema URL (required)' });
        }
      }
    }

    if (errors.length > 0 || invalidNames.length > 0) {
      const issues: string[] = [];
      if (errors.length > 0) issues.push(`${errors.length} validation errors`);
      if (invalidNames.length > 0) issues.push(`${invalidNames.length} invalid service names`);

      return this.fail(
        `Service validation failed: ${issues.join(', ')}`,
        {
          errors: errors.length > 0 ? errors : undefined,
          invalidNames: invalidNames.length > 0 ? invalidNames : undefined,
          warnings: warnings.length > 0 ? warnings : undefined,
          serviceCount: serviceNames.length,
          note: 'Service names must use reverse-domain notation (e.g., dev.ucp.shopping)'
        }
      );
    }

    if (warnings.length > 0) {
      return this.warn(
        `${serviceNames.length} service(s) defined with ${warnings.length} warning(s)`,
        { warnings, services: serviceNames }
      );
    }

    return this.pass(
      `${serviceNames.length} service(s) defined with valid structure`,
      { services: serviceNames }
    );
  }
}

export class ServiceEndpointsCheck extends BaseCheck {
  readonly id = 'service-endpoints';
  readonly name = 'Service Endpoints';
  readonly description = 'Checks if REST service endpoints are reachable';
  override readonly dependencies = ['schema-validation']; // Changed from service-definitions so it runs even with warnings

  async run(context: CheckContext): Promise<CheckResult> {
    const profile = context.data.get('profile') as UcpDiscoveryProfile | undefined;
    const options = context.options;

    if (!options.checkEndpoints) {
      return this.skip('Endpoint checking disabled');
    }

    if (!profile?.ucp?.services) {
      return this.skip('No services found');
    }

    const endpoints: { service: string; endpoint: string; status: string }[] = [];
    const failures: { service: string; endpoint: string; error: string }[] = [];

    for (const [name, service] of Object.entries(profile.ucp.services)) {
      if (service.rest?.endpoint) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);

          const response = await fetch(service.rest.endpoint, {
            method: 'HEAD',
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            endpoints.push({
              service: name,
              endpoint: service.rest.endpoint,
              status: `HTTP ${response.status}`,
            });
          } else {
            failures.push({
              service: name,
              endpoint: service.rest.endpoint,
              error: `HTTP ${response.status}`,
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          failures.push({
            service: name,
            endpoint: service.rest.endpoint,
            error: errorMessage,
          });
        }
      }
    }

    if (failures.length > 0) {
      return this.fail(
        `${failures.length} endpoint(s) unreachable`,
        { failures, reachable: endpoints }
      );
    }

    if (endpoints.length === 0) {
      return this.skip('No REST endpoints to check');
    }

    return this.pass(
      `All ${endpoints.length} REST endpoint(s) are reachable`,
      { endpoints }
    );
  }
}

/**
 * Capability checks - names, extensions, completeness
 */

import { BaseCheck, type CheckContext } from './base';
import type { CheckResult } from '../types/index';
import type { UcpDiscoveryProfile, UcpCapability } from '../types/index';
import { CAPABILITY_NAME_REGEX } from '../schemas/index';

/**
 * Helper to collect all capabilities from both top-level and inline in services
 */
function getAllCapabilities(profile: UcpDiscoveryProfile): UcpCapability[] {
  const capabilities: UcpCapability[] = [];

  // Top-level capabilities
  if (profile.ucp.capabilities) {
    capabilities.push(...profile.ucp.capabilities);
  }

  // Inline capabilities in services
  if (profile.ucp.services) {
    for (const service of Object.values(profile.ucp.services)) {
      if (service.capabilities) {
        capabilities.push(...service.capabilities);
      }
    }
  }

  return capabilities;
}

export class CapabilityNamesCheck extends BaseCheck {
  readonly id = 'capability-names';
  readonly name = 'Capability Names';
  readonly description = 'Validates capability names follow reverse-domain pattern';
  override readonly dependencies = ['schema-validation'];

  async run(context: CheckContext): Promise<CheckResult> {
    const profile = context.data.get('profile') as UcpDiscoveryProfile | undefined;

    if (!profile) {
      return this.skip('No profile available');
    }

    const capabilities = getAllCapabilities(profile);

    if (capabilities.length === 0) {
      return this.skip('No capabilities found');
    }

    // Store for other checks
    context.data.set('allCapabilities', capabilities);

    const invalidNames: { name: string; reason: string }[] = [];

    for (const cap of capabilities) {
      if (!CAPABILITY_NAME_REGEX.test(cap.name)) {
        invalidNames.push({
          name: cap.name,
          reason: 'Does not match pattern ^[a-z][a-z0-9]*(\\.[a-z][a-z0-9_]*)+$',
        });
      }
    }

    if (invalidNames.length > 0) {
      return this.fail(
        `${invalidNames.length} capability name(s) don't follow reverse-domain pattern`,
        { invalidNames, total: capabilities.length }
      );
    }

    return this.pass(
      `All ${capabilities.length} capability names follow reverse-domain pattern`,
      { count: capabilities.length, names: capabilities.map(c => c.name) }
    );
  }
}

export class CapabilityExtensionsCheck extends BaseCheck {
  readonly id = 'capability-extensions';
  readonly name = 'Capability Extensions';
  readonly description = 'Validates extended capabilities reference existing parents';
  override readonly dependencies = ['capability-names'];

  async run(context: CheckContext): Promise<CheckResult> {
    const capabilities = context.data.get('allCapabilities') as UcpCapability[] | undefined;

    if (!capabilities || capabilities.length === 0) {
      return this.skip('No capabilities found');
    }

    const capabilityNames = new Set(capabilities.map(c => c.name));
    const extensions = capabilities.filter(c => c.extends);
    const invalidExtensions: { name: string; extends: string }[] = [];

    for (const cap of extensions) {
      if (cap.extends && !capabilityNames.has(cap.extends)) {
        invalidExtensions.push({
          name: cap.name,
          extends: cap.extends,
        });
      }
    }

    if (invalidExtensions.length > 0) {
      return this.fail(
        `${invalidExtensions.length} extension(s) reference non-existent parent capabilities`,
        { invalidExtensions }
      );
    }

    if (extensions.length === 0) {
      return this.pass('No capability extensions defined', { extensionCount: 0 });
    }

    return this.pass(
      `All ${extensions.length} extension(s) reference valid parent capabilities`,
      {
        extensionCount: extensions.length,
        extensions: extensions.map(e => ({ name: e.name, extends: e.extends })),
      }
    );
  }
}

export class CapabilityCompletenessCheck extends BaseCheck {
  readonly id = 'capability-completeness';
  readonly name = 'Capability Completeness';
  readonly description = 'Checks if capabilities have recommended fields (name, version, spec, schema)';
  override readonly dependencies = ['schema-validation'];

  async run(context: CheckContext): Promise<CheckResult> {
    const profile = context.data.get('profile') as UcpDiscoveryProfile | undefined;

    if (!profile) {
      return this.skip('No profile available');
    }

    const capabilities = getAllCapabilities(profile);

    if (capabilities.length === 0) {
      return this.skip('No capabilities found');
    }

    // Only name is truly required, others are recommended
    const requiredFields = ['name'];
    const recommendedFields = ['version', 'spec', 'schema'];

    const missingRequired: { name: string; missing: string[] }[] = [];
    const missingRecommended: { name: string; missing: string[] }[] = [];

    for (const cap of capabilities) {
      const capObj = cap as unknown as Record<string, unknown>;
      const missingReq = requiredFields.filter(field => !capObj[field]);
      const missingRec = recommendedFields.filter(field => !capObj[field]);

      if (missingReq.length > 0) {
        missingRequired.push({ name: cap.name || 'unknown', missing: missingReq });
      }
      if (missingRec.length > 0) {
        missingRecommended.push({ name: cap.name || 'unknown', missing: missingRec });
      }
    }

    if (missingRequired.length > 0) {
      return this.fail(
        `${missingRequired.length} capability/capabilities missing required fields`,
        { missingRequired }
      );
    }

    if (missingRecommended.length > 0) {
      return this.warn(
        `${missingRecommended.length} capability/capabilities missing recommended fields (spec, schema)`,
        { missingRecommended, note: 'Consider adding spec and schema URLs for full UCP compliance' }
      );
    }

    return this.pass(
      `All ${capabilities.length} capabilities have required and recommended fields`,
      { count: capabilities.length }
    );
  }
}

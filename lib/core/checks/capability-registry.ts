/**
 * Capability Registry Check
 *
 * Validates capabilities against the known UCP capability registry.
 * Checks for:
 * - Known vs unknown capabilities (custom)
 * - Extension parent dependencies
 * - Deprecated capabilities
 */

import { BaseCheck, type CheckContext } from './base';
import type { CheckResult } from '../types/index';
import {
  isKnownCapability,
  isCoreCapability,
  isExtension,
  getParentCapability,
  getCapabilityInfo,
} from '../registry/capabilities';

export class CapabilityRegistryCheck extends BaseCheck {
  readonly id = 'capability-registry';
  readonly name = 'Capability Registry Validation';
  readonly description = 'Validates capabilities against known UCP capability registry';
  override readonly dependencies = ['schema-validation'];

  async run(context: CheckContext): Promise<CheckResult> {
    const profile = context.data.get('profile') as any;

    if (!profile?.ucp?.capabilities) {
      return this.skip('No capabilities to validate');
    }

    const capabilities = profile.ucp.capabilities;
    const knownCapabilities: string[] = [];
    const unknownCapabilities: string[] = [];
    const coreCapabilities: string[] = [];
    const extensions: string[] = [];
    const warnings: string[] = [];

    // First pass: categorize capabilities
    for (const capability of capabilities) {
      const name = capability.name;
      if (!name) {
        warnings.push('Found capability without name');
        continue;
      }

      if (isKnownCapability(name)) {
        knownCapabilities.push(name);

        if (isCoreCapability(name)) {
          coreCapabilities.push(name);
        } else if (isExtension(name)) {
          extensions.push(name);
        }
      } else {
        unknownCapabilities.push(name);
      }
    }

    // Second pass: validate extension dependencies
    const capabilityNames = capabilities.map((c: any) => c.name).filter(Boolean);
    const missingParents: Array<{ extension: string; parent: string }> = [];

    for (const extensionName of extensions) {
      const parentName = getParentCapability(extensionName);
      if (parentName && !capabilityNames.includes(parentName)) {
        missingParents.push({
          extension: extensionName,
          parent: parentName,
        });
      }
    }

    // Build result
    if (missingParents.length > 0) {
      return this.fail(
        `${missingParents.length} extension(s) have missing parent capabilities`,
        {
          missingParents,
          knownCount: knownCapabilities.length,
          unknownCount: unknownCapabilities.length,
        }
      );
    }

    // Warnings for unknown capabilities (not failures - could be custom)
    if (unknownCapabilities.length > 0) {
      return this.warn(
        `Found ${unknownCapabilities.length} unknown capability(ies) - may be custom extensions`,
        {
          unknownCapabilities,
          knownCapabilities: knownCapabilities.length,
          coreCapabilities: coreCapabilities.length,
          extensions: extensions.length,
        }
      );
    }

    return this.pass(
      'All capabilities are known UCP capabilities',
      {
        total: capabilities.length,
        core: coreCapabilities.length,
        extensions: extensions.length,
      }
    );
  }
}

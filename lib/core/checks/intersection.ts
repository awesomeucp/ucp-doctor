/**
 * Capability Intersection Algorithm Check
 *
 * Simulates UCP capability negotiation by testing intersection algorithm.
 * Per UCP spec: Extensions without parent capabilities should be pruned during negotiation.
 */

import { BaseCheck, type CheckContext } from './base';
import type { CheckResult } from '../types/index';

interface Capability {
  name: string;
  extends?: string;
}

/**
 * Simulates capability intersection algorithm
 * Returns capabilities that would remain after intersection with platform
 */
function simulateIntersection(
  businessCapabilities: Capability[],
  platformCapabilities: string[]
): {
  intersection: string[];
  pruned: Array<{ name: string; reason: string }>;
} {
  const platformSet = new Set(platformCapabilities);
  const intersection = new Set<string>();
  const pruned: Array<{ name: string; reason: string }> = [];

  // First pass: Add capabilities that exist in both profiles
  for (const capability of businessCapabilities) {
    if (platformSet.has(capability.name)) {
      intersection.add(capability.name);
    }
  }

  // Second pass: Prune extensions whose parents aren't in intersection
  let changed = true;
  while (changed) {
    changed = false;
    const toRemove: string[] = [];

    for (const capability of businessCapabilities) {
      if (intersection.has(capability.name) && capability.extends) {
        // This is an extension in the intersection
        if (!intersection.has(capability.extends)) {
          // Parent not in intersection - prune this extension
          toRemove.push(capability.name);
          changed = true;
        }
      }
    }

    for (const name of toRemove) {
      intersection.delete(name);
      const cap = businessCapabilities.find(c => c.name === name);
      pruned.push({
        name,
        reason: `Parent capability "${cap?.extends}" not in intersection`
      });
    }
  }

  return {
    intersection: Array.from(intersection),
    pruned
  };
}

export class IntersectionCheck extends BaseCheck {
  readonly id = 'intersection';
  readonly name = 'Capability Intersection Algorithm';
  readonly description = 'Simulates capability negotiation with mock platform profile';
  override readonly dependencies = ['schema-validation'];

  async run(context: CheckContext): Promise<CheckResult> {
    const profile = context.data.get('profile') as any;

    if (!profile?.ucp?.capabilities || profile.ucp.capabilities.length === 0) {
      return this.skip('No capabilities to test intersection');
    }

    const businessCapabilities: Capability[] = profile.ucp.capabilities.map((c: any) => ({
      name: c.name,
      extends: c.extends
    }));

    // Create mock platform profile with common capabilities
    // (In real implementation, platform would provide their profile)
    const mockPlatformCapabilities = [
      'dev.ucp.shopping.checkout',
      'dev.ucp.common.identity_linking',
      // Note: intentionally omitting some extensions to test pruning
    ];

    // Simulate intersection
    const result = simulateIntersection(businessCapabilities, mockPlatformCapabilities);

    // Check for potential issues
    const extensions = businessCapabilities.filter(c => c.extends);
    const orphanedExtensions = extensions.filter(ext => {
      const parent = ext.extends;
      return parent && !businessCapabilities.some(c => c.name === parent);
    });

    if (orphanedExtensions.length > 0) {
      return this.fail(
        `${orphanedExtensions.length} extension(s) reference non-existent parent capabilities`,
        {
          orphanedExtensions: orphanedExtensions.map(e => ({
            extension: e.name,
            missingParent: e.extends
          })),
          note: 'Extensions must have their parent capabilities defined in the same profile'
        }
      );
    }

    if (result.pruned.length > 0) {
      return this.pass(
        `Intersection algorithm works correctly (${result.pruned.length} extension(s) would be pruned)`,
        {
          totalCapabilities: businessCapabilities.length,
          afterIntersection: result.intersection.length,
          pruned: result.pruned,
          note: 'Pruned extensions are expected when platform lacks parent capabilities'
        }
      );
    }

    return this.pass(
      'Intersection algorithm validated (all capabilities have parents)',
      {
        totalCapabilities: businessCapabilities.length,
        extensions: extensions.length,
        coreCapabilities: businessCapabilities.length - extensions.length
      }
    );
  }
}

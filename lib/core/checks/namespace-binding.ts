/**
 * Namespace-to-Origin Binding Check
 *
 * Per UCP specification: "The spec and schema URLs MUST match the namespace authority origin"
 * This check validates that capability spec/schema URLs match their namespace authority.
 */

import { BaseCheck, type CheckContext } from './base';
import type { CheckResult } from '../types/index';
import { validateNamespaceBinding, extractNamespace, getExpectedOrigin } from '../registry/capabilities';

export class NamespaceBindingCheck extends BaseCheck {
  readonly id = 'namespace-binding';
  readonly name = 'Namespace-to-Origin Binding';
  readonly description = 'Validates that capability spec/schema URLs match namespace authority origin';
  override readonly dependencies = ['schema-validation'];

  async run(context: CheckContext): Promise<CheckResult> {
    const profile = context.data.get('profile') as any;

    if (!profile?.ucp?.capabilities) {
      return this.skip('No capabilities to validate');
    }

    const violations: Array<{
      capability: string;
      issue: string;
    }> = [];

    for (const capability of profile.ucp.capabilities) {
      const name = capability.name;
      if (!name) continue;

      const result = validateNamespaceBinding(
        name,
        capability.spec,
        capability.schema
      );

      if (!result.valid) {
        violations.push({
          capability: name,
          issue: result.reason || 'Unknown validation error',
        });
      }
    }

    if (violations.length > 0) {
      return this.fail(
        `${violations.length} capability(ies) violate namespace-to-origin binding`,
        { violations }
      );
    }

    return this.pass(
      'All capabilities follow namespace-to-origin binding rules',
      {
        capabilitiesChecked: profile.ucp.capabilities.length,
      }
    );
  }
}

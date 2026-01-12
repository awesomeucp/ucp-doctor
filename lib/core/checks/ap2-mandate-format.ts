/**
 * AP2 mandate format validation check
 * Validates AP2 capability configuration and requirements
 */

import { BaseCheck, type CheckContext } from './base';
import type { CheckResult } from '../types/index';
import type { UcpDiscoveryProfile } from '../types/index';
import { DiagnosticCode, DiagnosticMessages } from '../types/diagnostic-codes';

export class AP2MandateFormatCheck extends BaseCheck {
  readonly id = 'ap2-mandate-format';
  readonly name = 'AP2 Mandate Format';
  readonly description = 'Validates AP2 capability configuration';
  override readonly dependencies = ['capability-names'];

  async run(context: CheckContext): Promise<CheckResult> {
    const profile = context.data.get('profile') as
      | UcpDiscoveryProfile
      | undefined;

    if (!profile?.ucp?.capabilities) {
      return this.skip('No capabilities defined');
    }

    // Check if AP2 capability is present
    const ap2Capability = profile.ucp.capabilities.find(
      (cap) => cap.name === 'dev.ucp.shopping.ap2_mandates'
    );

    if (!ap2Capability) {
      return this.skip('AP2 capability not present');
    }

    const issues: string[] = [];

    // Validate that AP2 extends checkout
    if (ap2Capability.extends !== 'dev.ucp.shopping.checkout') {
      issues.push(
        'AP2 capability must extend dev.ucp.shopping.checkout'
      );
    }

    // Validate config has vp_formats_supported
    if (ap2Capability.config) {
      const config = ap2Capability.config as Record<string, unknown>;
      if (!config.vp_formats_supported) {
        issues.push('AP2 config missing vp_formats_supported field');
      }
    }

    // AP2 requires signing keys for platform signatures
    if (!profile.signing_keys || profile.signing_keys.length === 0) {
      issues.push(
        'AP2 capability requires signing_keys for verifiable credentials'
      );
    }

    if (issues.length > 0) {
      return this.fail(
        `${issues.length} issue(s) found in AP2 configuration`,
        {
          code: DiagnosticCode.AP2_MANDATE_INVALID_FORMAT,
          issues,
          capability: ap2Capability.name,
          documentation:
            'https://github.com/Universal-Commerce-Protocol/ucp/blob/main/docs/specification/ap2-mandates.md',
        }
      );
    }

    // Store AP2 capability in context for downstream checks
    context.data.set('ap2Capability', ap2Capability);

    return this.pass('AP2 capability is properly configured', {
      capability: ap2Capability.name,
      version: ap2Capability.version,
      extends: ap2Capability.extends,
      config: ap2Capability.config,
    });
  }
}

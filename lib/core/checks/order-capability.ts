/**
 * Order capability validation check
 * Validates that Order capability has required signing keys for webhook signatures
 */

import { BaseCheck, type CheckContext } from './base';
import type { CheckResult } from '../types/index';
import type { UcpDiscoveryProfile } from '../types/index';
import { DiagnosticCode, DiagnosticMessages } from '../types/diagnostic-codes';

export class OrderCapabilityCheck extends BaseCheck {
  readonly id = 'order-capability';
  readonly name = 'Order Capability';
  readonly description =
    'Validates Order capability signing keys requirement';
  override readonly dependencies = ['capability-names', 'signing-keys'];

  async run(context: CheckContext): Promise<CheckResult> {
    const profile = context.data.get('profile') as
      | UcpDiscoveryProfile
      | undefined;

    if (!profile?.ucp?.capabilities) {
      return this.skip('No capabilities defined');
    }

    // Check if Order capability is present
    const orderCapability = profile.ucp.capabilities.find(
      (cap) => cap.name === 'dev.ucp.shopping.order'
    );

    if (!orderCapability) {
      return this.skip('Order capability not present');
    }

    // Order capability requires signing keys per spec (order.md:290-320)
    if (!profile.signing_keys || profile.signing_keys.length === 0) {
      return this.fail(
        DiagnosticMessages[DiagnosticCode.UCP_ORDER_MISSING_SIGNING_KEYS],
        {
          code: DiagnosticCode.UCP_ORDER_MISSING_SIGNING_KEYS,
          capability: orderCapability.name,
          version: orderCapability.version,
          fix: 'Add signing_keys array to your UCP profile with at least one ES256/ES384/ES512 key',
          documentation:
            'https://github.com/Universal-Commerce-Protocol/ucp/blob/main/docs/specification/order.md',
        }
      );
    }

    // Validate that at least one key supports webhook signing (ES256/ES384/ES512)
    const supportedKeys = profile.signing_keys.filter((key) => {
      if (key.kty !== 'EC') return false;
      if (!key.alg) return true; // No alg specified, assume it could work
      return ['ES256', 'ES384', 'ES512'].includes(key.alg);
    });

    if (supportedKeys.length === 0) {
      return this.fail(
        'No signing keys support recommended algorithms for Order capability',
        {
          code: 'ORDER_NO_SUPPORTED_KEYS',
          capability: orderCapability.name,
          note: 'Order webhooks require EC keys with ES256, ES384, or ES512 algorithms',
          availableKeys: profile.signing_keys.map((k) => ({
            kid: k.kid,
            kty: k.kty,
            alg: k.alg,
          })),
        }
      );
    }

    return this.pass(
      `Order capability has ${supportedKeys.length} signing key(s) for webhook signatures`,
      {
        capability: orderCapability.name,
        version: orderCapability.version,
        supportedKeys: supportedKeys.map((k) => ({
          kid: k.kid,
          kty: k.kty,
          alg: k.alg,
        })),
      }
    );
  }
}

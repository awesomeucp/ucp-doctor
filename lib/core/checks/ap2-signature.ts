/**
 * AP2 signature validation check
 * Validates business capability to sign AP2 merchant authorizations
 */

import { BaseCheck, type CheckContext } from './base';
import type { CheckResult } from '../types/index';
import type { UcpDiscoveryProfile } from '../types/index';
import { DiagnosticCode, DiagnosticMessages } from '../types/diagnostic-codes';
import { validateECKey, isAP2SupportedAlgorithm } from '../utils/crypto';

export class AP2SignatureCheck extends BaseCheck {
  readonly id = 'ap2-signature';
  readonly name = 'AP2 Signature';
  readonly description =
    'Validates business capability to sign AP2 merchant authorizations';
  override readonly dependencies = ['ap2-mandate-format', 'signing-keys'];

  async run(context: CheckContext): Promise<CheckResult> {
    const profile = context.data.get('profile') as
      | UcpDiscoveryProfile
      | undefined;
    const ap2Capability = context.data.get('ap2Capability');

    if (!ap2Capability) {
      return this.skip('AP2 capability not present');
    }

    if (!profile?.signing_keys || profile.signing_keys.length === 0) {
      return this.fail(
        'AP2 requires signing keys for merchant_authorization',
        {
          code: DiagnosticCode.AP2_SIGNATURE_MISSING_KID,
          note: 'Business must sign merchant_authorization using JWS with EC keys',
        }
      );
    }

    const issues: { kid: string; issue: string }[] = [];
    const validKeys: { kid: string; kty: string; alg?: string }[] = [];

    // Validate that at least one signing key supports AP2 (ES256/ES384/ES512)
    for (const key of profile.signing_keys) {
      const kid = key.kid || 'unknown';

      // AP2 requires EC keys
      if (key.kty !== 'EC') {
        issues.push({
          kid,
          issue: `AP2 requires EC keys, found ${key.kty}`,
        });
        continue;
      }

      // Validate EC key structure
      if (!validateECKey(key)) {
        issues.push({
          kid,
          issue: 'EC key missing required fields (crv, x, y)',
        });
        continue;
      }

      // Validate algorithm if specified
      if (key.alg && !isAP2SupportedAlgorithm(key.alg)) {
        issues.push({
          kid,
          issue: `Algorithm ${key.alg} not supported for AP2 (use ES256, ES384, or ES512)`,
        });
        continue;
      }

      // Key is valid for AP2
      validKeys.push({ kid, kty: key.kty, alg: key.alg });
    }

    if (validKeys.length === 0) {
      return this.fail(
        DiagnosticMessages[DiagnosticCode.AP2_SIGNATURE_UNSUPPORTED_ALG],
        {
          code: DiagnosticCode.AP2_SIGNATURE_UNSUPPORTED_ALG,
          issues,
          note: 'At least one EC key with ES256/ES384/ES512 algorithm is required for AP2 merchant_authorization signatures',
          documentation:
            'https://github.com/Universal-Commerce-Protocol/ucp/blob/main/docs/specification/ap2-mandates.md',
        }
      );
    }

    const result = {
      validKeys,
      totalKeys: profile.signing_keys.length,
    };

    if (issues.length > 0) {
      return this.warn(
        `${validKeys.length} valid key(s), ${issues.length} issue(s) found`,
        { ...result, issues }
      );
    }

    return this.pass(
      `${validKeys.length} signing key(s) support AP2 merchant_authorization`,
      result
    );
  }
}

/**
 * Signing keys validation check
 */

import { BaseCheck, type CheckContext } from './base';
import type { CheckResult } from '../types/index';
import type { UcpDiscoveryProfile } from '../types/index';
import { DiagnosticCode } from '../types/diagnostic-codes';

export class SigningKeysCheck extends BaseCheck {
  readonly id = 'signing-keys';
  readonly name = 'Signing Keys';
  readonly description = 'Validates JWK signing key format';
  override readonly dependencies = ['schema-validation'];

  async run(context: CheckContext): Promise<CheckResult> {
    const profile = context.data.get('profile') as UcpDiscoveryProfile | undefined;

    if (!profile?.signing_keys) {
      return this.skip('No signing keys defined (optional)');
    }

    const keys = profile.signing_keys;

    if (keys.length === 0) {
      return this.skip('Signing keys array is empty');
    }

    const issues: { kid: string; issue: string }[] = [];

    for (const key of keys) {
      if (!key.kid) {
        issues.push({ kid: 'unknown', issue: 'Missing kid (key ID)' });
        continue;
      }

      if (!key.kty) {
        issues.push({ kid: key.kid, issue: 'Missing kty (key type)' });
        continue;
      }

      // Validate EC keys
      if (key.kty === 'EC') {
        if (!key.crv) {
          issues.push({ kid: key.kid, issue: 'EC key missing crv (curve)' });
        }
        if (!key.x) {
          issues.push({ kid: key.kid, issue: 'EC key missing x coordinate' });
        }
        if (!key.y) {
          issues.push({ kid: key.kid, issue: 'EC key missing y coordinate' });
        }
      }

      // Validate RSA keys
      if (key.kty === 'RSA') {
        if (!key.n) {
          issues.push({ kid: key.kid, issue: 'RSA key missing n (modulus)' });
        }
        if (!key.e) {
          issues.push({ kid: key.kid, issue: 'RSA key missing e (exponent)' });
        }
      }
    }

    if (issues.length > 0) {
      return this.fail(
        `${issues.length} issue(s) found in signing keys`,
        { issues }
      );
    }

    // Validate algorithms for AP2/Order capability support
    const unsupportedAlgs: { kid: string; alg?: string }[] = [];

    for (const key of keys) {
      if (key.alg && !['ES256', 'ES384', 'ES512', 'RS256'].includes(key.alg)) {
        unsupportedAlgs.push({ kid: key.kid, alg: key.alg });
      }
    }

    const keySummary = keys.map((k) => ({
      kid: k.kid,
      kty: k.kty,
      alg: k.alg,
      use: k.use,
    }));

    if (unsupportedAlgs.length > 0) {
      return this.warn(
        `${unsupportedAlgs.length} signing key(s) use non-recommended algorithms`,
        {
          code: DiagnosticCode.SIGNING_KEY_UNSUPPORTED_ALG,
          keys: keySummary,
          unsupportedAlgs,
          note: 'UCP recommends ES256, ES384, or ES512 for AP2 and webhook signatures',
        }
      );
    }

    return this.pass(`All ${keys.length} signing key(s) are valid`, {
      keys: keySummary,
    });
  }
}

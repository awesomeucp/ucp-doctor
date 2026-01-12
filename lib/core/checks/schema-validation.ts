/**
 * Schema validation check - validates against UCP discovery schema
 */

import { BaseCheck, type CheckContext } from './base';
import type { CheckResult } from '../types/index';
import { UcpDiscoveryProfileSchema } from '../schemas/index';

export class SchemaValidationCheck extends BaseCheck {
  readonly id = 'schema-validation';
  readonly name = 'Schema Validation';
  readonly description = 'Validates the response matches the UCP discovery profile schema';
  override readonly dependencies = ['json-format'];

  async run(context: CheckContext): Promise<CheckResult> {
    const parsedJson = context.data.get('parsedJson') as unknown;

    if (!parsedJson) {
      return this.skip('No parsed JSON available');
    }

    const result = UcpDiscoveryProfileSchema.safeParse(parsedJson);

    if (!result.success) {
      const errors = result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }));

      return this.fail(
        `Schema validation failed with ${errors.length} error(s)`,
        { errors }
      );
    }

    context.data.set('profile', result.data);

    // Safely count services and capabilities
    const servicesCount = result.data.ucp.services
      ? Object.keys(result.data.ucp.services).length
      : 0;

    let capabilitiesCount = result.data.ucp.capabilities?.length || 0;

    // Also count inline capabilities in services
    if (result.data.ucp.services) {
      for (const service of Object.values(result.data.ucp.services)) {
        if ((service as any).capabilities) {
          capabilitiesCount += (service as any).capabilities.length;
        }
      }
    }

    return this.pass(
      'Response matches UCP discovery profile schema',
      {
        version: result.data.ucp.version,
        servicesCount,
        capabilitiesCount,
        hasPayment: !!result.data.payment,
        hasSigningKeys: !!result.data.signing_keys,
      }
    );
  }
}

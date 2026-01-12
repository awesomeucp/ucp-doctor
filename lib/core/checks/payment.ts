/**
 * Payment handler validation check
 */

import { BaseCheck, type CheckContext } from './base';
import type { CheckResult } from '../types/index';
import type { UcpDiscoveryProfile } from '../types/index';

// Reverse-domain pattern for handler names (e.g., com.google.pay, dev.ucp.delegate_payment)
const HANDLER_NAME_REGEX = /^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9_]*)+$/;

export class PaymentHandlersCheck extends BaseCheck {
  readonly id = 'payment-handlers';
  readonly name = 'Payment Handlers';
  readonly description = 'Validates payment handler definitions';
  override readonly dependencies = ['schema-validation'];

  async run(context: CheckContext): Promise<CheckResult> {
    const profile = context.data.get('profile') as UcpDiscoveryProfile | undefined;

    if (!profile?.payment?.handlers) {
      return this.skip('No payment handlers defined (optional)');
    }

    const handlers = profile.payment.handlers;

    if (handlers.length === 0) {
      return this.skip('Payment handlers array is empty');
    }

    // In strict mode, require all fields for full UCP compliance
    const requiredFields = ['id', 'name', 'version', 'spec'];
    // These are strongly recommended
    const recommendedFields = ['config_schema', 'instrument_schemas', 'config'];

    const errors: { handler: string; missing: string[] }[] = [];
    const warnings: { handler: string; missing: string[]; issues?: string[] }[] = [];
    const invalidNames: { handler: string; name: string }[] = [];
    const handlerIds = new Set<string>();
    const duplicateIds: string[] = [];

    for (const handler of handlers) {
      // Check for duplicate handler IDs
      if (handler.id) {
        if (handlerIds.has(handler.id)) {
          duplicateIds.push(handler.id);
        }
        handlerIds.add(handler.id);
      }
      const handlerObj = handler as unknown as Record<string, unknown>;
      const handlerName = handler.id || handler.name || 'unknown';

      const missingRequired = requiredFields.filter(field => {
        const value = handlerObj[field];
        return value === undefined || value === null || value === '';
      });

      const missingRecommended = recommendedFields.filter(field => {
        const value = handlerObj[field];
        return value === undefined || value === null || value === '';
      });

      // Validate handler name format (should be reverse-domain like com.google.pay)
      if (handler.name && !HANDLER_NAME_REGEX.test(handler.name)) {
        invalidNames.push({ handler: handlerName, name: handler.name });
      }

      if (missingRequired.length > 0) {
        errors.push({ handler: handlerName, missing: missingRequired });
      }

      if (missingRecommended.length > 0) {
        warnings.push({ handler: handlerName, missing: missingRecommended });
      }
    }

    // Check for errors (missing required fields, duplicates, invalid names)
    if (errors.length > 0 || duplicateIds.length > 0 || invalidNames.length > 0) {
      const issues: string[] = [];
      if (errors.length > 0) issues.push(`${errors.length} missing required fields`);
      if (duplicateIds.length > 0) issues.push(`${duplicateIds.length} duplicate handler IDs`);
      if (invalidNames.length > 0) issues.push(`${invalidNames.length} invalid name format`);

      return this.fail(
        `Payment handler validation failed: ${issues.join(', ')}`,
        {
          errors: errors.length > 0 ? errors : undefined,
          duplicateIds: duplicateIds.length > 0 ? duplicateIds : undefined,
          invalidNames: invalidNames.length > 0 ? invalidNames : undefined,
          warnings: warnings.length > 0 ? warnings : undefined
        }
      );
    }

    const handlerSummary = handlers.map(h => ({
      id: h.id,
      name: h.name,
      version: h.version,
      type: (h as any).type,
    }));

    // Warnings for missing recommended fields
    if (warnings.length > 0) {
      return this.warn(
        `${handlers.length} payment handler(s) defined, ${warnings.length} missing recommended fields`,
        {
          handlers: handlerSummary,
          warnings,
          note: 'Consider adding config_schema, instrument_schemas, and config for complete handler definitions'
        }
      );
    }

    return this.pass(
      `All ${handlers.length} payment handler(s) are valid`,
      { handlers: handlerSummary }
    );
  }
}

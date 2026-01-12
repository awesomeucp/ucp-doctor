/**
 * Version checks - format and recency validation
 */

import { BaseCheck, type CheckContext } from './base';
import type { CheckResult } from '../types/index';
import { isKnownVersion, isDeprecated, getDeprecationReason, LATEST_UCP_VERSION } from '../registry/versions';
import type { UcpDiscoveryProfile } from '../types/index';
import { VERSION_REGEX } from '../schemas/index';

export class VersionFormatCheck extends BaseCheck {
  readonly id = 'version-format';
  readonly name = 'Version Format';
  readonly description = 'Validates UCP version is in YYYY-MM-DD format';
  override readonly dependencies = ['schema-validation'];

  async run(context: CheckContext): Promise<CheckResult> {
    const profile = context.data.get('profile') as UcpDiscoveryProfile | undefined;

    if (!profile?.ucp?.version) {
      return this.skip('No version field found');
    }

    const version = profile.ucp.version;

    if (!VERSION_REGEX.test(version)) {
      return this.fail(
        `Version "${version}" is not in YYYY-MM-DD format`,
        { version, expected: 'YYYY-MM-DD' }
      );
    }

    const parts = version.split('-').map(Number);
    const year = parts[0]!;
    const month = parts[1]!;
    const day = parts[2]!;
    const date = new Date(year, month - 1, day);

    if (isNaN(date.getTime())) {
      return this.fail(
        `Version "${version}" is not a valid date`,
        { version }
      );
    }

    context.data.set('versionDate', date);

    return this.pass(
      `Version "${version}" is valid YYYY-MM-DD format`,
      { version, parsed: { year, month, day } }
    );
  }
}

export class VersionRecencyCheck extends BaseCheck {
  readonly id = 'version-recency';
  readonly name = 'Version Recency';
  readonly description = 'Checks if the UCP version is recent';
  override readonly dependencies = ['version-format'];

  async run(context: CheckContext): Promise<CheckResult> {
    const profile = context.data.get('profile') as UcpDiscoveryProfile | undefined;
    const versionDate = context.data.get('versionDate') as Date | undefined;

    if (!profile?.ucp?.version || !versionDate) {
      return this.skip('No valid version date available');
    }

    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - versionDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff > 365) {
      return this.warn(
        `Version "${profile.ucp.version}" is ${daysDiff} days old. Consider updating.`,
        { version: profile.ucp.version, daysOld: daysDiff }
      );
    }

    return this.pass(
      `Version "${profile.ucp.version}" is current (${daysDiff} days old)`,
      { version: profile.ucp.version, daysOld: daysDiff }
    );
  }
}

export class VersionRegistryCheck extends BaseCheck {
  readonly id = 'version-registry';
  readonly name = 'Version Registry Validation';
  readonly description = 'Validates version against known UCP specification versions';
  override readonly dependencies = ['version-format'];

  async run(context: CheckContext): Promise<CheckResult> {
    const profile = context.data.get('profile') as UcpDiscoveryProfile | undefined;

    if (!profile?.ucp?.version) {
      return this.skip('No version field found');
    }

    const version = profile.ucp.version;

    // Check if version is known
    if (!isKnownVersion(version)) {
      return this.warn(
        `Version "${version}" is not a published UCP specification version`,
        {
          version,
          latestKnownVersion: LATEST_UCP_VERSION,
          note: 'This may be a pre-release or draft version'
        }
      );
    }

    // Check if version is deprecated
    if (isDeprecated(version)) {
      const reason = getDeprecationReason(version);
      return this.warn(
        `Version "${version}" is deprecated`,
        {
          version,
          deprecationReason: reason,
          latestVersion: LATEST_UCP_VERSION
        }
      );
    }

    return this.pass(
      `Version "${version}" is a known UCP specification version`,
      { version, latestVersion: LATEST_UCP_VERSION }
    );
  }
}

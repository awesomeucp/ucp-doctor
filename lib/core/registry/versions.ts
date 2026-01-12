/**
 * Registry of known UCP specification versions
 *
 * These are official published versions of the Universal Commerce Protocol.
 * Profiles should reference a valid version from this registry.
 */

export interface UcpVersionInfo {
  version: string;
  releaseDate: Date;
  deprecated?: boolean;
  deprecationReason?: string;
  specUrl: string;
}

/**
 * Known UCP specification versions (most recent first)
 */
export const KNOWN_UCP_VERSIONS: UcpVersionInfo[] = [
  {
    version: '2026-01-11',
    releaseDate: new Date('2026-01-11'),
    specUrl: 'https://ucp.dev/docs/specification',
  },
  // Add more versions as they are published
];

/**
 * Latest UCP version
 */
export const LATEST_UCP_VERSION = KNOWN_UCP_VERSIONS[0].version;

/**
 * Check if a version string is a known UCP version
 */
export function isKnownVersion(version: string): boolean {
  return KNOWN_UCP_VERSIONS.some(v => v.version === version);
}

/**
 * Get version info if it exists
 */
export function getVersionInfo(version: string): UcpVersionInfo | undefined {
  return KNOWN_UCP_VERSIONS.find(v => v.version === version);
}

/**
 * Check if a version is deprecated
 */
export function isDeprecated(version: string): boolean {
  const info = getVersionInfo(version);
  return info?.deprecated ?? false;
}

/**
 * Get deprecation reason if version is deprecated
 */
export function getDeprecationReason(version: string): string | undefined {
  const info = getVersionInfo(version);
  return info?.deprecationReason;
}

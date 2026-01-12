/**
 * Schema exports for UCP Doctor
 *
 * Uses auto-generated strict schemas from official UCP specifications.
 * Legacy manual lenient schemas are deprecated.
 */

// Export generated strict schema for UCP Discovery Profile
import { ProfileSchemaSchema } from './generated/discovery/profile_schema';

// Use strict schema by default (per user decision: strict only, no lenient mode)
export { ProfileSchemaSchema as UcpDiscoveryProfileSchema };

// Export all generated schemas
export * from './generated/index';

// Legacy exports from manual schemas (deprecated - for backwards compatibility only)
// Export VERSION_REGEX, CAPABILITY_NAME_REGEX and other utilities still used by checks
export { VERSION_REGEX, VersionSchema, CAPABILITY_NAME_REGEX, CapabilityNameSchema } from './discovery';

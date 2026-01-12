/**
 * Zod schemas for UCP Discovery Profile validation
 * Based on: ucp/source/discovery/profile_schema.json and npm-sdk/src/schemas/generated.ts
 *
 * Note: Schemas are lenient to support both strict spec and simplified implementations
 */

import { z } from 'zod';

// Version pattern: YYYY-MM-DD
export const VERSION_REGEX = /^\d{4}-\d{2}-\d{2}$/;
export const VersionSchema = z.string().regex(
  VERSION_REGEX,
  'Version must be in YYYY-MM-DD format'
);

// Lenient version that allows any string
export const VersionSchemaLenient = z.string();

// Capability name pattern: reverse-domain notation
export const CAPABILITY_NAME_REGEX = /^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9_]*)+$/;
export const CapabilityNameSchema = z.string().regex(
  CAPABILITY_NAME_REGEX,
  'Capability name must be in reverse-domain notation (e.g., dev.ucp.shopping.checkout)'
);

// REST binding schema (lenient - schema is optional for simplified implementations)
export const RestBindingSchema = z.object({
  schema: z.string().optional(),
  endpoint: z.string(),
});

// MCP binding schema
export const McpBindingSchema = z.object({
  schema: z.string().optional(),
  endpoint: z.string(),
});

// A2A binding schema
export const A2ABindingSchema = z.object({
  endpoint: z.string(),
});

// Embedded binding schema
export const EmbeddedBindingSchema = z.object({
  schema: z.string(),
});

// Capability schema (lenient - spec/schema are optional for simplified implementations)
export const CapabilityDiscoverySchema = z.object({
  name: z.string(),
  version: z.string().optional(),
  spec: z.string().optional(),
  schema: z.string().optional(),
  extends: z.string().optional(),
  config: z.record(z.unknown()).optional(),
});

// Service definition schema (lenient - spec optional, capabilities can be inline)
export const ServiceDefinitionSchema = z.object({
  version: z.string(),
  spec: z.string().optional(),
  rest: RestBindingSchema.optional(),
  mcp: McpBindingSchema.optional(),
  a2a: A2ABindingSchema.optional(),
  embedded: EmbeddedBindingSchema.optional(),
  // Support inline capabilities (some implementations put them here)
  capabilities: z.array(CapabilityDiscoverySchema).optional(),
});

// UCP core schema (lenient - top-level capabilities optional if inline in services)
export const UcpCoreSchema = z.object({
  version: z.string(),
  services: z.record(z.string(), ServiceDefinitionSchema).optional(),
  capabilities: z.array(CapabilityDiscoverySchema).optional(),
});

// Use enum for signing key usage
export const UseSchema = z.enum(['sig', 'enc']);

// Payment handler schema (lenient - many fields optional for simplified implementations)
export const PaymentHandlerSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string().optional(),
  version: z.string().optional(),
  spec: z.string().optional(),
  config_schema: z.string().optional(),
  instrument_schemas: z.array(z.string()).optional(),
  config: z.record(z.unknown()).optional(),
  // Allow extra fields for simplified implementations
  supported_tokens: z.array(z.string()).optional(),
  supported_networks: z.array(z.string()).optional(),
});

// Payment section schema
export const PaymentSchema = z.object({
  handlers: z.array(PaymentHandlerSchema).optional(),
});

// Signing key schema with type-specific validation
export const SigningKeySchema = z.object({
  kid: z.string().min(1, 'Key ID (kid) is required'),
  kty: z.string().min(1, 'Key type (kty) is required'),
  crv: z.string().optional(),
  x: z.string().optional(),
  y: z.string().optional(),
  n: z.string().optional(),
  e: z.string().optional(),
  use: UseSchema.optional(),
  alg: z.string().optional(),
}).refine(
  (key) => {
    if (key.kty === 'EC') {
      return key.crv && key.x && key.y;
    }
    if (key.kty === 'RSA') {
      return key.n && key.e;
    }
    return true;
  },
  {
    message: 'EC keys require crv, x, y; RSA keys require n, e',
  }
);

// Full discovery profile schema (lenient)
export const UcpDiscoveryProfileSchema = z.object({
  ucp: UcpCoreSchema,
  payment: PaymentSchema.optional(),
  signing_keys: z.array(SigningKeySchema).optional(),
});

export type UcpDiscoveryProfileValidated = z.infer<typeof UcpDiscoveryProfileSchema>;

/**
 * Registry of known UCP capabilities and extensions
 *
 * This registry contains all officially recognized UCP capabilities
 * as defined in the UCP specification.
 */

export interface CapabilityInfo {
  name: string;
  type: 'core' | 'extension';
  extends?: string; // For extensions only
  description: string;
  specUrl: string;
  schemaUrl: string;
  since: string; // Version when capability was introduced
}

/**
 * Known UCP core capabilities
 */
export const CORE_CAPABILITIES: CapabilityInfo[] = [
  {
    name: 'dev.ucp.shopping.checkout',
    type: 'core',
    description: 'Facilitates checkout sessions with cart management and tax calculation',
    specUrl: 'https://ucp.dev/docs/specification/checkout',
    schemaUrl: 'https://ucp.dev/schemas/shopping/checkout_resp.json',
    since: '2026-01-11',
  },
  {
    name: 'dev.ucp.common.identity_linking',
    type: 'core',
    description: 'OAuth 2.0-based authorization for platforms to act on user\'s behalf',
    specUrl: 'https://ucp.dev/docs/specification/identity-linking',
    schemaUrl: 'https://ucp.dev/schemas/common/identity_linking.json',
    since: '2026-01-11',
  },
  {
    name: 'dev.ucp.shopping.order',
    type: 'core',
    description: 'Webhook-based updates for order lifecycle events',
    specUrl: 'https://ucp.dev/docs/specification/order',
    schemaUrl: 'https://ucp.dev/schemas/shopping/order.json',
    since: '2026-01-11',
  },
];

/**
 * Known UCP extensions
 */
export const EXTENSIONS: CapabilityInfo[] = [
  {
    name: 'dev.ucp.shopping.fulfillment',
    type: 'extension',
    extends: 'dev.ucp.shopping.checkout',
    description: 'Adds fulfillment options, shipping destinations, and delivery methods to checkout',
    specUrl: 'https://ucp.dev/docs/specification/fulfillment',
    schemaUrl: 'https://ucp.dev/schemas/shopping/fulfillment_resp.json',
    since: '2026-01-11',
  },
  {
    name: 'dev.ucp.shopping.discount',
    type: 'extension',
    extends: 'dev.ucp.shopping.checkout',
    description: 'Adds discount code support with multiple codes and applied discounts',
    specUrl: 'https://ucp.dev/docs/specification/discount',
    schemaUrl: 'https://ucp.dev/schemas/shopping/discount_resp.json',
    since: '2026-01-11',
  },
  {
    name: 'dev.ucp.shopping.ap2_mandate',
    type: 'extension',
    extends: 'dev.ucp.shopping.checkout',
    description: 'Cryptographic proof of authorization for autonomous commerce',
    specUrl: 'https://ucp.dev/docs/specification/ap2-mandates',
    schemaUrl: 'https://ucp.dev/schemas/shopping/ap2_mandate.json',
    since: '2026-01-11',
  },
];

/**
 * All known capabilities (core + extensions)
 */
export const ALL_CAPABILITIES = [...CORE_CAPABILITIES, ...EXTENSIONS];

/**
 * Check if a capability name is known
 */
export function isKnownCapability(name: string): boolean {
  return ALL_CAPABILITIES.some(c => c.name === name);
}

/**
 * Get capability info by name
 */
export function getCapabilityInfo(name: string): CapabilityInfo | undefined {
  return ALL_CAPABILITIES.find(c => c.name === name);
}

/**
 * Check if a capability is a core capability
 */
export function isCoreCapability(name: string): boolean {
  return CORE_CAPABILITIES.some(c => c.name === name);
}

/**
 * Check if a capability is an extension
 */
export function isExtension(name: string): boolean {
  return EXTENSIONS.some(c => c.name === name);
}

/**
 * Get the parent capability of an extension
 */
export function getParentCapability(extensionName: string): string | undefined {
  const extension = EXTENSIONS.find(e => e.name === extensionName);
  return extension?.extends;
}

/**
 * Extract namespace from capability name (reverse-domain part)
 * Example: "dev.ucp.shopping.checkout" -> "dev.ucp"
 */
export function extractNamespace(capabilityName: string): string {
  const parts = capabilityName.split('.');
  // Take first 2-3 parts as namespace (e.g., "dev.ucp" or "com.example.custom")
  if (parts.length >= 3) {
    return parts.slice(0, 2).join('.');
  }
  return capabilityName;
}

/**
 * Get expected origin for namespace
 * Maps namespace to expected spec/schema URL origin
 */
export function getExpectedOrigin(namespace: string): string {
  // Known namespace mappings
  const namespaceOrigins: Record<string, string> = {
    'dev.ucp': 'https://ucp.dev',
    // Add more as needed
  };

  return namespaceOrigins[namespace] || `https://${namespace.split('.').reverse().join('.')}`;
}

/**
 * Validate that spec/schema URLs match namespace authority
 * Per UCP spec: "The spec and schema URLs MUST match the namespace authority origin"
 */
export function validateNamespaceBinding(
  capabilityName: string,
  specUrl?: string,
  schemaUrl?: string
): { valid: boolean; reason?: string } {
  const namespace = extractNamespace(capabilityName);
  const expectedOrigin = getExpectedOrigin(namespace);

  if (specUrl && !specUrl.startsWith(expectedOrigin)) {
    return {
      valid: false,
      reason: `Spec URL origin "${new URL(specUrl).origin}" does not match namespace "${namespace}" expected origin "${expectedOrigin}"`,
    };
  }

  if (schemaUrl && !schemaUrl.startsWith(expectedOrigin)) {
    return {
      valid: false,
      reason: `Schema URL origin "${new URL(schemaUrl).origin}" does not match namespace "${namespace}" expected origin "${expectedOrigin}"`,
    };
  }

  return { valid: true };
}

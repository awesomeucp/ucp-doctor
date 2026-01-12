export { BaseCheck, type CheckContext } from './base';
export { ConnectivityCheck } from './connectivity';
export { DiscoveryEndpointCheck } from './discovery';
export { JsonFormatCheck } from './json-format';
export { SchemaValidationCheck } from './schema-validation';
export { VersionFormatCheck, VersionRecencyCheck, VersionRegistryCheck } from './version';
export { CapabilityNamesCheck, CapabilityExtensionsCheck, CapabilityCompletenessCheck } from './capabilities';
export { NamespaceBindingCheck } from './namespace-binding';
export { CapabilityRegistryCheck } from './capability-registry';
export { IntersectionCheck } from './intersection';
export { ServiceDefinitionsCheck, ServiceEndpointsCheck } from './services';
export { PaymentHandlersCheck } from './payment';
export { SigningKeysCheck } from './signing-keys';
export { OrderCapabilityCheck } from './order-capability';
export { AP2MandateFormatCheck } from './ap2-mandate-format';
export { AP2SignatureCheck } from './ap2-signature';
export { SchemaUrlsCheck } from './schema-urls';
export { HttpsEnforcementCheck, EndpointFormatCheck } from './url-validation';

import { BaseCheck } from './base';
import { ConnectivityCheck } from './connectivity';
import { DiscoveryEndpointCheck } from './discovery';
import { JsonFormatCheck } from './json-format';
import { SchemaValidationCheck } from './schema-validation';
import { VersionFormatCheck, VersionRecencyCheck, VersionRegistryCheck } from './version';
import { CapabilityNamesCheck, CapabilityExtensionsCheck, CapabilityCompletenessCheck } from './capabilities';
import { ServiceDefinitionsCheck, ServiceEndpointsCheck } from './services';
import { PaymentHandlersCheck } from './payment';
import { SigningKeysCheck } from './signing-keys';
import { OrderCapabilityCheck } from './order-capability';
import { AP2MandateFormatCheck } from './ap2-mandate-format';
import { AP2SignatureCheck } from './ap2-signature';
import { SchemaUrlsCheck } from './schema-urls';
import { HttpsEnforcementCheck, EndpointFormatCheck } from './url-validation';

/**
 * All available checks in dependency order
 */
// Import new checks
import { NamespaceBindingCheck } from './namespace-binding';
import { CapabilityRegistryCheck } from './capability-registry';
import { IntersectionCheck } from './intersection';

export const ALL_CHECKS: BaseCheck[] = [
  new ConnectivityCheck(),
  new DiscoveryEndpointCheck(),
  new JsonFormatCheck(),
  new SchemaValidationCheck(),
  new VersionFormatCheck(),
  new VersionRecencyCheck(),
  new VersionRegistryCheck(), // NEW: Validate against version registry
  new HttpsEnforcementCheck(),
  new EndpointFormatCheck(),
  new CapabilityNamesCheck(),
  new CapabilityRegistryCheck(), // NEW: Validate against capability registry
  new NamespaceBindingCheck(), // NEW: Namespace-to-origin binding
  new CapabilityExtensionsCheck(),
  new IntersectionCheck(), // NEW: Capability intersection algorithm validation
  new CapabilityCompletenessCheck(),
  new ServiceDefinitionsCheck(),
  new ServiceEndpointsCheck(),
  new PaymentHandlersCheck(),
  new SigningKeysCheck(),
  new AP2MandateFormatCheck(), // NEW: AP2 capability configuration validation
  new OrderCapabilityCheck(), // NEW: Order capability signing keys requirement
  new AP2SignatureCheck(), // NEW: AP2 signature capability validation
  new SchemaUrlsCheck(),
];

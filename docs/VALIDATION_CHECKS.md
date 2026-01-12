# UCP Doctor Validation Checks

Comprehensive documentation for all 20 validation checks in UCP Doctor.

## Overview

UCP Doctor performs 20 validation checks organized into 7 categories. All checks are aligned with the official [UCP Specification (2026-01-11)](https://ucp.dev).

## Check Categories

- [Connectivity](#connectivity) (2 checks)
- [Structure](#structure) (2 checks)
- [Protocol](#protocol) (5 checks)
- [Capabilities](#capabilities) (6 checks)
- [Services](#services) (2 checks)
- [Payment](#payment) (1 check)
- [Security](#security) (2 checks)

---

## Connectivity

### 1. Connectivity Check
**ID**: `connectivity`
**Category**: `connectivity`
**Description**: Verifies that the target domain is reachable via HTTP.

**Pass Criteria**:
- Domain resolves and responds to HTTP requests
- HTTP status in 2xx or 3xx range

**Fail Scenarios**:
- Domain does not exist (DNS failure)
- Connection timeout
- Network error

**Example Output**:
```
✓ Domain is reachable (HTTP 200)
```

---

### 2. Discovery Endpoint Check
**ID**: `discovery-endpoint`
**Category**: `connectivity`
**Description**: Validates that the `/.well-known/ucp` discovery endpoint exists and returns a 200 status.

**Pass Criteria**:
- `/.well-known/ucp` endpoint returns HTTP 200
- Response contains valid JSON

**Fail Scenarios**:
- Endpoint returns 404 (not found)
- Endpoint returns non-2xx status
- Response is not JSON

**Example Output**:
```
✓ Discovery endpoint exists (HTTP 200)
```

---

## Structure

### 3. JSON Format Check
**ID**: `json-format`
**Category**: `structure`
**Description**: Ensures the discovery endpoint response is valid JSON.

**Pass Criteria**:
- Response can be parsed as JSON
- No syntax errors

**Fail Scenarios**:
- Response is not valid JSON
- Empty response
- Malformed JSON structure

**Example Output**:
```
✓ Response is valid JSON
```

---

### 4. Schema Validation Check
**ID**: `schema-validation`
**Category**: `structure`
**Description**: Validates that the response matches the UCP discovery profile schema.

**Pass Criteria**:
- Response validates against `ProfileSchemaSchema`
- All required fields present
- Field types match schema

**Fail Scenarios**:
- Missing required fields (e.g., `ucp.version`)
- Type mismatches (e.g., string instead of object)
- Invalid structure

**Example Output**:
```
✓ Response matches UCP discovery profile schema
```

---

## Protocol

### 5. Version Format Check
**ID**: `version-format`
**Category**: `protocol`
**Description**: Validates that the UCP version follows the `YYYY-MM-DD` date format.

**Pass Criteria**:
- Version matches regex: `/^\d{4}-\d{2}-\d{2}$/`
- Date components are valid (e.g., month 01-12)

**Fail Scenarios**:
- Invalid format (e.g., "1.0.0", "2026-1-11")
- Non-date values
- Missing version field

**Example Output**:
```
✓ Version "2026-01-11" is valid YYYY-MM-DD format
```

---

### 6. Version Registry Check
**ID**: `version-registry`
**Category**: `protocol`
**Description**: Validates that the version corresponds to a known published UCP specification.

**Pass Criteria**:
- Version exists in `KNOWN_UCP_VERSIONS` registry
- Version is an officially released specification

**Warning Scenarios**:
- Version is valid format but not in registry (custom/future version)

**Example Output**:
```
✓ Version "2026-01-11" is a known UCP specification version
```

**Warning Output**:
```
! Version "2026-02-01" is not a published UCP specification version
```

**Known Versions**:
- `2026-01-11` (Current specification)

---

### 7. Version Recency Check
**ID**: `version-recency`
**Category**: `protocol`
**Description**: Checks if the version is not outdated (within 1 year).

**Pass Criteria**:
- Version date is within the last 365 days

**Warning Scenarios**:
- Version is older than 1 year
- Suggests updating to latest specification

**Example Output**:
```
✓ Version is recent (within 1 year)
```

**Warning Output**:
```
! Version "2024-01-11" is outdated (365+ days old)
  Consider updating to 2026-01-11
```

---

### 8. HTTPS Enforcement Check
**ID**: `https-enforcement`
**Category**: `protocol`
**Description**: Validates proper HTTPS usage for security.

**Pass Criteria**:
- Primary endpoint uses HTTPS
- No mixed content (HTTP resources in HTTPS context)

**Fail Scenarios**:
- HTTP used for sensitive operations
- Downgrade from HTTPS to HTTP

**Example Output**:
```
✓ Using HTTPS correctly
```

---

### 9. Endpoint Format Check
**ID**: `endpoint-format`
**Category**: `protocol`
**Description**: Validates that all endpoints are properly formatted URLs.

**Pass Criteria**:
- All endpoints are valid URLs
- Proper scheme (http/https)
- Valid hostnames

**Fail Scenarios**:
- Malformed URLs
- Missing scheme
- Invalid characters

**Example Output**:
```
✓ All endpoints properly formatted
```

---

## Capabilities

### 10. Capability Names Check
**ID**: `capability-names`
**Category**: `capabilities`
**Description**: Validates that capability names follow reverse-domain notation.

**Pass Criteria**:
- Names match regex: `/^[a-z][a-z0-9]*(\.[a-z][a-z0-9_]*)+$/`
- Examples: `dev.ucp.shopping.checkout`, `com.example.custom`

**Fail Scenarios**:
- Invalid format (e.g., "checkout", "Checkout", "CHECKOUT")
- Uppercase letters
- Invalid characters
- Too short (must have at least one dot)

**Example Output**:
```
✓ All capability names follow reverse-domain notation
```

**Fail Output**:
```
✗ Invalid capability names:
  - "checkout" (should be "dev.ucp.shopping.checkout")
  - "My.Capability" (no uppercase allowed)
```

---

### 11. Capability Registry Check
**ID**: `capability-registry`
**Category**: `capabilities`
**Description**: Validates capabilities against the official registry and checks extension dependencies.

**Pass Criteria**:
- Capabilities are either:
  - Core capabilities (from official registry)
  - Extensions of core capabilities
  - Custom capabilities (namespace-validated)
- All extension parent dependencies are present

**Warning Scenarios**:
- Unknown capabilities (not in registry, might be custom)
- Extension declared but parent capability missing

**Example Output**:
```
✓ 3 core capabilities, 2 extensions, 1 custom capability
  Core: dev.ucp.shopping.checkout, dev.ucp.common.identity_linking, dev.ucp.shopping.order
  Extensions: dev.ucp.shopping.fulfillment, dev.ucp.shopping.discount
  Custom: com.example.loyalty
```

**Warning Output**:
```
! Extension "dev.ucp.shopping.fulfillment" declared but parent "dev.ucp.shopping.checkout" is missing
```

**Core Capabilities**:
- `dev.ucp.shopping.checkout` - Checkout operations
- `dev.ucp.common.identity_linking` - Identity linking
- `dev.ucp.shopping.order` - Order management

**Extension Capabilities**:
- `dev.ucp.shopping.fulfillment` - Extends checkout
- `dev.ucp.shopping.discount` - Extends checkout
- `dev.ucp.shopping.ap2_mandate` - Extends checkout

---

### 12. Capability Extensions Check
**ID**: `capability-extensions`
**Category**: `capabilities`
**Description**: Validates that capability extensions reference valid parent capabilities.

**Pass Criteria**:
- Extensions have valid parent references
- Parent capabilities exist in the profile
- No circular dependencies

**Fail Scenarios**:
- Extension references non-existent parent
- Circular extension chains

**Example Output**:
```
✓ All extension dependencies satisfied
```

---

### 13. Capability Completeness Check
**ID**: `capability-completeness`
**Category**: `capabilities`
**Description**: Checks that capabilities have recommended fields for better discoverability.

**Pass Criteria**:
- Capabilities have `spec` URL (recommended)
- Capabilities have `schema` URL (recommended)
- Both URLs are accessible (if `checkSchemas` option enabled)

**Warning Scenarios**:
- Missing `spec` URL
- Missing `schema` URL
- URLs return 404

**Example Output**:
```
✓ All capabilities have recommended fields
```

**Warning Output**:
```
! Capabilities missing recommended fields:
  - "dev.ucp.shopping.checkout" missing spec URL
  - "dev.ucp.shopping.order" missing schema URL
```

---

### 14. Namespace Binding Check
**ID**: `namespace-binding`
**Category**: `capabilities`
**Description**: Validates namespace-to-origin binding per UCP specification (MUST requirement).

**Pass Criteria**:
- Spec URL origin matches namespace authority
- Schema URL origin matches namespace authority
- Example: `dev.ucp.*` capabilities MUST use `https://ucp.dev/...` URLs

**Fail Scenarios**:
- Spec URL origin doesn't match namespace
- Schema URL origin doesn't match namespace
- Example: `dev.ucp.shopping.checkout` using `https://example.com/spec`

**Example Output**:
```
✓ All spec/schema URLs match namespace authority
```

**Fail Output**:
```
✗ Namespace-to-origin binding violations:
  - "dev.ucp.shopping.checkout": spec URL "https://example.com/checkout-spec" does not match namespace "dev.ucp" (expected https://ucp.dev/...)
```

**Namespace Rules**:
- `dev.ucp.*` → `https://ucp.dev/...`
- `com.example.*` → `https://example.com/...`
- `org.acme.*` → `https://acme.org/...`

---

### 15. Intersection Algorithm Check
**ID**: `intersection`
**Category**: `capabilities`
**Description**: Simulates the capability intersection algorithm to validate extension pruning logic.

**Pass Criteria**:
- Simulation runs without errors
- Extension pruning follows specification rules

**Info Output**:
- Shows which capabilities survive intersection
- Shows which extensions are pruned and why

**Example Output**:
```
ℹ Intersection simulation:
  5 capabilities in intersection
  0 extensions pruned
  Surviving: dev.ucp.shopping.checkout, dev.ucp.shopping.fulfillment, dev.ucp.shopping.order, dev.ucp.common.identity_linking, com.example.loyalty
```

**With Pruning**:
```
ℹ Intersection simulation:
  3 capabilities in intersection
  2 extensions pruned
  Pruned:
    - dev.ucp.shopping.fulfillment (parent dev.ucp.shopping.checkout not in intersection)
    - dev.ucp.shopping.discount (parent dev.ucp.shopping.checkout not in intersection)
  Surviving: dev.ucp.shopping.order, dev.ucp.common.identity_linking, com.example.loyalty
```

---

## Services

### 16. Service Definitions Check
**ID**: `service-definitions`
**Category**: `services`
**Description**: Validates that services have required fields and follow naming conventions.

**Pass Criteria** (Strict Mode):
- Service name follows reverse-domain notation: `/^[a-z][a-z0-9]*(\.[a-z][a-z0-9_]*)+$/`
- Has `version` field
- Has `spec` URL
- Transport-specific validation passes:
  - **REST**: Has `endpoint` and `schema` URLs
  - **MCP**: Has `endpoint`
  - **A2A**: Has `endpoint` and `intent`
  - **Embedded**: Has `start_url`

**Fail Scenarios**:
- Missing required fields
- Invalid service name format
- Missing transport-specific fields

**Example Output**:
```
✓ All services have required fields
  - dev.ucp.shopping.checkout_service (REST)
  - dev.ucp.shopping.order_service (REST)
```

**Fail Output**:
```
✗ Service definition issues:
  - "checkoutService": invalid name format (should be reverse-domain notation)
  - "dev.ucp.shopping.checkout": missing version field
  - "dev.ucp.shopping.order": REST binding missing endpoint
```

**Transport Types**:
- `rest` - RESTful HTTP API
- `mcp` - Model Context Protocol
- `a2a` - App-to-App
- `embedded` - Embedded widget/iframe

---

### 17. Service Endpoints Check
**ID**: `service-endpoints`
**Category**: `services`
**Description**: Checks that service REST endpoints are reachable (requires `checkEndpoints` option).

**Pass Criteria**:
- Endpoints return 2xx-5xx status (server exists)
- DNS resolves
- Connection successful

**Skip Scenarios**:
- `checkEndpoints` option is false
- Service has no REST binding

**Fail Scenarios**:
- Connection timeout
- DNS failure
- Network error

**Example Output**:
```
✓ All service endpoints are reachable
```

**Skipped Output**:
```
⊘ Skipped (checkEndpoints option disabled)
```

---

## Payment

### 18. Payment Handlers Check
**ID**: `payment-handlers`
**Category**: `payment`
**Description**: Validates payment handler definitions with strict compliance.

**Pass Criteria** (Strict Mode):
- All handlers have: `id`, `name`, `version`, `spec`
- Handler IDs are unique
- No duplicate handler IDs

**Fail Scenarios**:
- Missing required fields
- Duplicate handler IDs
- Invalid field types

**Example Output**:
```
✓ All payment handlers have required fields
  - pay.google
  - pay.apple
  - pay.shopify
```

**Fail Output**:
```
✗ Payment handler issues:
  Incomplete handlers:
    - "pay.google" missing spec URL
    - "pay.apple" missing version
  Duplicate IDs:
    - "pay.shopify" appears 2 times
```

---

## Security

### 19. Signing Keys Check
**ID**: `signing-keys`
**Category**: `security`
**Description**: Validates that signing keys are in valid JWK format.

**Pass Criteria**:
- Keys are valid JSON Web Keys (JWK)
- Required JWK fields present (`kty`, `use`, `kid`)
- Proper key type and algorithm

**Skip Scenarios**:
- No signing keys present

**Fail Scenarios**:
- Invalid JWK format
- Missing required fields
- Unsupported key type

**Example Output**:
```
✓ All signing keys are valid JWK format
  - key-1 (RSA, sig)
  - key-2 (EC, sig)
```

**Skipped Output**:
```
⊘ No signing keys present
```

---

### 20. Schema URLs Check
**ID**: `schema-urls`
**Category**: `security`
**Description**: Validates that schema URLs are reachable (requires `checkSchemas` option).

**Pass Criteria**:
- All schema URLs return 2xx status
- URLs are valid and accessible

**Skip Scenarios**:
- `checkSchemas` option is false
- No schema URLs present

**Fail Scenarios**:
- Schema URL returns 404
- Connection timeout
- Invalid URL format

**Example Output**:
```
✓ All schema URLs are reachable
  - https://ucp.dev/schemas/shopping/checkout.json
  - https://ucp.dev/schemas/shopping/order.json
```

**Skipped Output**:
```
⊘ Skipped (checkSchemas option disabled)
```

---

## Check Results

Each check returns one of four possible statuses:

### ✓ Pass
- Check completed successfully
- No issues found
- Implementation meets requirements

### ✗ Fail
- Critical issue found
- Implementation does not meet specification
- Must be fixed for compliance

### ! Warning
- Non-critical issue found
- Implementation works but has recommendations
- Should be addressed for best practices

### ⊘ Skip
- Check was not performed
- Usually due to:
  - Optional feature not enabled (`checkEndpoints`, `checkSchemas`)
  - Feature not present in implementation (e.g., no signing keys)
  - Prerequisite check failed

---

## Validation Modes

### Strict Mode (Default)
- Enforces full UCP specification compliance
- All MUST requirements are validated
- SHOULD requirements generate warnings
- Used for production implementations

**Characteristics**:
- Payment handlers require all fields: id, name, version, spec
- Services require version and spec
- Namespace-to-origin binding enforced
- Extension dependencies validated

---

## Configuration Options

### checkEndpoints
**Type**: `boolean`
**Default**: `true`
**Affects**: Service Endpoints Check

When enabled, validates that service REST endpoints are reachable.

### checkSchemas
**Type**: `boolean`
**Default**: `false`
**Affects**: Schema URLs Check, Capability Completeness Check

When enabled, validates that schema URLs return 200 status.

### verbose
**Type**: `boolean`
**Default**: `false`
**Affects**: All checks

When enabled, includes detailed diagnostic information in check results.

---

## Registries

### Version Registry
**Location**: `lib/core/registry/versions.ts`
**Purpose**: Tracks known UCP specification versions

**Contents**:
```typescript
{
  version: '2026-01-11',
  releaseDate: new Date('2026-01-11'),
  specUrl: 'https://ucp.dev/docs/specification'
}
```

### Capability Registry
**Location**: `lib/core/registry/capabilities.ts`
**Purpose**: Tracks core capabilities, extensions, and namespace validation

**Core Capabilities**:
- `dev.ucp.shopping.checkout`
- `dev.ucp.common.identity_linking`
- `dev.ucp.shopping.order`

**Extensions**:
- `dev.ucp.shopping.fulfillment` (extends checkout)
- `dev.ucp.shopping.discount` (extends checkout)
- `dev.ucp.shopping.ap2_mandate` (extends checkout)

---

## Implementation Details

### Check Lifecycle

1. **Initialization**: Check is instantiated with configuration
2. **Execution**: `run()` method is called with context
3. **Validation**: Check performs validation logic
4. **Result**: Returns `CheckResult` with status and details
5. **Reporting**: Result is formatted and displayed

### Check Context

Each check receives a context object with:
- `profile`: The UCP profile being validated
- `options`: Configuration options (checkEndpoints, checkSchemas, verbose)
- `metadata`: Additional metadata (URL, timestamp, etc.)

### Result Object

```typescript
interface CheckResult {
  status: 'pass' | 'fail' | 'warn' | 'skip'
  message: string
  details?: string[]
  duration?: number
}
```

---

## Adding Custom Checks

To add a new validation check:

1. Create check file in `lib/core/checks/`:
```typescript
import { BaseCheck, type CheckContext } from './base'
import type { CheckResult } from '../types/index'

export class MyCustomCheck extends BaseCheck {
  readonly id = 'my-custom-check'
  readonly category = 'custom'

  async run(context: CheckContext): Promise<CheckResult> {
    // Your validation logic here

    if (validationPassed) {
      return this.pass('Validation successful')
    } else {
      return this.fail('Validation failed', ['Detail 1', 'Detail 2'])
    }
  }
}
```

2. Register check in `lib/core/checks/index.ts`:
```typescript
import { MyCustomCheck } from './my-custom-check'

export const ALL_CHECKS: BaseCheck[] = [
  // ... existing checks
  new MyCustomCheck(),
]
```

3. Test your check with a sample profile

---

## Testing Validation Checks

### Manual Testing

```bash
# Start development server
npm run dev

# Open http://localhost:3000
# Enter a UCP implementation URL
# Review check results
```

### Programmatic Testing

```typescript
import { DiagnosticEngine } from './lib/core/engine/diagnostic-engine'

const engine = new DiagnosticEngine()
const results = await engine.diagnose('https://demo.awesomeucp.com', {
  checkEndpoints: true,
  checkSchemas: false,
  verbose: true
})

console.log(results.summary)
console.log(results.checks)
```

---

## Related Documentation

- [UCP Specification](https://ucp.dev/docs/specification)
- [Schema Generator Documentation](tools/schema-generator/README.md)
- [Main README](README.md)

---

## License

Part of the Universal Commerce Protocol project.
Apache License 2.0

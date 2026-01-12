/**
 * UCP Discovery Profile types
 * Based on: ucp/source/discovery/profile_schema.json
 */

export interface UcpCapability {
  name: string;
  version: string;
  spec: string;
  schema: string;
  extends?: string;
  config?: Record<string, unknown>;
}

export interface UcpRestBinding {
  schema: string;
  endpoint: string;
}

export interface UcpMcpBinding {
  schema: string;
  endpoint: string;
}

export interface UcpA2ABinding {
  endpoint: string;
}

export interface UcpEmbeddedBinding {
  schema: string;
}

export interface UcpService {
  version: string;
  spec?: string;
  rest?: UcpRestBinding;
  mcp?: UcpMcpBinding;
  a2a?: UcpA2ABinding;
  embedded?: UcpEmbeddedBinding;
  capabilities?: UcpCapability[];
}

export interface UcpPaymentHandler {
  id: string;
  name: string;
  version: string;
  spec: string;
  config_schema: string;
  instrument_schemas: string[];
  config: Record<string, unknown>;
}

export interface UcpSigningKey {
  kid: string;
  kty: string;
  crv?: string;
  x?: string;
  y?: string;
  n?: string;
  e?: string;
  use?: 'sig' | 'enc';
  alg?: string;
}

export interface UcpDiscoveryProfile {
  ucp: {
    version: string;
    services: Record<string, UcpService>;
    capabilities: UcpCapability[];
  };
  payment?: {
    handlers?: UcpPaymentHandler[];
  };
  signing_keys?: UcpSigningKey[];
}

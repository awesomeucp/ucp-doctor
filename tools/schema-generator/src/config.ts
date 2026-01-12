import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const config = {
  // Input paths (UCP specification schemas)
  // From ucp-doctor/tools/schema-generator/src -> ../../.. gets us to root, then /ucp/spec
  ucpSpecRoot: join(__dirname, '../../../../ucp/spec'),
  schemasPath: join(__dirname, '../../../../ucp/spec/schemas'),
  discoveryPath: join(__dirname, '../../../../ucp/spec/discovery'),
  servicesPath: join(__dirname, '../../../../ucp/spec/services'),

  // Output paths (ucp-doctor generated schemas)
  // From ucp-doctor/tools/schema-generator/src -> ../../../lib gets us to ucp-doctor/lib
  outputRoot: join(__dirname, '../../../lib/core/schemas/generated'),

  // Generation options
  generateTypes: true,
  generateBarrelExports: true,
  addFileHeaders: true,
  includeDescriptions: true,

  // Post-processing
  formatWithPrettier: false, // Will use project's prettier config later

  // Naming conventions
  fileNamingStrategy: 'kebab-case' as const,
  exportNamingStrategy: 'PascalCase' as const,

  // Advanced
  preserveRefs: false, // Bundle refs for simpler output
  strictMode: true, // Generate strict schemas

  // Exclusions
  excludePatterns: [
    '**/*.example.json',
    '**/*.test.json'
  ]
};

export type Config = typeof config;

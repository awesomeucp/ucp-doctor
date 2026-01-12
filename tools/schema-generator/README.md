# UCP Schema Generator

Auto-generates strict Zod schemas from official UCP JSON schemas.

## Overview

This tool is a mandatory build dependency for ucp-doctor. It generates TypeScript/Zod validation schemas from the official UCP specification JSON schemas located in `/ucp/spec/schemas/`.

## Features

- **Auto-generation**: Converts JSON schemas to Zod schemas
- **$ref Resolution**: Handles complex schema references using bundling
- **Complex Features**: Supports `allOf`, `oneOf`, circular references
- **Post-processing**: Adds file headers, JSDoc comments, timestamps
- **Strict Mode**: Generates strict validation schemas per UCP specification
- **Watch Mode**: Auto-regenerates on schema changes during development

## Usage

### Generate Schemas

From ucp-doctor root:
```bash
npm run schemas:generate
```

### Watch Mode (Development)

```bash
npm run schemas:watch
```

Auto-regenerates schemas when source JSON schemas change.

## Architecture

### Input
- **Source**: `/ucp/spec/schemas/` and `/ucp/spec/discovery/`
- **Format**: JSON Schema (Draft 2020-12)
- **Count**: ~76 schema files

### Output
- **Location**: `/ucp-doctor/lib/core/schemas/generated/`
- **Format**: TypeScript with Zod validation
- **Structure**: Mirrors source directory structure

### Processing Pipeline

1. **Find Schemas**: Recursively finds all `.json` files
2. **Resolve $refs**: Bundles schemas using `@apidevtools/json-schema-ref-parser`
3. **Generate Zod**: Converts to Zod using `json-schema-to-zod`
4. **Post-process**: Adds headers, JSDoc, formats code
5. **Write Files**: Outputs TypeScript files with barrel exports

## Configuration

Configuration is in `src/config.ts`:

```typescript
{
  // Input paths (relative to src/)
  schemasPath: '../../../../ucp/spec/schemas',
  discoveryPath: '../../../../ucp/spec/discovery',

  // Output path (relative to src/)
  outputRoot: '../../../lib/core/schemas/generated',

  // Options
  strictMode: true,              // Generate strict schemas
  generateTypes: true,           // Generate TS types
  generateBarrelExports: true,   // Generate index.ts files
  addFileHeaders: true,          // Add source attribution
  includeDescriptions: true      // Add JSDoc from schemas
}
```

## Dependencies

- **@apidevtools/json-schema-ref-parser**: $ref resolution
- **json-schema-to-zod**: JSON Schema to Zod conversion
- **tsx**: TypeScript execution
- **chokidar**: File watching (for watch mode)

## Generated Schema Example

**Input** (`ucp/spec/schemas/shopping/types/line_item.create_req.json`):
```json
{
  "type": "object",
  "required": ["item", "quantity"],
  "properties": {
    "item": { "$ref": "item.create_req.json" },
    "quantity": { "type": "integer", "minimum": 1 }
  }
}
```

**Output** (`lib/core/schemas/generated/shopping/types/line_item.create_req.ts`):
```typescript
/**
 * Auto-generated from UCP JSON Schema
 * Source: /ucp/spec/schemas/shopping/types/line_item.create_req.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `npm run schemas:generate`
 */

import { z } from "zod"

export const LineItemCreateReqSchema = z.object({
  item: ItemCreateReqSchema,
  quantity: z.number().int().min(1)
})

export type LineItemCreateReq = z.infer<typeof LineItemCreateReqSchema>
```

## Development

### Adding New Schemas

1. Add JSON schema to `/ucp/spec/schemas/`
2. Run `npm run schemas:generate`
3. Generated schema will be available at `lib/core/schemas/generated/`

### Modifying Generation Logic

1. Edit files in `src/`:
   - `config.ts` - Configuration
   - `resolver.ts` - $ref resolution
   - `generator.ts` - Zod code generation
   - `post-process.ts` - Post-processing
   - `index.ts` - Main orchestrator

2. Test changes:
   ```bash
   cd tools/schema-generator
   npm run dev  # Watch mode for generator itself
   ```

### Troubleshooting

**Schemas not generating:**
- Check that `/ucp/spec/schemas/` exists and contains JSON files
- Verify paths in `src/config.ts` are correct

**Import errors in generated schemas:**
- Check for circular references in source schemas
- Verify $ref paths are correct in source schemas

**Type errors in generated code:**
- Some complex JSON Schema features may not convert perfectly
- Check `json-schema-to-zod` compatibility

## Integration with ucp-doctor

The schema-generator is tightly integrated with ucp-doctor:

1. **Build Process**: Automatically runs before Next.js build
2. **Validation**: Generated schemas are used by diagnostic checks
3. **Type Safety**: Generated TypeScript types ensure type correctness
4. **Strict Mode**: Enforces UCP specification compliance

## License

Part of the Universal Commerce Protocol project.
Apache License 2.0

import { jsonSchemaToZod } from 'json-schema-to-zod';
import { ResolvedSchema } from './resolver.js';
import { config } from './config.js';
import { basename } from 'node:path';

export interface GeneratedSchema {
  code: string;
  schemaName: string;
  typeName: string;
  imports: string[];
}

/**
 * Converts a file name to PascalCase schema name
 * Example: line_item.create_req.json -> LineItemCreateReqSchema
 */
function toPascalCase(str: string): string {
  return str
    .replace(/\.json$/, '')
    .replace(/[._-]([a-z])/g, (_, letter) => letter.toUpperCase())
    .replace(/^([a-z])/, (_, letter) => letter.toUpperCase());
}

/**
 * Generates Zod schema code from a resolved JSON schema
 */
export function generateZodSchema(resolved: ResolvedSchema): GeneratedSchema {
  const fileName = basename(resolved.originalPath);
  const baseName = toPascalCase(fileName);
  const schemaName = `${baseName}Schema`;
  const typeName = baseName;

  try {
    // Convert JSON Schema to Zod using json-schema-to-zod
    const zodCode = jsonSchemaToZod(resolved.schema, {
      module: 'esm',
      name: schemaName,
      type: true // Generate TypeScript type
    });

    // Extract any imports (the library should handle this)
    const imports = ['import { z } from "zod";'];

    return {
      code: zodCode,
      schemaName,
      typeName,
      imports
    };
  } catch (error) {
    console.error(`Failed to generate Zod schema for ${fileName}:`, error);
    throw error;
  }
}

/**
 * Generates code for multiple schemas
 */
export function generateZodSchemas(
  resolved: ResolvedSchema[]
): GeneratedSchema[] {
  return resolved.map(generateZodSchema);
}

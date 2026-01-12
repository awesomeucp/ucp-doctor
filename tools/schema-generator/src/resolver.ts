import $RefParser from '@apidevtools/json-schema-ref-parser';
import { JSONSchema } from '@apidevtools/json-schema-ref-parser';

export interface ResolvedSchema {
  schema: JSONSchema;
  originalPath: string;
  schemaId?: string;
}

/**
 * Resolves all $ref references in a JSON schema
 * Uses bundling to embed refs while preserving structure
 */
export async function resolveSchema(
  filePath: string
): Promise<ResolvedSchema> {
  try {
    // Bundle the schema (embeds all $refs but preserves $id URIs)
    const bundled = await $RefParser.bundle(filePath, {
      dereference: {
        circular: 'ignore' // Handle circular refs gracefully
      }
    }) as JSONSchema;

    // Extract schema ID if present
    const schemaId = typeof bundled === 'object' && bundled !== null && '$id' in bundled
      ? (bundled as { $id?: string }).$id
      : undefined;

    return {
      schema: bundled,
      originalPath: filePath,
      schemaId
    };
  } catch (error) {
    console.error(`Failed to resolve schema at ${filePath}:`, error);
    throw error;
  }
}

/**
 * Resolves multiple schemas in parallel
 */
export async function resolveSchemas(
  filePaths: string[]
): Promise<ResolvedSchema[]> {
  return Promise.all(filePaths.map(resolveSchema));
}

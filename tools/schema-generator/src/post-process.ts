import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { GeneratedSchema } from './generator.js';
import { ResolvedSchema } from './resolver.js';
import { config } from './config.js';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Adds file header to generated code
 */
export function addFileHeader(
  code: string,
  resolved: ResolvedSchema
): string {
  if (!config.addFileHeaders) {
    return code;
  }

  const templatePath = join(__dirname, '../templates/schema-header.txt');
  const template = readFileSync(templatePath, 'utf-8');

  const header = template
    .replace('{{sourcePath}}', resolved.originalPath)
    .replace('{{schemaId}}', resolved.schemaId || 'N/A')
    .replace('{{timestamp}}', new Date().toISOString());

  return `${header}\n\n${code}`;
}

/**
 * Post-processes generated schema code
 * - Adds file headers
 * - Adds JSDoc comments
 * - Formats code (if configured)
 */
export function postProcess(
  generated: GeneratedSchema,
  resolved: ResolvedSchema
): string {
  let code = generated.code;

  // Add file header
  code = addFileHeader(code, resolved);

  // Add description from schema as JSDoc (if present)
  if (config.includeDescriptions) {
    const schema = resolved.schema;
    if (typeof schema === 'object' && schema !== null) {
      const description = (schema as { description?: string }).description;
      const title = (schema as { title?: string }).title;

      if (description || title) {
        const jsdoc = [
          '/**',
          title ? ` * ${title}` : '',
          description ? ` * ` : '',
          description ? ` * ${description}` : '',
          ' */'
        ].filter(Boolean).join('\n');

        // Insert JSDoc before the export statement
        code = code.replace(
          /export const/,
          `${jsdoc}\nexport const`
        );
      }
    }
  }

  return code;
}

/**
 * Post-processes all generated schemas
 */
export function postProcessAll(
  generated: GeneratedSchema[],
  resolved: ResolvedSchema[]
): string[] {
  return generated.map((gen, i) => postProcess(gen, resolved[i]));
}

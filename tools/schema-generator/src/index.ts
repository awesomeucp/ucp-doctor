import { existsSync, mkdirSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname, basename } from 'node:path';
import { resolveSchema, resolveSchemas } from './resolver.js';
import { generateZodSchema, generateZodSchemas } from './generator.js';
import { postProcessAll } from './post-process.js';
import { config } from './config.js';

/**
 * Recursively find all JSON schema files
 */
function findSchemaFiles(dir: string, files: string[] = []): string[] {
  if (!existsSync(dir)) {
    console.warn(`Directory not found: ${dir}`);
    return files;
  }

  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      findSchemaFiles(fullPath, files);
    } else if (entry.endsWith('.json')) {
      // Check if file matches exclusion patterns
      const shouldExclude = config.excludePatterns.some(pattern => {
        // Simple glob matching (just checks if pattern is in path)
        return fullPath.includes(pattern.replace('**/', '').replace('*', ''));
      });

      if (!shouldExclude) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * Determine output file path for a schema
 */
function getOutputPath(schemaPath: string): string {
  // Check if it's from discovery or schemas directory
  let rel: string;
  if (schemaPath.includes('/discovery/')) {
    rel = join('discovery', relative(config.discoveryPath, schemaPath));
  } else {
    rel = relative(config.schemasPath, schemaPath);
  }
  const outputFile = rel.replace(/\.json$/, '.ts');
  return join(config.outputRoot, outputFile);
}

/**
 * Generate single schema file
 */
async function generateSchemaFile(schemaPath: string): Promise<void> {
  try {
    console.log(`Processing: ${relative(config.ucpSpecRoot, schemaPath)}`);

    // Resolve $refs
    const resolved = await resolveSchema(schemaPath);

    // Generate Zod code
    const generated = generateZodSchema(resolved);

    // Post-process
    const [code] = postProcessAll([generated], [resolved]);

    // Determine output path
    const outputPath = getOutputPath(schemaPath);

    // Ensure output directory exists
    const outputDir = dirname(outputPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Write file
    writeFileSync(outputPath, code, 'utf-8');
    console.log(`✓ Generated: ${relative(process.cwd(), outputPath)}`);
  } catch (error) {
    console.error(`✗ Failed to generate ${schemaPath}:`, error);
    throw error;
  }
}

/**
 * Generate barrel export file (index.ts) for a directory
 */
function generateBarrelExport(dir: string): void {
  if (!config.generateBarrelExports) {
    return;
  }

  const files = readdirSync(dir);
  const tsFiles = files.filter(f => f.endsWith('.ts') && f !== 'index.ts');

  if (tsFiles.length === 0) {
    return;
  }

  const exports = tsFiles.map(file => {
    const name = basename(file, '.ts');
    // Don't add .js extension - Next.js doesn't need it
    return `export * from './${name}';`;
  }).join('\n');

  const indexPath = join(dir, 'index.ts');
  writeFileSync(indexPath, exports + '\n', 'utf-8');
  console.log(`✓ Generated barrel export: ${relative(process.cwd(), indexPath)}`);
}

/**
 * Recursively generate barrel exports for all subdirectories
 */
function generateAllBarrelExports(dir: string): void {
  if (!existsSync(dir)) {
    return;
  }

  // Generate for current directory
  generateBarrelExport(dir);

  // Recursively generate for subdirectories
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      generateAllBarrelExports(fullPath);
    }
  }
}

/**
 * Main generation function
 */
async function generate(): Promise<void> {
  console.log('🚀 UCP Schema Generator');
  console.log('========================\n');

  console.log('Configuration:');
  console.log(`  Input: ${config.schemasPath}`);
  console.log(`  Output: ${config.outputRoot}`);
  console.log(`  Strict Mode: ${config.strictMode}`);
  console.log('');

  // Find all schema files from multiple sources
  console.log('📁 Finding schema files...');
  const schemaFiles = [
    ...findSchemaFiles(config.schemasPath),
    ...findSchemaFiles(config.discoveryPath)
  ];
  console.log(`Found ${schemaFiles.length} schema files\n`);

  if (schemaFiles.length === 0) {
    console.warn('⚠️  No schema files found!');
    return;
  }

  // Clean output directory
  console.log('🧹 Cleaning output directory...');
  if (existsSync(config.outputRoot)) {
    // For now, just create it if it doesn't exist
    // TODO: Add proper cleaning logic
  }
  mkdirSync(config.outputRoot, { recursive: true });
  console.log('');

  // Generate each schema
  console.log('⚙️  Generating Zod schemas...');
  for (const schemaFile of schemaFiles) {
    await generateSchemaFile(schemaFile);
  }
  console.log('');

  // Generate barrel exports
  console.log('📦 Generating barrel exports...');
  generateAllBarrelExports(config.outputRoot);
  console.log('');

  console.log('✅ Schema generation complete!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generate().catch(error => {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  });
}

export { generate };

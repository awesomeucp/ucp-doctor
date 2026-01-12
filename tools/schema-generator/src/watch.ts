/**
 * Watch Mode for UCP Schema Generator
 *
 * Watches for changes in UCP specification schemas and auto-regenerates Zod schemas.
 */

import chokidar from 'chokidar';
import { generate } from './index';
import { config } from './config';
import { existsSync } from 'node:fs';

/**
 * Start watching schema directories for changes
 */
async function watch(): Promise<void> {
  console.log('🔍 UCP Schema Generator - Watch Mode');
  console.log('====================================\n');

  // Verify directories exist
  if (!existsSync(config.schemasPath)) {
    console.error(`❌ Schema directory not found: ${config.schemasPath}`);
    console.error('   Make sure the UCP submodule is initialized.');
    process.exit(1);
  }

  console.log('Configuration:');
  console.log(`  Watching: ${config.schemasPath}`);
  console.log(`  Watching: ${config.discoveryPath}`);
  console.log(`  Output: ${config.outputRoot}`);
  console.log('');

  // Run initial generation
  console.log('🚀 Running initial schema generation...\n');
  try {
    await generate();
    console.log('\n✅ Initial generation complete');
  } catch (error) {
    console.error('\n❌ Initial generation failed:', error);
    console.log('\n👀 Continuing to watch for changes...');
  }

  console.log('\n👀 Watching for schema changes...');
  console.log('   Press Ctrl+C to stop\n');

  // Track if regeneration is in progress
  let isRegenerating = false;

  // Debounce timer
  let debounceTimer: NodeJS.Timeout | null = null;

  // Watch for changes in schema directories
  const watcher = chokidar.watch(
    [config.schemasPath, config.discoveryPath],
    {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
      }
    }
  );

  // Handle file changes
  const handleChange = (path: string) => {
    // Only process JSON files
    if (!path.endsWith('.json')) {
      return;
    }

    console.log(`📝 Detected change: ${path}`);

    // Debounce: wait 1 second after last change
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(async () => {
      if (isRegenerating) {
        console.log('⏳ Generation already in progress, skipping...');
        return;
      }

      isRegenerating = true;
      console.log('\n🔄 Regenerating schemas...');

      try {
        await generate();
        console.log('✅ Regeneration complete\n');
        console.log('👀 Watching for schema changes...\n');
      } catch (error) {
        console.error('❌ Regeneration failed:', error);
        console.log('\n👀 Continuing to watch for changes...\n');
      } finally {
        isRegenerating = false;
      }
    }, 1000);
  };

  watcher
    .on('add', handleChange)
    .on('change', handleChange)
    .on('unlink', (path) => {
      if (path.endsWith('.json')) {
        console.log(`🗑️  Detected deletion: ${path}`);
        handleChange(path);
      }
    })
    .on('error', (error) => {
      console.error('❌ Watcher error:', error);
    });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n👋 Stopping watch mode...');
    watcher.close().then(() => {
      console.log('✅ Watch mode stopped');
      process.exit(0);
    });
  });
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  watch().catch(error => {
    console.error('❌ Watch mode failed:', error);
    process.exit(1);
  });
}

export { watch };

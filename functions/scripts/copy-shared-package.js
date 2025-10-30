#!/usr/bin/env node
/**
 * Copy the built shared/slideSpec package into functions/lib for runtime access.
 * This ensures the @plzfixthx/slide-spec package is available at runtime.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`❌ Source directory not found: ${src}`);
    process.exit(1);
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy all shared packages
const sharedPackages = [
  { name: 'slideSpec', source: '../../shared/slideSpec/dist', target: '../lib/slide-spec' },
  { name: 'errors', source: '../../shared/errors/lib', target: '../lib/errors' },
  { name: 'utils', source: '../../shared/utils/lib', target: '../lib/utils' },
  { name: 'validation', source: '../../shared/validation/lib', target: '../lib/validation' },
];

console.log('Copying shared packages...');
for (const pkg of sharedPackages) {
  const sourceDir = path.join(__dirname, pkg.source);
  const targetDir = path.join(__dirname, pkg.target);

  if (fs.existsSync(sourceDir)) {
    copyRecursive(sourceDir, targetDir);
    console.log(`✅ Copied @plzfixthx/${pkg.name}`);
  } else {
    console.warn(`⚠️  Skipped @plzfixthx/${pkg.name} (not built yet)`);
  }
}


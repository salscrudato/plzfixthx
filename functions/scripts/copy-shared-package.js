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

const sourceDir = path.join(__dirname, '../../shared/slideSpec/dist');
const targetDir = path.join(__dirname, '../lib/slide-spec');

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

console.log('Copying shared package...');
copyRecursive(sourceDir, targetDir);
console.log('✅ Shared package copied to lib/slide-spec');


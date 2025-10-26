#!/usr/bin/env node
/**
 * Fix ESM import paths for the slide-spec package.
 * Ensures deep imports use the correct .js extension for ESM compatibility.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const libDir = path.join(__dirname, '../lib');
let filesFixed = 0;

function fixImports(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fixImports(filePath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;

      // Fix all relative imports to add .js extension
      // Match: from "./something" or from '../something'
      const lines = content.split('\n');
      const fixedLines = lines.map(line => {
        // Fix @plzfixthx/slide-spec imports to use relative path
        if (line.includes('@plzfixthx/slide-spec')) {
          return line.replace(
            /@plzfixthx\/slide-spec/g,
            () => {
              // Calculate relative path from current file to slide-spec
              const fileDir = path.dirname(filePath);
              const libDir = path.join(path.dirname(filePath), '..');
              const slideSpecPath = path.join(libDir, 'slide-spec', 'index.js');
              const relativePath = path.relative(fileDir, slideSpecPath).replace(/\\/g, '/');
              return relativePath;
            }
          );
        }
        // Match import statements with relative paths
        if (line.includes('from "') || line.includes("from '")) {
          return line.replace(
            /from\s+["'](\.\.?\/[^"']+)["']/g,
            (match, importPath) => {
              // Skip if already has .js or .json extension
              if (importPath.endsWith('.js') || importPath.endsWith('.json')) {
                return match;
              }
              // Check if this is a directory import (no extension and directory exists)
              const resolvedPath = path.join(path.dirname(filePath), importPath);
              try {
                if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
                  return `from "${importPath}/index.js"`;
                }
              } catch (e) {
                // Ignore errors, fall through to .js extension
              }
              return `from "${importPath}.js"`;
            }
          );
        }
        // Match dynamic imports
        if (line.includes('import(')) {
          return line.replace(
            /import\s*\(\s*["'](\.\.?\/[^"']+)["']\s*\)/g,
            (match, importPath) => {
              if (importPath.endsWith('.js') || importPath.endsWith('.json')) {
                return match;
              }
              // Check if this is a directory import
              const resolvedPath = path.join(path.dirname(filePath), importPath);
              try {
                if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
                  return `import("${importPath}/index.js")`;
                }
              } catch (e) {
                // Ignore errors, fall through to .js extension
              }
              return `import("${importPath}.js")`;
            }
          );
        }
        return line;
      });

      content = fixedLines.join('\n');

      if (content !== originalContent) {
        console.log(`  Fixed: ${path.relative(libDir, filePath)}`);
        fs.writeFileSync(filePath, content, 'utf8');
        filesFixed++;
      }
    }
  }
}

console.log('Fixing ESM imports...');
fixImports(libDir);
console.log(`✅ ESM imports fixed (${filesFixed} files modified)`);


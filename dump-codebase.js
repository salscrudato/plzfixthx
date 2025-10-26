#!/usr/bin/env node

/**
 * Codebase Dump Script
 * Collects all source code files and their contents into a single text file
 * Excludes: node_modules, dist, build, .git, and other non-essential directories
 */

const fs = require('fs');
const path = require('path');

const EXCLUDE_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  '.git',
  '.next',
  'coverage',
  '.venv',
  'venv',
  '__pycache__',
  '.pytest_cache',
  '.turbo',
  'lib',
  '.firebase',
  'public',
  '.vscode',
  '.idea',
]);

const EXCLUDE_FILES = new Set([
  '.DS_Store',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  '.env',
  '.env.local',
  '.env.*.local',
]);

const SOURCE_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.css',
  '.scss',
  '.html',
  '.md',
  '.yml',
  '.yaml',
  '.xml',
  '.sql',
  '.py',
  '.go',
  '.rs',
  '.java',
  '.cpp',
  '.c',
  '.h',
  '.sh',
  '.bash',
  '.zsh',
]);

function shouldIncludeFile(filePath) {
  const fileName = path.basename(filePath);
  
  // Exclude specific files
  if (EXCLUDE_FILES.has(fileName)) return false;
  
  // Exclude hidden files except .env.example
  if (fileName.startsWith('.') && fileName !== '.env.example') return false;
  
  // Include only source files
  const ext = path.extname(filePath);
  return SOURCE_EXTENSIONS.has(ext);
}

function shouldIncludeDir(dirPath) {
  const dirName = path.basename(dirPath);
  return !EXCLUDE_DIRS.has(dirName);
}

function walkDir(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (shouldIncludeDir(filePath)) {
          walkDir(filePath, fileList);
        }
      } else if (stat.isFile()) {
        if (shouldIncludeFile(filePath)) {
          fileList.push(filePath);
        }
      }
    }
  } catch (e) {
    console.warn(`Warning: Could not read directory ${dir}: ${e.message}`);
  }
  
  return fileList;
}

function main() {
  const rootDir = process.cwd();
  console.log(`📁 Scanning codebase in: ${rootDir}`);
  
  const files = walkDir(rootDir);
  console.log(`📄 Found ${files.length} source files`);
  
  let output = `# Codebase Dump\n`;
  output += `Generated: ${new Date().toISOString()}\n`;
  output += `Root Directory: ${rootDir}\n`;
  output += `Total Files: ${files.length}\n`;
  output += `\n${'='.repeat(80)}\n\n`;
  
  let fileCount = 0;
  let totalSize = 0;
  
  for (const filePath of files) {
    try {
      const relPath = path.relative(rootDir, filePath);
      const content = fs.readFileSync(filePath, 'utf-8');
      const size = Buffer.byteLength(content, 'utf-8');
      
      totalSize += size;
      fileCount++;
      
      output += `\n${'─'.repeat(80)}\n`;
      output += `FILE: ${relPath}\n`;
      output += `SIZE: ${(size / 1024).toFixed(2)} KB\n`;
      output += `${'─'.repeat(80)}\n\n`;
      output += content;
      output += `\n\n`;
      
      if (fileCount % 10 === 0) {
        console.log(`  ✓ Processed ${fileCount} files...`);
      }
    } catch (e) {
      console.warn(`Warning: Could not read file ${filePath}: ${e.message}`);
    }
  }
  
  output += `\n${'='.repeat(80)}\n`;
  output += `SUMMARY\n`;
  output += `${'='.repeat(80)}\n`;
  output += `Total Files: ${fileCount}\n`;
  output += `Total Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`;
  output += `Generated: ${new Date().toISOString()}\n`;
  
  const outputPath = path.join(rootDir, 'CODEBASE_DUMP.txt');
  fs.writeFileSync(outputPath, output, 'utf-8');
  
  console.log(`\n✅ Codebase dump complete!`);
  console.log(`📝 Output file: ${outputPath}`);
  console.log(`📊 Statistics:`);
  console.log(`   - Files: ${fileCount}`);
  console.log(`   - Total Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
}

main();


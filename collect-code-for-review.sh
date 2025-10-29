#!/bin/bash

# Script to collect all code files for external code review
# Output file: code-review-bundle.txt

OUTPUT_FILE="code-review-bundle.txt"
REPO_ROOT="$(pwd)"

# Clear or create the output file
> "$OUTPUT_FILE"

echo "Collecting code files for review..."
echo "Repository: plzfixthx" >> "$OUTPUT_FILE"
echo "Generated: $(date)" >> "$OUTPUT_FILE"
echo "========================================" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Function to process a file
process_file() {
    local file="$1"
    local relative_path="${file#$REPO_ROOT/}"
    
    echo "" >> "$OUTPUT_FILE"
    echo "================================================================================" >> "$OUTPUT_FILE"
    echo "FILE: $relative_path" >> "$OUTPUT_FILE"
    echo "================================================================================" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    cat "$file" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
}

# Find and process all code files, excluding node_modules, dist, lib, and other build artifacts
find . -type f \( \
    -name "*.ts" -o \
    -name "*.tsx" -o \
    -name "*.js" -o \
    -name "*.jsx" -o \
    -name "*.json" -o \
    -name "*.html" -o \
    -name "*.css" -o \
    -name "*.sh" \
\) \
    -not -path "*/node_modules/*" \
    -not -path "*/dist/*" \
    -not -path "*/lib/*" \
    -not -path "*/build/*" \
    -not -path "*/.git/*" \
    -not -path "*/test-output/*" \
    -not -path "*package-lock.json" \
    -not -path "$OUTPUT_FILE" \
    | sort | while read -r file; do
    process_file "$file"
    echo "Processed: ${file#$REPO_ROOT/}"
done

echo "" >> "$OUTPUT_FILE"
echo "================================================================================" >> "$OUTPUT_FILE"
echo "END OF CODE REVIEW BUNDLE" >> "$OUTPUT_FILE"
echo "================================================================================" >> "$OUTPUT_FILE"

echo ""
echo "Code collection complete!"
echo "Output file: $OUTPUT_FILE"
echo "File size: $(du -h "$OUTPUT_FILE" | cut -f1)"
echo "Total files processed: $(grep -c "^FILE: " "$OUTPUT_FILE")"


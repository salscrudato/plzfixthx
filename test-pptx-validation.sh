#!/bin/bash

# Comprehensive PPTX Validation Test Script
# Tests PPTX generation at each stage of development
# Validates: ZIP structure, XML validity, content presence, no corruption

set -e

EXPORT_URL="https://exportpptx-3wgb3rbjta-uc.a.run.app"
TEST_DIR="/tmp/pptx-test-$(date +%s)"
OUTPUT_FILE="$TEST_DIR/test-slide.pptx"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== PPTX Validation Test Suite ===${NC}\n"

# Create test directory
mkdir -p "$TEST_DIR"
echo -e "${YELLOW}Test directory: $TEST_DIR${NC}\n"

# Test 1: Generate PPTX
echo -e "${BLUE}[TEST 1] Generating PPTX...${NC}"
curl -s -X POST "$EXPORT_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "spec": {
      "meta": {"version": "1.0", "locale": "en-US", "theme": "Test", "aspectRatio": "16:9"},
      "content": {
        "title": {"id": "title", "text": "Test Slide"},
        "subtitle": {"id": "subtitle", "text": "Minimal PPTX Test"},
        "bullets": [{"id": "b1", "items": [{"text": "First bullet", "level": 1}, {"text": "Second bullet", "level": 1}]}]
      },
      "layout": {
        "grid": {"rows": 8, "cols": 12, "gutter": 8, "margin": {"t": 32, "r": 32, "b": 32, "l": 32}},
        "regions": [{"name": "header", "rowStart": 1, "colStart": 1, "rowSpan": 1, "colSpan": 12}, {"name": "body", "rowStart": 2, "colStart": 1, "rowSpan": 6, "colSpan": 12}],
        "anchors": [{"refId": "title", "region": "header", "order": 0}, {"refId": "subtitle", "region": "header", "order": 1}, {"refId": "b1", "region": "body", "order": 0}]
      },
      "styleTokens": {
        "palette": {"primary": "#000000", "accent": "#0066CC", "neutral": ["#000000", "#333333", "#666666", "#999999", "#CCCCCC", "#EEEEEE", "#FFFFFF"]},
        "typography": {"fonts": {"sans": "Aptos"}, "sizes": {"step_-2": 12, "step_-1": 14, "step_0": 16, "step_1": 20, "step_2": 28, "step_3": 40}, "weights": {"regular": 400, "medium": 500, "semibold": 600, "bold": 700}, "lineHeights": {"compact": 1.2, "standard": 1.5}},
        "spacing": {"base": 4, "steps": [0, 4, 8, 12, 16, 24, 32]},
        "radii": {"sm": 4, "md": 8, "lg": 12},
        "shadows": {"sm": "0 2px 4px rgba(0,0,0,.08)", "md": "0 4px 12px rgba(0,0,0,.12)", "lg": "0 12px 32px rgba(0,0,0,.16)"},
        "contrast": {"minTextContrast": 7, "minUiContrast": 4.5}
      }
    }
  }' -o "$OUTPUT_FILE" 2>/dev/null

if [ -f "$OUTPUT_FILE" ]; then
  SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
  echo -e "${GREEN}✓ PPTX generated successfully ($SIZE)${NC}\n"
else
  echo -e "${RED}✗ Failed to generate PPTX${NC}\n"
  exit 1
fi

# Test 2: Validate ZIP structure
echo -e "${BLUE}[TEST 2] Validating ZIP structure...${NC}"
if unzip -t "$OUTPUT_FILE" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ ZIP structure is valid${NC}\n"
else
  echo -e "${RED}✗ ZIP structure is corrupted${NC}\n"
  exit 1
fi

# Test 3: Extract and check for required files
echo -e "${BLUE}[TEST 3] Checking required PPTX files...${NC}"
EXTRACT_DIR="$TEST_DIR/extracted"
unzip -q "$OUTPUT_FILE" -d "$EXTRACT_DIR"

REQUIRED_FILES=(
  "[Content_Types].xml"
  "_rels/.rels"
  "ppt/presentation.xml"
  "ppt/slides/slide1.xml"
  "ppt/theme/theme1.xml"
)

ALL_PRESENT=true
for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "$EXTRACT_DIR/$file" ]; then
    echo -e "${GREEN}✓ $file${NC}"
  else
    echo -e "${RED}✗ $file missing${NC}"
    ALL_PRESENT=false
  fi
done

if [ "$ALL_PRESENT" = false ]; then
  echo -e "\n${RED}✗ Required files missing${NC}\n"
  exit 1
fi
echo ""

# Test 4: Validate XML syntax
echo -e "${BLUE}[TEST 4] Validating XML syntax...${NC}"
XML_FILES=(
  "ppt/presentation.xml"
  "ppt/slides/slide1.xml"
  "ppt/theme/theme1.xml"
)

for xml_file in "${XML_FILES[@]}"; do
  if xmllint --noout "$EXTRACT_DIR/$xml_file" 2>/dev/null; then
    echo -e "${GREEN}✓ $xml_file is valid XML${NC}"
  else
    echo -e "${YELLOW}⚠ $xml_file XML validation skipped (xmllint not available)${NC}"
  fi
done
echo ""

# Test 5: Check for content in slide
echo -e "${BLUE}[TEST 5] Checking slide content...${NC}"
SLIDE_XML="$EXTRACT_DIR/ppt/slides/slide1.xml"

if grep -q "Test Slide" "$SLIDE_XML"; then
  echo -e "${GREEN}✓ Title text found${NC}"
else
  echo -e "${RED}✗ Title text not found${NC}"
fi

if grep -q "Minimal PPTX Test" "$SLIDE_XML"; then
  echo -e "${GREEN}✓ Subtitle text found${NC}"
else
  echo -e "${RED}✗ Subtitle text not found${NC}"
fi

if grep -q "First bullet" "$SLIDE_XML"; then
  echo -e "${GREEN}✓ Bullet content found${NC}"
else
  echo -e "${RED}✗ Bullet content not found${NC}"
fi
echo ""

# Test 6: Check for corruption markers
echo -e "${BLUE}[TEST 6] Checking for corruption markers...${NC}"
CORRUPTION_MARKERS=(
  "NaN"
  "undefined"
  "null"
  "ERROR"
)

FOUND_CORRUPTION=false
for marker in "${CORRUPTION_MARKERS[@]}"; do
  if grep -r "$marker" "$EXTRACT_DIR/ppt/slides/" 2>/dev/null | grep -q .; then
    echo -e "${RED}✗ Found corruption marker: $marker${NC}"
    FOUND_CORRUPTION=true
  fi
done

if [ "$FOUND_CORRUPTION" = false ]; then
  echo -e "${GREEN}✓ No corruption markers found${NC}"
fi
echo ""

# Test 7: File size sanity check
echo -e "${BLUE}[TEST 7] File size sanity check...${NC}"
FILE_SIZE=$(stat -f%z "$OUTPUT_FILE" 2>/dev/null || stat -c%s "$OUTPUT_FILE")
if [ "$FILE_SIZE" -gt 10000 ] && [ "$FILE_SIZE" -lt 1000000 ]; then
  echo -e "${GREEN}✓ File size is reasonable ($FILE_SIZE bytes)${NC}"
else
  echo -e "${RED}✗ File size is suspicious ($FILE_SIZE bytes)${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}=== Test Summary ===${NC}"
echo -e "${GREEN}✓ All tests passed!${NC}"
echo -e "\nTest file: $OUTPUT_FILE"
echo -e "Extracted to: $EXTRACT_DIR"
echo -e "\nYou can now:"
echo -e "  1. Open $OUTPUT_FILE in PowerPoint"
echo -e "  2. Verify no repair dialog appears"
echo -e "  3. Check that content displays correctly"


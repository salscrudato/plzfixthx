/**
 * Standalone PowerPoint Generation Test System
 * Tests precise layout control for title, subtitle, content, and accent elements
 */

import PptxGenJS from "pptxgenjs";
import * as fs from "fs";
import * as path from "path";

// Slide dimensions for 16:9 aspect ratio
const SLIDE_WIDTH = 10; // inches
const SLIDE_HEIGHT = 5.625; // inches (16:9)

// Font sizes in points (pt)
// Note: PptxGenJS uses points directly, not pixels
// Updated specifications: 26pt title, 14pt subtitle, 12pt content
const TITLE_FONT_SIZE = 26;
const SUBTITLE_FONT_SIZE = 14;
const CONTENT_FONT_SIZE = 12;

// Colors
const TITLE_COLOR = "1F2937"; // Dark grey
const SUBTITLE_COLOR = "6B7280"; // Medium grey
const ACCENT_GRADIENT_START = "3B82F6"; // Blue
const ACCENT_GRADIENT_END = "8B5CF6"; // Purple

// Layout measurements (in inches)
const ACCENT_BAR_WIDTH = 0.08; // Thin accent bar
const MARGIN_LEFT = 0.6; // Left margin for content
const MARGIN_RIGHT = 0.5; // Right margin
const MARGIN_TOP = 0.35; // Top margin - moved closer to top
const TITLE_HEIGHT = 0.45; // Height allocated for title - reduced for smaller font
const SUBTITLE_HEIGHT = 0.3; // Height allocated for subtitle - reduced for smaller font
const SPACING_AFTER_TITLE = 0.05; // Space between title and subtitle - tighter
const SPACING_AFTER_SUBTITLE = 0.2; // Space between subtitle and content - reduced

/**
 * Test configuration
 */
interface TestSlideConfig {
  title: string;
  subtitle: string;
  content: string[];
  outputPath: string;
}

/**
 * Create a test slide with precise layout control
 */
export async function createTestSlide(config: TestSlideConfig): Promise<void> {
  const pptx = new PptxGenJS();
  
  // Set layout to 16:9
  pptx.layout = "LAYOUT_16x9";
  pptx.defineLayout({ name: "CUSTOM", width: SLIDE_WIDTH, height: SLIDE_HEIGHT });
  pptx.layout = "CUSTOM";
  
  const slide = pptx.addSlide();
  
  // 1. Add background (clean white)
  slide.background = { fill: "FFFFFF" };
  
  // 2. Add left-aligned gradient accent bar
  addGradientAccentBar(slide);
  
  // 3. Add title (28pt font)
  const titleY = MARGIN_TOP;
  slide.addText(config.title, {
    x: MARGIN_LEFT,
    y: titleY,
    w: SLIDE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT,
    h: TITLE_HEIGHT,
    fontSize: TITLE_FONT_SIZE,
    bold: true,
    color: TITLE_COLOR,
    fontFace: "Arial",
    align: "left",
    valign: "top",
    wrap: true
  });
  
  // 4. Add subtitle (16pt font, grey)
  const subtitleY = titleY + TITLE_HEIGHT + SPACING_AFTER_TITLE;
  slide.addText(config.subtitle, {
    x: MARGIN_LEFT,
    y: subtitleY,
    w: SLIDE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT,
    h: SUBTITLE_HEIGHT,
    fontSize: SUBTITLE_FONT_SIZE,
    color: SUBTITLE_COLOR,
    fontFace: "Arial",
    align: "left",
    valign: "top",
    wrap: true
  });
  
  // 5. Add content area (below subtitle, above bottom margin)
  const contentY = subtitleY + SUBTITLE_HEIGHT + SPACING_AFTER_SUBTITLE;
  const contentHeight = SLIDE_HEIGHT - contentY - 0.5; // 0.5" bottom margin
  
  // Format content as bullet points
  const bulletText = config.content.map(item => `• ${item}`).join("\n");
  
  slide.addText(bulletText, {
    x: MARGIN_LEFT,
    y: contentY,
    w: SLIDE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT,
    h: contentHeight,
    fontSize: CONTENT_FONT_SIZE,
    color: "374151",
    fontFace: "Arial",
    align: "left",
    valign: "top",
    wrap: true,
    lineSpacing: 20
  });
  
  // Save the presentation
  const buffer = await pptx.write({ outputType: "nodebuffer" }) as Buffer;
  fs.writeFileSync(config.outputPath, buffer);
  
  console.log(`✅ Test slide created: ${config.outputPath}`);
  console.log(`   Title: "${config.title}" (${TITLE_FONT_SIZE}pt)`);
  console.log(`   Subtitle: "${config.subtitle}" (${SUBTITLE_FONT_SIZE}pt)`);
  console.log(`   Content items: ${config.content.length}`);
  console.log(`   Layout: ${SLIDE_WIDTH}" x ${SLIDE_HEIGHT}" (16:9)`);
}

/**
 * Add a thin gradient accent bar on the left edge
 */
function addGradientAccentBar(slide: any): void {
  // PptxGenJS doesn't support native gradients on shapes, so we'll create
  // multiple thin rectangles with varying colors to simulate a gradient

  const steps = 20; // Number of gradient steps
  const barHeight = SLIDE_HEIGHT / steps;

  for (let i = 0; i < steps; i++) {
    // Interpolate between start and end colors
    const ratio = i / (steps - 1);
    const color = interpolateColor(ACCENT_GRADIENT_START, ACCENT_GRADIENT_END, ratio);

    slide.addShape("rect", {
      x: 0,
      y: i * barHeight,
      w: ACCENT_BAR_WIDTH,
      h: barHeight,
      fill: { color: color },
      line: { type: "none" }
    });
  }
}

/**
 * Interpolate between two hex colors
 */
function interpolateColor(color1: string, color2: string, ratio: number): string {
  const r1 = parseInt(color1.substring(0, 2), 16);
  const g1 = parseInt(color1.substring(2, 4), 16);
  const b1 = parseInt(color1.substring(4, 6), 16);
  
  const r2 = parseInt(color2.substring(0, 2), 16);
  const g2 = parseInt(color2.substring(2, 4), 16);
  const b2 = parseInt(color2.substring(4, 6), 16);
  
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  
  return `${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * Run a series of tests with different content
 */
export async function runTests(): Promise<void> {
  const outputDir = path.join(__dirname, "../../test-output");
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log("🚀 Starting PowerPoint generation tests...\n");
  
  // Test 1: Short content
  await createTestSlide({
    title: "Q4 Revenue Growth",
    subtitle: "Financial Performance Overview",
    content: [
      "Revenue increased 23% year-over-year",
      "Customer acquisition up 15%",
      "Retention rate: 94%"
    ],
    outputPath: path.join(outputDir, "test-1-short-content.pptx")
  });
  
  console.log("");
  
  // Test 2: Medium content
  await createTestSlide({
    title: "Product Roadmap 2024",
    subtitle: "Strategic Initiatives and Key Milestones",
    content: [
      "Q1: Launch mobile app with offline capabilities",
      "Q2: Implement AI-powered recommendations",
      "Q3: Expand to European markets",
      "Q4: Release enterprise features and SSO integration",
      "Ongoing: Performance optimization and user feedback integration"
    ],
    outputPath: path.join(outputDir, "test-2-medium-content.pptx")
  });
  
  console.log("");
  
  // Test 3: Long title and subtitle
  await createTestSlide({
    title: "Digital Transformation Strategy for Enterprise Organizations",
    subtitle: "Leveraging Cloud Technologies and AI to Drive Innovation and Competitive Advantage",
    content: [
      "Modernize legacy systems with cloud-native architecture",
      "Implement data-driven decision making across all departments",
      "Foster culture of innovation and continuous improvement"
    ],
    outputPath: path.join(outputDir, "test-3-long-titles.pptx")
  });
  
  console.log("");
  
  // Test 4: Minimal content
  await createTestSlide({
    title: "Vision",
    subtitle: "Our North Star",
    content: [
      "Empower every person and organization to achieve more"
    ],
    outputPath: path.join(outputDir, "test-4-minimal.pptx")
  });
  
  console.log("\n✨ All tests completed!");
  console.log(`📁 Output directory: ${outputDir}`);
  console.log("\n📊 Verification checklist:");
  console.log("   [ ] Title is 28pt font size");
  console.log("   [ ] Subtitle is 16pt font size in grey");
  console.log("   [ ] Content fits between subtitle and bottom margin");
  console.log("   [ ] Content respects left and right margins");
  console.log("   [ ] Blue-purple gradient accent bar on left edge");
  console.log("   [ ] Accent bar is thin and full height");
}

// Run tests if executed directly
if (require.main === module) {
  runTests().catch(console.error);
}


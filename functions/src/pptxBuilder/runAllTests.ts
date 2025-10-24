/**
 * Comprehensive PowerPoint Generation Test Runner
 * Runs all tests and generates a summary report
 */

import { runTests } from "./testSlideGeneration";
import { createVisualVerificationSlide } from "./visualVerificationTest";
import { runEndToEndTests } from "./endToEndTest";
import * as fs from "fs";
import * as path from "path";

/**
 * Run all PowerPoint generation tests
 */
async function runAllTests(): Promise<void> {
  console.log("╔═══════════════════════════════════════════════════════════════╗");
  console.log("║   PowerPoint Generation - Comprehensive Test Suite           ║");
  console.log("╚═══════════════════════════════════════════════════════════════╝\n");
  
  const startTime = Date.now();
  
  try {
    // Test Suite 1: Basic slide generation tests
    console.log("📦 Test Suite 1: Basic Slide Generation");
    console.log("─".repeat(65));
    await runTests();
    console.log("\n");
    
    // Test Suite 2: Visual verification with measurement guides
    console.log("📦 Test Suite 2: Visual Verification");
    console.log("─".repeat(65));
    await createVisualVerificationSlide();
    console.log("\n");
    
    // Test Suite 3: End-to-end integration tests
    console.log("📦 Test Suite 3: End-to-End Integration");
    console.log("─".repeat(65));
    await runEndToEndTests();
    console.log("\n");
    
    // Generate summary report
    const totalDuration = Date.now() - startTime;
    generateSummaryReport(totalDuration);
    
  } catch (error) {
    console.error("\n❌ Test suite failed:", error);
    process.exit(1);
  }
}

/**
 * Generate a summary report of all tests
 */
function generateSummaryReport(totalDuration: number): void {
  const outputDir = path.join(__dirname, "../../test-output");
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith(".pptx"));
  
  console.log("╔═══════════════════════════════════════════════════════════════╗");
  console.log("║                      TEST SUMMARY REPORT                      ║");
  console.log("╚═══════════════════════════════════════════════════════════════╝\n");
  
  console.log("✅ All test suites completed successfully!\n");
  
  console.log("📊 Test Results:");
  console.log(`   Total duration: ${totalDuration}ms`);
  console.log(`   Files generated: ${files.length}`);
  console.log(`   Output directory: ${outputDir}\n`);
  
  console.log("📁 Generated Files:");
  files.forEach((file, index) => {
    const filePath = path.join(outputDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`   ${index + 1}. ${file} (${sizeKB} KB)`);
  });
  
  console.log("\n" + "═".repeat(65));
  console.log("\n🎯 PRECISION BUILDER SPECIFICATIONS:");
  console.log("─".repeat(65));
  console.log("   ✓ Title Font Size:        26pt");
  console.log("   ✓ Subtitle Font Size:     14pt (grey color)");
  console.log("   ✓ Content Font Size:      12pt");
  console.log("   ✓ Content Area:           Maximized with tighter header spacing");
  console.log("   ✓ Margins:                Left: 0.6\", Right: 0.5\", Top: 0.35\", Bottom: 0.5\"");
  console.log("   ✓ Accent Bar:             Blue-purple gradient, 0.08\" wide, full height");
  console.log("   ✓ Layout:                 16:9 aspect ratio (10\" x 5.625\")");
  console.log("   ✓ Builder Priority:       Precision → Enhanced Premium → Layout → Hybrid → Premium → Minimal");
  
  console.log("\n" + "═".repeat(65));
  console.log("\n📋 MANUAL VERIFICATION CHECKLIST:");
  console.log("─".repeat(65));
  console.log("   [ ] Open each PPTX file in PowerPoint");
  console.log("   [ ] Select title text and verify font size is exactly 26pt");
  console.log("   [ ] Select subtitle text and verify font size is exactly 14pt");
  console.log("   [ ] Select content text and verify font size is exactly 12pt");
  console.log("   [ ] Verify subtitle color is grey (not black)");
  console.log("   [ ] Verify gradient accent bar appears on left edge");
  console.log("   [ ] Verify accent bar is thin (0.08\") and spans full slide height");
  console.log("   [ ] Verify accent bar has blue-to-purple gradient");
  console.log("   [ ] Verify title and subtitle are close together (tight spacing)");
  console.log("   [ ] Verify title and subtitle are positioned near top left");
  console.log("   [ ] Verify content area has more room than before");
  console.log("   [ ] Verify content fits within slide bounds");
  console.log("   [ ] Verify left margin is 0.6\" (content starts after accent bar)");
  console.log("   [ ] Verify right margin is 0.5\"");
  console.log("   [ ] Verify content doesn't overlap with title/subtitle");
  console.log("   [ ] Verify content doesn't extend beyond bottom margin");
  
  console.log("\n" + "═".repeat(65));
  console.log("\n💡 NEXT STEPS:");
  console.log("─".repeat(65));
  console.log("   1. Review all generated PowerPoint files");
  console.log("   2. Verify layout specifications match requirements");
  console.log("   3. Test with AI-generated content via the web interface");
  console.log("   4. Deploy to Firebase Functions when ready");
  
  console.log("\n" + "═".repeat(65));
  console.log("\n🚀 DEPLOYMENT COMMANDS:");
  console.log("─".repeat(65));
  console.log("   Build:   npm run build");
  console.log("   Test:    npm run test:pptx:e2e");
  console.log("   Deploy:  npm run deploy");
  
  console.log("\n" + "═".repeat(65) + "\n");
  
  // Write summary to file
  const summaryPath = path.join(outputDir, "TEST_SUMMARY.txt");
  const summaryContent = `
PowerPoint Generation Test Summary
Generated: ${new Date().toISOString()}
Total Duration: ${totalDuration}ms
Files Generated: ${files.length}

Specifications:
- Title Font Size: 26pt
- Subtitle Font Size: 14pt (grey)
- Content Font Size: 12pt
- Accent Bar: Blue-purple gradient, 0.08" wide, full height
- Margins: L=0.6", R=0.5", T=0.35", B=0.5"
- Layout: 16:9 (10" x 5.625")
- Header Spacing: Tighter (title and subtitle closer together)

Generated Files:
${files.map((f, i) => `${i + 1}. ${f}`).join("\n")}

All tests completed successfully!
`;
  
  fs.writeFileSync(summaryPath, summaryContent);
  console.log(`📄 Summary report saved to: ${summaryPath}\n`);
}

// Run all tests if executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}


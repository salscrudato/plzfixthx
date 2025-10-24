/**
 * End-to-End PowerPoint Generation Test
 * Tests the complete pipeline from SlideSpec to PPTX with precision builder
 */

import PptxGenJS from "pptxgenjs";
import * as fs from "fs";
import * as path from "path";
import type { SlideSpecV1 } from "../types/SlideSpecV1";
import { buildWithFallback } from "./orchestrator";

/**
 * Create a sample SlideSpec for testing
 */
function createSampleSlideSpec(): SlideSpecV1 {
  return {
    meta: {
      version: "1.0",
      locale: "en-US",
      theme: "Professional",
      aspectRatio: "16:9"
    },
    content: {
      title: {
        id: "title",
        text: "Q4 Revenue Performance"
      },
      subtitle: {
        id: "subtitle",
        text: "Financial Metrics and Growth Analysis"
      },
      bullets: [
        {
          id: "bullets-1",
          items: [
            { text: "Revenue increased 23% year-over-year to $4.2M", level: 1 },
            { text: "Customer acquisition up 15% with 1,200 new accounts", level: 1 },
            { text: "Customer retention rate improved to 94%", level: 1 },
            { text: "Average deal size grew 18% to $35K", level: 1 }
          ]
        }
      ],
      callouts: [
        {
          id: "callout-1",
          text: "Best quarter in company history",
          variant: "success"
        }
      ]
    },
    layout: {
      grid: { rows: 12, cols: 12, gutter: 0.2, margin: { t: 0.5, r: 0.5, b: 0.5, l: 0.6 } },
      regions: [
        { name: "header", rowStart: 0, colStart: 0, rowSpan: 2, colSpan: 12 },
        { name: "body", rowStart: 2, colStart: 0, rowSpan: 9, colSpan: 12 },
        { name: "footer", rowStart: 11, colStart: 0, rowSpan: 1, colSpan: 12 }
      ],
      anchors: [
        { refId: "title", region: "header", order: 1 },
        { refId: "subtitle", region: "header", order: 2 },
        { refId: "bullets-1", region: "body", order: 1 }
      ]
    },
    styleTokens: {
      palette: {
        primary: "#1E40AF",
        accent: "#06B6D4",
        neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0", "#F1F5F9", "#F8FAFC"]
      },
      typography: {
        fonts: {
          sans: "Arial",
          serif: "Georgia",
          mono: "Courier New"
        },
        sizes: {
          "step_-2": 10,
          "step_-1": 12,
          step_0: 14,
          step_1: 16,
          step_2: 20,
          step_3: 28
        },
        weights: {
          regular: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        },
        lineHeights: {
          compact: 1.25,
          standard: 1.5
        }
      },
      spacing: {
        base: 0.25,
        steps: [0.125, 0.25, 0.5, 1, 2]
      },
      radii: {
        sm: 0.05,
        md: 0.1,
        lg: 0.2
      },
      shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.05)",
        md: "0 4px 6px rgba(0,0,0,0.1)",
        lg: "0 10px 15px rgba(0,0,0,0.15)"
      },
      contrast: {
        minTextContrast: 4.5,
        minUiContrast: 3
      }
    }
  };
}

/**
 * Create a sample SlideSpec with data visualization
 */
function createDataVizSlideSpec(): SlideSpecV1 {
  return {
    meta: {
      version: "1.0",
      locale: "en-US",
      theme: "Professional",
      aspectRatio: "16:9"
    },
    content: {
      title: {
        id: "title",
        text: "Sales Performance by Region"
      },
      subtitle: {
        id: "subtitle",
        text: "Q4 2024 Regional Breakdown"
      },
      bullets: [
        {
          id: "bullets-1",
          items: [
            { text: "North America leads with 45% of total revenue", level: 1 },
            { text: "Europe shows strongest growth at 28% YoY", level: 1 },
            { text: "Asia-Pacific expanding rapidly with new markets", level: 1 }
          ]
        }
      ],
      dataViz: {
        id: "chart-1",
        kind: "bar",
        title: "Revenue by Region ($M)",
        labels: ["North America", "Europe", "Asia-Pacific", "Latin America"],
        series: [
          {
            name: "Q4 2024",
            values: [1.89, 1.26, 0.84, 0.21]
          }
        ],
        valueFormat: "currency"
      }
    },
    layout: {
      grid: { rows: 12, cols: 12, gutter: 0.2, margin: { t: 0.5, r: 0.5, b: 0.5, l: 0.6 } },
      regions: [
        { name: "header", rowStart: 0, colStart: 0, rowSpan: 2, colSpan: 12 },
        { name: "body", rowStart: 2, colStart: 0, rowSpan: 9, colSpan: 12 },
        { name: "footer", rowStart: 11, colStart: 0, rowSpan: 1, colSpan: 12 }
      ],
      anchors: [
        { refId: "title", region: "header", order: 1 },
        { refId: "subtitle", region: "header", order: 2 },
        { refId: "bullets-1", region: "body", order: 1 },
        { refId: "chart-1", region: "body", order: 2 }
      ]
    },
    styleTokens: {
      palette: {
        primary: "#1E40AF",
        accent: "#06B6D4",
        neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0", "#F1F5F9", "#F8FAFC"]
      },
      typography: {
        fonts: {
          sans: "Arial",
          serif: "Georgia",
          mono: "Courier New"
        },
        sizes: {
          "step_-2": 10,
          "step_-1": 12,
          step_0: 14,
          step_1: 16,
          step_2: 20,
          step_3: 28
        },
        weights: {
          regular: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        },
        lineHeights: {
          compact: 1.25,
          standard: 1.5
        }
      },
      spacing: {
        base: 0.25,
        steps: [0.125, 0.25, 0.5, 1, 2]
      },
      radii: {
        sm: 0.05,
        md: 0.1,
        lg: 0.2
      },
      shadows: {
        sm: "0 1px 2px rgba(0,0,0,0.05)",
        md: "0 4px 6px rgba(0,0,0,0.1)",
        lg: "0 10px 15px rgba(0,0,0,0.15)"
      },
      contrast: {
        minTextContrast: 4.5,
        minUiContrast: 3
      }
    }
  };
}

/**
 * Run end-to-end tests
 */
export async function runEndToEndTests(): Promise<void> {
  const outputDir = path.join(__dirname, "../../test-output");
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log("🚀 Running End-to-End PowerPoint Generation Tests\n");
  
  // Test 1: Basic slide with bullets and callout
  console.log("Test 1: Basic slide with bullets and callout");
  const spec1 = createSampleSlideSpec();
  const pptx1 = new PptxGenJS();
  pptx1.layout = "LAYOUT_16x9";
  
  const result1 = await buildWithFallback(pptx1, spec1);
  console.log(`   ✅ Build result: ${result1.stage} (${result1.totalDuration}ms)`);
  
  const buffer1 = await pptx1.write({ outputType: "nodebuffer" }) as Buffer;
  const outputPath1 = path.join(outputDir, "e2e-test-1-basic.pptx");
  fs.writeFileSync(outputPath1, buffer1);
  console.log(`   📁 Saved: ${outputPath1}\n`);
  
  // Test 2: Slide with data visualization
  console.log("Test 2: Slide with data visualization");
  const spec2 = createDataVizSlideSpec();
  const pptx2 = new PptxGenJS();
  pptx2.layout = "LAYOUT_16x9";
  
  const result2 = await buildWithFallback(pptx2, spec2);
  console.log(`   ✅ Build result: ${result2.stage} (${result2.totalDuration}ms)`);
  
  const buffer2 = await pptx2.write({ outputType: "nodebuffer" }) as Buffer;
  const outputPath2 = path.join(outputDir, "e2e-test-2-dataviz.pptx");
  fs.writeFileSync(outputPath2, buffer2);
  console.log(`   📁 Saved: ${outputPath2}\n`);
  
  console.log("✨ All end-to-end tests completed!\n");
  console.log("📊 Verification Checklist:");
  console.log("   [ ] Title is 28pt font size");
  console.log("   [ ] Subtitle is 16pt font size in grey");
  console.log("   [ ] Content fits between subtitle and bottom margin");
  console.log("   [ ] Content respects left and right margins");
  console.log("   [ ] Blue-purple gradient accent bar on left edge");
  console.log("   [ ] Accent bar is thin and full height");
  console.log("   [ ] All elements are properly positioned");
  console.log("\n💡 Open the generated files in PowerPoint to verify!");
}

// Run tests if executed directly
if (require.main === module) {
  runEndToEndTests().catch(console.error);
}


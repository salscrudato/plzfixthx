/**
 * Design Preview Component
 * Displays a preview of the current design system
 */

import React, { useMemo } from "react";
import type { SlideSpecV2 } from "@/types/SlideSpecV2";
import { LAYOUT_PATTERNS } from "@/lib/layoutPatterns";
import { validateDesignQuality, getQualityColor, getQualityInterpretation } from "@/lib/designQuality";

interface DesignPreviewProps {
  spec: SlideSpecV2;
}

export const DesignPreview: React.FC<DesignPreviewProps> = ({
  spec
}) => {
  const qualityScore = useMemo(() => validateDesignQuality(spec), [spec]);
  const pattern = LAYOUT_PATTERNS[spec.design.pattern];

  return (
    <div className="w-full space-y-6 p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Design Preview</h2>
        <p className="text-sm text-gray-600 mt-1">
          Professional slide design with quality metrics
        </p>
      </div>

      {/* Quality Score */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border-2" style={{ borderColor: getQualityColor(qualityScore.overall) }}>
          <div className="text-sm font-semibold text-gray-600">Overall Quality</div>
          <div className="text-3xl font-bold mt-2" style={{ color: getQualityColor(qualityScore.overall) }}>
            {qualityScore.overall}/100
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {getQualityInterpretation(qualityScore.overall)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Contrast</span>
            <span className="font-semibold text-gray-900">{qualityScore.contrast}%</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Hierarchy</span>
            <span className="font-semibold text-gray-900">{qualityScore.hierarchy}%</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">White Space</span>
            <span className="font-semibold text-gray-900">{qualityScore.whitespace}%</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Accessibility</span>
            <span className="font-semibold text-gray-900">{qualityScore.accessibility}%</span>
          </div>
        </div>
      </div>

      {/* Design Pattern */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Design Pattern</h3>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="font-medium text-gray-900">{pattern?.name}</div>
          <p className="text-sm text-gray-600 mt-1">{pattern?.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {pattern?.bestFor.map((use, idx) => (
              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                {use}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Color Palette</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600">Primary</div>
            <div
              className="w-full h-12 rounded-lg border-2 border-gray-200"
              style={{ backgroundColor: spec.styleTokens.palette.primary }}
            />
            <code className="text-xs text-gray-500">{spec.styleTokens.palette.primary}</code>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600">Accent</div>
            <div
              className="w-full h-12 rounded-lg border-2 border-gray-200"
              style={{ backgroundColor: spec.styleTokens.palette.accent }}
            />
            <code className="text-xs text-gray-500">{spec.styleTokens.palette.accent}</code>
          </div>
        </div>

        {/* Neutral Colors */}
        <div className="text-sm font-medium text-gray-600 mt-4">Neutral Scale</div>
        <div className="grid grid-cols-7 gap-2">
          {spec.styleTokens.palette.neutral.map((color, idx) => (
            <div key={idx} className="space-y-1">
              <div
                className="w-full h-8 rounded border border-gray-300"
                style={{ backgroundColor: color }}
              />
              <code className="text-xs text-gray-500 block text-center">{idx}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Typography</h3>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">Primary Font</div>
            <div className="text-2xl font-bold" style={{ fontFamily: spec.design.typography.fontPairing.primary }}>
              {spec.design.typography.fontPairing.primary}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">Secondary Font</div>
            <div className="text-lg" style={{ fontFamily: spec.design.typography.fontPairing.secondary }}>
              {spec.design.typography.fontPairing.secondary}
            </div>
          </div>
        </div>
      </div>

      {/* Issues & Warnings */}
      {(qualityScore.issues.length > 0 || qualityScore.warnings.length > 0) && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Design Feedback</h3>
          {qualityScore.issues.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm font-semibold text-red-900 mb-2">Issues</div>
              <ul className="space-y-1">
                {qualityScore.issues.map((issue, idx) => (
                  <li key={idx} className="text-sm text-red-800">
                    • {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {qualityScore.warnings.length > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm font-semibold text-yellow-900 mb-2">Warnings</div>
              <ul className="space-y-1">
                {qualityScore.warnings.map((warning, idx) => (
                  <li key={idx} className="text-sm text-yellow-800">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DesignPreview;


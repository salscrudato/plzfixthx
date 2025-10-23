/**
 * Design System UI Component
 * Showcases all available design system options
 */

import React, { useState } from "react";
import { PROFESSIONAL_PALETTES, getPaletteNames } from "@/lib/colorPalettes";
import { TYPOGRAPHY_PAIRS, getTypographyPairNames } from "@/lib/typographyPairs";
import { LAYOUT_PATTERNS, getLayoutPatternNames } from "@/lib/layoutPatterns";

interface DesignSystemUIProps {
  onSelectPalette?: (paletteName: string) => void;
  onSelectTypography?: (typographyName: string) => void;
  onSelectPattern?: (patternName: string) => void;
}

export const DesignSystemUI: React.FC<DesignSystemUIProps> = ({
  onSelectPalette,
  onSelectTypography,
  onSelectPattern
}) => {
  const [activeTab, setActiveTab] = useState<"palettes" | "typography" | "patterns">("palettes");

  return (
    <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("palettes")}
          className={`flex-1 px-4 py-3 font-medium text-center transition-colors ${
            activeTab === "palettes"
              ? "bg-blue-50 text-blue-700 border-b-2 border-blue-700"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Color Palettes
        </button>
        <button
          onClick={() => setActiveTab("typography")}
          className={`flex-1 px-4 py-3 font-medium text-center transition-colors ${
            activeTab === "typography"
              ? "bg-blue-50 text-blue-700 border-b-2 border-blue-700"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Typography
        </button>
        <button
          onClick={() => setActiveTab("patterns")}
          className={`flex-1 px-4 py-3 font-medium text-center transition-colors ${
            activeTab === "patterns"
              ? "bg-blue-50 text-blue-700 border-b-2 border-blue-700"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Patterns
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Palettes Tab */}
        {activeTab === "palettes" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getPaletteNames().map(paletteName => {
                const palette = PROFESSIONAL_PALETTES[paletteName];
                return (
                  <div
                    key={paletteName}
                    onClick={() => onSelectPalette?.(paletteName)}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900 mb-3">{palette.name}</h3>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div
                          className="flex-1 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: palette.primary }}
                          title="Primary"
                        />
                        <div
                          className="flex-1 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: palette.accent }}
                          title="Accent"
                        />
                      </div>
                      <div className="flex gap-1">
                        {palette.neutral.map((color, idx) => (
                          <div
                            key={idx}
                            className="flex-1 h-6 rounded border border-gray-300"
                            style={{ backgroundColor: color }}
                            title={`Neutral ${idx}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-3">{palette.use}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Typography Tab */}
        {activeTab === "typography" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getTypographyPairNames().map(typographyName => {
                const typography = TYPOGRAPHY_PAIRS[typographyName];
                return (
                  <div
                    key={typographyName}
                    onClick={() => onSelectTypography?.(typographyName)}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900 mb-3">{typography.name}</h3>
                    <div className="space-y-3">
                      <div>
                        <div
                          className="text-2xl font-bold"
                          style={{ fontFamily: typography.primary }}
                        >
                          Primary Font
                        </div>
                        <code className="text-xs text-gray-500">{typography.primary}</code>
                      </div>
                      <div>
                        <div style={{ fontFamily: typography.secondary }}>
                          Secondary Font
                        </div>
                        <code className="text-xs text-gray-500">{typography.secondary}</code>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-3">{typography.use}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Patterns Tab */}
        {activeTab === "patterns" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getLayoutPatternNames().map(patternName => {
                const pattern = LAYOUT_PATTERNS[patternName];
                return (
                  <div
                    key={patternName}
                    onClick={() => onSelectPattern?.(patternName)}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900 mb-3">{pattern.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-600 mb-2">Best for:</div>
                      <div className="flex flex-wrap gap-1">
                        {pattern.bestFor.map((use, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {use}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      White Space: {pattern.whitespacePercentage}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignSystemUI;


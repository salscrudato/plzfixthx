/**
 * PPTX Builder Module
 * Exports all PPTX building utilities
 */

export * from "./designTokenMapper";
export * from "./patterns";
export * from "./slideBuilder";
export * from "./chartBuilder";
export * from "./premiumComponents";
export * from "./shapeHelpers";

// Re-export commonly used functions
export {
  buildProfessionalSlide,
  buildProfessionalSlide as buildSlide
} from "./slideBuilder";

export {
  buildChart,
  buildBarChart,
  buildLineChart,
  buildPieChart,
  buildAreaChart,
  validateChartConfig,
  getRecommendedChartType
} from "./chartBuilder";

export {
  getRegionsForPattern,
  validatePatternRegions,
  calculateWhitespacePercentage
} from "./patterns";

export {
  addConnectorArrow,
  addCurvedConnector,
  addCalloutBox,
  addProcessFlow,
  addMetricCard,
  addComparisonBox
} from "./shapeHelpers";

export {
  mapColorPalette,
  mapTypography,
  mapShadows,
  mapSpacing,
  mapRadii,
  getCompleteTokenMap,
  validateDesignTokens
} from "./designTokenMapper";


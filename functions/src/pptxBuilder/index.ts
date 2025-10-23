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
export * from "./advancedShapes";
export * from "./enhancedDataViz";
export * from "./iconLibrary";
export * from "./enhancedAnimations";
export * from "./whitespaceManager";
export * from "./professionalTemplates";
export * from "./designAccents";

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
  addCalloutBox,
  addProcessFlow,
  addMetricCard,
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

// Advanced shapes
export {
  addDirectionalArrow,
  addCurvedConnector,
  addProgressBar,
  addStepIndicator,
  addComparisonBox,
  addHighlightBadge,
  addEmphasisBackground,
  addVerticalDivider,
  addHorizontalDivider
} from "./advancedShapes";

// Enhanced data visualization
export {
  addChartHeader,
  addChartAnnotations,
  addCustomLegend,
  addMetricHighlight,
  addTrendIndicator,
  addComparisonBar
} from "./enhancedDataViz";

// Icon library
export {
  addIcon,
  type IconType
} from "./iconLibrary";

// Enhanced animations
export {
  createAnimation,
  getRecommendedAnimation,
  getAnimationDuration,
  createStaggerConfig,
  getEasingCurve,
  calculateSequenceTiming,
  getAnimationPreset,
  validateAnimationConfig,
  getAnimationMetadata,
  type AnimationType,
  type AnimationConfig,
  type StaggerConfig
} from "./enhancedAnimations";

// Whitespace management
export {
  getSpacing,
  createUniformPadding,
  createUniformMargin,
  createCustomPadding,
  createCustomMargin,
  calculateContentWidth,
  calculateContentHeight,
  getRecommendedLineHeight,
  getRecommendedParagraphSpacing,
  calculateVerticalRhythm,
  getBreathingRoomPercentage,
  validateBreathingRoom,
  getContentMargin,
  getContainerPadding,
  calculateGridGap,
  calculateColumnWidth,
  getRecommendedSectionSpacing,
  getOptimalSlideMargins,
  getTextBoxPadding,
  getListItemSpacing,
  getElementSpacing,
  validateLayoutSpacing,
  SPACING_SCALE,
  type SpacingConfig,
  type PaddingConfig,
  type MarginConfig
} from "./whitespaceManager";

// Professional templates
export {
  getAllTemplates,
  getTemplate,
  getTemplatesByUseCase,
  getTemplateLayout,
  getRecommendedTemplate,
  validateTemplate,
  createCustomTemplate,
  getTemplateStats,
  TITLE_SLIDE_TEMPLATE,
  CONTENT_SLIDE_TEMPLATE,
  TWO_COLUMN_TEMPLATE,
  THREE_COLUMN_TEMPLATE,
  DATA_VIZ_TEMPLATE,
  IMAGE_FOCUS_TEMPLATE,
  TIMELINE_TEMPLATE,
  CENTERED_FOCUS_TEMPLATE,
  SIDEBAR_TEMPLATE,
  STACKED_TEMPLATE,
  MINIMAL_TEMPLATE,
  FULL_BLEED_TEMPLATE,
  type TemplateConfig,
  type TemplateLayout
} from "./professionalTemplates";


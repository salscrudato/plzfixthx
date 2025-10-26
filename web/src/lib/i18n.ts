/**
 * Internationalization (i18n) utilities for plzfixthx
 * Supports locale-aware formatting and translations
 */

export type Locale = "en" | "es" | "fr" | "de" | "ja" | "zh";

interface I18nConfig {
  locale: Locale;
  dateFormat: "short" | "long";
  numberFormat: "en-US" | "de-DE" | "fr-FR" | "ja-JP" | "zh-CN";
}

const defaultConfig: I18nConfig = {
  locale: "en",
  dateFormat: "short",
  numberFormat: "en-US",
};

let currentConfig = { ...defaultConfig };

/**
 * Get current locale
 */
export function getLocale(): Locale {
  return currentConfig.locale;
}

/**
 * Set locale
 */
export function setLocale(locale: Locale): void {
  currentConfig.locale = locale;
  // Update document language
  document.documentElement.lang = locale;
}

/**
 * Format number according to current locale
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(currentConfig.numberFormat, options).format(value);
}

/**
 * Format currency according to current locale
 */
export function formatCurrency(value: number, currency: string = "USD"): string {
  return new Intl.NumberFormat(currentConfig.numberFormat, {
    style: "currency",
    currency,
  }).format(value);
}

/**
 * Format date according to current locale
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions =
    currentConfig.dateFormat === "short"
      ? { year: "numeric", month: "short", day: "numeric" }
      : { year: "numeric", month: "long", day: "numeric", weekday: "long" };

  return new Intl.DateTimeFormat(currentConfig.numberFormat, {
    ...defaultOptions,
    ...options,
  }).format(dateObj);
}

/**
 * Format time according to current locale
 */
export function formatTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(currentConfig.numberFormat, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    ...options,
  }).format(dateObj);
}

/**
 * Translation strings
 */
const translations: Record<Locale, Record<string, string>> = {
  en: {
    "app.title": "plsfixthx",
    "app.subtitle": "Create beautiful, professional slides with AI",
    "app.description": "Powered by advanced AI • Consulting-firm quality • Ready to export",
    "input.placeholder": "Describe your slide... (e.g., 'Q3 revenue growth strategy')",
    "button.generate": "Generate",
    "button.generating": "Generating...",
    "button.download.pptx": "PowerPoint",
    "button.download.pdf": "PDF",
    "button.download.png": "PNG",
    "button.create-another": "Create Another",
    "preview.title": "Your Slide Preview",
    "preview.subtitle": "Professional quality, ready to download",
    "error.title": "Error generating slide",
    "aria.skip-to-content": "Skip to main content",
    "aria.slide-prompt": "Slide prompt input",
    "aria.generate-slide": "Generate slide",
    "aria.download-pptx": "Download slide as PowerPoint presentation",
    "aria.download-pdf": "Download slide as PDF document",
    "aria.download-png": "Download slide as PNG image",
    "aria.create-another": "Create another slide",
  },
  es: {
    "app.title": "plsfixthx",
    "app.subtitle": "Crea diapositivas hermosas y profesionales con IA",
    "app.description": "Impulsado por IA avanzada • Calidad de firma de consultoría • Listo para exportar",
    "input.placeholder": "Describe tu diapositiva... (p. ej., 'Estrategia de crecimiento de ingresos Q3')",
    "button.generate": "Generar",
    "button.generating": "Generando...",
    "button.download.pptx": "PowerPoint",
    "button.download.pdf": "PDF",
    "button.download.png": "PNG",
    "button.create-another": "Crear Otro",
    "preview.title": "Vista Previa de Tu Diapositiva",
    "preview.subtitle": "Calidad profesional, listo para descargar",
    "error.title": "Error al generar diapositiva",
    "aria.skip-to-content": "Saltar al contenido principal",
    "aria.slide-prompt": "Entrada de solicitud de diapositiva",
    "aria.generate-slide": "Generar diapositiva",
    "aria.download-pptx": "Descargar diapositiva como presentación de PowerPoint",
    "aria.download-pdf": "Descargar diapositiva como documento PDF",
    "aria.download-png": "Descargar diapositiva como imagen PNG",
    "aria.create-another": "Crear otra diapositiva",
  },
  fr: {
    "app.title": "plsfixthx",
    "app.subtitle": "Créez de belles diapositives professionnelles avec l'IA",
    "app.description": "Alimenté par l'IA avancée • Qualité de cabinet de conseil • Prêt à exporter",
    "input.placeholder": "Décrivez votre diapositive... (p. ex., 'Stratégie de croissance des revenus Q3')",
    "button.generate": "Générer",
    "button.generating": "Génération en cours...",
    "button.download.pptx": "PowerPoint",
    "button.download.pdf": "PDF",
    "button.download.png": "PNG",
    "button.create-another": "Créer un Autre",
    "preview.title": "Aperçu de Votre Diapositive",
    "preview.subtitle": "Qualité professionnelle, prêt à télécharger",
    "error.title": "Erreur lors de la génération de la diapositive",
    "aria.skip-to-content": "Aller au contenu principal",
    "aria.slide-prompt": "Entrée d'invite de diapositive",
    "aria.generate-slide": "Générer une diapositive",
    "aria.download-pptx": "Télécharger la diapositive en tant que présentation PowerPoint",
    "aria.download-pdf": "Télécharger la diapositive en tant que document PDF",
    "aria.download-png": "Télécharger la diapositive en tant qu'image PNG",
    "aria.create-another": "Créer une autre diapositive",
  },
  de: {
    "app.title": "plsfixthx",
    "app.subtitle": "Erstellen Sie schöne, professionelle Folien mit KI",
    "app.description": "Angetrieben durch fortschrittliche KI • Beratungsqualität • Exportbereit",
    "input.placeholder": "Beschreiben Sie Ihre Folie... (z. B. 'Q3-Umsatzwachstumsstrategie')",
    "button.generate": "Generieren",
    "button.generating": "Wird generiert...",
    "button.download.pptx": "PowerPoint",
    "button.download.pdf": "PDF",
    "button.download.png": "PNG",
    "button.create-another": "Weitere Erstellen",
    "preview.title": "Ihre Folienvorschau",
    "preview.subtitle": "Professionelle Qualität, exportbereit",
    "error.title": "Fehler beim Generieren der Folie",
    "aria.skip-to-content": "Zum Hauptinhalt springen",
    "aria.slide-prompt": "Folieneingabeaufforderung",
    "aria.generate-slide": "Folie generieren",
    "aria.download-pptx": "Folie als PowerPoint-Präsentation herunterladen",
    "aria.download-pdf": "Folie als PDF-Dokument herunterladen",
    "aria.download-png": "Folie als PNG-Bild herunterladen",
    "aria.create-another": "Weitere Folie erstellen",
  },
  ja: {
    "app.title": "plsfixthx",
    "app.subtitle": "AIで美しくプロフェッショナルなスライドを作成",
    "app.description": "高度なAIを搭載 • コンサルティング企業品質 • エクスポート準備完了",
    "input.placeholder": "スライドを説明してください... (例: 'Q3売上成長戦略')",
    "button.generate": "生成",
    "button.generating": "生成中...",
    "button.download.pptx": "PowerPoint",
    "button.download.pdf": "PDF",
    "button.download.png": "PNG",
    "button.create-another": "別のスライドを作成",
    "preview.title": "スライドプレビュー",
    "preview.subtitle": "プロフェッショナル品質、ダウンロード準備完了",
    "error.title": "スライド生成エラー",
    "aria.skip-to-content": "メインコンテンツにスキップ",
    "aria.slide-prompt": "スライドプロンプト入力",
    "aria.generate-slide": "スライドを生成",
    "aria.download-pptx": "スライドをPowerPoint形式でダウンロード",
    "aria.download-pdf": "スライドをPDF形式でダウンロード",
    "aria.download-png": "スライドをPNG形式でダウンロード",
    "aria.create-another": "別のスライドを作成",
  },
  zh: {
    "app.title": "plsfixthx",
    "app.subtitle": "使用AI创建美观的专业幻灯片",
    "app.description": "由先进的AI驱动 • 咨询公司质量 • 准备导出",
    "input.placeholder": "描述您的幻灯片... (例如: 'Q3收入增长战略')",
    "button.generate": "生成",
    "button.generating": "生成中...",
    "button.download.pptx": "PowerPoint",
    "button.download.pdf": "PDF",
    "button.download.png": "PNG",
    "button.create-another": "创建另一个",
    "preview.title": "您的幻灯片预览",
    "preview.subtitle": "专业质量，准备下载",
    "error.title": "生成幻灯片出错",
    "aria.skip-to-content": "跳到主要内容",
    "aria.slide-prompt": "幻灯片提示输入",
    "aria.generate-slide": "生成幻灯片",
    "aria.download-pptx": "将幻灯片下载为PowerPoint演示文稿",
    "aria.download-pdf": "将幻灯片下载为PDF文档",
    "aria.download-png": "将幻灯片下载为PNG图像",
    "aria.create-another": "创建另一个幻灯片",
  },
};

/**
 * Get translated string
 */
export function t(key: string, defaultValue?: string): string {
  const locale = currentConfig.locale;
  const localeTranslations = translations[locale];
  return localeTranslations?.[key] ?? defaultValue ?? key;
}

/**
 * Initialize i18n with browser locale
 */
export function initI18n(): void {
  const browserLocale = navigator.language.split("-")[0] as Locale;
  const supportedLocales: Locale[] = ["en", "es", "fr", "de", "ja", "zh"];
  const locale = supportedLocales.includes(browserLocale) ? browserLocale : "en";
  setLocale(locale);
}


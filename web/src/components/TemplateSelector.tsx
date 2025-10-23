import { useState } from "react";
import { TEMPLATES, type Template } from "@/lib/templates";

interface TemplateSelectorProps {
  selectedTemplateId?: string;
  onSelectTemplate: (template: Template) => void;
}

export function TemplateSelector({ selectedTemplateId, onSelectTemplate }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<Template["category"] | "all">("all");

  const categories: Array<{ id: Template["category"] | "all"; label: string; icon: string }> = [
    { id: "all", label: "All", icon: "📋" },
    { id: "business", label: "Business", icon: "💼" },
    { id: "education", label: "Education", icon: "🎓" },
    { id: "marketing", label: "Marketing", icon: "📊" },
    { id: "creative", label: "Creative", icon: "🎨" },
    { id: "minimal", label: "Minimal", icon: "⚪" },
  ];

  const filteredTemplates =
    selectedCategory === "all"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[var(--neutral-1)]">Choose a Template</h3>
        <button
          onClick={() => setSelectedCategory("all")}
          className="text-sm text-[var(--color-primary)] hover:underline"
        >
          View All
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? "bg-[var(--color-primary)] text-white shadow-md"
                : "bg-white border border-[var(--neutral-7)] text-[var(--neutral-2)] hover:border-[var(--color-primary)]"
            }`}
          >
            <span>{cat.icon}</span>
            <span className="text-sm font-medium">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className={`group relative p-4 rounded-xl border-2 transition-all hover:shadow-lg ${
              selectedTemplateId === template.id
                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-md"
                : "border-[var(--neutral-7)] bg-white hover:border-[var(--color-primary)]"
            }`}
          >
            {/* Thumbnail */}
            <div className="aspect-video bg-gradient-to-br from-[var(--neutral-8)] to-[var(--neutral-9)] rounded-lg mb-3 flex items-center justify-center text-4xl">
              {template.thumbnail}
            </div>

            {/* Template Info */}
            <div className="text-left">
              <h4 className="text-sm font-semibold text-[var(--neutral-1)] mb-1 group-hover:text-[var(--color-primary)]">
                {template.name}
              </h4>
              <p className="text-xs text-[var(--neutral-4)] line-clamp-2">
                {template.description}
              </p>
            </div>

            {/* Selected Indicator */}
            {selectedTemplateId === template.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}

            {/* Color Preview */}
            <div className="flex gap-1 mt-2">
              <div
                className="w-4 h-4 rounded-full border border-[var(--neutral-7)]"
                style={{ backgroundColor: template.spec.styleTokens?.palette.primary }}
              />
              <div
                className="w-4 h-4 rounded-full border border-[var(--neutral-7)]"
                style={{ backgroundColor: template.spec.styleTokens?.palette.accent }}
              />
            </div>
          </button>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-[var(--neutral-4)]">
          <p>No templates found in this category</p>
        </div>
      )}
    </div>
  );
}


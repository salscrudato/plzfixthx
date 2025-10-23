import { useState } from "react";
import { Link, Search, Palette, X } from "lucide-react";

type ImageRole = "hero" | "logo" | "illustration" | "icon" | "background";
type ImageSourceType = "url" | "unsplash" | "placeholder";

interface ImageData {
  role: ImageRole;
  source: {
    type: ImageSourceType;
    url?: string;
    query?: string;
  };
  alt: string;
  fit?: "cover" | "contain" | "fill";
}

interface ImageIntegrationProps {
  onAddImage: (image: ImageData) => void;
  onClose: () => void;
}

export function ImageIntegration({ onAddImage, onClose }: ImageIntegrationProps) {
  const [imageData, setImageData] = useState<ImageData>({
    role: "hero",
    source: { type: "unsplash", query: "" },
    alt: "",
    fit: "cover"
  });

  const roles: Array<{ role: ImageRole; label: string; description: string; size: string }> = [
    { role: "hero", label: "Hero Image", description: "Large featured image", size: "60-70% of slide" },
    { role: "logo", label: "Logo", description: "Brand identity", size: "1x1 inch" },
    { role: "illustration", label: "Illustration", description: "Supporting visual", size: "30-40% of slide" },
    { role: "icon", label: "Icon", description: "Small decorative", size: "0.5x0.5 inch" },
    { role: "background", label: "Background", description: "Full slide background", size: "Full slide" }
  ];

  const sourceTypes: Array<{ type: ImageSourceType; label: string; icon: any; description: string }> = [
    { type: "unsplash", label: "Unsplash", icon: Search, description: "High-quality stock photos" },
    { type: "url", label: "URL", icon: Link, description: "Image from web URL" },
    { type: "placeholder", label: "Placeholder", icon: Palette, description: "Generated placeholder" }
  ];

  const suggestedQueries: Record<string, string[]> = {
    business: ["business professional office modern", "corporate team meeting", "business handshake"],
    tech: ["technology abstract digital blue", "coding programming laptop", "data visualization"],
    finance: ["finance growth chart business", "money investment banking", "stock market trading"],
    healthcare: ["healthcare medical professional", "hospital doctor nurse", "medical technology"],
    marketing: ["marketing creative design colorful", "social media advertising", "brand strategy"]
  };

  const handleSubmit = () => {
    onAddImage(imageData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[var(--neutral-7)] p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--neutral-1)]">Add Image</h2>
            <p className="text-sm text-[var(--neutral-3)]">Enhance your slide with visuals</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--neutral-8)] rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image Role */}
          <div>
            <label className="block text-sm font-semibold text-[var(--neutral-2)] mb-3">
              Image Role
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roles.map((role) => (
                <button
                  key={role.role}
                  onClick={() => setImageData({ ...imageData, role: role.role })}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    imageData.role === role.role
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                      : "border-[var(--neutral-7)] hover:border-[var(--color-primary)]/50"
                  }`}
                >
                  <div className="font-semibold text-sm text-[var(--neutral-1)]">{role.label}</div>
                  <div className="text-xs text-[var(--neutral-4)] mt-1">{role.description}</div>
                  <div className="text-xs text-[var(--color-primary)] mt-1 font-medium">{role.size}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Source Type */}
          <div>
            <label className="block text-sm font-semibold text-[var(--neutral-2)] mb-3">
              Image Source
            </label>
            <div className="grid grid-cols-3 gap-3">
              {sourceTypes.map((source) => {
                const Icon = source.icon;
                return (
                  <button
                    key={source.type}
                    onClick={() => setImageData({ ...imageData, source: { type: source.type } })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      imageData.source.type === source.type
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                        : "border-[var(--neutral-7)] hover:border-[var(--color-primary)]/50"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 mx-auto ${imageData.source.type === source.type ? "text-[var(--color-primary)]" : "text-[var(--neutral-3)]"}`} />
                    <div className="font-semibold text-sm text-[var(--neutral-1)] text-center">{source.label}</div>
                    <div className="text-xs text-[var(--neutral-4)] mt-1 text-center">{source.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Source-specific inputs */}
          {imageData.source.type === "unsplash" && (
            <div>
              <label className="block text-sm font-semibold text-[var(--neutral-2)] mb-2">
                Search Query
              </label>
              <input
                type="text"
                value={imageData.source.query || ""}
                onChange={(e) => setImageData({ ...imageData, source: { ...imageData.source, query: e.target.value } })}
                placeholder="e.g., business professional office modern"
                className="w-full px-4 py-3 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none"
              />
              
              {/* Suggested Queries */}
              <div className="mt-3">
                <p className="text-xs text-[var(--neutral-4)] mb-2">Suggested queries:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(suggestedQueries).map(([category, queries]) => (
                    <div key={category} className="space-y-1">
                      <p className="text-xs font-semibold text-[var(--neutral-3)] capitalize">{category}:</p>
                      {queries.map((query) => (
                        <button
                          key={query}
                          onClick={() => setImageData({ ...imageData, source: { type: "unsplash", query } })}
                          className="text-xs px-2 py-1 bg-[var(--neutral-8)] hover:bg-[var(--color-primary)]/10 text-[var(--neutral-2)] rounded mr-1"
                        >
                          {query}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {imageData.source.type === "url" && (
            <div>
              <label className="block text-sm font-semibold text-[var(--neutral-2)] mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={imageData.source.url || ""}
                onChange={(e) => setImageData({ ...imageData, source: { ...imageData.source, url: e.target.value } })}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none"
              />
            </div>
          )}

          {imageData.source.type === "placeholder" && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                A placeholder image will be generated with your slide's color scheme.
              </p>
            </div>
          )}

          {/* Alt Text */}
          <div>
            <label className="block text-sm font-semibold text-[var(--neutral-2)] mb-2">
              Alt Text (for accessibility)
            </label>
            <input
              type="text"
              value={imageData.alt}
              onChange={(e) => setImageData({ ...imageData, alt: e.target.value })}
              placeholder="Describe the image for screen readers"
              className="w-full px-4 py-3 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none"
            />
          </div>

          {/* Image Fit */}
          <div>
            <label className="block text-sm font-semibold text-[var(--neutral-2)] mb-2">
              Image Fit
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "cover", label: "Cover", description: "Fill area, crop if needed" },
                { value: "contain", label: "Contain", description: "Fit within area" },
                { value: "fill", label: "Fill", description: "Stretch to fill" }
              ].map((fit) => (
                <button
                  key={fit.value}
                  onClick={() => setImageData({ ...imageData, fit: fit.value as any })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    imageData.fit === fit.value
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                      : "border-[var(--neutral-7)] hover:border-[var(--color-primary)]/50"
                  }`}
                >
                  <div className="font-semibold text-sm text-[var(--neutral-1)]">{fit.label}</div>
                  <div className="text-xs text-[var(--neutral-4)] mt-1">{fit.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-[var(--neutral-7)] text-[var(--neutral-2)] font-semibold rounded-xl hover:bg-[var(--neutral-8)] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                (imageData.source.type === "unsplash" && !imageData.source.query) ||
                (imageData.source.type === "url" && !imageData.source.url) ||
                !imageData.alt.trim()
              }
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              Add Image to Slide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


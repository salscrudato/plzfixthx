import { useState } from "react";
import { Palette, Type, Image, Save, Plus, Trash2, Check } from "lucide-react";

interface BrandKit {
  id: string;
  name: string;
  colors: {
    primary: string;
    accent: string;
    neutral: string[];
  };
  fonts: {
    heading: string;
    body: string;
  };
  logo?: {
    url: string;
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  };
}

interface BrandKitManagerProps {
  currentKit?: BrandKit;
  savedKits: BrandKit[];
  onSaveKit: (kit: BrandKit) => void;
  onApplyKit: (kit: BrandKit) => void;
  onDeleteKit: (id: string) => void;
}

export function BrandKitManager({ currentKit, savedKits, onSaveKit, onApplyKit, onDeleteKit }: BrandKitManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingKit, setEditingKit] = useState<BrandKit>(
    currentKit || {
      id: "",
      name: "",
      colors: {
        primary: "#3B82F6",
        accent: "#10B981",
        neutral: ["#0F172A", "#1E293B", "#334155", "#64748B", "#94A3B8", "#CBD5E1", "#F8FAFC"]
      },
      fonts: {
        heading: "Inter",
        body: "Inter"
      }
    }
  );

  const popularFonts = [
    "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins",
    "Raleway", "Nunito", "Playfair Display", "Merriweather"
  ];

  const handleSave = () => {
    const kitToSave = {
      ...editingKit,
      id: editingKit.id || `kit-${Date.now()}`
    };
    onSaveKit(kitToSave);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-[var(--neutral-7)] p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--neutral-1)]">Brand Kit</h2>
            <p className="text-sm text-[var(--neutral-3)]">Maintain consistent branding</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {isEditing ? "Cancel" : "Create New"}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-6 p-6 bg-[var(--neutral-8)] rounded-xl">
          {/* Kit Name */}
          <div>
            <label className="block text-sm font-semibold text-[var(--neutral-2)] mb-2">
              Brand Kit Name
            </label>
            <input
              type="text"
              value={editingKit.name}
              onChange={(e) => setEditingKit({ ...editingKit, name: e.target.value })}
              placeholder="e.g., Company Brand 2024"
              className="w-full px-4 py-3 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none bg-white"
            />
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-semibold text-[var(--neutral-2)] mb-3">
              Brand Colors
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--neutral-3)] mb-2">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={editingKit.colors.primary}
                    onChange={(e) => setEditingKit({
                      ...editingKit,
                      colors: { ...editingKit.colors, primary: e.target.value }
                    })}
                    className="w-16 h-12 rounded-lg border border-[var(--neutral-7)] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editingKit.colors.primary}
                    onChange={(e) => setEditingKit({
                      ...editingKit,
                      colors: { ...editingKit.colors, primary: e.target.value }
                    })}
                    className="flex-1 px-3 py-2 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] outline-none bg-white font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[var(--neutral-3)] mb-2">Accent Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={editingKit.colors.accent}
                    onChange={(e) => setEditingKit({
                      ...editingKit,
                      colors: { ...editingKit.colors, accent: e.target.value }
                    })}
                    className="w-16 h-12 rounded-lg border border-[var(--neutral-7)] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editingKit.colors.accent}
                    onChange={(e) => setEditingKit({
                      ...editingKit,
                      colors: { ...editingKit.colors, accent: e.target.value }
                    })}
                    className="flex-1 px-3 py-2 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] outline-none bg-white font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fonts */}
          <div>
            <label className="block text-sm font-semibold text-[var(--neutral-2)] mb-3 flex items-center gap-2">
              <Type className="w-4 h-4" />
              Typography
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--neutral-3)] mb-2">Heading Font</label>
                <select
                  value={editingKit.fonts.heading}
                  onChange={(e) => setEditingKit({
                    ...editingKit,
                    fonts: { ...editingKit.fonts, heading: e.target.value }
                  })}
                  className="w-full px-4 py-3 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] outline-none bg-white"
                >
                  {popularFonts.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-[var(--neutral-3)] mb-2">Body Font</label>
                <select
                  value={editingKit.fonts.body}
                  onChange={(e) => setEditingKit({
                    ...editingKit,
                    fonts: { ...editingKit.fonts, body: e.target.value }
                  })}
                  className="w-full px-4 py-3 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] outline-none bg-white"
                >
                  {popularFonts.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm font-semibold text-[var(--neutral-2)] mb-3 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Logo (Optional)
            </label>
            <input
              type="url"
              value={editingKit.logo?.url || ""}
              onChange={(e) => setEditingKit({
                ...editingKit,
                logo: { url: e.target.value, position: editingKit.logo?.position || "top-right" }
              })}
              placeholder="https://example.com/logo.png"
              className="w-full px-4 py-3 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none bg-white"
            />
            {editingKit.logo?.url && (
              <div className="mt-3">
                <label className="block text-xs text-[var(--neutral-3)] mb-2">Logo Position</label>
                <div className="grid grid-cols-2 gap-2">
                  {["top-left", "top-right", "bottom-left", "bottom-right"].map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setEditingKit({
                        ...editingKit,
                        logo: { ...editingKit.logo!, position: pos as any }
                      })}
                      className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                        editingKit.logo?.position === pos
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                          : "border-[var(--neutral-7)] hover:border-[var(--color-primary)]/50"
                      }`}
                    >
                      {pos.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!editingKit.name.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Brand Kit
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {savedKits.length === 0 ? (
            <div className="text-center py-12">
              <Palette className="w-16 h-16 text-[var(--neutral-5)] mx-auto mb-4" />
              <p className="text-[var(--neutral-3)]">No brand kits saved yet</p>
              <p className="text-sm text-[var(--neutral-4)] mt-2">Create your first brand kit to maintain consistent branding</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedKits.map((kit) => (
                <div
                  key={kit.id}
                  className="p-4 border-2 border-[var(--neutral-7)] rounded-xl hover:border-[var(--color-primary)] transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-[var(--neutral-1)]">{kit.name}</h3>
                    <button
                      onClick={() => onDeleteKit(kit.id)}
                      className="p-1 hover:bg-red-50 text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div
                        className="w-8 h-8 rounded-lg border border-[var(--neutral-7)]"
                        style={{ backgroundColor: kit.colors.primary }}
                        title="Primary"
                      />
                      <div
                        className="w-8 h-8 rounded-lg border border-[var(--neutral-7)]"
                        style={{ backgroundColor: kit.colors.accent }}
                        title="Accent"
                      />
                    </div>

                    <div className="text-xs text-[var(--neutral-3)]">
                      <p><strong>Heading:</strong> {kit.fonts.heading}</p>
                      <p><strong>Body:</strong> {kit.fonts.body}</p>
                    </div>

                    <button
                      onClick={() => onApplyKit(kit)}
                      className="w-full px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
                    >
                      <Check className="w-4 h-4" />
                      Apply to Slides
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


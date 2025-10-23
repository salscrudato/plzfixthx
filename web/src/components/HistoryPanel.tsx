import { useState } from "react";
import { useSlideHistory } from "@/hooks/useSlideHistory";
import type { Presentation } from "@/types/Presentation";

interface HistoryPanelProps {
  onLoadPresentation: (presentation: Presentation) => void;
}

export function HistoryPanel({ onLoadPresentation }: HistoryPanelProps) {
  const { 
    history, 
    loading, 
    deletePresentation, 
    clearHistory, 
    searchPresentations 
  } = useSlideHistory();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const displayedHistory = searchQuery 
    ? searchPresentations(searchQuery) 
    : history;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="glass rounded-[var(--radius-2xl)] p-6 space-y-4">
        <div className="h-8 bg-[var(--neutral-8)] rounded animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[var(--neutral-8)] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-[var(--radius-2xl)] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[var(--neutral-1)]">
          Recent Presentations
        </h3>
        {history.length > 0 && (
          <button
            onClick={() => setShowConfirmClear(true)}
            className="text-sm text-red-500 hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      {history.length > 0 && (
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search presentations..."
            className="w-full px-4 py-2 pl-10 rounded-lg border-2 border-[var(--neutral-7)] focus:border-[var(--color-primary)] focus:outline-none"
          />
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-4)]" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      )}

      {/* History List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {displayedHistory.length === 0 ? (
          <div className="text-center py-8 text-[var(--neutral-4)]">
            {searchQuery ? (
              <p>No presentations found matching "{searchQuery}"</p>
            ) : (
              <div className="space-y-2">
                <p>No saved presentations yet</p>
                <p className="text-xs">Generated presentations will appear here</p>
              </div>
            )}
          </div>
        ) : (
          displayedHistory.map((item) => (
            <div
              key={item.id}
              className="group p-4 rounded-lg border-2 border-[var(--neutral-7)] hover:border-[var(--color-primary)] transition-all bg-white"
            >
              <div className="flex items-start justify-between gap-4">
                <button
                  onClick={() => onLoadPresentation(item.presentation)}
                  className="flex-1 text-left"
                >
                  <h4 className="font-semibold text-[var(--neutral-1)] group-hover:text-[var(--color-primary)] mb-1">
                    {item.presentation.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-[var(--neutral-4)]">
                    <span>{item.presentation.slides.length} slide{item.presentation.slides.length !== 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>{formatDate(item.savedAt)}</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Delete "${item.presentation.title}"?`)) {
                      deletePresentation(item.id);
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Delete presentation"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirm Clear Dialog */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 space-y-4">
            <h4 className="text-lg font-bold text-[var(--neutral-1)]">
              Clear All History?
            </h4>
            <p className="text-sm text-[var(--neutral-3)]">
              This will permanently delete all {history.length} saved presentation{history.length !== 1 ? 's' : ''}. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-[var(--neutral-7)] text-[var(--neutral-2)] hover:bg-[var(--neutral-8)] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearHistory();
                  setShowConfirmClear(false);
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, AlertTriangle, Lightbulb, Wand2, TrendingUp } from "lucide-react";

interface SlideIssue {
  severity: "error" | "warning" | "suggestion";
  category: "content" | "design" | "accessibility" | "performance";
  message: string;
  fix?: string;
  autoFixable: boolean;
}

interface RefinementSuggestion {
  type: "content" | "design" | "layout" | "color" | "typography";
  priority: "high" | "medium" | "low";
  suggestion: string;
  rationale: string;
  autoApplicable: boolean;
}

interface SlideQualityAnalyzerProps {
  slideSpec: any;
  onAutoFix?: () => void;
  onApplySuggestion?: (suggestion: RefinementSuggestion) => void;
}

export function SlideQualityAnalyzer({ slideSpec, onAutoFix, onApplySuggestion }: SlideQualityAnalyzerProps) {
  const [issues, setIssues] = useState<SlideIssue[]>([]);
  const [suggestions, setSuggestions] = useState<RefinementSuggestion[]>([]);
  const [qualityScore, setQualityScore] = useState(0);

  useEffect(() => {
    analyzeSlide();
  }, [slideSpec]);

  const analyzeSlide = () => {
    const foundIssues: SlideIssue[] = [];
    const foundSuggestions: RefinementSuggestion[] = [];

    // Check title length
    if (slideSpec?.content?.title?.text?.length > 60) {
      foundIssues.push({
        severity: "warning",
        category: "content",
        message: "Title is too long (>60 characters)",
        fix: "Condense title to 40-50 characters",
        autoFixable: false
      });
    }

    // Check bullet count
    const bulletCount = slideSpec?.content?.bullets?.reduce((sum: number, group: any) => 
      sum + (group.items?.length || 0), 0) || 0;
    
    if (bulletCount > 6) {
      foundIssues.push({
        severity: "warning",
        category: "content",
        message: `Too many bullets (${bulletCount}). Limit to 5-6 for better retention.`,
        fix: "Reduce to 5-6 most important points",
        autoFixable: false
      });
    }

    // Check for data visualization opportunity
    const hasNumbers = slideSpec?.content?.bullets?.some((group: any) =>
      group.items?.some((item: any) => /\d+%|\$\d+|^\d+/.test(item.text))
    );

    if (hasNumbers && !slideSpec?.content?.dataViz) {
      foundSuggestions.push({
        type: "design",
        priority: "high",
        suggestion: "Convert numeric bullets to chart visualization",
        rationale: "Data visualizations are 60% more memorable than text",
        autoApplicable: false
      });
    }

    // Check for images
    if (!slideSpec?.content?.images && !slideSpec?.content?.imagePlaceholders) {
      foundSuggestions.push({
        type: "design",
        priority: "low",
        suggestion: "Consider adding a supporting image or illustration",
        rationale: "Visual elements increase engagement by 80%",
        autoApplicable: false
      });
    }

    // Check color contrast (simplified)
    const primaryColor = slideSpec?.styleTokens?.palette?.primary;
    if (primaryColor === "#000000" || primaryColor === "#FFFFFF") {
      foundSuggestions.push({
        type: "color",
        priority: "high",
        suggestion: "Use a more distinctive primary color",
        rationale: "Black/white primary colors lack visual interest",
        autoApplicable: true
      });
    }

    setIssues(foundIssues);
    setSuggestions(foundSuggestions);

    // Calculate quality score
    const errorCount = foundIssues.filter(i => i.severity === "error").length;
    const warningCount = foundIssues.filter(i => i.severity === "warning").length;
    const score = Math.max(0, 100 - (errorCount * 20) - (warningCount * 10));
    setQualityScore(score);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  const getSeverityIcon = (severity: SlideIssue["severity"]) => {
    switch (severity) {
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "suggestion":
        return <Lightbulb className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority: RefinementSuggestion["priority"]) => {
    const colors = {
      high: "bg-red-100 text-red-700",
      medium: "bg-yellow-100 text-yellow-700",
      low: "bg-blue-100 text-blue-700"
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-[var(--neutral-7)] p-6 space-y-6">
      {/* Header with Quality Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--neutral-1)]">Slide Quality</h2>
            <p className="text-sm text-[var(--neutral-3)]">AI-powered analysis & suggestions</p>
          </div>
        </div>
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor(qualityScore)}`}>
            {qualityScore}
          </div>
          <div className="text-sm text-[var(--neutral-3)]">{getScoreLabel(qualityScore)}</div>
        </div>
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[var(--neutral-1)]">Issues Found</h3>
            {issues.some(i => i.autoFixable) && onAutoFix && (
              <button
                onClick={onAutoFix}
                className="px-3 py-1 bg-[var(--color-primary)] text-white text-sm rounded-lg hover:bg-[var(--color-primary)]/90 transition-all flex items-center gap-1"
              >
                <Wand2 className="w-4 h-4" />
                Auto-Fix
              </button>
            )}
          </div>
          <div className="space-y-2">
            {issues.map((issue, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-[var(--neutral-7)] hover:border-[var(--color-primary)] transition-all"
              >
                <div className="flex items-start gap-3">
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-[var(--neutral-1)]">
                        {issue.message}
                      </span>
                      {issue.autoFixable && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-semibold">
                          AUTO-FIXABLE
                        </span>
                      )}
                    </div>
                    {issue.fix && (
                      <p className="text-sm text-[var(--neutral-3)]">
                        <strong>Fix:</strong> {issue.fix}
                      </p>
                    )}
                    <p className="text-xs text-[var(--neutral-4)] mt-1 capitalize">
                      {issue.category}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-[var(--neutral-1)]">Smart Suggestions</h3>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-[var(--neutral-7)] hover:border-[var(--color-primary)] transition-all"
              >
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getPriorityBadge(suggestion.priority)}
                      <span className="text-xs text-[var(--neutral-4)] capitalize">
                        {suggestion.type}
                      </span>
                    </div>
                    <p className="font-semibold text-sm text-[var(--neutral-1)] mb-1">
                      {suggestion.suggestion}
                    </p>
                    <p className="text-sm text-[var(--neutral-3)] mb-3">
                      {suggestion.rationale}
                    </p>
                    {suggestion.autoApplicable && onApplySuggestion && (
                      <button
                        onClick={() => onApplySuggestion(suggestion)}
                        className="px-3 py-1.5 bg-[var(--color-primary)] text-white text-sm rounded-lg hover:bg-[var(--color-primary)]/90 transition-all"
                      >
                        Apply Suggestion
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Good */}
      {issues.length === 0 && suggestions.length === 0 && (
        <div className="text-center py-8">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-[var(--neutral-1)]">Slide looks great!</p>
          <p className="text-sm text-[var(--neutral-3)] mt-2">No issues or suggestions found</p>
        </div>
      )}
    </div>
  );
}


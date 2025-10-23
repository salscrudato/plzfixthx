import { useState } from "react";
import { BarChart3, LineChart, PieChart, TrendingUp, Plus, X } from "lucide-react";

type ChartType = "bar" | "line" | "pie" | "area" | "scatter" | "doughnut" | "waterfall" | "combo" | "funnel";

interface ChartData {
  chartType: ChartType;
  title: string;
  labels: string[];
  series: Array<{
    name: string;
    values: number[];
  }>;
  showTrendline?: boolean;
  showDataTable?: boolean;
}

interface AdvancedChartBuilderProps {
  onAddChart: (chart: ChartData) => void;
  onClose: () => void;
}

export function AdvancedChartBuilder({ onAddChart, onClose }: AdvancedChartBuilderProps) {
  const [chartData, setChartData] = useState<ChartData>({
    chartType: "bar",
    title: "",
    labels: ["Q1", "Q2", "Q3", "Q4"],
    series: [{ name: "Series 1", values: [0, 0, 0, 0] }],
    showTrendline: false,
    showDataTable: false
  });

  const chartTypes: Array<{ type: ChartType; label: string; icon: any; description: string }> = [
    { type: "bar", label: "Bar Chart", icon: BarChart3, description: "Compare categories" },
    { type: "line", label: "Line Chart", icon: LineChart, description: "Show trends over time" },
    { type: "pie", label: "Pie Chart", icon: PieChart, description: "Show proportions" },
    { type: "area", label: "Area Chart", icon: TrendingUp, description: "Show volume over time" },
    { type: "scatter", label: "Scatter Plot", icon: TrendingUp, description: "Show correlation" },
    { type: "doughnut", label: "Doughnut Chart", icon: PieChart, description: "Modern pie chart" },
    { type: "waterfall", label: "Waterfall Chart", icon: BarChart3, description: "Show cumulative effect" },
    { type: "combo", label: "Combo Chart", icon: LineChart, description: "Combine bar + line" },
    { type: "funnel", label: "Funnel Chart", icon: TrendingUp, description: "Show conversion stages" }
  ];

  const handleAddSeries = () => {
    setChartData({
      ...chartData,
      series: [...chartData.series, { name: `Series ${chartData.series.length + 1}`, values: new Array(chartData.labels.length).fill(0) }]
    });
  };

  const handleRemoveSeries = (index: number) => {
    setChartData({
      ...chartData,
      series: chartData.series.filter((_, i) => i !== index)
    });
  };

  const handleUpdateSeriesName = (index: number, name: string) => {
    const newSeries = [...chartData.series];
    newSeries[index].name = name;
    setChartData({ ...chartData, series: newSeries });
  };

  const handleUpdateSeriesValue = (seriesIndex: number, valueIndex: number, value: number) => {
    const newSeries = [...chartData.series];
    newSeries[seriesIndex].values[valueIndex] = value;
    setChartData({ ...chartData, series: newSeries });
  };

  const handleUpdateLabel = (index: number, label: string) => {
    const newLabels = [...chartData.labels];
    newLabels[index] = label;
    setChartData({ ...chartData, labels: newLabels });
  };

  const handleAddDataPoint = () => {
    setChartData({
      ...chartData,
      labels: [...chartData.labels, `Label ${chartData.labels.length + 1}`],
      series: chartData.series.map(s => ({ ...s, values: [...s.values, 0] }))
    });
  };

  const handleRemoveDataPoint = (index: number) => {
    setChartData({
      ...chartData,
      labels: chartData.labels.filter((_, i) => i !== index),
      series: chartData.series.map(s => ({ ...s, values: s.values.filter((_, i) => i !== index) }))
    });
  };

  const handleSubmit = () => {
    onAddChart(chartData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[var(--neutral-7)] p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--neutral-1)]">Advanced Chart Builder</h2>
            <p className="text-sm text-[var(--neutral-3)]">Create professional data visualizations</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--neutral-8)] rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Chart Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-[var(--neutral-2)] mb-3">
              Chart Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {chartTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.type}
                    onClick={() => setChartData({ ...chartData, chartType: type.type })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      chartData.chartType === type.type
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                        : "border-[var(--neutral-7)] hover:border-[var(--color-primary)]/50"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${chartData.chartType === type.type ? "text-[var(--color-primary)]" : "text-[var(--neutral-3)]"}`} />
                    <div className="font-semibold text-sm text-[var(--neutral-1)]">{type.label}</div>
                    <div className="text-xs text-[var(--neutral-4)] mt-1">{type.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chart Title */}
          <div>
            <label className="block text-sm font-semibold text-[var(--neutral-2)] mb-2">
              Chart Title
            </label>
            <input
              type="text"
              value={chartData.title}
              onChange={(e) => setChartData({ ...chartData, title: e.target.value })}
              placeholder="e.g., Quarterly Revenue Growth"
              className="w-full px-4 py-3 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none"
            />
          </div>

          {/* Data Labels */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-[var(--neutral-2)]">
                Data Labels
              </label>
              <button
                onClick={handleAddDataPoint}
                className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Data Point
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {chartData.labels.map((label, index) => (
                <div key={index} className="flex gap-1">
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => handleUpdateLabel(index, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] outline-none text-sm"
                  />
                  {chartData.labels.length > 2 && (
                    <button
                      onClick={() => handleRemoveDataPoint(index)}
                      className="p-2 hover:bg-red-50 text-red-500 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Data Series */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-[var(--neutral-2)]">
                Data Series
              </label>
              <button
                onClick={handleAddSeries}
                className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Series
              </button>
            </div>
            <div className="space-y-4">
              {chartData.series.map((series, seriesIndex) => (
                <div key={seriesIndex} className="p-4 bg-[var(--neutral-8)] rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={series.name}
                      onChange={(e) => handleUpdateSeriesName(seriesIndex, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] outline-none font-semibold"
                      placeholder="Series name"
                    />
                    {chartData.series.length > 1 && (
                      <button
                        onClick={() => handleRemoveSeries(seriesIndex)}
                        className="p-2 hover:bg-red-50 text-red-500 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {series.values.map((value, valueIndex) => (
                      <input
                        key={valueIndex}
                        type="number"
                        value={value}
                        onChange={(e) => handleUpdateSeriesValue(seriesIndex, valueIndex, parseFloat(e.target.value) || 0)}
                        className="px-3 py-2 rounded-lg border border-[var(--neutral-7)] focus:border-[var(--color-primary)] outline-none text-sm"
                        placeholder="0"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3 p-4 bg-[var(--neutral-8)] rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={chartData.showTrendline}
                onChange={(e) => setChartData({ ...chartData, showTrendline: e.target.checked })}
                className="w-5 h-5 rounded border-[var(--neutral-6)] text-[var(--color-primary)]"
              />
              <span className="text-sm font-medium text-[var(--neutral-2)]">Show Trendline</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={chartData.showDataTable}
                onChange={(e) => setChartData({ ...chartData, showDataTable: e.target.checked })}
                className="w-5 h-5 rounded border-[var(--neutral-6)] text-[var(--color-primary)]"
              />
              <span className="text-sm font-medium text-[var(--neutral-2)]">Show Data Table</span>
            </label>
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
              disabled={!chartData.title.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              Add Chart to Slide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartProps {
  kind: "bar" | "line" | "pie";
  labels: string[];
  series: { name: string; values: number[] }[];
  title?: string;
  valueFormat?: "number" | "percent" | "currency" | "auto";
  colors?: string[];
}

const DEFAULT_COLORS = [
  "#6366F1", // Primary
  "#EC4899", // Accent
  "#10B981", // Success
  "#F59E0B", // Warning
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#14B8A6", // Teal
];

export function Chart({ kind, labels, series, title, valueFormat = "auto", colors }: ChartProps) {
  const COLORS = colors || DEFAULT_COLORS;
  // Transform data for recharts format
  const data = labels.map((label, index) => {
    const point: any = { name: label };
    series.forEach((s) => {
      point[s.name] = s.values[index] || 0;
    });
    return point;
  });

  const formatValue = (value: number) => {
    switch (valueFormat) {
      case "percent":
        return `${value}%`;
      case "currency":
        return `$${value.toLocaleString()}`;
      case "number":
        return value.toLocaleString();
      default:
        return value;
    }
  };

  if (kind === "pie") {
    // For pie charts, use the first series
    const pieData = labels.map((label, index) => ({
      name: label,
      value: series[0]?.values[index] || 0,
    }));

    return (
      <div className="w-full h-full">
        {title && (
          <h4 className="text-sm font-semibold text-[var(--neutral-2)] mb-2 text-center">
            {title}
          </h4>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) => `${name}: ${((percent as number) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((_entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => formatValue(value)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (kind === "line") {
    return (
      <div className="w-full h-full">
        {title && (
          <h4 className="text-sm font-semibold text-[var(--neutral-2)] mb-2">
            {title}
          </h4>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-7)" />
            <XAxis 
              dataKey="name" 
              stroke="var(--neutral-4)"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="var(--neutral-4)"
              style={{ fontSize: '12px' }}
              tickFormatter={(value: any) => String(formatValue(value))}
            />
            <Tooltip 
              formatter={(value: any) => formatValue(value)}
              contentStyle={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--neutral-7)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            {series.map((s, index) => (
              <Line
                key={s.name}
                type="monotone"
                dataKey={s.name}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Bar chart (default)
  return (
    <div className="w-full h-full">
      {title && (
        <h4 className="text-sm font-semibold text-[var(--neutral-2)] mb-2">
          {title}
        </h4>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-7)" />
          <XAxis 
            dataKey="name" 
            stroke="var(--neutral-4)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="var(--neutral-4)"
            style={{ fontSize: '12px' }}
            tickFormatter={(value: any) => String(formatValue(value))}
          />
          <Tooltip 
            formatter={(value: any) => formatValue(value)}
            contentStyle={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--neutral-7)',
              borderRadius: '8px',
            }}
          />
          <Legend />
          {series.map((s, index) => (
            <Bar
              key={s.name}
              dataKey={s.name}
              fill={COLORS[index % COLORS.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


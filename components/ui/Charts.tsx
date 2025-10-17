"use client";

import { useMemo } from "react";

interface SimpleChartProps {
  data: { label: string; value: number; color: string }[];
  title: string;
  type?: "bar" | "donut";
}

export const SimpleChart = ({ data, title, type = "bar" }: SimpleChartProps) => {
  // Validar datos de entrada
  const validData = data.filter((d) => d && typeof d.value === "number" && !isNaN(d.value));

  const maxValue = useMemo(() => {
    if (validData.length === 0) return 0;
    return Math.max(...validData.map((d) => d.value));
  }, [validData]);

  const total = useMemo(() => validData.reduce((sum, d) => sum + d.value, 0), [validData]);

  // Mostrar estado vacío si no hay datos válidos
  if (validData.length === 0 || total === 0) {
    return (
      <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="text-gray-400 text-sm">No hay datos disponibles</div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "donut") {
    return (
      <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            {/* SVG Donut Chart */}
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 42 42">
              <circle
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                stroke="#374151"
                strokeWidth="3"
              />
              {validData.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const strokeDasharray = `${percentage} ${100 - percentage}`;
                const strokeDashoffset = validData
                  .slice(0, index)
                  .reduce((sum, d) => sum + (d.value / total) * 100, 0);

                return (
                  <circle
                    key={item.label}
                    cx="21"
                    cy="21"
                    r="15.915"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="3"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={-strokeDashoffset}
                    className="transition-all duration-1000"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{total}</div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {validData.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full`}
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-300">{item.label}</span>
              </div>
              <span className="text-sm font-medium text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary-800 rounded-xl p-6 border border-secondary-700">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-4">
        {validData.map((item) => (
          <div key={item.label} className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">{item.label}</span>
              <span className="text-sm font-bold text-white">{item.value}</span>
            </div>
            <div className="w-full bg-secondary-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-1000 relative overflow-hidden`}
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "green" | "yellow" | "red" | "purple" | "indigo";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
}: MetricCardProps) => {
  const colorClasses = {
    blue: "from-blue-500 via-blue-600 to-blue-700 border-blue-400/30 hover:shadow-blue-500/30",
    green:
      "from-green-500 via-green-600 to-green-700 border-green-400/30 hover:shadow-green-500/30",
    yellow:
      "from-yellow-500 via-yellow-600 to-yellow-700 border-yellow-400/30 hover:shadow-yellow-500/30",
    red: "from-red-500 via-red-600 to-red-700 border-red-400/30 hover:shadow-red-500/30",
    purple:
      "from-purple-500 via-purple-600 to-purple-700 border-purple-400/30 hover:shadow-purple-500/30",
    indigo:
      "from-indigo-500 via-indigo-600 to-indigo-700 border-indigo-400/30 hover:shadow-indigo-500/30",
  };

  return (
    <div
      className={`group bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-6 text-white shadow-2xl transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden border`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r from-${color}-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse`}
      ></div>
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          <p className={`text-${color}-100 text-sm font-bold uppercase tracking-wider mb-2`}>
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <p className="text-4xl font-bold transition-all duration-300 group-hover:scale-110">
              {value}
            </p>
            {trend && (
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? "text-green-300" : "text-red-300"
                }`}
              >
                <span className="inline-block">
                  {trend.isPositive ? "↗️" : "↘️"} {Math.abs(trend.value)}%
                </span>
              </span>
            )}
          </div>
          <p className={`text-${color}-200 text-sm font-medium mt-1`}>{subtitle}</p>
        </div>
        <div className="relative ml-4">
          <Icon
            className={`h-14 w-14 text-${color}-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`}
          />
          <div
            className={`absolute -inset-2 bg-${color}-400/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
          ></div>
        </div>
      </div>
    </div>
  );
};

"use client";

import { useMemo, useState } from "react";
import { BarChart2, LineChart, TrendingUp, Zap } from "lucide-react";
import type { DailyWatchTime } from "@/lib/admin-queries";
import { formatWatchTime } from "@/lib/format";

function formatDateLabel(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatDateFull(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function WatchTimeChart({ data }: { data: DailyWatchTime[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  // Sort chronologically (oldest -> newest) for left-to-right display
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  const maxWatchTime = useMemo(() => {
    if (sortedData.length === 0) return 1;
    const max = Math.max(...sortedData.map((d) => d.totalSeconds));
    return max > 0 ? max : 1;
  }, [sortedData]);

  const stats = useMemo(() => {
    if (sortedData.length === 0) {
      return { peakDay: null, avgDaily: 0, totalEvents: 0 };
    }
    const peak = [...sortedData].sort((a, b) => b.totalSeconds - a.totalSeconds)[0];
    const totalSecs = sortedData.reduce((acc, curr) => acc + curr.totalSeconds, 0);
    const totalEvts = sortedData.reduce((acc, curr) => acc + curr.eventCount, 0);
    const avg = totalSecs / sortedData.length;

    return {
      peakDay: peak,
      avgDaily: avg,
      totalEvents: totalEvts,
    };
  }, [sortedData]);

  if (sortedData.length === 0) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center rounded-xl border border-border bg-surface p-6 text-muted">
        <p className="text-sm">No watch events recorded yet.</p>
      </div>
    );
  }

  // SVG dimensions for smooth scaling
  const height = 260;
  const paddingX = 50;
  const paddingY = 30;
  const width = 800;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Generate ticks for Y-axis
  const yTicksCount = 4;
  const yTicks = Array.from({ length: yTicksCount + 1 }).map((_, i) => {
    const val = (maxWatchTime / yTicksCount) * (yTicksCount - i);
    const y = paddingY + (chartHeight / yTicksCount) * i;
    return { val, y };
  });

  // Calculate coordinates for points
  const points = sortedData.map((d, index) => {
    const x =
      paddingX +
      (index / Math.max(1, sortedData.length - 1)) * chartWidth;
    const barWidth = Math.max(12, Math.min(48, chartWidth / sortedData.length - 12));
    const barX = paddingX + (index + 0.5) * (chartWidth / sortedData.length) - barWidth / 2;
    const ratio = d.totalSeconds / maxWatchTime;
    const y = paddingY + chartHeight * (1 - ratio);
    const barHeight = Math.max(4, chartHeight * ratio);
    return { ...d, x, y, barX, barWidth, barHeight, ratio, index };
  });

  // Generate SVG path for line chart
  const linePath = points.reduce((acc, pt, idx) => {
    const cmd = idx === 0 ? "M" : "L";
    return `${acc} ${cmd} ${pt.x} ${pt.y}`;
  }, "");

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
      : "";

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="flex w-full flex-col gap-6 rounded-2xl border border-border bg-surface p-6 shadow-xs">
      {/* Chart Top Header & Quick Metrics */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-4 sm:flex sm:items-center sm:gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[#065fd4]/10 text-[#065fd4]">
              <TrendingUp className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted">Daily Average</span>
              <span className="text-sm font-bold text-foreground">
                {formatWatchTime(Math.round(stats.avgDaily))}
              </span>
            </div>
          </div>

          {stats.peakDay && (
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <Zap className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted">
                  Peak ({formatDateLabel(stats.peakDay.date)})
                </span>
                <span className="text-sm font-bold text-foreground">
                  {formatWatchTime(stats.peakDay.totalSeconds)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* View mode toggle: Bar vs Line */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-background/50 p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartType("bar")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
              chartType === "bar"
                ? "bg-surface text-foreground shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            <BarChart2 className="size-3.5" />
            Bars
          </button>
          <button
            type="button"
            onClick={() => setChartType("line")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
              chartType === "line"
                ? "bg-surface text-foreground shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            <LineChart className="size-3.5" />
            Line
          </button>
        </div>
      </div>

      {/* Main SVG Chart Container */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[500px] overflow-visible"
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#065fd4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#3ea6ff" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff0000" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#ff4e4e" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#065fd4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#065fd4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y-axis labels */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingX}
                y1={tick.y}
                x2={width - paddingX}
                y2={tick.y}
                stroke="currentColor"
                className="text-border"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingX - 8}
                y={tick.y + 4}
                textAnchor="end"
                className="fill-muted text-[10px] font-medium"
              >
                {formatWatchTime(Math.round(tick.val))}
              </text>
            </g>
          ))}

          {/* Line view gradient area */}
          {chartType === "line" && (
            <>
              <path d={areaPath} fill="url(#areaGradient)" />
              <path
                d={linePath}
                fill="none"
                stroke="#065fd4"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Render Data Points / Bars */}
          {points.map((pt) => {
            const isHovered = hoveredIndex === pt.index;

            return (
              <g
                key={pt.date}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredIndex(pt.index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Full-height hit target for easier mouse hover */}
                <rect
                  x={pt.barX - 4}
                  y={paddingY}
                  width={pt.barWidth + 8}
                  height={chartHeight}
                  fill="transparent"
                />

                {chartType === "bar" && (
                  <rect
                    x={pt.barX}
                    y={pt.y}
                    width={pt.barWidth}
                    height={pt.barHeight}
                    rx="4"
                    fill={isHovered ? "url(#barGradientHover)" : "url(#barGradient)"}
                    className="transition-all duration-200"
                  />
                )}

                {chartType === "line" && (
                  <>
                    {/* Vertical guide line on hover */}
                    {isHovered && (
                      <line
                        x1={pt.x}
                        y1={paddingY}
                        x2={pt.x}
                        y2={height - paddingY}
                        stroke="#ff0000"
                        strokeDasharray="2 2"
                        strokeWidth="1.5"
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? "6" : "4"}
                      fill={isHovered ? "#ff0000" : "#065fd4"}
                      stroke="var(--background, #fff)"
                      strokeWidth="2"
                      className="transition-all duration-200"
                    />
                  </>
                )}

                {/* X Axis Date Labels */}
                <text
                  x={chartType === "bar" ? pt.barX + pt.barWidth / 2 : pt.x}
                  y={height - 8}
                  textAnchor="middle"
                  className={`text-[11px] transition-colors ${
                    isHovered
                      ? "fill-foreground font-bold"
                      : "fill-muted font-medium"
                  }`}
                >
                  {formatDateLabel(pt.date)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {activePoint && (
          <div
            className="pointer-events-none absolute z-10 flex -translate-x-1/2 flex-col gap-1 rounded-xl border border-border bg-foreground p-3 text-background shadow-xl backdrop-blur-md transition-all duration-150"
            style={{
              left: `${
                ((activePoint.index + 0.5) / sortedData.length) * 100
              }%`,
              top: "10px",
            }}
          >
            <span className="text-xs font-semibold opacity-80">
              {formatDateFull(activePoint.date)}
            </span>
            <div className="flex items-center gap-2 text-sm font-bold">
              <span>{formatWatchTime(activePoint.totalSeconds)}</span>
              <span className="text-xs font-normal opacity-70">
                ({activePoint.totalSeconds.toLocaleString()}s)
              </span>
            </div>
            <span className="text-xs opacity-75">
              {activePoint.eventCount.toLocaleString()} ping events
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { useSyncExternalStore } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  type TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { subscribeTheme, getThemeSnapshot, getServerThemeSnapshot } from "@/components/ThemeToggle";
import type { PricePoint } from "@/lib/market";
import { formatPkr } from "@/lib/market";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

// Brand accent (--accent) — identical value in both themes (see globals.css),
// so it's safe to hard-code here rather than read a CSS custom property from
// inside a canvas-rendered chart.
const LINE_COLOR = "#7c5cff";

/** Value formats a chart can render — a plain string id (rather than a
 *  function prop) so this component stays passable from Server Components. */
const FORMATTERS = {
  pkr: formatPkr,
  index: (value: number) => value.toFixed(1),
} as const;

export default function PriceTrendChart({
  history,
  format = "pkr",
  height = "h-40",
}: {
  history: PricePoint[];
  /** How to format y-axis ticks and tooltip values: "pkr" currency (default)
   *  or "index" for a normalized/indexed series like an aggregated market
   *  index. */
  format?: keyof typeof FORMATTERS;
  /** Tailwind height class for the chart's container. */
  height?: string;
}) {
  const valueFormatter = FORMATTERS[format];
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);
  const isDark = theme !== "light";

  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const tickColor = isDark ? "#9aa0ac" : "#5b616e";

  const data = useMemo(
    () => ({
      labels: history.map((p) => p.label),
      datasets: [
        {
          data: history.map((p) => Math.round(p.value)),
          borderColor: LINE_COLOR,
          borderWidth: 2,
          pointRadius: (ctx: { dataIndex: number }) =>
            ctx.dataIndex === history.length - 1 ? 4 : 0,
          pointHoverRadius: 5,
          pointBackgroundColor: LINE_COLOR,
          pointBorderColor: isDark ? "#0d0f17" : "#ffffff",
          pointBorderWidth: 2,
          cubicInterpolationMode: "monotone" as const,
          fill: true,
          backgroundColor: (ctx: { chart: { ctx: CanvasRenderingContext2D; chartArea?: { top: number; bottom: number } } }) => {
            const { ctx: canvasCtx, chartArea } = ctx.chart;
            if (!chartArea) return "rgba(124,92,255,0.18)";
            const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, "rgba(124,92,255,0.28)");
            gradient.addColorStop(1, "rgba(124,92,255,0)");
            return gradient;
          },
        },
      ],
    }),
    [history, isDark]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index" as const, intersect: false },
      plugins: {
        tooltip: {
          displayColors: false,
          backgroundColor: isDark ? "#12141f" : "#ffffff",
          titleColor: isDark ? "#f4f5f7" : "#14151a",
          bodyColor: isDark ? "#f4f5f7" : "#14151a",
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: (item: TooltipItem<"line">) => valueFormatter(Number(item.parsed.y)),
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: tickColor, font: { size: 11 } },
        },
        y: {
          grid: { color: gridColor },
          border: { display: false },
          ticks: {
            color: tickColor,
            font: { size: 11 },
            maxTicksLimit: 4,
            callback: (value: string | number) => valueFormatter(Number(value)),
          },
        },
      },
    }),
    [gridColor, tickColor, isDark, valueFormatter]
  );

  return (
    <div className={`${height} w-full`}>
      <Line data={data} options={options} />
    </div>
  );
}

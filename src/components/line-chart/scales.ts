import * as d3 from "d3";
import { DataPoint } from "./types";

export function createXScale(data: DataPoint[], width: number): d3.ScaleTime<number, number> {
  const parseDate = (d: string) => new Date(d);
  const xDomain = d3.extent(data, (d) => parseDate(d.date)) as [Date, Date];
  return d3.scaleTime().domain(xDomain).range([0, width]);
}

export function createYScaleLeft(data: DataPoint[], height: number): d3.ScaleLinear<number, number> {
  const yLeftMax = d3.max([
    d3.max(data, (d) => d.sales) || 0,
    d3.max(data, (d) => d.goal) || 0,
  ])!;
  return d3.scaleLinear().domain([0, yLeftMax]).nice().range([height, 0]);
}

export function createMetricScales(
  data: DataPoint[],
  metricKeys: string[],
  height: number
): Record<string, d3.ScaleLinear<number, number>> {
  const metricScales: Record<string, d3.ScaleLinear<number, number>> = {};

  metricKeys.forEach((key) => {
    const values = data.map((d) => (d[key as keyof DataPoint] as number) || 0);
    const minVal = d3.min(values) ?? 0;
    const maxVal = d3.max(values) ?? 0;
    if (maxVal === minVal) {
      metricScales[key] = d3
        .scaleLinear()
        .domain([minVal - 1000, maxVal + 1000])
        .range([height, 0]);
    } else {
      const buffer = (maxVal - minVal) * 0.1;
      metricScales[key] = d3
        .scaleLinear()
        .domain([minVal - buffer, maxVal + buffer])
        .range([height, 0]);
    }
  });

  return metricScales;
}
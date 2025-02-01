import * as d3 from "d3";
import { DataPoint } from "./types";

interface DrawMetricLinesParams {
  g: d3.Selection<SVGGElement, unknown, null, undefined>;
  data: DataPoint[];
  xScale: d3.ScaleTime<number, number>;
  allPaths: d3.Selection<SVGPathElement, unknown, null, undefined>[];
  innerHeight: number;
}

/**
 * Draw each line for keys like spotify_listeners, facebook_likes, etc.
 * Now we normalize each property to highlight changes in each param individually.
 * The line is scaled from [minVal..maxVal] => [0..innerHeight].
 */
export function drawMetricLines({
  g,
  data,
  xScale,
  allPaths,
  innerHeight,
}: DrawMetricLinesParams) {
  const parseDate = (d: string) => new Date(d);

  const metrics = [
    { key: "spotify_listeners", color: "rgb(99, 102, 241)" },
    { key: "spotify_followers", color: "rgb(244, 63, 94)" },
    { key: "spotify_popularity", color: "rgb(234, 179, 8)" },
    { key: "facebook_likes", color: "rgb(59, 130, 246)" },
    { key: "facebook_talks", color: "rgb(37, 99, 235)" },
    { key: "instagram_followers", color: "rgb(139, 92, 246)" },
    { key: "youtube_channel_subscribers", color: "rgb(239, 68, 68)" },
    { key: "youtube_channel_views", color: "rgb(220, 38, 38)" },
    { key: "tiktok_followers", color: "rgb(16, 185, 129)" },
    { key: "tiktok_likes", color: "rgb(5, 150, 105)" },
  ];

  // Filter out zeros from data for each metric
  const filteredData = data.map(d => {
    const filtered = { ...d };
    metrics.forEach(m => {
      const val = filtered[m.key as keyof DataPoint] as number;
      if (val === 0) {
        delete filtered[m.key as keyof DataPoint];
      }
    });
    return filtered;
  });
  data = filteredData;

  metrics.forEach((m) => {
    // Compute min and max for this metric
    const minVal = d3.min(data, (d) => (d[m.key as keyof DataPoint] as number) || 0) ?? 0;
    const maxVal = d3.max(data, (d) => (d[m.key as keyof DataPoint] as number) || 0) ?? 0;
    const domainSpan = maxVal - minVal === 0 ? 1 : maxVal - minVal;

    const lineGen = d3
      .line<DataPoint>()
      .x((d) => xScale(parseDate(d.date)))
      .y((d) => {
        const val = (d[m.key as keyof DataPoint] as number) || 0;
        const normalized = (val - minVal) / domainSpan; // [0..1]
        // invert so 0 is at bottom:
        return innerHeight - normalized * innerHeight;
      })
      .defined((d) => {
        const val = d[m.key as keyof DataPoint] as number;
        return typeof val === "number";
      })
      .curve(d3.curveMonotoneX);

    const path = g
      .append("path")
      .datum(data)
      .attr("class", `${m.key}-line`)
      .attr("fill", "none")
      .attr("stroke", m.color)
      .attr("stroke-width", 2)
      .attr("d", lineGen)
      .style("opacity", 0);

    allPaths.push(path);

    // fade in after ~3s
    path
      .transition()
      .delay(3000)
      .duration(1500)
      .style("opacity", 1);
  });
}
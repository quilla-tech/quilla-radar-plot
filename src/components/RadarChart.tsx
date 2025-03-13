import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { METRIC_LABELS, METRIC_CATEGORIES } from "@/constants/metricLabels";

interface RadarChartProps {
  data: Array<{
    metric: string;
    normalized_score: number;
    raw_value: number;
    related_artists_normalized_average: number;
  }>;
}

const RadarChart = ({ data }: RadarChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current || !containerRef.current) return;

    // Create a predefined order based on METRIC_CATEGORIES
    const orderedMetrics = [
      ...METRIC_CATEGORIES.spotify,
      ...METRIC_CATEGORIES.tiktok,
      ...METRIC_CATEGORIES.instagram,
      ...METRIC_CATEGORIES.facebook
    ];

    // Sort data according to the predefined order
    const sortedData = [...data].sort((a, b) => {
      const indexA = orderedMetrics.indexOf(a.metric as any);
      const indexB = orderedMetrics.indexOf(b.metric as any);
      
      // If both metrics are in our ordered list, sort by their position
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // If only one is in the list, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // If neither is in the list, fall back to alphabetical
      return a.metric.localeCompare(b.metric);
    });

    // Log the sorted metrics to verify order
    console.log("Sorted metrics:", sortedData.map(d => d.metric));

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Setup dimensions
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Create scales
    const numPoints = sortedData.length;
    const angleScale = d3
      .scaleLinear()
      .domain([0, numPoints])
      .range([0, 2 * Math.PI]);

    const radiusScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([0, radius]);

    // Draw axis lines
    svg.selectAll(".axis-line")
      .data(sortedData)
      .join("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (d, i) => radius * Math.cos(angleScale(i) - Math.PI / 2))
      .attr("y2", (d, i) => radius * Math.sin(angleScale(i) - Math.PI / 2))
      .attr("stroke", "#ddd")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4");

    // Draw reference circles
    const circles = [0.2, 0.4, 0.6, 0.8, 1.0];
    svg.selectAll(".circle")
      .data(circles)
      .join("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", d => radiusScale(d))
      .attr("fill", "none")
      .attr("stroke", "#ddd")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4");

    // Draw related artists area using a polygon that goes exactly through each point
    // Create points for the related artists polygon
    const relatedPolygonPoints = sortedData.map((d, i) => {
      const angle = angleScale(i) - Math.PI / 2;
      const r = radiusScale(d.related_artists_normalized_average);
      return [r * Math.cos(angle), r * Math.sin(angle)];
    });

    // Create a polygon path generator with smoothing
    const polygonGenerator = d3.line()
      .x(d => d[0])
      .y(d => d[1])
      .curve(d3.curveCardinalClosed.tension(0.5)); // Use cardinal curve with tension for smoothing

    // Draw the related artists polygon
    svg.append("path")
      .datum(relatedPolygonPoints)
      .attr("d", polygonGenerator)
      .attr("fill", "rgba(131, 117, 105, 0.1)")
      .attr("stroke", "rgba(131, 117, 105, 0.8)")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,4");

    // Draw main artist area using a polygon that goes exactly through each point
    // Create points for the main artist polygon
    const mainPolygonPoints = sortedData.map((d, i) => {
      const angle = angleScale(i) - Math.PI / 2;
      const r = radiusScale(d.normalized_score);
      return [r * Math.cos(angle), r * Math.sin(angle)];
    });

    // Draw the main artist polygon
    svg.append("path")
      .datum(mainPolygonPoints)
      .attr("d", polygonGenerator)
      .attr("fill", "rgba(255, 189, 0, 0.3)")
      .attr("stroke", "rgba(255, 189, 0, 0.8)")
      .attr("stroke-width", 1.5);

    // Add labels with debug info
    svg.selectAll(".label")
      .data(sortedData)
      .join("text")
      .attr("x", (d, i) => (radius + 20) * Math.cos(angleScale(i) - Math.PI / 2))
      .attr("y", (d, i) => (radius + 20) * Math.sin(angleScale(i) - Math.PI / 2))
      .attr("text-anchor", (d, i) => {
        const angle = angleScale(i) * (180 / Math.PI);
        return angle < 180 ? "start" : "end";
      })
      .attr("dominant-baseline", "middle")
      .text(d => METRIC_LABELS[d.metric] || d.metric)
      .attr("fill", "#666")
      .style("font-size", "12px");

  }, [data]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default RadarChart; 
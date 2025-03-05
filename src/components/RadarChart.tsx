import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { METRIC_LABELS } from "@/constants/metricLabels";

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
    const numPoints = data.length;
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
      .data(data)
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

    // Create path generators
    const mainAreaGenerator = d3.lineRadial<(typeof data)[0]>()
      .angle((d, i) => angleScale(i) - Math.PI / 2)
      .radius(d => radiusScale(d.normalized_score))
      .curve(d3.curveCatmullRomClosed);

    const relatedAreaGenerator = d3.lineRadial<(typeof data)[0]>()
      .angle((d, i) => angleScale(i) - Math.PI / 2)
      .radius(d => radiusScale(d.related_artists_normalized_average))
      .curve(d3.curveCatmullRomClosed);

    // Draw related artists area first (so it's behind)
    svg.append("path")
      .datum(data)
      .attr("d", relatedAreaGenerator)
      .attr("fill", "rgba(131, 117, 105, 0.1)")
      .attr("stroke", "rgba(131, 117, 105, 0.8)")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,4");

    // Draw main artist area (on top)
    svg.append("path")
      .datum(data)
      .attr("d", mainAreaGenerator)
      .attr("fill", "rgba(255, 189, 0, 0.3)")
      .attr("stroke", "rgba(255, 189, 0, 0.8)")
      .attr("stroke-width", 1.5);

    // Add labels
    svg.selectAll(".label")
      .data(data)
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
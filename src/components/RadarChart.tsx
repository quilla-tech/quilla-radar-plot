import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { DataPoint } from "./line-chart/types";

interface RadarChartProps {
  data: DataPoint[];
}

const RadarChart = ({ data }: RadarChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current || !containerRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Get the last data point
    const lastDataPoint = data[data.length - 1];

    // Define metrics and their colors
    const metrics = [
      { key: "spotify_listeners", label: "Spotify Listeners", color: "rgb(99, 102, 241)" },
      { key: "spotify_followers", label: "Spotify Followers", color: "rgb(244, 63, 94)" },
      { key: "spotify_popularity", label: "Spotify Popularity", color: "rgb(234, 179, 8)" },
      { key: "facebook_likes", label: "Facebook Likes", color: "rgb(59, 130, 246)" },
      { key: "facebook_talks", label: "Facebook Talks", color: "rgb(37, 99, 235)" },
      { key: "instagram_followers", label: "Instagram Followers", color: "rgb(139, 92, 246)" },
      { key: "youtube_channel_subscribers", label: "YouTube Subscribers", color: "rgb(239, 68, 68)" },
      { key: "youtube_channel_views", label: "YouTube Views", color: "rgb(220, 38, 38)" },
      { key: "tiktok_followers", label: "TikTok Followers", color: "rgb(16, 185, 129)" },
      { key: "tiktok_likes", label: "TikTok Likes", color: "rgb(5, 150, 105)" },
    ];

    // Get container dimensions
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${width/2 + margin.left},${height/2 + margin.top})`);

    // Angle scale
    const angleScale = d3.scalePoint()
      .domain(metrics.map(m => m.key))
      .range([0, 2 * Math.PI]);

    // Radius scale
    const radiusScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, radius]);

    // Create background circles
    const circles = [0.2, 0.4, 0.6, 0.8, 1];
    circles.forEach(circle => {
      svg.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", radiusScale(circle))
        .attr("fill", "none")
        .attr("stroke", "rgb(203, 213, 225)")
        .attr("stroke-dasharray", "4,4");
    });

    // Create axes
    metrics.forEach(metric => {
      const angle = angleScale(metric.key)! - Math.PI / 2;
      const lineEndX = radius * Math.cos(angle);
      const lineEndY = radius * Math.sin(angle);

      // Draw axis line
      svg.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", lineEndX)
        .attr("y2", lineEndY)
        .attr("stroke", "rgb(203, 213, 225)");

      // Add label
      const labelDistance = radius + 20;
      svg.append("text")
        .attr("x", labelDistance * Math.cos(angle))
        .attr("y", labelDistance * Math.sin(angle))
        .attr("text-anchor", angle > Math.PI / 2 && angle < 3 * Math.PI / 2 ? "end" : "start")
        .attr("dominant-baseline", "middle")
        .attr("fill", "rgb(100, 116, 139)")
        .attr("font-size", "12px")
        .text(metric.label);
    });

    // Calculate normalized values
    const normalizedValues = metrics.map(metric => {
      const value = lastDataPoint[metric.key as keyof DataPoint] as number || 0;
      const maxValue = d3.max(data, d => d[metric.key as keyof DataPoint] as number) || 1;
      return { ...metric, value: value / maxValue };
    });

    // Create radar path
    const lineGenerator = d3.lineRadial<typeof normalizedValues[0]>()
      .angle(d => angleScale(d.key)! - Math.PI / 2)
      .radius(d => radiusScale(d.value))
      .curve(d3.curveCatmullRomClosed);

    // Add radar area
    svg.append("path")
      .datum(normalizedValues)
      .attr("d", lineGenerator)
      .attr("fill", "rgba(99, 102, 241, 0.1)")
      .attr("stroke", "rgb(99, 102, 241)")
      .attr("stroke-width", 2);

    // Add dots at each point
    svg.selectAll(".radar-dot")
      .data(normalizedValues)
      .join("circle")
      .attr("class", "radar-dot")
      .attr("cx", d => radiusScale(d.value) * Math.cos(angleScale(d.key)! - Math.PI / 2))
      .attr("cy", d => radiusScale(d.value) * Math.sin(angleScale(d.key)! - Math.PI / 2))
      .attr("r", 4)
      .attr("fill", d => d.color);

  }, [data]);

  return (
    <div 
      ref={containerRef} 
      style={{ width: "100%", height: "100%", position: "absolute" }}
    >
      <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default RadarChart; 
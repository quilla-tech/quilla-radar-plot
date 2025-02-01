import * as d3 from "d3";
import { Annotation } from "./types";

interface DrawAnnotationsParams {
  g: d3.Selection<SVGGElement, unknown, null, undefined>;
  annotations: Annotation[];
  xScale: d3.ScaleTime<number, number>;
  innerHeight: number;
}

/**
 * Draw vertical annotation lines, plus a floating tooltip on mouseover.
 */
export function drawAnnotations({
  g,
  annotations,
  xScale,
  innerHeight,
}: DrawAnnotationsParams) {
  const annotationTooltip = d3
    .select("body")
    .append("div")
    .attr("class", "annotation-tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
    .style("font-size", "14px")
    .style("pointer-events", "all")
    .style("opacity", 0);

  const parseDate = (d: string) => new Date(d);

  const annotationGroup = g.append("g").attr("class", "annotations");

  annotationGroup
    .selectAll(".annotation-line")
    .data(annotations)
    .enter()
    .append("line")
    .attr("class", "annotation-line")
    .attr("x1", (d) => xScale(parseDate(d.date)))
    .attr("x2", (d) => xScale(parseDate(d.date)))
    .attr("y1", 0)
    .attr("y2", innerHeight)
    .attr("stroke", "orange")
    .attr("stroke-dasharray", "3,3")
    .style("opacity", 0)
    .style("cursor", "pointer")
    .style("pointer-events", "all")
    .transition()
    .delay(4500)
    .duration(1500)
    .style("opacity", 1);

  annotationGroup
    .selectAll(".annotation-line")
    .on("mouseover", function (event, d) {
      annotationTooltip.style("opacity", 1).html(d.description);
    })
    .on("mousemove", function (event) {
      annotationTooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px");
    })
    .on("mouseout", function () {
      annotationTooltip.style("opacity", 0);
    });
}
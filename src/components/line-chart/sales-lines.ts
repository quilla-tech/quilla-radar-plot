import * as d3 from "d3";
import { DataPoint } from "./types";

interface DrawSalesLinesParams {
  g: d3.Selection<SVGGElement, unknown, null, undefined>;
  data: DataPoint[];
  xScale: d3.ScaleTime<number, number>;
  yScaleLeft: d3.ScaleLinear<number, number>;
  innerHeight: number;
  allPaths: d3.Selection<SVGPathElement, unknown, null, undefined>[];
}

/**
 * Draw the sales lines: goal, past, future, plus the area fill.
 * Then run animations in sequence: goal -> past -> future -> area.
 */
export function drawSalesLines({
  g,
  data,
  xScale,
  yScaleLeft,
  innerHeight,
  allPaths,
}: DrawSalesLinesParams) {
  const parseDate = (d: string) => new Date(d);

  const areaGenerator = d3
    .area<DataPoint>()
    .x((d) => xScale(parseDate(d.date)))
    .y0(innerHeight)
    .y1((d) => yScaleLeft(d.sales))
    .curve(d3.curveMonotoneX);

  const salesLine = d3
    .line<DataPoint>()
    .x((d) => xScale(parseDate(d.date)))
    .y((d) => yScaleLeft(d.sales))
    .curve(d3.curveMonotoneX);

  const goalLine = d3
    .line<DataPoint>()
    .x((d) => xScale(parseDate(d.date)))
    .y((d) => yScaleLeft(d.goal))
    .curve(d3.curveMonotoneX);

  const today = new Date();
  const pastData = data.filter((d) => parseDate(d.date) <= today);
  const futureData = data.filter((d) => parseDate(d.date) > today);

  // GOAL line
  const goalPath = g
    .append("path")
    .datum(data)
    .attr("class", "goal-line")
    .attr("fill", "none")
    .attr("stroke", "rgb(100, 116, 139)")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5")
    .attr("d", goalLine)
    .style("opacity", 0);
  allPaths.push(goalPath);

  // PAST sales
  const pastPath = g
    .append("path")
    .datum(pastData)
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "rgb(34, 197, 94)")
    .attr("stroke-width", 2)
    .attr("d", salesLine)
    .style("opacity", 0);
  allPaths.push(pastPath);

  // FUTURE sales
  const futurePath = g
    .append("path")
    .datum(futureData)
    .attr("class", "line-future")
    .attr("fill", "none")
    .attr("stroke", "rgb(34, 197, 94)")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5")
    .attr("d", salesLine)
    .style("opacity", 0);
  allPaths.push(futurePath);

  // AREA fill
  const areaPath = g
    .append("path")
    .datum(data)
    .attr("class", "area")
    .attr("fill", "url(#area-gradient)")
    .attr("d", areaGenerator)
    .style("opacity", 0);
  allPaths.push(areaPath);

  // Animate them in sequence
  const goalLength = goalPath.node()?.getTotalLength() || 0;
  goalPath
    .style("opacity", 1)
    .attr("stroke-dasharray", `${goalLength + 10}`)
    .attr("stroke-dashoffset", goalLength)
    .transition()
    .duration(1500)
    .attr("stroke-dashoffset", 0)
    .on("end", function () {
      d3.select(this).attr("stroke-dasharray", "5,5");
      const pastLength = pastPath.node()?.getTotalLength() || 0;
      pastPath
        .style("opacity", 1)
        .attr("stroke-dasharray", pastLength)
        .attr("stroke-dashoffset", pastLength)
        .transition()
        .duration(1500)
        .attr("stroke-dashoffset", 0)
        .on("end", () => {
          const futureLength = futurePath.node()?.getTotalLength() || 0;
          futurePath
            .style("opacity", 1)
            .attr("stroke-dasharray", `${futureLength + 10}`)
            .attr("stroke-dashoffset", futureLength)
            .transition()
            .duration(1500)
            .attr("stroke-dashoffset", 0)
            .on("end", function () {
              d3.select(this).attr("stroke-dasharray", "5,5");
              areaPath
                .transition()
                .duration(1000)
                .style("opacity", 1);
            });
        });
    });
}
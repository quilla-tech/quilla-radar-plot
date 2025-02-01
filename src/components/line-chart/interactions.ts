import * as d3 from "d3";
import { DataPoint, Annotation } from "./types";

interface AddInteractionsParams {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  g: d3.Selection<SVGGElement, unknown, null, undefined>;
  data: DataPoint[];
  annotations: Annotation[];
  xScale: d3.ScaleTime<number, number>;
  yScaleLeft: d3.ScaleLinear<number, number>;
  innerWidth: number;
  innerHeight: number;
  allPaths: d3.Selection<SVGPathElement, unknown, null, undefined>[];
  metricScales: Record<string, d3.ScaleLinear<number, number>>;
}

export function addInteractions({
  svg,
  g,
  data,
  annotations,
  xScale,
  yScaleLeft,
  innerWidth,
  innerHeight,
  allPaths,
  metricScales,
}: AddInteractionsParams) {
  // After lines are drawn, we can add transitions for dimming
  setTimeout(() => {
    // Add a class to all paths for CSS transitions
    allPaths.forEach((path) => {
      path.classed("chart-line", true)
        .style("transition", "opacity 0.2s ease")
        .style("pointer-events", "all");
    });

    // On hover, dim all others
    allPaths.forEach((path) => {
      path
        .on("mouseover", function () {
          allPaths.forEach((other) => {
            other.style("opacity", 0.2);
          });
          d3.select(this).style("opacity", 1);
        })
        .on("mouseout", function () {
          allPaths.forEach((other) => {
            other.style("opacity", 1);
          });
        });
    });
  }, 6000);

  // Create the tooltip for sales & goal
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
    .style("font-size", "14px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  const focus = g.append("g").style("display", "none");
  focus
    .append("circle")
    .attr("pointer-events", "none")
    .attr("class", "sales-circle")
    .attr("r", 4)
    .attr("fill", "rgb(34, 197, 94)");

  focus
    .append("circle")
    .attr("pointer-events", "none")
    .attr("class", "goal-circle")
    .attr("r", 4)
    .attr("fill", "rgb(100, 116, 139)");

  const bisect = d3.bisector<DataPoint, Date>((d) => new Date(d.date)).left;

  // Overlay rect for capturing mouse events
  g.append("rect")
    .attr("class", "overlay")
    .attr("width", innerWidth)
    .attr("height", innerHeight)
    .attr("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", () => {
      focus.style("display", null);
      tooltip.style("opacity", 1);
    })
    .on("mouseout", () => {
      focus.style("display", "none");
      tooltip.style("opacity", 0);
    })
    .on("mousemove", (event) => {
      const [mx] = d3.pointer(event);
      const x0 = xScale.invert(mx);
      const i = bisect(data, x0, 1);
      if (i >= data.length) return;

      const d0 = data[i - 1];
      const d1 = data[i];
      if (!d0 || !d1) return;

      const parseDate = (s: string) => new Date(s);
      const chosen =
        x0.getTime() - parseDate(d0.date).getTime() >
        parseDate(d1.date).getTime() - x0.getTime()
          ? d1
          : d0;

      

      focus
        .select(".sales-circle")
        .attr(
          "transform",
          `translate(${xScale(parseDate(chosen.date))},${yScaleLeft(chosen.sales)})`
        );

      focus
        .select(".goal-circle")
        .attr(
          "transform",
          `translate(${xScale(parseDate(chosen.date))},${yScaleLeft(chosen.goal)})`
        );

      
      


      const dateStr = parseDate(chosen.date).toLocaleDateString();


      // metrics
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

      // Check for annotation on this exact date
      const annos = annotations.filter((a) => a.date === chosen.date);

      // Check for annotation on this exact date

      const metricAnnos = metrics.map((m) => ({
        key: m.key,
        color: m.color,
        value: chosen[m.key as keyof DataPoint] as number
      }));

      console.log(metricAnnos);

      tooltip
        .html(`
          <div class="font-medium">
            ${dateStr}
          </div>
          <div class="flex items-center gap-2">
            <span style="color: rgb(34, 197, 94)">●</span> Revenue: $${chosen.sales.toLocaleString()}
          </div>
          <div class="flex items-center gap-2">
            <span style="color: rgb(100, 116, 139)">●</span> Target: $${chosen.goal.toLocaleString()}
          </div>
          ${
            annos.length
              ? `<div class="mt-2 pt-2 border-t border-gray-200">
                ${annos
                  .map(
                    (a) => `
                      <div class="text-sm text-gray-600">
                        <span class="text-blue-500">●</span> ${a.description}
                      </div>
                    `
                  )
                  .join("")}
              </div>`
              : ""
          }     
          ${
            metricAnnos.length
              ? `<div class="mt-2 pt-2 border-t border-gray-200">
                ${metricAnnos
                  .map(
                    (a) => `
                      <div class="text-sm text-gray-600">
                        <span style="color: ${a.color}">●</span> ${a.key}: ${a.value.toLocaleString()}
                      </div>
                    `
                  )
                  .join("")}
              </div>`
              : ""
          }
         
        `)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 10 + "px");
    });
}
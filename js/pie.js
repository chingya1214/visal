const width2 = 400;
const height2 = 400;
const radius2 = Math.min(width2, height2) / 2;
const svg2 = d3.select("#chart-area")
    .append("svg")
    .attr("width", width2)
    .attr("height", height2)
    .append("g")
    .attr("transform", `translate(${width2 / 2}, ${height2 / 2})`);

const color2 = d3.scaleOrdinal(["#66c2a5","#fc8d62","#8da0cb",
    "#e78ac3","#a6d854","#ffd92f"]);

const pie = d3.pie()
    .value(d => d.count)
    .sort(null);

const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius2);

function type(d) {
    d.A13 = Number(d.A13);
    d.A14 = Number(d.A14);
    d.A15 = Number(d.A15);
    return d;
}

function arcTween(a) {
    const i = d3.interpolate(this._current, a);
    this._current = i(1);
    return (t) => arc(i(t));
}

d3.json("data.json", type).then(data => {
    d3.selectAll("input")
        .on("change", update);

    function update(val = this.value) {
        // Join new csv
        const path2 = svg2.selectAll("path")
            .data(pie(data[val]));

        var div2 = d3.select("body")
            .append("div")
            .attr("class", "tooltip-donut")
            .style("opacity", 0);

        // Update existing arcs
        path2.transition().duration(200).attrTween("d", arcTween);

        // Enter new arcs
        path2.enter().append("path")
            .attr("fill", (d, i) => color2(i))
            .attr("d", arc)
            .attr("stroke", "white")
            .attr("stroke-width", "6px")
            .each(function(d) { this._current = d; })
            .on('mouseover', function (d, i) {
                div2.transition()
                    .duration(50)
                    .style("opacity", 1);
                let num ='<h5>'+(d.data.region).toString()+'</h5>' + '<span>演出場次：'+(d.data.count).toString() + '場'+ '</span><br>票房：'+ (d.data.count2).toString() + '億'+ '<br>銷售票數'+ (d.data.count3).toString() + '萬';
                div2.html(num)
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 15) + "px");
            })
            .on('mouseout', function (d, i) {
                div2.transition()
                    .duration('50')
                    .style("opacity", 0);
            })

    }

    update("A13");
});
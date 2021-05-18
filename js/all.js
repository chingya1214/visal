// set the dimensions and margins of the graph
let margin = {top: 60, right:40, bottom: 50, left: 40},
    width = 560 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
let svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
// const timeConv = d3.time.format("%Y").parse;
const timeConv = d3.timeParse("%Y");
// Parse the Data

Promise.all([
    d3.csv("csv/sumBof.csv"),
    d3.csv("csv/avgBof.csv"),
    d3.csv("csv/session.csv"),
    d3.csv("csv/ticNum.csv")
]).then(function(dataset) {
    const data = dataset[0];
    const dataAvg= dataset[1];
    const dataSession= dataset[2];
    const dataticNum= dataset[3];
    function dataProcess(preData){
        let keys = preData.columns.slice(1)
// color palette
        let color = d3.scaleOrdinal()
            .domain(keys)
            .range(d3.schemeSet2);
// let color = d3.scale.ordinal()
//     .domain(keys)
//     .range(["#79d5b6", "#3646b4", "#85d1e5", "#ad85e5", "#050542"]);

//stack the csv?
        let stackedData = d3.stack()
            .keys(keys)
            (preData)
        return [keys, color, stackedData];
    }
// GENERAL //
//////////

// List of groups = header of the csv files
    let keys = dataProcess(data)[0]
// color palette
    let color = dataProcess(data)[1]
//stack the csv?
    let stackedData = dataProcess(data)[2]
//dataAvg
    let keys2 = dataProcess(dataAvg)[0]
//stack the csv?
    let stackedDataAvg = dataProcess(dataAvg)[2]

    let keys3 = dataProcess(dataSession)[0]
//stack the csv?
    let stackedDataSe = dataProcess(dataSession)[2]

    let keys4 = dataProcess(dataticNum)[0]
//stack the csv?
    let stackedDataticN = dataProcess(dataticNum)[2]

    let dataState = data;
//////////
// AXIS //
//////////

// Add X axis
    const x = d3.scaleTime().range([0,width]);
    x.domain(d3.extent(data, function(d){
        return timeConv(d.year)}));

    let xAxis = svg.append("g").attr("class", "xAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(5))


// Add X axis label:
    svg.append("text").attr("class","xLabel")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height+40 )
        .text("(年)");

// Add Y axis label:
    svg
        .append("text").attr("class","yLabel")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", -20 )
        .text("金額(億)")
        .attr("text-anchor", "start")

// Add Y axis

    let y = d3.scaleLinear()
        .domain([0, d3.max(stackedData, d => d3.max(d, d => d[1])+3 )]).nice()
        //  .domain([0, 20])
        .range([ height, 0 ]);

    let yAxis=svg.append("g").attr("class", "yAxis")
        .call(d3.axisLeft(y))



//////////
// BRUSHING AND CHART //
//////////

// Add a clipPath: everything out of this area won't be drawn.
    let clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width )
        .attr("height", height )
        .attr("x", 0)
        .attr("y", 0);


// Create the scatteletiable: where both the circles and the brush take place
    let areaChart = svg.append('g')
        .attr("clip-path", "url(#clip)")

// Area generator
    let area = d3.area()
        .x(function(d) { return x( timeConv(d.data.year)); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })


// Show the areas
    areaChart
        .selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", function(d) { return "myArea " + d.key })
        .style("fill", function(d) { return color(d.key); })
        .attr("d", area)

/////////////////////Click update/////////////////////////////
    d3.select("#avg_bof").on('click', function(){
        d3.selectAll("#chart h5").html("2013-2019節目平均票房")
        d3.selectAll(".yLabel").remove();
        svg.append("text").attr("class","yLabel")
            .attr("text-anchor", "end")
            .attr("x", 0)
            .attr("y", -20 )
            .text("金額(萬)")
            .attr("text-anchor", "start")
        y = d3.scaleLinear()
            .domain([0, d3.max(stackedDataAvg, d => d3.max(d, d => d[1])+3 )]).nice()
            .range([ height, 0 ]);
        areaChart
            .selectAll(".myArea").data(stackedDataAvg)
            .exit()
            .remove()
            .data(stackedDataAvg)
            .enter()
            .append("path")
            .attr("class", function(d) { return "myArea " + d.key })
            .style("fill", function(d) { return color(d.key); })
            .attr("d", area)
        yAxis.transition().call(d3.axisLeft(y));

        dataState = dataAvg;
        document.getElementById("unit").innerHTML="金額(萬)";

    });

    d3.select("#sum_bof").on('click', function(){
        d3.selectAll("#chart h5").html("2013-2019節目總票房")
        d3.selectAll(".yLabel").remove();
        svg.append("text").attr("class","yLabel")
            .attr("text-anchor", "end")
            .attr("x", 0)
            .attr("y", -20 )
            .text("金額(億)")
            .attr("text-anchor", "start")
        y = d3.scaleLinear()
            .domain([0, d3.max(stackedData, d => d3.max(d, d => d[1])+3 )]).nice()
            .range([ height, 0 ]);
        areaChart
            .selectAll(".myArea").data(stackedData)
            .exit()
            .remove()
            .data(stackedData)
            .enter()
            .append("path")
            .attr("class", function(d) { return "myArea " + d.key })
            .style("fill", function(d) { return color(d.key); })
            .attr("d", area)
        yAxis.transition().call(d3.axisLeft(y));
        dataState = data;
        document.getElementById("unit").innerHTML="金額(億)";
    });

    d3.select("#session").on('click', function(){
        d3.selectAll("#chart h5").html("2013-2019節目場次")
        d3.selectAll(".yLabel").remove();
        svg.append("text").attr("class","yLabel")
            .attr("text-anchor", "end")
            .attr("x", 0)
            .attr("y", -20 )
            .text("場次")
            .attr("text-anchor", "start")
        y = d3.scaleLinear()
            .domain([0, d3.max(stackedDataSe, d => d3.max(d, d => d[1])+3 )]).nice()
            //  .domain([0, 30])
            .range([ height, 0 ]);
        areaChart
            .selectAll(".myArea").data(stackedDataSe)
            .exit()
            .remove()
            .data(stackedDataSe)
            .enter()
            .append("path")
            .attr("class", function(d) { return "myArea " + d.key })
            .style("fill", function(d) { return color(d.key); })
            .attr("d", area)
        yAxis.transition().call(d3.axisLeft(y));
        dataState = dataSession;
        document.getElementById("unit").innerHTML="場次&nbsp;&emsp;&nbsp;";
    });

    d3.select("#tic_num").on('click', function(){
        d3.selectAll("#chart h5").html("2013-2019售票張數")
        d3.selectAll(".yLabel").remove();
        svg.append("text").attr("class","yLabel")
            .attr("text-anchor", "end")
            .attr("x", 0)
            .attr("y", -20 )
            .text("張數(萬)")
            .attr("text-anchor", "start")
        y = d3.scaleLinear()
            .domain([0, d3.max(stackedDataticN, d => d3.max(d, d => d[1])+3 )]).nice()
            .range([ height, 0 ]);
        areaChart
            .selectAll(".myArea").data(stackedDataticN)
            .exit()
            .remove()
            .data(stackedDataticN)
            .enter()
            .append("path")
            .attr("class", function(d) { return "myArea " + d.key })
            .style("fill", function(d) { return color(d.key); })
            .attr("d", area)
        yAxis.transition().call(d3.axisLeft(y));
        dataState = dataticNum;
        document.getElementById("unit").innerHTML="張數(萬)";
    });
    let idleTimeout
    function idled() { idleTimeout = null; }

// A function that update the chart for given boundaries
    function updateChart() {

        extent = d3.event.selection

        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if(!extent){
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
            x.domain(d3.extent(data, function(d) { return  timeConv(d.year); }))
        }else{
            x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
            areaChart.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
        }

        // Update axis and area position
        xAxis.transition().duration(1000).call(d3.axisBottom(x).ticks(5))
        areaChart
            .selectAll("path")
            .transition().duration(1000)
            .attr("d", area)
    }



    //////////
    // HIGHLIGHT GROUP //
    //////////

    // What to do when one group is hovered
    let highlight = function(d){
        console.log(d)
        // reduce opacity of all groups
        d3.selectAll(".myArea").style("opacity", .1)
        // expect the one that is hovered
        d3.select("."+d).style("opacity", 1)
    }

    // And when it is not hovered anymore
    let noHighlight = function(d){
        d3.selectAll(".myArea").style("opacity", 1)
    }



//-------------??----------//
    var timeScales = data.map(function(id) { return x(timeConv(id.year)); });


    var focus = svg.append('g')
        // .csv(function(d){ return d.values })
        .attr('class', 'focus')
        .style('display', 'none');


    focus.append('line')
        .attr('class', 'x-hover-line hover-line')
        .attr('y1' , 0)
        .attr('y2', height);

    var mouseLine = focus
        .append("path") // create vertical line to follow mouse
        .attr("class", "mouse-line")
        .attr("stroke", "#303030")
        .attr("stroke-width", 2)
        .attr("opacity", "0");

    svg.append('rect')
        .attr("class", "overlay")
        .attr("width", width+20)
        .attr("height", height)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove);

    function mouseover() {
        focus.style("display", null);
// tooltip.style("display", null);
    }
    function mouseout() {
        focus.style("display", "none");
// tooltip.style("display", "none");
    }
    function mousemove() {

        var i = d3.bisect(timeScales, d3.mouse(this)[0], 1);
        var di = dataState[i-1];
        let sum;
        if (dataState==dataAvg){
            document.getElementById("other").innerHTML="-";
            sum = parseFloat(di.戲劇)+parseFloat(di.音樂)+parseFloat(di.舞蹈)+parseFloat(di.親子);

        }else{
            document.getElementById("other").innerHTML=di.其他;
            sum = parseFloat(di.戲劇)+parseFloat(di.音樂)+parseFloat(di.舞蹈)+parseFloat(di.親子)+parseFloat(di.其他);
        }

        sum = sum.toFixed(1);
        document.getElementById("year").innerHTML=di.year;
        document.getElementById("drama").innerHTML=di.戲劇;
        document.getElementById("music").innerHTML=di.音樂;
        document.getElementById("dance").innerHTML=di.舞蹈;
        document.getElementById("child").innerHTML=di.親子;

        document.getElementById("total").innerHTML=sum;

        focus.attr("transform", "translate(" + x(timeConv(di.year)) + ",0)");

    }





});
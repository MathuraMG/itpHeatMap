function makeAjaxCallLineGraph(){
  $.ajax({
    url: serverUrl + '/login?loginId=horsetrunk12',
    success: function(result){
      console.log('LOGGED IN');

    },
    error: function(result){
      console.log(result);
    }
  }).done(function(){
    var startTime = new Date("2016-05-11");
    startTime = startTime.toISOString();
    startTime = startTime.slice(0,-5);
    $.ajax({
      url: serverUrl + '/floordata_itp?startTime=' + startTime ,
      success: function(result){

        data = parseData(result);
        // for(var i=0;i<1;i++){
        //   data = data.concat(data)
        // }
        console.log(JSON.stringify(data));
        console.log(JSON.parse(JSON.stringify(data)));

        console.log('start mapping at -- ' + new Date());
        drawLineGraph();
        console.log('finish mapping at -- ' + new Date());
        addEveryMinute();

      }
    })
  });
}

function parseData(result){
  var parsedData = [];
  var rawData = result[0].data.data;
  for(var i =0;i<rawData.length;i++){
    parsedData.push({
      "date":new Date(rawData[i].x),
      "val":rawData[i]["NYU ITP"]});
  }
  return parsedData;
}

function fillData(){
  for(var i =0;i<1000;i++){
    var tempDate = new Date(new Date() - i*100*60*60*60);
    data.push({
      "date":tempDate,
      "val":(Math.random()*20).toFixed(1)%10
    });
  }
}

function drawLineGraph() {

  //calculate min and max date
  var minN = d3.min(data, function (d) { return d.date; }).getTime(),
      maxN = d3.max(data, function (d) { return d.date; }).getTime();
  var minDate = new Date(minN),
      maxDate = new Date(maxN);

  //calculate min and max y
  var yMin = d3.min(data, function (d) { return d.val; }),
      yMax = d3.max(data, function (d) { return d.val; });

  //Draw the main chart

  var margin = {top: 20, right: 20, bottom: 30, left: 35},
  width = 660 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

  plotChart = d3.select('#chart').classed('chart', true).append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var plotArea = plotChart.append('g')
  .attr('clip-path', 'url(#plotAreaClip)');

  plotArea.append('clipPath')
  .attr('id', 'plotAreaClip')
  .append('rect')
  .attr({ width: width, height: height });

  //define the x scale

  xScale = d3.time.scale()
  .domain([minDate, maxDate])
  .range([0, width]);

  yScale = d3.scale.linear()
  .domain([0, yMax])
  .range([height, 0]);

  //define the x and y axes

  xAxis = d3.svg.axis()
  .scale(xScale)
  .orient('bottom')
  .ticks(5),
  yAxis = d3.svg.axis()
  .scale(yScale)
  .orient('left');

  plotChart.append('g')
  .attr('class', 'line-graph-axis')
  .attr('transform', 'translate(0,' + height + ')')
  .call(xAxis);

  plotChart.append('g')
  .attr('class', 'line-graph-axis')
  .call(yAxis);

  //define the line

  var lineFunc = d3.svg.line()
  .x(function(d) {
    return xScale(new Date(d.date));
  })
  .y(function(d) {
    return yScale(d.val);
  })
  .interpolate('basis');

  plotChart.append('svg:path')
  .attr('d', lineFunc(data))
  .attr('stroke', '#82C9C9')
  .attr('stroke-width', 2)
  .attr('fill', 'none')
  .attr('class','line-graph-path')

  //draw the lower chart

  var navWidth = width,
  navHeight = 100 - margin.top - margin.bottom;

  var navChart = d3.select('#chart').classed('chart', true).append('svg')
  .classed('navigator', true)
  .attr('width', navWidth + margin.left + margin.right)
  .attr('height', navHeight + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // x and y axis for the lower chart

  var navXScale = d3.time.scale()
  .domain([minDate, maxDate])
  .range([0, navWidth]);

  var navYScale = d3.scale.linear()
  .domain([yMin, yMax])
  .range([navHeight, 0]);

  //define the x axis

  var navXAxis = d3.svg.axis()
  .scale(navXScale)
  .ticks(5)
  .orient('bottom');

  navChart.append('g')
  .attr('class', 'line-graph-axis')
  .attr('transform', 'translate(0,' + navHeight + ')')
  .call(navXAxis);

  // add the data in the bottom part

  var navData = d3.svg.area()
  .x(function (d) { return navXScale(d.date); })
  .y0(navHeight)
  .y1(function (d) { return navYScale(d.val); })
  .interpolate('basis');;

  var navLine = d3.svg.line()
  .x(function (d) { return navXScale(d.date); })
  .y(function (d) { return navYScale(d.val); })
  .interpolate('basis');

  navChart.append('path')
  .attr('class', 'data')
  .attr('d', navData(data))

  navChart.append('path')
  .attr('class', 'line')
  .attr('d', navLine(data));

  //brush event ??

  var viewport = d3.svg.brush()
  .x(navXScale)
  .on("brush", function () {
      xScale.domain(viewport.empty() ? navXScale.domain() : viewport.extent());
      redrawChart(plotChart,xScale,yScale,data,xAxis);
  });

  //viewport component

  navChart.append("g")
  .attr("class", "viewport")
  .call(viewport)
  .selectAll("rect")
  .attr("height", navHeight);

}

function redrawChart(plotChart,xScaleTemp,yScale,data,xAxis) {

  var lineFuncTemp = d3.svg.line()
  .x(function(d) {
    return xScaleTemp(new Date(d.date));
  })
  .y(function(d) {
    return yScale(d.val);
  })
  .interpolate('basis');

  $('.line-graph-path').remove();
  plotChart.append('svg:path')
  .attr('d', lineFuncTemp(data))
  .attr('stroke', '#82C9C9')
  .attr('stroke-width', 2)
  .attr('fill', 'none')
  .attr('class','line-graph-path')

  plotChart.select('.x.axis').call(xAxis);
}

function addEveryMinute() {
  var oneMin = 120*1000;

  //call the outlet every 1 minute to check if the number has changed
  setInterval(function(){
    var now = new Date();
    now.setSeconds(0);
    startTime1 = now - 60*1000 - 4*60*60*1000;
    startTime1 = new Date(startTime1);
    startTime1 = startTime1.toISOString();
    startTime1 = startTime1.slice(0,-5);
    console.log(startTime1);
    var tempUrl = serverUrl + '/floordata_itp?startTime=' + startTime1 ;
    console.log(tempUrl);
    $.ajax({
      url: tempUrl,
      success: function(result){
        console.log('here is the result');
        console.log(result);
        data.shift();
        data.push({
          "date":new Date(result[0].data.data[0].x),
          "val":result[0].data.data[0]["NYU ITP"]});

        //redraw the graph
        redrawChart(plotChart,xScale,yScale,data,xAxis);

        }
      })
  }, 60000);

}

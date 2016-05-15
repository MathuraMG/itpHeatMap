var serverUrl = "http://0.0.0.0:5000";
var selectedTimeRange = [];
function makeAjaxCallLineGraph(){
  var serverUrl = "https://itpenertivserver.herokuapp.com";
  $.ajax({

    url: serverUrl + '/login?loginId=horsetrunk12',
    success: function(result){
      console.log('LOGGED IN');

    },
    error: function(result){
      console.log(result);
    }
  }).done(function(){
    var now = new Date();
    now.setSeconds(0);
    startTime = now - 1*60*60*1000 - 4*60000*60; //temp hack for EST. Conert to moment js - 4*60000*60
    startTime = new Date(startTime);
    startTime = startTime.toISOString();
    startTime = startTime.slice(0,-5);
    var serverUrl = "https://itpenertivserver.herokuapp.com";
    $.ajax({

      url: serverUrl + '/floordata_itp?startTime=' + startTime ,
      success: function(result){

        accumData = parseData(result);
        // for(var i=0;i<1;i++){
        //   data = data.concat(data)
        // }
        console.log(JSON.stringify(accumData));
        console.log(JSON.parse(JSON.stringify(accumData)));

        console.log('start mapping at -- ' + new Date());
        drawLineGraph();
        console.log('finish mapping at -- ' + new Date());
        // addEveryMinute();
        //get heat map here


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
    accumData.push({
      "date":tempDate,
      "val":(Math.random()*20).toFixed(1)%10
    });
  }
}

function drawLineGraph() {

  //calculate min and max date
  var minN = d3.min(accumData, function (d) { return d.date; }).getTime(),
      maxN = d3.max(accumData, function (d) { return d.date; }).getTime();
  var minDate = new Date(minN),
      maxDate = new Date(maxN);

  //calculate min and max y
  var yMin = d3.min(accumData, function (d) { return d.val; }),
      yMax = d3.max(accumData, function (d) { return d.val; });

  //Draw the main chart

  var margin = {top: 0.1*window.innerHeight, right: 20, bottom: 30, left: 35},
  width = 0.5*window.innerWidth - margin.left - margin.right,
  height = 0.25*window.innerHeight - margin.top - margin.bottom;

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
  .domain([0, yMax+5])
  .range([height, 0]);

  //define the x and y axes

  xAxis = d3.svg.axis()
  .scale(xScale)
  .orient('bottom')
  .ticks(5),
  yAxis = d3.svg.axis()
  .scale(yScale)
  .ticks(4)
  .orient('left');

  plotChart.append('g')
  .attr('class', 'line-graph-axis')
  .attr('transform', 'translate(0,' + height + ')')
  .call(xAxis);

  plotChart.append('g')
  .attr('class', 'line-graph-axis-y')
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

  plotArea.append('svg:path')
  .attr('d', lineFunc(accumData))
  .attr('class','line-graph-area')

  // $('.line-graph-area').wrap('<div class="line-graph-area-container"></div>');


  //draw the lower chart

  var navWidth = width,
  navHeight = 0.17*window.innerHeight - margin.top - margin.bottom;

  var navChart = d3.select('#chart').classed('chart', true).append('svg')
  .classed('navigator', true)
  .attr('width', navWidth + margin.left + margin.right)
  .attr('height', navHeight + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + 0 + ')');

  // x and y axis for the lower chart

  var navXScale = d3.time.scale()
  .domain([minDate, maxDate])
  .range([0, navWidth]);

  var navYScale = d3.scale.linear()
  .domain([0, yMax])
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
  .interpolate('basis');

  navChart.append('path')
  .attr('class', 'data')
  .attr('d', navData(accumData));

  //brush event ??

  var viewport = d3.svg.brush()
  .x(navXScale)
  .on("brush", function () {
      xScale.domain(viewport.empty() ? navXScale.domain() : viewport.extent());
      redrawChart(plotArea,plotChart,xScale,yScale,accumData,xAxis,height);
  });

  //viewport component

  navChart.append("g")
  .attr("class", "viewport")
  .call(viewport)
  .selectAll("rect")
  .attr("height", navHeight);

  xScale.domain([
      accumData[accumData.length-20].date,
      accumData[accumData.length-1].date
  ]);



  redrawChart(plotArea,plotChart,xScale,yScale,accumData,xAxis,height);
  updateViewportFromChart(minDate,maxDate,xScale,viewport,navChart)

}

function updateZoomFromChart(zoom,xScale,maxDate,minDate) {

    zoom.x(xScale);

    var fullDomain = maxDate - minDate,
        currentDomain = xScale.domain()[1] - xScale.domain()[0];

    var minScale = currentDomain / fullDomain,
        maxScale = minScale * 20;

    zoom.scaleExtent([minScale, maxScale]);
}

function updateViewportFromChart(minDate,maxDate,xScale,viewport,navChart) {
  if ((xScale.domain()[0] <= minDate) && (xScale.domain()[1] >= maxDate)) {
      viewport.clear();
  }
  else {
      viewport.extent(xScale.domain());
  }
  navChart.select('.viewport').call(viewport);
}

function redrawChart(plotArea,plotChart,xScaleTemp,yScale,accumData,xAxis,height) {

  var lineFuncTemp = d3.svg.line()
  .x(function(d) {
    return xScale(new Date(d.date));
  })
  .y(function(d) {
    return yScale(d.val);
  })
  .interpolate('basis');

  $('.line-graph-area').remove();

  plotArea.append('svg:path')
  .attr('d', lineFuncTemp(accumData))
  .attr('class','line-graph-area')
  .attr('fill','none');


  plotChart.select('.line-graph-axis').call(xAxis);
  selectedTimeRange = xScaleTemp.domain();
  plotChart.select('.line-graph-axis-y').call(yAxis);

  getEnergyUsage();

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
        accumData.shift();
        accumData.push({
          "date":new Date(result[0].data.data[0].x),
          "val":result[0].data.data[0]["NYU ITP"]});

        //redraw the graph
        redrawChart(plotArea,plotChart,xScale,yScale,accumData,xAxis,height);

        }
      })
  }, 60000);

}

function getEnergyUsage() {
  var energyCalcData = $.grep(accumData, function(d) {
    return d.date >= selectedTimeRange[0] && d.date <= selectedTimeRange[1];
  });

  var total = energyCalcData.map(function(a) {
    return a.val;
  }).reduce(function(a, b) {
    return a + b;
  })/60;

  changeEnergyNumbers(total);
}

function changeEnergyNumbers(energyValue) {
  console.log(energyValue);
  //potato - 225kcal = 0.261675 kWh
  var noOfPotato = energyValue/0.261675;
  var hrOfHairdryer = energyValue/1.5;
  var noOfCFL = energyValue/0.14;
  $('.calc-energy-num.num-potato').html(' x ' + noOfPotato.toFixed(0) );
  $('.calc-energy-num.num-hairdryer').html(  hrOfHairdryer.toFixed(0) +' hrs');
  $('.calc-energy-num.num-cfl').html(' x ' + noOfCFL.toFixed(0) );
  $('.calc-energy-val').html(energyValue.toFixed(2));
}

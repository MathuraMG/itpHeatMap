$(document).ready(function() {
  //for the three d model
  setUpThreeJS();
  setupHTMLStructure();
  render();
  animate();
  // makeAjaxCall();
  // getRealTimePower();
  // get24hourData(makeAjaxCallLineGraph);


  //using the same data for the line graph
  makeAjaxCallLineGraph();


});

function setupHTMLStructure() {

  $('canvas').wrap('<section class="pg1-3dmodel"></section>');
  var section = $('<section>');
  section.attr('class','pg1-potatoviz');
  $('body').append(section);

  //section for the line graph
  var section = $('<section>');
  section.attr('class','pg1-linegraph');
  $('body').append(section);

  var div = $('<div>');
  div.attr('id','chart');
  section.append(div);

  var headingDiv = $('<div>');
  headingDiv.attr('class','pg1-linegraph-heading');
  headingDiv.html('Power consumption over last month');
  section.append(headingDiv);

  //section for the what if
  var section = $('<section>');
  section.attr('class','pg-whatif');
  $('body').append(section);
}

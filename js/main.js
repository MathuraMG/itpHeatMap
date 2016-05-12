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
  var section = $('<section>');
  section.attr('class','pg1-linegraph');
  $('body').append(section);
  var div = $('<div>');
  div.attr('id','chart');
  section.append(div);
  var section = $('<section>');
  section.attr('class','pg-whatif');
  $('body').append(section);
}

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

  var modelContainer = document.getElementsByClassName('pg1-3dmodel')[0];
  modelContainer.addEventListener( 'mousemove', onMouseMove, false );
  modelContainer.addEventListener( 'click', onMouseClick, false );
  var speechBubble = $('<div>');
  speechBubble.attr('class','bubble');
  $('.pg1-3dmodel').append(speechBubble);

  //POTATOES

  var section = $('<section>');
  section.attr('class','pg1-potatoviz');
  $('body').append(section);

  var calcDiv = $('<div>');
  calcDiv.attr('class','calc-div');
  section.append(calcDiv);

  var calcImage = $('<img>');
  calcImage.attr('class','calc-energy-image');
  calcImage.attr('src','assets/potato.png');
  calcDiv.append(calcImage);

  var calcNum = $('<div>');
  calcNum.attr('class','calc-energy-num');
  calcDiv.append(calcNum);

  var calcVal = $('<div>');
  calcVal.attr('class','calc-energy-val');
  calcDiv.append(calcVal);

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

}

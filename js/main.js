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

  //THE HEAT MAP
  //LEFT SIDE
  $('canvas').wrap('<section class="pg1-3dmodel"></section>');

  var modelContainer = document.getElementsByClassName('pg1-3dmodel')[0];
  modelContainer.addEventListener( 'mousemove', onMouseMove, false );
  modelContainer.addEventListener( 'click', onMouseClick, false );
  var speechBubble = $('<div>');
  speechBubble.attr('class','bubble');
  $('.pg1-3dmodel').append(speechBubble);

  //POTATOES
  //RIGHT SIDE

  //section for the line graph
  var section = $('<section>');
  section.attr('class','pg1-linegraph');
  $('body').append(section);

  var imageDiv = $('<div>');
  imageDiv.attr('class','pg1-linegraph-image');
  section.append(imageDiv);

  var calcDiv = $('<div>');
  calcDiv.attr('class','calc-div');
  section.append(calcDiv);

  var calcVal = $('<div>');
  calcVal.attr('class','calc-energy-val-text');
  calcDiv.append(calcVal);
  calcVal.html('Energy Consumed over time selected');

  var calcVal = $('<div>');
  calcVal.attr('class','calc-energy-val');
  calcDiv.append(calcVal);


  var calcVal = $('<div>');
  calcVal.attr('class','calc-energy-val-unit');
  calcDiv.append(calcVal);
  calcVal.html('kilo Watt hours');

  var calcSpeechBubble = $('<div>');
  calcSpeechBubble.attr('class','calc-bubble');
  calcDiv.append(calcSpeechBubble);

  var calcImage = $('<img>');
  calcImage.attr('class','calc-energy-image');
  calcImage.attr('src','assets/potato.png');
  calcDiv.append(calcImage);

  var calcNum = $('<div>');
  calcNum.attr('class','calc-energy-num');
  calcDiv.append(calcNum);





  var div = $('<div>');
  div.attr('id','chart');
  section.append(div);



}

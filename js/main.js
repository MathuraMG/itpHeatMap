$(document).ready(function() {
  //for the three d model
  setUpThreeJS();
  setupHTMLStructure();
  render();
  animate();
  // makeAjaxCall();
  // getRealTimePower();
  // get24hourData(makeAjaxCallLineGraph);


  //line graph
  makeAjaxCallLineGraph();
  addEveryMinute();

  //heatMap
  makeAjaxCall();
  getRealTimePower();

  //if(isRoomDataOn==true)


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

  var modelHeading = $('<div>');
  modelHeading.attr('class','model-heading');
  $('.pg1-3dmodel').append(modelHeading);
  modelHeading.html('An overview of the current power consumption at ITP');


  //POTATOES
  //RIGHT SIDE

  //section for the line graph
  var section = $('<section>');
  section.attr('class','pg1-linegraph');
  $('body').append(section);

  var imageDiv = $('<div>');
  imageDiv.attr('class','pg1-linegraph-image');
  // section.append(imageDiv);

  var calcDiv = $('<div>');
  calcDiv.attr('class','calc-div');
  section.append(calcDiv);

  var calcLeftText = $('<div>');
  calcLeftText.attr('class','calc-left-text');
  calcDiv.append(calcLeftText);

  var calcVal = $('<div>');
  calcVal.attr('class','calc-energy-val-text');
  calcLeftText.append(calcVal);
  calcVal.html('Energy Consumed over time selected');

  var calcVal = $('<div>');
  calcVal.attr('class','calc-energy-val');
  calcLeftText.append(calcVal);


  var calcVal = $('<div>');
  calcVal.attr('class','calc-energy-val-unit');
  calcLeftText.append(calcVal);
  calcVal.html('kilo Watt hours');

  var calcSpeechBubble = $('<div>');
  calcSpeechBubble.attr('class','calc-bubble');
  calcDiv.append(calcSpeechBubble);

  var calcImage = $('<img>');
  calcImage.attr('class','calc-energy-image image-potato');
  calcImage.attr('src','assets/potato.png');
  calcSpeechBubble.append(calcImage);

  var calcNum = $('<div>');
  calcNum.attr('class','calc-energy-num num-potato');
  calcSpeechBubble.append(calcNum);

  var calcImage = $('<img>');
  calcImage.attr('class','calc-energy-image image-potato');
  calcImage.attr('src','assets/hairDryer.png');
  calcSpeechBubble.append(calcImage);

  var calcNum = $('<div>');
  calcNum.attr('class','calc-energy-num num-hairdryer');
  calcSpeechBubble.append(calcNum);

  var calcImage = $('<img>');
  calcImage.attr('class','calc-energy-image image-potato');
  calcImage.attr('src','assets/cfl.jpeg');
  calcSpeechBubble.append(calcImage);

  var calcNum = $('<div>');
  calcNum.attr('class','calc-energy-num num-cfl');
  calcSpeechBubble.append(calcNum);



  var div = $('<div>');
  div.attr('id','chart');
  section.append(div);

  drawEquipmentsBack();


}

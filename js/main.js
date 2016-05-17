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
  $('.pg1-3dmodel').click( onMouseClick );



  var speechBubble = $('<div>');
  speechBubble.attr('class','bubble');
  $('.pg1-3dmodel').append(speechBubble);

  var modelContent = $('<div>');
  modelContent.attr('class','model-content');
  $('.pg1-3dmodel').append(modelContent);

  var modelHeading = $('<div>');
  modelHeading.attr('class','model-heading');
  modelContent.append(modelHeading);
  modelHeading.html('AN ENERGY OVERVIEW');

  var modelSubHeading = $('<div>');
  modelSubHeading.attr('class','model-sub-heading');
  modelContent.append(modelSubHeading);
  modelSubHeading.html('the ITP edition &nbsp;');

  var modelHeadingDesc = $('<div>');
  modelHeadingDesc.attr('class','model-heading-desc');
  modelContent.append(modelHeadingDesc);
  modelHeadingDesc.html('Realtime Power Consumption Map');

  var legendContent = $('<div>');
  legendContent.attr('class','legend-content');
  $('.pg1-3dmodel').append(legendContent);

  var legendGradient = $('<img>');
  legendGradient.attr('class','legend-gradient-img');
  legendGradient.attr('src','assets/gradient.png');
  legendContent.append(legendGradient);

  var legendGradient = $('<div>');
  legendGradient.attr('class','legend-gradient-text');
  legendContent.append(legendGradient);

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
  calcVal.attr('class','calc-energy-val');
  calcLeftText.append(calcVal);

  var calcVal = $('<div>');
  calcVal.attr('class','calc-energy-val-unit');
  calcLeftText.append(calcVal);
  calcVal.html('kilo Watt hours');

  var calcVal = $('<div>');
  calcVal.attr('class','calc-energy-val-text');
  calcLeftText.append(calcVal);
  calcVal.html('Energy Consumed over time selected');



  // var calcSpeechBubbleDecoy = $('<div>');
  // calcSpeechBubbleDecoy.attr('class','calc-bubble-decoy');
  // calcDiv.append(calcSpeechBubbleDecoy);

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
  calcImage.attr('class','calc-energy-image image-dryer');
  calcImage.attr('src','assets/hairDryer.png');
  calcSpeechBubble.append(calcImage);

  var calcNum = $('<div>');
  calcNum.attr('class','calc-energy-num num-hairdryer');
  calcSpeechBubble.append(calcNum);

  var calcImage = $('<img>');
  calcImage.attr('class','calc-energy-image image-cfl');
  calcImage.attr('src','assets/cfl.png');
  calcSpeechBubble.append(calcImage);

  var calcNum = $('<div>');
  calcNum.attr('class','calc-energy-num num-cfl');
  calcSpeechBubble.append(calcNum);



  var div = $('<div>');
  div.attr('id','chart');
  section.append(div);

  drawEquipmentsBack();


}

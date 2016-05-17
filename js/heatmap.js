//Questions:
//What is classed??

//TODO:
// Attach zoom functionality


var monthArray = [ "Jan","Feb", "March","April","May","June","July","Aug","Sept","Oct","Nov","Dec"];
//REFERENCE
// File op - https://gist.github.com/Arahnoid/9925725

var accumData = [];
var cubes; //3d model of the rooms
var roomPower = [];
var schema;

//Three JS variables
var scene;
var camera;
var renderer;
var controls;
var threePointLight1;
var threePointLight2;
var threePointLight3;
var ambientLight;

var mouseVector;
var raycaster;

var SCREEN_WIDTH = window.innerWidth*0.5, SCREEN_HEIGHT = window.innerHeight*.99;
var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR = 20000;

var plotArea,plotChart,xScale,yScale,accumData,xAxis,height, width,margin;

var navWidth, navChart, navXScale, navYScale,navXAxis, navData, viewport, zoom;
// var serverUrl = "http://0.0.0.0:5000";
// var serverUrl = "https://itpenertivserver.herokuapp.com";
var serverUrl = "https://agile-reef-71741.herokuapp.com";

var myInterval,floorDataInterval,roomDataInterval;

var isRoomDataOn = false;

// set up scene/camera etc for 3js
function setUpThreeJS() {
  //Three.js
  //set scene
  scene = new THREE.Scene();

  //set camera
  camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene.add(camera);
   camera.position.set(100*.82,-1700*.82,1500*.82);
  camera.lookAt(scene.position);

  //set renderer
  renderer = new THREE.WebGLRenderer( {antialias:true} );
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  document.body.appendChild(renderer.domElement);

  //set events
  THREEx.WindowResize(renderer, camera); // automatically resize renderer
  THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) }); // toggle full-screen on given key press

  //setuup the light
  ambientLight = new THREE.AmbientLight(0xFFFFFF);
  scene.add(ambientLight);

  threePointLight1= new THREE.PointLight(0xffffff,1,1500);
  threePointLight1.position.set(0,100,1000);
  scene.add(threePointLight1);

  threePointLight2= new THREE.PointLight(0xffffff,1,1000);
  threePointLight2.position.set(800,-400,-10);
  scene.add(threePointLight2);

  threePointLight3= new THREE.PointLight(0xffffff,1,1000);
  threePointLight3.position.set(0,-400,500);
  scene.add(threePointLight3);

  //set controls (using lib - OrbitControls.js)

  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.addEventListener( 'change', render );

  //for select and click
  mouseVector = new THREE.Vector3();
  raycaster = new THREE.Raycaster();

}

// render three js
function render() {
  requestAnimationFrame( render );
  renderer.render(scene, camera);
  renderer.setSize(SCREEN_WIDTH , SCREEN_HEIGHT );
  renderer.setClearColor(0x3389d3);
};

// animate three js
function animate(){
  requestAnimationFrame( animate );
  controls.update();
};

// get data from server
function makeAjaxCall() {

  var now = new Date();
  now.setSeconds(0);
  startTime = now - 120*1000;// - 4*60000*60;// temp hack for EST. Conert to moment js - 4*60000*60
  startTime = new Date(startTime);
  startTime = startTime.toISOString();
  startTime = startTime.slice(0,-5);
  var serverUrl = "https://agile-reef-71741.herokuapp.com";

  $.ajax({
    url: serverUrl + '/login?loginId=horsetrunk12',
    async: false,
    success: function(result){
      console.log('LOGGED IN');
    }
  }).done(function(){
    var serverUrl = "https://agile-reef-71741.herokuapp.com";
    $.ajax({
      url: serverUrl + '/schema_itp',
      async: false,
      success: function(result){
        schema = JSON.parse(result);
      }
    }).done(function(){
      var subLocationArray = '';
      var outputData = '';
      for(var i =0;i<schema.length;i++)
      {
        subLocationArray = subLocationArray.concat(schema[i].id);
        if(i!=schema.length-1){
          subLocationArray = subLocationArray.concat(',');
        }
      }

      $.ajax({
        url: serverUrl + '/floordata_itp?startTime=' + startTime + '&sublocationId=' + subLocationArray,
        async: false,
        success: function(result){
          subLocationData = result;
          console.log(result);
          // data is ready, show the heat map
          drawHeatMap(subLocationData);
        }
      })
    });
  });
}

// parse data
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

// get power drawn on floor
function getRealTimePower() {
  var oneMin = 120*1000;
  console.log(' in here saving the day ');
  //call the outlet every 1 minute to check if the number has changed
  floorDataInterval = setInterval(function(){
    floorDataUpdate();
  }, 30000);

}

// draw 3d heat map
function drawHeatMap(subLocationData) {

  cubes = new THREE.Object3D();
  scene.add( cubes );

  //find the room with maximum energy usage on the floor
  var maxEnergy  = 0;

  for(var i = 0; i < rooms.length; i++ ) {
    var tempEnergy = 0;
    for(var j =0;j<rooms[i].sublocationId.length;j++){
      tempEnergy += getPowerForSubLocation(rooms[i].sublocationId[j]);
    }
    if(tempEnergy > maxEnergy){
      maxEnergy = tempEnergy;
    }
  }

  var rectLength = 10000, rectWidth = 10000;

  var rectShape = new THREE.Shape();
  rectShape.moveTo( 0,0 );
  rectShape.lineTo( 0, rectWidth );
  rectShape.lineTo( rectLength, rectWidth );
  rectShape.lineTo( rectLength, 0 );
  rectShape.lineTo( 0, 0 );

  var rectGeom = new THREE.ShapeGeometry( rectShape );
  var gridHelper = new THREE.GridHelper( rectLength, 20 );
  gridHelper.rotation.set(0,3.14/2,3.14/2);
  gridHelper.position.set(0,0,-9);
  gridHelper.setColors(0x358ACE,0x358ACE);
  scene.add( gridHelper );

  var gridXY = new THREE.Mesh( rectGeom, new THREE.MeshBasicMaterial( { color: 0x096DC2 } ) ) ;
  gridXY.rotation.set(0,3.14/2,3.14/2); //bottom wall
  gridXY.position.set(-450,-rectLength+100,-10);
  scene.add( gridXY );

  var gridYZ = new THREE.Mesh( rectGeom, new THREE.MeshBasicMaterial( { color: 0x358ACE } ) ) ;
  gridYZ.rotation.set(3.14/2,0,3.14/2); //back wall?
  gridYZ.position.set(rectLength-450,0-350,-10);
  scene.add( gridYZ );

  var gridXZ = new THREE.Mesh( rectGeom, new THREE.MeshBasicMaterial( { color: 0x67A8DA } ) ) ;
  gridXZ.position.set(-450,-rectLength-150,-10); //k
  scene.add( gridXZ );

  for(var i = 0; i < rooms.length; i++ ) {
    var tempTotalPower = 0;

    for(var j =0;j<rooms[i].sublocationId.length;j++){
      tempTotalPower += getPowerForSubLocation(rooms[i].sublocationId[j]);
    }

    if(tempTotalPower == 0) {
      tempTotalPower = 0.0002;
    }

    roomPower[i] = tempTotalPower;

    var texture = [];
    // material texture
    for(var m =0;m<5;m++){
      texture[m] = new THREE.Texture( generateTexture(tempTotalPower,maxEnergy)[m] );
      texture[m].needsUpdate = true;
    }

    var ratio = tempTotalPower/maxEnergy;
    var test = 90*ratio;
    var topColor = 'hsl('+(90-test)+', 100%, 50%)';

    var geom = new THREE.CubeGeometry( rooms[i].w, rooms[i].l, tempTotalPower*150  );
    var grayness = Math.random() * 0.5 + 0.25;
    var cubeMaterials = [
      new THREE.MeshLambertMaterial({ map: texture[4], transparent: true }),//right wall SET
      new THREE.MeshLambertMaterial({ map: texture[4], transparent: true }),//left wall
      new THREE.MeshLambertMaterial({ map: texture[4], transparent: true }),//back wall SET
      new THREE.MeshLambertMaterial({ map: texture[4], transparent: true }),//front wall SET
      new THREE.MeshLambertMaterial({ map: texture[4], transparent: true }),
      new THREE.MeshLambertMaterial({ map: texture[4], transparent: true }),
    ];
    var mat = new THREE.MeshFaceMaterial( cubeMaterials );
    var cube = new THREE.Mesh( geom, mat );

    var legendRatio = ((maxEnergy*1000/50).toFixed(0))*10;
    var legendText =
    ' > ' + legendRatio*4 + 'W <br><br>'+
     legendRatio*1 + 'W - ' + legendRatio*4 + 'W <br><br>' +
     legendRatio*2 + 'W - ' + legendRatio*3 + 'W <br><br>' +
     legendRatio*3 + 'W - ' + legendRatio*2 + 'W <br><br>' +
    '< ' + legendRatio*1 + 'W <br><br>' ;
    $('.legend-gradient-text').html(legendText);

    scene.add(cube);
    cube.position.set(rooms[i].xpos, rooms[i].ypos-350 - 400, tempTotalPower*75); // change the center of 'z' to the base
    cube.rotation.set( 0, 0, 0);
    cube.grayness = grayness; // *** NOTE THIS
    cube.userData = {
               id: rooms[i].sublocationId,
               name: rooms[i].name,
               power: tempTotalPower
           };
    cubes.add( cube );
  }
}

//updates the heat map every minute
function updateHeatMap(subLocationData) {

  //find the room with maximum energy usage on the floor
  var maxEnergy  = 0;

  for(var i = 0; i < rooms.length; i++ ) {
    var tempEnergy = 0;
    for(var j =0;j<rooms[i].sublocationId.length;j++){
      tempEnergy += getPowerForSubLocation(rooms[i].sublocationId[j]);
    }
    if(tempEnergy>maxEnergy){
      maxEnergy = tempEnergy;
    }
  }

  for(var i = 0; i < rooms.length; i++ ) {
    var tempTotalPower = 0;

    for(var j =0;j<rooms[i].sublocationId.length;j++){
      tempTotalPower += getPowerForSubLocation(rooms[i].sublocationId[j]);
    }

    if(tempTotalPower == 0) {
      tempTotalPower = 0.0002;
    }

    // console.log('altering height i think')
    cubes.children[i].scale.z *= tempTotalPower/roomPower[i];
    cubes.children[i].position.z = tempTotalPower*75;
    cubes.children[i].userData.power = tempTotalPower;
    roomPower[i] = tempTotalPower;

    var legendRatio = ((maxEnergy*1000/50).toFixed(0))*10;
    var legendText =
    ' > ' + legendRatio*4 + 'W <br><br>'+
     legendRatio*1 + 'W - ' + legendRatio*4 + 'W <br><br>' +
     legendRatio*2 + 'W - ' + legendRatio*3 + 'W <br><br>' +
     legendRatio*3 + 'W - ' + legendRatio*2 + 'W <br><br>' +
    '< ' + legendRatio*1 + 'W <br><br>' ;
    $('.legend-gradient-text').html(legendText);

    var texture = [];

    for(var m =0;m<5;m++){
      texture[m] = new THREE.Texture( generateTexture(tempTotalPower,maxEnergy)[m] );
      texture[m].needsUpdate = true;
    }

    ratio = tempTotalPower/maxEnergy;
    test = 90*ratio;
    topColor = 'hsl('+(90-test)+', 100%, 50%)';

    cubes.children[i].material.materials[0].map = texture[4];
    cubes.children[i].material.materials[1].map = texture[4];
    cubes.children[i].material.materials[2].map = texture[4];
    cubes.children[i].material.materials[3].map = texture[4];
    cubes.children[i].material.materials[4].map = texture[4];
    cubes.children[i].material.materials[5].map = texture[4];
  }
}


// get the energy for a given sublocation by moving throught the array
function getPowerForSubLocation(id) {

  for(var i=0;i<subLocationData.length;i++)
  {
    if(subLocationData[i].id.localeCompare(id)==0)
    {
      var keyname = subLocationData[i].data.names[0];
      return subLocationData[i].data.data[0][keyname];
    }
    else
    {
      continue;
    }
  }
}


// generate texture for heat map
function generateTexture(roomEnergy,maxEnergy) {

	var size = 4 ;

  var canvasArray = [];
  for(var i =0;i<5;i++){

  	// create canvas
  	canvas = document.createElement( 'canvas' );
  	canvas.width = size;
  	canvas.height = size;

  	// get context
  	var context = canvas.getContext( '2d' );

  	// draw gradient
  	context.rect( 0, 0, size, size );

    var gradient;
    var ratio = roomEnergy/maxEnergy;
    var sat = (94-70)*(ratio);
    var bright = (50-10)*ratio;
    var test = 0;


    switch(i){
      case 0:
        gradient = context.createLinearGradient( size, size, size, 0);
        gradient.addColorStop(0,  'hsl(90, 70%, 40%'); // purple
        gradient.addColorStop(1,  'hsl('+(90-test)+', 70%, 40%'); // gradient colour
        break;
      case 1:
        gradient = context.createLinearGradient( size, size, 0, size);
        gradient.addColorStop(0,  'hsl(90, 70%, 40%'); // purple
        gradient.addColorStop(1,  'hsl('+(90-test)+', 70%, 40%'); // gradient colour
        break;
      case 2: //top wall
        gradient = context.createLinearGradient( 0, size, size, size);
        gradient.addColorStop(0,  'hsl(343, '+ (sat +70)+'%, '+(70-bright-(20-(20-4)*ratio))+'%'); // purple
        gradient.addColorStop(1,  'hsl(343, '+ (sat +70)+'%, '+(70-bright-(20-(20-4)*ratio))+'%'); // gradient colour
        break;
      case 3: //left wall
        gradient = context.createLinearGradient( 0, size, size, size);
        gradient.addColorStop(0,  'hsl(343, '+ (sat +70)+'%, '+(70-bright-(24-(24-8)*ratio))+'%'); // purple
        gradient.addColorStop(1,  'hsl(343, '+ (sat +70)+'%, '+(70-bright-(24-(24-8)*ratio))+'%'); // gradient colour
        break;
      case 4: //all walls
        gradient = context.createLinearGradient( 0, size, size, size);
        gradient.addColorStop(0,  'hsl(343, '+ (0)+'%, '+(50-bright)+'%'); // purple
        gradient.addColorStop(1,  'hsl(343, '+ (0)+'%, '+(50-bright)+'%'); // gradient colour
        break;
    }

  	context.fillStyle = gradient;
  	context.fill();
    canvasArray.push(canvas);
  }

	return canvasArray;

}


//button to run the past 24 hour animation
function createAnimationButton(subLocationData) {
  var button = $('<button>');
  button.click(function(){
    console.log('running the animation');
    updateHeatMap24(subLocationData);
  })
  $('body').append(button);
  console.log(cubes);
}

function myStopFunction() {
  console.log('STOP IT');
  clearInterval(floorDataInterval);
}

//for when the mouse hovers over
function onMouseMove(e)
{

  mouseVector.x = 2 * (e.clientX / SCREEN_WIDTH) - 1;
  mouseVector.y = 1 - 2 * ( e.clientY / SCREEN_HEIGHT );

  raycaster.setFromCamera( mouseVector.clone(), camera );
  var intersects = raycaster.intersectObjects( cubes.children );

  for( var i = 0; i < intersects.length; i++ ) {
    var intersection = intersects[ i ],
    obj = intersection.object;
  }
  if(intersects[0]){
    $('.bubble').css('display','inline-block');
    $('.bubble').html(intersects[0].object.userData.name +  ' (' + (intersects[0].object.userData.power*1000).toFixed(0) + ' W)');
    $('.bubble').css('top',e.clientY-50);
    $('.bubble').css('left',e.clientX-12);
  }
  else {
    $('.bubble').css('display','none');
  }
}

function onMouseClick(e)
{
  console.log('it has been the clicketh');
  isRoomDataOn  = true;
  mouseVector.x = 2 * (e.clientX / SCREEN_WIDTH) - 1;
  mouseVector.y = 1 - 2 * ( e.clientY / SCREEN_HEIGHT );

  raycaster.setFromCamera( mouseVector.clone(), camera );
  var intersects = raycaster.intersectObjects( cubes.children );
  // cubes.children.forEach(function( cube ) {
  //   cube.material.color.setRGB( cube.grayness, cube.grayness, cube.grayness );
  // });
  getRoomsData(intersects[0].object.userData.id,intersects[0].object.userData.name);

}


function getRoomsData(subLocationIdList,roomName)
{
  var equipmentList = '';
  for(var a =0 ;a<subLocationIdList.length;a++){
    for(var i=0;i<schema.length;i++)
    {
      if(schema[i].id.localeCompare(subLocationIdList[a]) == 0)
      {
        for(var j =0;j<schema[i].equipments.length;j++)
        {
          equipmentList = equipmentList.concat(schema[i].equipments[j]);
          if(true){//j!=schema[i].equipments.length-1){
              equipmentList = equipmentList.concat(',');
          }
        }
      }
    }
  }
   equipmentList=equipmentList.slice(0,-1);
   myStopFunction();

   getEquipmentData(equipmentList,roomName);
   roomDataInterval = setInterval(function(){
     getEquipmentData(equipmentList,roomName);
   }
   ,30000);

}

//actual function to update fllor map - calls updateHeatMap
function floorDataUpdate() {
  var serverUrl = "https://agile-reef-71741.herokuapp.com";
  var now = new Date();
  now.setSeconds(0);
  startTime1 = now - 120*1000;// - 4*60*60*1000;
  startTime1 = new Date(startTime1);
  startTime1 = startTime1.toISOString();
  startTime1 = startTime1.slice(0,-5);
  console.log(startTime1);

  var subLocationArray = '';
  var outputData = '';
  for(var i =0;i<schema.length;i++)
  {
    subLocationArray = subLocationArray.concat(schema[i].id);
    if(i!=schema.length-1){
      subLocationArray = subLocationArray.concat(',');
    }
  }
  $.ajax({
    url: serverUrl + '/floordata_itp?startTime=' + startTime1 + '&sublocationId=' + subLocationArray,
    async: false,
    success: function(result){
      subLocationData = result;
      console.log('MATHURA');
      // data is ready, show the heat map
      updateHeatMap(subLocationData);
    }
  })
}

function drawEquipmentsBack() {

  decoyDiv = $('<div>');
  decoyDiv.attr('class','equipment-back-decoy');
  $('body').append(decoyDiv);

  backDiv = $('<div>');
  backDiv.attr('class','equipment-back-container');
  decoyDiv.append(backDiv);

  dataDiv = $('<div>');
  dataDiv.attr('class','equipment-data-container');
  backDiv.append(dataDiv);

  roomNameDiv = $('<div>');
  roomNameDiv.attr('class','tree-map-room-name');
  backDiv.append(roomNameDiv);

  treeMapDiv = $('<div>');
  treeMapDiv.attr('class','tree-map-room-container');
  backDiv.append(treeMapDiv);

  $('.equipment-back-decoy').hide();

  //to click out of equipment data
  $('.equipment-back-decoy').click(function(e){
    console.log('inside the container');
    $('.equipment-back-decoy').hide();
    clearInterval(roomDataInterval);
    //floorDataUpdate();
    floorDataInterval = setInterval(function(){
      floorDataUpdate();
    }, 30000);
  });

  $('.equipment-back-container').click(function(e) {
    e.preventDefault();
    e.stopPropagation();
  })
}

function getEquipmentData(equipmentList,roomName) {
  var now = new Date();
  now.setSeconds(0);
  startTime = now - 120*1000;// - 4*60000*60;// temp hack for EST. Conert to moment js - 4*60000*60
  startTime = new Date(startTime);
  startTime = startTime.toISOString();
  startTime = startTime.slice(0,-5);


 $.ajax({
   url: serverUrl + '/floordata_itp?startTime=' + startTime + '&equipmentId=' + equipmentList,
   async: false,
   success: function(result){
     equipmentData = result;
     console.log(result);
     sortData(equipmentData);
     drawTreeMap(equipmentData,roomName);
   }
 }).done(function(){

 })
 return;

}

function getEquipmentText(equipmentData) {
  if($('.equipment-data-decoy')) {
    $('.equipment-back-decoy').show();
    $('.equipment-data-decoy').empty();
  }
  for( var i =0;i<equipmentData.length;i++) {
    var eqName = $('<div>');
    console.log(equipmentData[i].data.names[0]);
    eqName.attr('class','equipment-name');
    $('.equipment-data-container').append(eqName);
    eqName.html(equipmentData[i].data.names[0]);
    var eqPower = $('<div>');
    var keyName = equipmentData[i].data.names[0];
    eqPower.attr('class','equipment-power');
    $('.equipment-data-container').append(eqPower);
    eqPower.html(equipmentData[i].data.data[1][keyName]);
    console.log(equipmentData[i].data.data[1][keyName]);
  }
}

function drawTreeMap(equipmentData,roomName){

  if($('.equipment-data-decoy')) {
    $('.equipment-back-decoy').show();
    $('.equipment-data-decoy').empty();
  }

  $('.tree-map-room-name').html(roomName);
  var tree = {
    'name' : 'tree',
    'children' : []
  } ;
  var colorIndex = 0;
  for(var i =0 ;i<equipmentData.length;i++)
  {
    if(equipmentData[i].totalEnergy > 0) {
      colorIndex++;
    }
    var keyName = equipmentData[i].data.names[0];
    tree.children.push({
      'index':colorIndex,
      'name':equipmentData[i].data.names[0],
      'value':equipmentData[i].data.data[0][keyName],
      'size':equipmentData[i].data.data[0][keyName]
    });
  }

  var width = 0.5*innerWidth-40,
    height = 0.5*innerHeight-40,
    color = d3.scale.category20c(),
    div = d3.select(".tree-map-room-container").append("div")
       .style("position", "relative");

  var treemap = d3.layout.treemap()
      .size([width, height])
      .sticky(true)
      .value(function(d) { return d.size; });

  var node = div.datum(tree).selectAll(".node")
    .data(treemap.nodes)
    .enter().append("div")
    .attr("class", "tree-map-room")
  //   var className = 'class-'+allLineData[fullRoomIndex].name;
  // className = className.replace(/\s+/g, '');
    .attr("class", function(d){
      return ('tree-map-room class-' + d.name.replace(/[^\w]/gi, ''));
    } )
    .call(treeMapPosition)
    .style("background-color", function(d) {
        return d.name == 'tree' ? '#fff' : d3.hsl(180+d.index*(90/colorIndex),0.7,0.5)})
    .append('div')
    // .on("click",function(d){
    //
    //   var tempClassName = '.'+d.name.replace(/[^\w]/gi, '');
    //   $(tempClassName).toggle(500);
    //   $('.class-'+d.name.replace(/[^\w]/gi, '')).toggleClass('tree-map-room-saturate');
    // })
    .style("font-size", function(d) {
        return Math.max(0.5, 0.005*Math.sqrt(d.area))+'em'; })
    .text(function(d) { return d.children ? null : d.name + ' ('+ ((d.value*1000).toFixed(0)) + ')'; });

}

function treeMapPosition() {


  this.style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
      .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}

function sortData(equipmentData) {
  console.log('BEFORE: ');
  for(var  i =0;i<equipmentData.length;i++){
    if(equipmentData[i].totalEnergy == null){
      equipmentData[i].totalEnergy = 0;
      console.log('potato');
    }
    console.log(equipmentData[i].totalEnergy);
  }
  console.log(equipmentData);
  equipmentData = equipmentData.sort(function(a,b){
    return a.totalEnergy - b.totalEnergy;
  })
  console.log('AFTER: ');
  for(var  i =0;i<equipmentData.length;i++){
    console.log(equipmentData[i].totalEnergy);
  }
  return equipmentData;
}

function getCurrentTime() {
  var getCurrTimeInterval = setInterval(function() {
    var a = new Date();
    $('.curr-date').html(monthArray[a.getMonth()]+ '-' + a.getDate() + '-' + a.getFullYear());
    $('.curr-time').html((a.getHours() )+ ':' + a.getMinutes() + ':' + a.getSeconds());
  },1000);
}
/*********************
FOR THE ANIMATION
*******************/

//updates the heat map every minute
function updateHeatMap24(subLocationData) {

  console.log('test');
  console.log(subLocationData[0].data.data.length);
  //find the room with maximum energy usage on the floor
  var num=0;
  myInterval = setInterval(function(){
    getFloorData24(num);

  },20)
}


// get the energy for a given sublocation by moving throught the array
function getPowerForSubLocation24(id,num) {

  for(var i=0;i<subLocationData.length;i++)
  {
    if(subLocationData[i].id.localeCompare(id)==0)
    {
      var keyname = subLocationData[i].data.names[0];
      return subLocationData[i].data.data[num][keyname];
    }
    else
    {
      continue;
    }
  }
}

//reuses draw and update heatmap with the shiftboolean set to true
function get24hourData(cb) {
  var now = new Date();
  now.setSeconds(0);
  startTime1 = now - 60*60*1000;// - 4*60000*60;// temp hack for EST. Conert to moment js - 4*60000*60
  startTime1 = new Date(startTime1);
  startTime1 = startTime1.toISOString();
  startTime1 = startTime1.slice(0,-5);

  var serverUrl = "https://agile-reef-71741.herokuapp.com";

  $.ajax({
    url: serverUrl + '/login?loginId=horsetrunk12',
    async: false,
    success: function(result){
      console.log('LOGGED IN');
    }
  }).done(function(){

    $.ajax({
      url: serverUrl + '/schema_itp',
      async: false,
      success: function(result){
        schema = JSON.parse(result);
      }
    }).done(function(){
      var subLocationArray = '';
      var outputData = '';
      for(var i =0;i<schema.length;i++)
      {
        subLocationArray = subLocationArray.concat(schema[i].id);
        if(i!=schema.length-1){
          subLocationArray = subLocationArray.concat(',');
        }
      }
      $.ajax({
        url: serverUrl + '/floordata_itp?startTime=' + startTime1 + '&sublocationId=' + subLocationArray,
        async: false,
        success: function(result){
          subLocationData = result;
          console.log(subLocationData);

          // data is ready, show the heat map
          drawHeatMap(subLocationData);
          console.log(subLocationData);
          createAnimationButton(subLocationData);
        }
      })
    });
  });
}

function getFloorData24(num) {
  num++;
  var maxEnergy = 0;
  if(num<subLocationData[0].data.data.length){

    for(var i = 0; i < rooms.length; i++ ) {
      var tempEnergy = 0;
      for(var j =0;j<rooms[i].sublocationId.length;j++){
        tempEnergy += getPowerForSubLocation24(rooms[i].sublocationId[j],num);
      }
      if(tempEnergy>maxEnergy){
        maxEnergy = tempEnergy;
      }
    }

    for(var i = 0; i < rooms.length; i++ ) {
      var tempTotalPower = 0;

      for(var j =0;j<rooms[i].sublocationId.length;j++){
        tempTotalPower += getPowerForSubLocation24(rooms[i].sublocationId[j],num);
      }

      if(tempTotalPower == 0) {
        tempTotalPower = 0.0002;
      }

      // console.log('altering height i think')
      cubes.children[i].scale.z *= tempTotalPower/roomPower[i];
      cubes.children[i].position.z = tempTotalPower*75;
      roomPower[i] = tempTotalPower;

      var legendRatio = ((maxEnergy*1000/50).toFixed(0))*10;
      var legendText =
      ' > ' + legendRatio*4 + 'W <br><br>'+

       legendRatio*1 + 'W - ' + legendRatio*4 + 'W <br><br>' +
       legendRatio*2 + 'W - ' + legendRatio*3 + 'W <br><br>' +
       legendRatio*3 + 'W - ' + legendRatio*2 + 'W <br><br>' +
      '< ' + legendRatio*1 + 'W <br><br>' ;
      $('.legend-gradient-text').html(legendText);

      var texture = [];

      for(var m =0;m<5;m++){
        texture[m] = new THREE.Texture( generateTexture(tempTotalPower,maxEnergy)[m] );
        texture[m].needsUpdate = true;
      }

      ratio = tempTotalPower/maxEnergy;
      test = 90*ratio;
      topColor = 'hsl('+(90-test)+', 100%, 50%)';

      cubes.children[i].material.materials[0].map = texture[4];
      cubes.children[i].material.materials[1].map = texture[4];
      cubes.children[i].material.materials[2].map = texture[4];
      cubes.children[i].material.materials[3].map = texture[4];
      cubes.children[i].material.materials[4].map = texture[4];
      cubes.children[i].material.materials[5].map = texture[4];
    }
  }
  else{
    myStopFunction();
  }
  return num;
}

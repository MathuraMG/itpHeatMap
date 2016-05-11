//Questions:
//What is classed??

//TODO:
// Attach zoom functionality

//REFERENCE
// File op - https://gist.github.com/Arahnoid/9925725

var data = [];
var cubes; //3d model of the rooms
var roomPower = [];
var schema;

//Three JS variables
var scene;
var camera;
var renderer;
var controls;
var SCREEN_WIDTH = window.innerWidth*0.7, SCREEN_HEIGHT = window.innerHeight*0.8;
var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR = 20000;

var plotChart,xScale,yScale,data,xAxis;
var serverUrl = "http://0.0.0.0:5000";
// var serverUrl = "https://itpenertivserver.herokuapp.com";

var myInterval;

$(document).ready(function(){
  setUpThreeJS();
  render();
  animate();
  // makeAjaxCall();
  // getRealTimePower();
  get24hourData();
})

// set up scene/camera etc for 3js
function setUpThreeJS() {
  //Three.js
  //set scene
  scene = new THREE.Scene();

  //set camera
  camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene.add(camera);
  camera.position.set(100*.52,-1700*.52,1500*.52);
  camera.lookAt(scene.position);

  //set renderer
  renderer = new THREE.WebGLRenderer( {antialias:true} );
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  document.body.appendChild(renderer.domElement);

  //set events
  THREEx.WindowResize(renderer, camera); // automatically resize renderer
  THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) }); // toggle full-screen on given key press

  //set controls (using lib - OrbitControls.js)

  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.addEventListener( 'change', render )

}

// render three js
function render() {
  requestAnimationFrame( render );
  renderer.render(scene, camera);
  renderer.setSize(window.innerWidth*0.7 - 20, window.innerHeight*0.8 - 20);
  renderer.setClearColor(0xfff3e6);
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
  startTime = now - 120*1000 - 4*60000*60;// temp hack for EST. Conert to moment js - 4*60000*60
  startTime = new Date(startTime);
  startTime = startTime.toISOString();
  startTime = startTime.slice(0,-5);

  $.ajax({
    url: serverUrl + '/login?loginId=horsetrunk12',
    success: function(result){
      console.log('LOGGED IN');
    }
  }).done(function(){

    $.ajax({
      url: serverUrl + '/schema_itp',
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
  setInterval(function(){
    var now = new Date();
    now.setSeconds(0);
    startTime1 = now - 60*1000 - 4*60*60*1000;
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
      success: function(result){
        subLocationData = result;
        console.log('MATHURA');
        // data is ready, show the heat map
        updateHeatMap(subLocationData);
      }
    })

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
    if(tempEnergy>maxEnergy){
      maxEnergy = tempEnergy;
    }
  }

  var axis = new THREE.AxisHelper( 2000 )
  axis.position.set(-500,0,0);
  scene.add( axis );

  var gridHelper = new THREE.GridHelper( 1000, 25 );
  gridHelper.rotation.set(0,3.14/2,3.14/2);
  gridHelper.position.set(0,0,-5);
  gridHelper.setColors ("#FFE6CC", "#FFE6CC")
  scene.add( gridHelper );

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

    var geom = new THREE.CubeGeometry( rooms[i].w, rooms[i].l, tempTotalPower*100  );
    var grayness = Math.random() * 0.5 + 0.25;
    var cubeMaterials = [
      new THREE.MeshBasicMaterial({ map: texture[1], transparent: true }),//right wall SET
      new THREE.MeshBasicMaterial({ map: texture[3], transparent: true }),//left wall
      new THREE.MeshBasicMaterial({ map: texture[2], transparent: true }),//back wall SET
      new THREE.MeshBasicMaterial({ map: texture[0], transparent: true }),//front wall SET
      new THREE.MeshBasicMaterial({ map: texture[4], transparent: true }),
      new THREE.MeshBasicMaterial({ map: texture[4], transparent: true }),
    ];
    var mat = new THREE.MeshFaceMaterial( cubeMaterials );
    var cube = new THREE.Mesh( geom, mat );

    scene.add(cube);
    cube.position.set(rooms[i].xpos, rooms[i].ypos-350, tempTotalPower*50); // change the center of 'z' to the base
    cube.rotation.set( 0, 0, 0);
    cube.grayness = grayness; // *** NOTE THIS
    cube.userData = {
               id: rooms[i].sublocationId,
               name: rooms[i].name
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
    cubes.children[i].position.z = tempTotalPower*50;
    roomPower[i] = tempTotalPower;
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
    var test = 90*(ratio);

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
      case 2:
        gradient = context.createLinearGradient( size, 0, size, size);
        gradient.addColorStop(0,  'hsl(90, 100%, 70%'); // purple
        gradient.addColorStop(1,  'hsl('+(90-test)+', 100%, 70%'); // gradient colour
        break;
      case 3:
        gradient = context.createLinearGradient( 0, size, size, size);
        gradient.addColorStop(0,  'hsl(90, 100%, 50%'); // purple
        gradient.addColorStop(1,  'hsl('+(90-test)+', 100%, 70%'); // gradient colour
        break;
      case 4:
        gradient = context.createLinearGradient( 0, size, size, size);
        gradient.addColorStop(0,  'hsl('+(90-test)+', 100%, 40%'); // purple
        gradient.addColorStop(1,  'hsl('+(90-test)+', 100%, 40%'); // gradient colour
        break;
    }

  	context.fillStyle = gradient;
  	context.fill();
    canvasArray.push(canvas);
  }

	return canvasArray;

}

//updates the heat map every minute
function updateHeatMap24(subLocationData) {

  console.log('test');
  console.log(subLocationData[0].data.data.length);
  //find the room with maximum energy usage on the floor
  var num=0;
  myInterval = setInterval(function(){
    num++;
    console.log('hi hi');
    var maxEnergy = 0;
    if(num<subLocationData[0].data.data.length){
      console.log(' in herre -  ' + num);
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
        cubes.children[i].position.z = tempTotalPower*50;
        roomPower[i] = tempTotalPower;

        var texture = [];

        for(var m =0;m<5;m++){
          texture[m] = new THREE.Texture( generateTexture(tempTotalPower,maxEnergy)[m] );
          texture[m].needsUpdate = true;
        }

        ratio = tempTotalPower/maxEnergy;
        test = 90*ratio;
        topColor = 'hsl('+(90-test)+', 100%, 50%)';

        // console.log(cubes.children[i].material.materials[5].color + ' -- ' + topColor);
        // var cubeMaterials = [
        cubes.children[i].material.materials[0].map = texture[1];
        cubes.children[i].material.materials[1].map = texture[3];
        cubes.children[i].material.materials[2].map = texture[2];
        cubes.children[i].material.materials[3].map = texture[0];
        cubes.children[i].material.materials[4].map = texture[4];
        cubes.children[i].material.materials[5].map = texture[4];
        // cubes.children[i].material.materials[5].color = topColor;
        // new THREE.MeshBasicMaterial({ map: texture[3], transparent: true }),//left wall
        // new THREE.MeshBasicMaterial({ map: texture[2], transparent: true }),//back wall SET
        // new THREE.MeshBasicMaterial({ map: texture[0], transparent: true }),//front wall SET
        // new THREE.MeshBasicMaterial({ color:topColor, transparent: true }),
        // new THREE.MeshBasicMaterial({ color:topColor, transparent: true }),
        // ];
        // cubes.children[i].material.materials = cubeMaterials;
      }
    }
    else{
      myStopFunction();
    }
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
function get24hourData() {
  var now = new Date();
  now.setSeconds(0);
  startTime1 = now - 1*60*60*1000 - 4*60000*60;// temp hack for EST. Conert to moment js - 4*60000*60
  startTime1 = new Date(startTime1);
  startTime1 = startTime1.toISOString();
  startTime1 = startTime1.slice(0,-5);

  $.ajax({
    url: serverUrl + '/login?loginId=horsetrunk12',
    success: function(result){
      console.log('LOGGED IN');
    }
  }).done(function(){

    $.ajax({
      url: serverUrl + '/schema_itp',
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
  clearInterval(myInterval);
}

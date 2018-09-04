(()=>{

"use strict";

const scene = cam.sceneEl; //document.querySelector('a-scene');
const quarterTurn = Math.PI/2;
const haltTurn = Math.PI;
const oneTurn = Math.PI*2;
var keyPressed = {};
var g = {x:1, y:0, z:0};
var velocity = new THREE.Vector3(0,0,.01);
var rollAxis = new THREE.Vector3(0,0,1);
var pitchAxis = new THREE.Vector3(1,0,0);
var start = Date.now();
var x,y,z,i;
var skyColor = '#6AE';
var maxPlaneY = 150;

/// HELPERS ////////////////////////////////////////////////////////////////////

function rnd(a, b) {
  if (typeof(b) == 'undefined' || b == null) {
    b = a;
    a = 0;
  }
  return (Math.random() * (b-a)) + a;
}

const rRnd = (a, b)=> Math.round(rnd(a, b));

function mk(type, attrs) {
  var el = document.createElement('a-'+type);
  for (var att in attrs) el.setAttribute(att, attrs[att]);
  scene.appendChild(el);
  return el;
}

function roundDec(n,d) {
  var m = 10**d;
  return Math.round(n*m)/m;
}

function debugXYZ(desc, obj, d=3) {
  console.log(desc+` x:${roundDec(obj.x,d)} y:${roundDec(obj.y,d)} z:${roundDec(obj.z,d)}`)
}

////////////////////////////////////////////////////////////////////////////////

//var buildSky = ()=> {
//  var w = cSky.width = 2000;
//  var h = cSky.height = 1000;
//  var ctx = cSky.getContext('2d');
//  ctx.fillStyle = '#000';
//  ctx.fillRect(0,0, w,h);
//  var rv = 1; // vertical radius;
//  ctx.fillStyle='#fff';
//  for (var y=rv*3; y<(h-rv*3); y+=rv*2) {
//    ctx.beginPath();
//    var vStep = Math.abs(y-(h/2))/(h/2);
//    var rh = rv+w*(.001*Math.asin(vStep)**10); // horizontal radius;
//    for (var x=rh*2; x<(w-rh*2); x+=rh*2) {
//      if (Math.random()<.01) {
//        let incR = Math.random()+.5;
//        ctx.ellipse(x,y, rh*incR,rv*incR, 0, 0,2*Math.PI);
//      }
//    }
//    ctx.fill();
//  }
//}
//buildSky();

// Worm
for (i=4; i<200; i+=2)
  ((el)=> setTimeout(()=> el.setAttribute('boid',true), i*150+1000))(
    mk('sphere', {position:`5 1 ${-i}`, color:'#666'})
  );

// random floating balls
for (i=0; i<200; i++)
  mk('sphere', {position:`${rRnd(200)-100} ${rRnd(200)-100} ${rRnd(200)-50}`, radius:4, color:'#080'});

// wall
//for (x=-200; x<200; x+=15)
//  for (y=-200; y<200; y+=15)
//    mk('sphere', {position:`${x} ${y} -1000`, radius:4, color:'#F60'});

var mkMountain = (x,z,r,h)=> {
  var red = rRnd(0,4).toString(16);
  var green = rRnd(7,10).toString(16);
  var color = `#${red}${green}0`;
  mk('sphere', {position:`${x} ${h} ${z}`, radius:r, color});
  mk('cylinder', {position:`${x} 0 ${z}`, radius:r, height:h*2, color});
}

// Limit Mountains
var totMountains = 33;
var inc = oneTurn/totMountains;
for (var i=0; i<oneTurn; i+=inc) {
  x = Math.sin(i)*900;
  z = Math.cos(i)*900;
  mkMountain(x, z, rnd(90,120), rnd(maxPlaneY, maxPlaneY*2));
}
for (var i=0; i<oneTurn; i+=inc) {
  x = Math.sin(i+inc/2)*750;
  z = Math.cos(i+inc/2)*750;
  mkMountain(x, z, rnd(55,90), rnd(maxPlaneY));
}

ball.addEventListener('hit', function(ev) {
  //console.log('Ball hit '+ ev.detail.el.tagName);
});

window.addEventListener("devicemotion", (ev)=>{
  var ag = event.accelerationIncludingGravity;
  g = { x:ag.x, y:ag.y, z:ag.z }
}, true);

function getWay() {
  if (g.x > 10) g.x = 10; if (g.x < -10) g.x = -10;
  if (g.y > 10) g.y = 10; if (g.y < -10) g.y = -10;
  if (g.z > 10) g.z = 10; if (g.z < -10) g.z = -10;
  var theWay = {
    up:    g.z/10 * -1,
    down:  g.z/10,
    left:  g.y/10 * -1,
    right: g.y/10,
    normal:     g.x/10,
    upsideDown: g.x/10 * -1
  };
  var bigger = { name: 'normal', val: 0 };
  for ( var k in theWay ) if ( theWay[k] > bigger.val ) bigger = { name: k, val: theWay[k] };
  theWay.bigger = bigger.name;
  return theWay;
}

var planeYaw = 0;
setInterval(function(){
  //var rotation = cam.object3D.rotation;
  if (g.x < 10) g.x += .2
  if (keyPressed.ARROWLEFT)  g.y -= .2, g.x /= 1.2;
  if (keyPressed.ARROWRIGHT) g.y += .2, g.x /= 1.2;
  if (keyPressed.ARROWUP)    g.z -= .3, g.x /= 1.2;
  if (keyPressed.ARROWDOWN)  g.z += .3, g.x /= 1.2;
  if (Math.abs(g.y) > 0) g.y -= g.y/100;
  if (Math.abs(g.z) > 0) g.z -= g.z/100;
  var way = getWay();
  plane.object3D.rotation.x = way.up * -quarterTurn;
  plane.object3D.rotation.y = planeYaw;
  cam.object3D.rotation.z = way.left * quarterTurn;
  var sinZ = Math.sin(-cam.object3D.rotation.z);
  if (sinZ != 0) planeYaw += sinZ/-80;
  // Move:
  var rotation = new THREE.Euler(way.up * -quarterTurn, planeYaw, 0, 'ZYX');
  //rotatDebug.object3D.rotation.copy(rotation);
  velocity = (new THREE.Vector3(0,0,.3)).applyEuler(rotation);
  ['x','y','z'].forEach((k)=> plane.object3D.position[k] -= velocity[k] );
  if (plane.object3D.position.y > maxPlaneY) {
    plane.object3D.position.y = 150;
    scene.setAttribute('fog', 'color', 'red');
    scene.setAttribute('background', 'color', 'red');
  } else if (plane.object3D.position.y < maxPlaneY-10) {
    scene.setAttribute('fog', 'color', skyColor);
    scene.setAttribute('background', 'color', skyColor);
  }
  //camDebug.object3D.position[k] = (camDebug.object3D.position[k]*9 + plane.object3D.position[k])/10;
  //camDebug.object3D.position.y = plane.object3D.position.y + 6;

  debugG();
} ,30);

var w,h,dbgCtx = debugGEl.getContext('2d');
function resizeCanvas() {
  debugGEl.width = w = window.innerWidth;
  debugGEl.height = h = window.innerHeight;
}
setTimeout(resizeCanvas, 100);
window.addEventListener("resize", resizeCanvas);
function debugG() {
  var blue=0, red=0;
  if (g.z < 0) blue = Math.round( 255 * g.z/10 * -1 );
  else red = Math.round( 255 * g.z/10 );
  var cx = w/2, cy = h/2;
  var max = h*0.04;
  //dbgCtx.fillStyle = '#CCC';
  dbgCtx.clearRect(0, 0, w, h);
  dbgCtx.strokeStyle = `rgba(${red}, 0, ${blue}, 1)`;
  dbgCtx.lineWidth = 3;
  dbgCtx.lineCap = 'round';
  dbgCtx.beginPath();
  dbgCtx.moveTo(cx, cy);
  dbgCtx.lineTo(cx+g.y*max, cy+g.x*max);
  dbgCtx.stroke();
  dbgCtx.closePath();
}


function limitRotationVal(rotation) {
  if (-oneTurn > rotation.z || rotation.z > oneTurn) rotation.z %= oneTurn;
}

document.addEventListener('keydown', (ev)=> { keyPressed[ev.key.toUpperCase()]=true; ev.stopPropagation() });
document.addEventListener('keyup', (ev)=> { keyPressed[ev.key.toUpperCase()]=false; ev.stopPropagation() });

})();

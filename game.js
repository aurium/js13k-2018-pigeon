"use strict";

const scene = document.querySelector('a-scene');
const cam = document.querySelector('a-camera');
const quarterTurn = Math.PI/2;
const haltTurn = Math.PI;
const oneTurn = Math.PI*2;
var keyPressed = {};
var velocity = new THREE.Vector3(0,0,.01);
var rollAxis = new THREE.Vector3(0,0,1);
var pitchAxis = new THREE.Vector3(1,0,0);

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

function buildSky() {
  var w = cSky.width = 2000;
  var h = cSky.height = 1000;
  var ctx = cSky.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0,0, w,h);
  var rv = 1; // vertical radius;
  ctx.fillStyle='#fff';
  for (var y=rv*3; y<(h-rv*3); y+=rv*2) {
    ctx.beginPath();
    var vStep = Math.abs(y-(h/2))/(h/2);
    var rh = rv+w*(.001*Math.asin(vStep)**10); // horizontal radius;
    for (var x=rh*2; x<(w-rh*2); x+=rh*2) {
      if (Math.random()<.01) {
        let incR = Math.random()+.5;
        ctx.ellipse(x,y, rh*incR,rv*incR, 0, 0,2*Math.PI);
      }
    }
    ctx.fill();
  }
}
buildSky();

// Makes sky and ground follow the camera
setInterval(()=>{
  sky.object3D.position.copy(cam.object3D.position);
  ground.object3D.position.x = cam.object3D.position.x;
  ground.object3D.position.z = cam.object3D.position.z;
}, 200);

// Worm
for (var i=4; i<200; i+=2)
  ((el)=> setTimeout(()=> el.setAttribute('boid',true), i*150+1000))(
    mk('sphere', {position:`5 1 ${-i}`, color:'#666'})
  );

// random floating balls
for (var i=0; i<200; i++)
  mk('sphere', {position:`${rRnd(200)-100} ${rRnd(200)-100} ${rRnd(200)-50}`, radius:4, color:'#080'});

// wall
//for (var x=-200; x<200; x+=15)
//  for (var y=-200; y<200; y+=15)
//    mk('sphere', {position:`${x} ${y} -80`, radius:4, color:'#F60'});

ball.addEventListener('hit', function(ev) {
  //console.log('Ball hit '+ ev.detail.el.tagName);
});


// Pilotagem:
function pitch(rotation, angle) {
  var origRollAxis = rollAxis.clone()
  rollAxis.applyAxisAngle(pitchAxis, angle);
  var turn = (new THREE.Euler).setFromQuaternion(
    (new THREE.Quaternion).setFromUnitVectors(origRollAxis, rollAxis)
  );
  rotation.x += turn.x;
  rotation.y += turn.y;
  rotation.z += turn.z;
}
function roll(rotation, angle) {
  var origPitchAxis = pitchAxis.clone()
  pitchAxis.applyAxisAngle(rollAxis, angle);
  var turn = (new THREE.Euler).setFromQuaternion(
    (new THREE.Quaternion).setFromUnitVectors(origPitchAxis, pitchAxis)
  );
  rotation.x += turn.x;
  rotation.y += turn.y;
  rotation.z += turn.z;
}

setInterval(function(){
  var rotation = cam.object3D.rotation;
  if (keyPressed.ARROWUP)    pitch(rotation, -.01);
  if (keyPressed.ARROWDOWN)  pitch(rotation, +.01);
  if (keyPressed.ARROWLEFT)  roll(rotation,  +.06);
  if (keyPressed.ARROWRIGHT) roll(rotation,  -.06);
  limitRotationVal(rotation);
  var sinZ = Math.sin(rotation.z);
  if (sinZ != 0) {
    // rotation.z += sinZ/-50;
    // if (Math.abs(rotation.z)<0.01) rotation.z = 0;
    //rotation.y += sinZ/100;
    //pitchAxis = (new THREE.Vector3(1,0,0)).applyEuler(rotation);
  }
  // Move:
  velocity = (new THREE.Vector3(0,0,.1)).applyEuler(rotation);
  cam.object3D.position.x -= velocity.x;
  cam.object3D.position.y -= velocity.y;
  cam.object3D.position.z -= velocity.z;
} ,30);

function limitRotationVal(rotation) {
  if (-oneTurn > rotation.z || rotation.z > oneTurn) rotation.z %= oneTurn;
}

document.addEventListener('keydown', (ev)=> { keyPressed[ev.key.toUpperCase()]=true; ev.stopPropagation() });
document.addEventListener('keyup', (ev)=> { keyPressed[ev.key.toUpperCase()]=false; ev.stopPropagation() });

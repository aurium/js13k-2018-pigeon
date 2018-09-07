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
var maxPlaneY = 200;
var planeSpeed = .9;

/// HELPERS ////////////////////////////////////////////////////////////////////

function rnd(a, b) {
  if (typeof(b) == 'undefined' || b == null) {
    b = a;
    a = 0;
  }
  return (Math.random() * (b-a)) + a;
}

const rRnd = (a, b)=> Math.round(rnd(a, b));

function mk(type, attrs, parent) {
  var el = document.createElement('a-'+type);
  for (var att in attrs) el.setAttribute(att, attrs[att]);
  if (parent) parent.appendChild(el);
  else scene.appendChild(el);
  return el;
}
HTMLElement.prototype.mk = function (type, attrs) {
  return mk(type, attrs, this);
}
HTMLElement.prototype.selfRemove = function () {
  this.parentNode.removeChild(this);
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
//for (i=0; i<200; i++)
//  mk('sphere', {position:`${rRnd(200)-100} ${rRnd(200)-100} ${rRnd(200)-50}`, radius:4, color:'#080'});

// Create Pingeons
for (i=0; i<60; i++) mk('cone', {
  position: `${rnd(10)} ${rnd(95,105)} ${rnd(10)+550}`,
  'radius-bottom': .2,
  'radius-top': 0,
  height: .4,
  color: 'red',
  boid: ''
});
var thePingeon = mk('cone', {
  id: 'thePingeon',
  position: `10 100 550`,
  'radius-bottom': .2,
  'radius-top': 0,
  height: .4,
  color: 'red',
  boid: 'main: true'
});

// Clouds
//<a-plane id="ground" class="solid" position="0 0 0" rotation="-90 0 0" width="2000" height="2000" color="#280">
for (i=0; i<8; i++) mk('plane', {
  position: `${rnd(-1500,1500)} ${maxPlaneY + rnd(-50,0)} ${rnd(-1200,1200)}`,
  width: rnd(400,600),
  height: rnd(400,600),
  rotation: '-90 0 0',
  color: '#FFF',
  opacity: 0.5,
  material: 'side: double',
  shadow: 'receive: false',
  cloud: {velocity: rnd(.5,1)}
});

var mkMountain = (x,z,r,h)=> {
  var red = rRnd(0,4).toString(16);
  var green = rRnd(7,10).toString(16);
  var color = `#${red}${green}0`;
  mk('sphere', {class:'solid', position:`${x} ${h} ${z}`, radius:r, color});
  if (h>0) mk('cylinder', {class:'solid', position:`${x} 0 ${z}`, radius:r, height:h*2, color});
}

// Border Mountains
var totMountains = 33;
var inc = oneTurn/totMountains;
for (i=0; i<oneTurn; i+=inc) {
  x = Math.sin(i)*1200;
  z = Math.cos(i)*1200;
  mkMountain(x, z, rnd(110,140), rnd(maxPlaneY, maxPlaneY*2));
}
for (i=0; i<oneTurn; i+=inc) {
  x = Math.sin(i+inc/2)*1000;
  z = Math.cos(i+inc/2)*1000;
  mkMountain(x, z, rnd(100,150), rnd(-100, maxPlaneY*.8));
}

var rForrest = 850;
for (x=-rForrest; x<rForrest; x+=20) for (z=-rForrest; z<rForrest; z+=20) {
  if (Math.random() < .02 && (x**2 + z**2) < rForrest**2) {
    var red = rRnd(0,1).toString(16);
    var green = rRnd(6,8).toString(16);
    var blue = rRnd(0,2).toString(16);
    var color = `#${red}${green}${blue}`;
    var h = (Math.random() + 2) * 20;
    mk('cone', {position:`${x} ${h/2} ${z}`, 'radius-bottom':13, 'radius-top':0, height:h, color});
    //mk('cylinder', {position:`${x} 0 ${z}`, radius:4, height:10, color:'#830'});
  }
}
//setTimeout(()=> planeBody.components["aabb-collider"].update(), 1000);

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

var planeYaw = 0, moveRotation = new THREE.Euler(0, 0, 0);
setInterval(function(){
  if (plane.dead) return showDeath();
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
  if (sinZ != 0) planeYaw += sinZ/-60;
  // Move:
  moveRotation = new THREE.Euler(way.up * -quarterTurn, planeYaw, 0, 'ZYX');
  //rotatDebug.object3D.rotation.copy(moveRotation);
  velocity = (new THREE.Vector3(0,0,planeSpeed)).applyEuler(moveRotation);
  ['x','y','z'].forEach((k)=> plane.object3D.position[k] -= velocity[k] );
  if (plane.object3D.position.y > maxPlaneY) {
    plane.object3D.position.y = maxPlaneY;
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

var explosion1, explosion2, explosionRadius=0.1;
setTimeout(()=> planeColiderTest.setAttribute('aabb-collider', 'objects', '.solid'), 1000);
planeColiderTest.addEventListener('hit', function(ev) {
  console.log(`plane hit ${ev.detail.el.tagName} ${ev.detail.el.id}`);
  //ev.detail.el.setAttribute('color', 'blue');
  planeColiderTest.removeAttribute('aabb-collider')
  var pos = plane.object3D.position;
  explosion1 = planeBody.mk('sphere', {radius:.02, color:'#F00'});
  explosion2 = explosion1.mk('sphere', {radius:.01, color:'#F60'});
  plane.dead = true
  planeSpeed = .08;
  buildDeadPlane();
  setTimeout(()=> setInterval(doSmoke, 2000), 4000);
});

function buildDeadPlane() {
  while (elice.firstElementChild) elice.firstElementChild.selfRemove();
  //<a-sphere id="cabin" color="#F80" radius=".18" position="0 .2 0"></a-sphere>
  planeBody.mk('sphere', {position:'0 .2 -.11', radius:.18, color:'#F60'});
  //<a-cone id="back" color="#F80" radius-bottom=".2" radius-top=".08" height="1"
  //        position="0 .65 0" rotation="0 0 0"></a-cone>
  planeBody.mk('cone', {position:'0 .65 0', 'radius-bottom':.2, 'radius-top':.08, height:1, color:'#F80'});
  //<a-cone id="wingLeft" color="#F80" radius-bottom=".2" radius-top=".1" height="1"
  //        position="-.6 .3 .05" scale=".4 1 1" rotation="90 0 90"></a-cone>
  planeBody.mk('cone', {position:'-.6 .3 .05', scale:'.4 1 1', rotation:'90 0 90',
               'radius-bottom':.2, 'radius-top':.1, height:1, color:'#F60'});
  //<a-cone id="wingRight" color="#F80" radius-bottom=".2" radius-top=".1" height="1"
  //        position=".6 .3 .05" scale=".4 1 1" rotation="90 0 -90"></a-cone>
  planeBody.mk('cone', {position:'.6 .3 .05', scale:'.4 1 1', rotation:'90 0 -90',
               'radius-bottom':.2, 'radius-top':.1, height:1, color:'#F60'});
  //<a-cone id="tail" color="#F80" radius-bottom=".15" radius-top=".05" height=".3"
  //        position="0 1.06 -.2" scale=".2 1 1" rotation="-70 0 0"></a-cone>
  planeBody.mk('cone', {position:'0 1.06 -.2', scale:'.2 1 1', rotation:'-70 0 0',
               'radius-bottom':.15, 'radius-top':.05, height:.3, color:'#F60'});
}

function showDeath() {
  planeSpeed *= 0.95;
  if (planeSpeed<0.001) planeSpeed = 0;
  explosionRadius += 0.008;
  if (explosionRadius<3) {
    if (explosionRadius<2) {
      explosion1.setAttribute('radius', explosionRadius*1.1);
      explosion1.setAttribute('opacity', 1 - explosionRadius*.8);
      explosion2.setAttribute('radius', explosionRadius*0.8);
      explosion2.setAttribute('opacity', 1 - explosionRadius*.5);
    } else {
      console.log('Remove explosion');
      explosionRadius = 3;
      explosion2.selfRemove();
      explosion1.selfRemove();
    }
  }
  // Turn a little asside:
  planeBody.object3D.rotation.y += -planeSpeed/5;
  // Drop if not in thr ground:
  if (plane.object3D.position.y > 1) plane.object3D.position.y -= 0.5;
  // Correct Cam Roll:
  cam.object3D.rotation.z /= 1.01;
  // Correct plane Pitch:
  plane.object3D.rotation.x /= 1.01;
  // Do not let the plane away:
  if (Math.abs(planeBody.object3D.position.x) > .5) planeBody.object3D.position.x /= 1.1;
  if (planeBody.object3D.position.z > -1.0) planeBody.object3D.position.z -= 0.01;
  if (planeBody.object3D.position.y > -0.4) planeBody.object3D.position.y -= 0.01;
  // Adjust view:
  if (moveRotation.x < -quarterTurn/2) {
    var div = 1.1 + (quarterTurn + moveRotation.x);
    cam.object3D.position.y -= planeSpeed/div;
    elice.object3D.position.y += planeSpeed/div;
    planeBody.object3D.position.y += planeSpeed/div;
  }
  if (moveRotation.x > -0.1) {
    cam.object3D.position.y += planeSpeed/14;
    elice.object3D.position.y -= planeSpeed/14;
    planeBody.object3D.position.y -= planeSpeed/14;
  }
  // Move away from colision point:
  velocity = (new THREE.Vector3(0,0,planeSpeed)).applyEuler(moveRotation);
  ['x','y','z'].forEach((k)=> {
    //plane.object3D.position[k] += velocity[k]/2;
    cam.object3D.position[k] += velocity[k]*2;
    elice.object3D.position[k] -= velocity[k];
    planeBody.object3D.position[k] -= velocity[k];
  });
}

function doSmoke() {
  //<a-torus-knot color="#B84A39" arc="180" p="2" q="7" radius="5" radius-tubular="0.1"></a-torus-knot>
  var pos = plane.object3D.position;
  var smoke = mk('torus', {
    position:`${pos.x} ${pos.y} ${pos.z-.1}`,
    radius:0, 'radius-tubular':.02, arc:360,
    color:'gray', rotation:'90 0 0'
  });
  smoke.radius = 0.05;
  moveSmoke(smoke, .8);
}
function moveSmoke(smoke, opacity) {
  smoke.object3D.position.y += 0.009;
  smoke.radius *= 1.017;
  smoke.setAttribute('radius', smoke.radius);
  smoke.setAttribute('radius-tubular', smoke.radius/8);
  smoke.setAttribute('opacity', opacity);
  if (opacity>0) setTimeout(()=> moveSmoke(smoke, opacity-0.005), 50);
  else smoke.selfRemove();
}

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

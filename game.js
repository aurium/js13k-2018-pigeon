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
var planeSpeed = 1;

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

// Draw Sky pattern
//(()=> {
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
//})();

// Draw Ground pattern
(()=> {
  var w = cGround.width = 128;
  var h = cGround.height = 128;
  var ctx = cGround.getContext('2d');
  ctx.fillStyle = '#170';
  ctx.fillRect(0,0, w,h);
  ctx.fillStyle = '#280';
  ctx.fillRect(0,0, w/2,h/2);
  ctx.fillRect(w/2,h/2, w,h);
//  for (x=0; x<w; x+=2) for (y=0; y<h; y+=2)
//    if (Math.random()<.5) ctx.fillRect(x,y, 2,2);
})();

// Draw Clouds pattern
(()=> {
  var w = cCloud.width = 64;
  var h = cCloud.height = 64;
  var ctx = cCloud.getContext('2d');
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(0,0, w,h);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(0,0, w/2,h/2);
  ctx.fillRect(w/2,h/2, w,h);
})();

// Draw Tree pattern
(()=> {
  var w = cTree.width = 8;
  var h = cTree.height = 32;
  var ctx = cTree.getContext('2d');
  ctx.fillStyle = '#280';
  ctx.fillRect(0,0, w,h);
  ctx.fillStyle = '#170';
  ctx.fillRect(0,h/2, w,h);
})();


// Draw Mountain pattern
(()=> {
  var w = cMountain.width = 8;
  var h = cMountain.height = 128;
  var ctx = cMountain.getContext('2d');
  ctx.fillStyle = '#280';
  ctx.fillRect(0,0, w,h);
  ctx.fillStyle = '#170';
  ctx.fillRect(0,h/2, w,h);
})();

// Worm
for (i=4; i<200; i+=2)
  ((el)=> setTimeout(()=> el.setAttribute('boid',true), i*150+1000))(
    mk('sphere', {position:`5 1 ${-i}`, color:'#666'})
  );

function mkPingeon(x, y, z, color='#DDD') {
  var pingeon = mk('sphere', { // Body
    position: `${x} ${y} ${z}`,
    'radius': .3,
    color: color,
    boid: ''
  });
  pingeon.mk('sphere', { // head
    position: '0 .3 0',
    'radius': .18,
    color: color,
  });
  pingeon.mk('cone', { // Bick
    position: '0 .5 0',
    'radius-bottom': .1,
    'radius-top': 0,
    height: .2,
    color: '#E80',
  });
  pingeon.mk('sphere', { // Left Wing
    position: '-.3 0 0',
    scale:'1 1 .3',
    'radius': .25,
    color: color,
  }).mk('animation', { // Animate Left Wing
    dur:400, repeat:'indefinite', easing:'linear', loop:'true', direction:'alternate',
    attribute:'rotation', from:'0 -20 0', to:'0 20 0'
  });
  pingeon.mk('sphere', { // Right Wing
    position: '.3 0 0',
    scale:'1 1 .3',
    'radius': .25,
    color: color,
  }).mk('animation', { // Animate Right Wing
    dur:400, repeat:'indefinite', easing:'linear', loop:'true', direction:'alternate',
    attribute:'rotation', from:'0 20 0', to:'0 -20 0'
  });
  pingeon.mk('sphere', { // Tail
    position: '0 -.3 0',
    scale:'1 1 .3',
    'radius': .2,
    color: color,
  });
  return pingeon;
}

// Create Pingeons
for (i=0; i<30; i++) mkPingeon(rnd(10), rnd(95,105), rnd(10)+550);
var thePingeon = mkPingeon(5, 100, 555, '#D00');

// Clouds
//<a-plane id="ground" class="solid" position="0 0 0" rotation="-90 0 0" width="2000" height="2000" color="#280">
for (i=0; i<8; i++) mk('plane', {
  position: `${rnd(-1500,1500)} ${maxPlaneY + rnd(-60,30)} ${rnd(-1200,1200)}`,
  width: rnd(400,600),
  height: rnd(400,600),
  rotation: '-90 0 0',
  color: '#FFF',
  opacity: 0.5,
  material: 'side: double',
  src:'#cCloud', repeat:'15 15',
  cloud: {velocity: rnd(.5,1)}
});

var mkMountain = (x,z,r,h)=> {
  var red = rRnd(0,4).toString(16);
  var green = rRnd(7,10).toString(16);
  var color = `#${red}${green}0`;
  mk('sphere', {class:'solid', position:`${x} ${h} ${z}`, radius:r,
    src:'#cMountain', repeat:'1 12', color
  });
  if (h>0) mk('cylinder', {
    class:'solid', position:`${x} ${h-maxPlaneY} ${z}`, radius:r, height:maxPlaneY*2,
    src:'#cMountain', repeat:'1 12', color
  });
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

var forrest = [];
function mkTree(x, z, h, delay=200) {
  var tree = mk('cone', {
    position:`${x} ${-h/2} ${z}`,
    'radius-bottom':13, 'radius-top':0, height:h,
    src:'#cTree', repeat:'1 5', color
  });
  tree.mk('animation', { // Animate Right Wing
    dur:delay, easing:'linear',
    attribute:'position', from:`${x} ${-h/2} ${z}`, to:`${x} ${h/2} ${z}`
  });
  tree.x = x;
  tree.z = z;
  tree.h = h;
  forrest.push(tree);
  return tree;
}
function removeTree(tree) {
  if (!tree) return;
  var yRotate = rnd(360);
  tree.mk('animation', { // Animate Right Wing
    dur:1000, easing:'linear',
    attribute:'rotation', from:`0 ${yRotate} 0`, to:`0 ${yRotate} 90`
  });
  tree.mk('animation', { // Animate Right Wing
    dur:1000, easing:'linear',
    attribute:'position', from:`${tree.x} ${tree.h/2} ${tree.z}`, to:`${tree.x} 5 ${tree.z}`
  });
  setTimeout(()=> tree.mk('animation', { // Animate Right Wing
    dur:1500, easing:'linear',
    attribute:'position', from:`${tree.x} 5 ${tree.z}`, to:`${tree.x} -7 ${tree.z}`
  }), 1500);
  setTimeout(()=> tree.selfRemove(), 3000);
}

var rForrest = 850;
for (x=-rForrest; x<rForrest; x+=20) for (z=-rForrest; z<rForrest; z+=20) {
  if (Math.random() < .02 && (x**2 + z**2) < rForrest**2) {
    var red = rRnd(0,1).toString(16);
    var green = rRnd(6,8).toString(16);
    var blue = rRnd(0,2).toString(16);
    var color = `#${red}${green}${blue}`;
    var h = rnd(40, 60);
    mkTree(x, z, h);
  }
}
// Rand initial forrest Array:
forrest = forrest.sort((a,b)=>rnd(-1,1));
// controll forrest size by the FPS:
setInterval(()=> {
  if (fps < 22 && forrest.length > 80) {
    console.log('Remove Tree ' + forrest.length);
    removeTree(forrest.shift());
  }
  if (fps > 25 && forrest.length < 700) {
    console.log('Planting Tree ' + (forrest.length+1));
    var x = rForrest*2, y = rForrest*2;
    while ((x**2 + z**2) > rForrest**2) { 
      x = rnd(-rForrest, rForrest);
      z = rnd(-rForrest, rForrest);
    }
    mkTree(x, z, rnd(40, 60), 10000);
  }
}, 500);

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

var fps = 30, lastTime = Date.now(), ticCount = 0, ticsCheckout = 10;
var planeYaw = 0, moveRotation = new THREE.Euler(0, 0, 0);
setInterval(function(){
  ticCount++;
  if (ticCount%ticsCheckout == 0) {
    var frameDalay = (Date.now() - lastTime) / ticsCheckout;
    lastTime = Date.now();
    fps = 1000/frameDalay;
    if (ticCount%(ticsCheckout*3) == 0) console.log(
                'FPS', Math.round(fps*10)/10,
                '\nMeter/frame', planeSpeed,
                '\nMeter/sec', planeSpeed*fps);
    if (!plane.dead) planeSpeed = ( planeSpeed*4 + (30/fps) ) / 5;
  }
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
  velocity = (new THREE.Vector3(0,0,planeSpeed)).applyEuler(moveRotation);
  ['x','y','z'].forEach((k)=> plane.object3D.position[k] -= velocity[k] );
  if (plane.object3D.position.y > maxPlaneY-3) {
    if (plane.object3D.position.y > maxPlaneY) {
      plane.object3D.position.y = maxPlaneY;
      scene.setAttribute('fog', 'color', 'red');
      scene.setAttribute('background', 'color', 'red');
    } else {
      scene.setAttribute('fog', 'color', skyColor);
      scene.setAttribute('background', 'color', skyColor);
    }
  }

  debugG();
} ,30);

if (typeof(camDebug) != 'undefined') {
  var camDbgPos = camDebug.object3D.position;
  setInterval(()=> {
    ['x','y','z'].forEach((k)=>
      camDbgPos[k] = (camDbgPos[k]*4 + thePingeon.object3D.position[k])/5
    );
    camDbgPos.y = thePingeon.object3D.position.y + 20;
  }, 30);
}

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
  setTimeout(()=> setInterval(doSmoke, 3000), 5000);
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

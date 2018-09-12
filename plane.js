"use strict";

(()=>{

var planeYaw = 0;
var moveRotation = new THREE.Euler(0, 0, 0);
var velocity = new THREE.Vector3(0, 0, .01);
var planeSpeed = 1;

plane.rotation = plane.object3D.rotation;
plane.pos = plane.object3D.position;

function getWay() {
  if (g.x > 10) g.x = 10; if (g.x < -10) g.x = -10;
  if (g.y > 10) g.y = 10; if (g.y < -10) g.y = -10;
  if (g.z > 10) g.z = 10; if (g.z < -10) g.z = -10;
  var theWay = {
    up:    g.z/10,
    down:  g.z/10 * -1,
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

window.planeTic = (ticCount)=> {
  if (!started) return;
  if (plane.dead) return showDeath();
  else planeSpeed = 10/fps;
  var way = getWay();
  plane.rotation.x = way.up * -quarterTurn;
  plane.rotation.y = planeYaw;
  cam.object3D.rotation.z = way.left * quarterTurn;
  var sinZ = sin(-cam.object3D.rotation.z);
  if (sinZ != 0) planeYaw += sinZ/-60;
  // Move:
  moveRotation = new THREE.Euler(way.up * -quarterTurn, planeYaw, 0, 'ZYX');
  velocity = (new THREE.Vector3(0,0,planeSpeed)).applyEuler(moveRotation);
  plane.pos.sub(velocity);
  if (plane.pos.y > maxPlaneY-3) {
    if (plane.pos.y > maxPlaneY) {
      plane.pos.y = maxPlaneY;
      scene.setAttribute('fog', 'color', 'red');
      scene.setAttribute('background', 'color', 'red');
    } else {
      scene.setAttribute('fog', 'color', skyColor);
      scene.setAttribute('background', 'color', skyColor);
    }
  }
  testColision();
}

var solidList = [];
window.updateSolidList = ()=> solidList = document.querySelectorAll('.solid');

function testColision() {
  //console.log(solidList.length, 'solids to test');
  for (var solid,i=0; solid=solidList[i]; i++) {
    var solidType = (solid.dataset.colideType || solid.tagName).split('-')[1];
    updateRealPosition(solid);
    if (testColision[solidType.toLowerCase()](solid)) return hit(solid);
  }
  if (plane.pos.y < 0) return hit(ground);
}

function updateRealPosition(theEl) {
  var curEl = theEl;
  theEl.realPos = new THREE.Vector3();
  while (curEl != scene) {
    theEl.realPos.applyEuler(curEl.object3D.rotation);
    theEl.realPos.add(curEl.object3D.position);
    curEl = curEl.parentNode;
  }
}

testColision.sphere = function(el) {
  //if (el.id == 'balloon0') console.log('test colision to',el.id,el.radius);
  el.r = el.r || parseFloat(el.getAttribute('radius'));
  if (plane.pos.distanceTo(el.realPos) < el.r) return true;
  else return false;
}

testColision.cylinder = function(el) {
  el.r = el.r || parseFloat(el.getAttribute('radius'));
  el.h = el.h || parseFloat(el.getAttribute('height'));
  var {elX, elY, elZ} = el.realPos;
  var {planeX, planeY, planeZ} = plane.pos;
  var dX = planeX - elX;
  var dZ = planeZ - elZ;
  if ( ( (dX**2 + dZ**2) == el.r**2 ) && ( planeY < el.h/2 ) ) return true;
  else return false;
}

var explosion1, explosion2, explosionRadius=0.1;

function hit(el) {
  plane.dead = true;
  console.log(`plane hit ${el.tagName} ${el.id}`);
  //el.setAttribute('color', 'blue');
  var pos = plane.pos;
  explosion1 = planeBody.mk('sphere', {radius:.02, color:'#F00'});
  explosion2 = explosion1.mk('sphere', {radius:.01, color:'#F60'});
  planeSpeed = .08;
  buildDeadPlane();
}

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
  explosionRadius += 0.2/fps;
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
      doSmoke();
    }
  }
  // Turn a little asside:
  planeBody.object3D.rotation.y += -planeSpeed/5;
  // Drop if not in thr ground:
  if (plane.pos.y > -.4) plane.pos.y -= 0.5;
  // Correct Cam Roll:
  cam.object3D.rotation.z /= 1.01;
  // Correct plane Pitch:
  plane.rotation.x /= 1.01;
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
  xyzDo((k)=> {
    //plane.pos[k] += velocity[k]/2;
    cam.object3D.position[k] += velocity[k]*3;
    elice.object3D.position[k] -= velocity[k]*1.5;
    planeBody.object3D.position[k] -= velocity[k]*1.5;
  });
}

function doSmoke() {
  //<a-torus-knot color="#B84A39" arc="180" p="2" q="7" radius="5" radius-tubular="0.1"></a-torus-knot>
  var pos = plane.pos;
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
  if (.595 < opacity && opacity <= .6) doSmoke();
  if (opacity>0) setTimeout(()=> moveSmoke(smoke, opacity-0.005), 50);
  else smoke.selfRemove();
}

})();

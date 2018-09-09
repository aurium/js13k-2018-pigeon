"use strict";

var boids = [];
var pingeonCounter = 0;

var logThePingeon = (...args)=> console.log('ThePingeon', ...args);

function mkPingeon(x, y, z, color='#DDD') {
  var me = mk('sphere', { // Body
    position: `${x} ${y} ${z}`,
    'radius': .3,
    color: color,
  });
  me.mk('sphere', { // head
    position: '0 .3 0',
    'radius': .18,
    color: color,
  });
  me.mk('cone', { // Bick
    position: '0 .5 0',
    'radius-bottom': .1,
    'radius-top': 0,
    height: .2,
    color: '#E80',
  });
  me.mk('sphere', { // Left Wing
    position: '-.3 0 0',
    scale:'1 1 .3',
    'radius': .25,
    color: color,
  }).mk('animation', { // Animate Left Wing
    dur:400, repeat:'indefinite', easing:'linear', loop:'true', direction:'alternate',
    attribute:'rotation', from:'0 -30 0', to:'0 30 0'
  });
  me.mk('sphere', { // Right Wing
    position: '.3 0 0',
    scale:'1 1 .3',
    'radius': .25,
    color: color,
  }).mk('animation', { // Animate Right Wing
    dur:400, repeat:'indefinite', easing:'linear', loop:'true', direction:'alternate',
    attribute:'rotation', from:'0 30 0', to:'0 -30 0'
  });
  me.mk('sphere', { // Tail
    position: '0 -.3 0',
    scale:'1 1 .3',
    'radius': .2,
    color: color,
  });
  me.id = 'pingeon' + pingeonCounter++;
  boids.push(me);
  me.distTo = {};
  me.vecTo = {};
  me.pos = me.object3D.position;
  me.rotation = me.object3D.rotation;
  me.rotation.order = 'ZYX';
  me.rotation.x = -quarterTurn;
  me.rotation.y = quarterTurn/2;
  me.will = me.rotation.clone();
  me.nearest = null;
  return me;
}

var up = new THREE.Vector3(0,1,0);
var boidTicsCheckout = 3;

function boidTic(ticCount) {

  if ((ticCount)%boidTicsCheckout == 0) {

    var vecCenter = new THREE.Vector3(0,0,0);
    for (var b1,i1=0; b1=boids[i1]; i1++) {
      // Update distance between boids:
      for (var b2,i2=i1+1; b2=boids[i2]; i2++) {
        var dist = b1.pos.distanceTo(b2.pos);
        b1.distTo[b2.id] = b2.distTo[b1.id] = dist;
        if (!b1.nearest || b1.nearest.distTo[b1.id] > dist) b1.nearest = b2;
        if (!b2.nearest || b2.nearest.distTo[b2.id] > dist) b2.nearest = b1;
        b1.vecTo[b2.id] = b2.pos.clone();
        b2.vecTo[b1.id] = b1.pos.clone();
        xyzDo((k)=> {
          b1.vecTo[b2.id][k] -= b1.pos[k];
          b2.vecTo[b1.id][k] -= b2.pos[k];
        });
      }
      xyzDo((k)=> vecCenter[k] += b1.pos[k] );
    }
    xyzDo((k)=> vecCenter[k] /= boids.length );

    for (var b,i=0; b=boids[i]; i++) {
      // Update boid will:
      if ( b.pos.y < 75 && b.will.x < -deg90) { // Stop drop
        //logThePingeon('stop drop');
        b.will.x += -deg90 +.1;
      }
      else if ( b.pos.y > 120 && b.will.x > -deg90) { // Stop up
        //logThePingeon('stop up');
        b.will.x += -deg90 -.1;
      }
      else if ( b.nearest.distTo[b.id] < .5 ) { // Too near! Go away.
        //logThePingeon('go away');
        b.will = (new THREE.Euler).setFromQuaternion(
          (new THREE.Quaternion())
          .setFromUnitVectors(up, b.nearest.vecTo[b.id])
        );
      }
      else if ( b.nearest.distTo[b.id] > 2 ) { // Too away! Get near.
        //logThePingeon('get near');
        b.will = (new THREE.Euler).setFromQuaternion(
          (new THREE.Quaternion())
          .setFromUnitVectors(up, vecCenter)
        );
      }
      else if ((ticCount)%(boidTicsCheckout*30) == 0) { // Free move
        //logThePingeon('free move');
        b.will.y += rnd(-deg90, deg90);
        b.will.x += rnd(-deg90-deg45, -deg45);
      }
      //logThePingeon('will X', b.will.x, (Math.abs(b.will.x) > deg45));
      if (b.will.x > -deg45) b.will.x = -deg45;
      if (b.will.x < -deg90-deg45) b.will.x = -deg90-deg45;
      b.will.z *= .05;
    }
  }

  var speed = 20/fps;
  for (var b,i=0; b=boids[i]; i++) {
    //if (b.id == 'thePingeon') console.log('boid FPS', 1000/timeDelta)
    xyzDo((k)=> b.rotation[k] = (b.rotation[k]*9 + b.will[k]) / 10 );
    var vecVel = (new THREE.Vector3(0,speed,0)).applyEuler(b.rotation);
    xyzDo((k)=> b.pos[k] += vecVel[k] );
  }
}


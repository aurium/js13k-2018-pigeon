"use strict";

(()=>{

const moveRadius = 480;

//var bCam = mk('camera', {far:800, position:'0 130 70', rotation:'0 0 0', 'look-controls':'enabled: false', active:true});
//var bCam = mk('camera', {far:1800, position:'0 800 0', rotation:'-90 0 0', 'look-controls':'enabled: false', active:true});

var balloons = [];

function mkBalloon(c1, c2, iniAng) {
  var balloon = mk('entity', { position: '0 150 0' });

  balloon.mk('sphere', {radius:35, position:'0 5 0', rotation:'0 0   0', scale:'.5 1 1', color:c1});
  balloon.mk('sphere', {radius:35, position:'0 5 0', rotation:'0 30  0', scale:'.5 1 1', color:c2});
  balloon.mk('sphere', {radius:35, position:'0 5 0', rotation:'0 60  0', scale:'.5 1 1', color:c1});
  balloon.mk('sphere', {radius:35, position:'0 5 0', rotation:'0 90  0', scale:'.5 1 1', color:c2});
  balloon.mk('sphere', {radius:35, position:'0 5 0', rotation:'0 120 0', scale:'.5 1 1', color:c1});
  balloon.mk('sphere', {radius:35, position:'0 5 0', rotation:'0 150 0', scale:'.5 1 1', color:c2});
  balloon.mk('cylinder', {radius:1.5, height:2, position:'0 -35 0', color:'#740'});

  var rot = balloon.object3D.rotation;
  setInterval(()=> rot.y+=.005, 100);

  balloon.object3D.position.ang = iniAng;
  balloons.push(balloon.object3D.position);
}

mkBalloon('#80C', '#608', 0);
mkBalloon('#EB0', '#7B0', deg90);
mkBalloon('#C06', '#804', deg180);
mkBalloon('#06C', '#008', -deg90);

window.balloonTic = function (ticCount) {
  // move it:
  // angSpeed = .008/fps =~ 3.8m/s in a 480m radius circle path.
  balloons.forEach((b)=> {
    b.ang += .01/fps;
    b.x = cos(b.ang) * moveRadius;
    b.z = sin(b.ang) * moveRadius;
  });
}

})();

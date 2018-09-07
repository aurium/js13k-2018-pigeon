(()=>{

"use strict";

var boids = [];
const quarterTurn = Math.PI/2;

AFRAME.registerComponent('boid', {
  schema: {},

  init: function () {
    // Do something when component first attached.
    //console.log('init', this);
    boids.push(this);
    this.pos = this.el.object3D.position;
    this.rotation = this.el.object3D.rotation;
    this.rotation.order = 'ZYX';
    this.rotation.x = -quarterTurn;
    this.rotation.y = quarterTurn/2;
    this.will = this.rotation.clone();
  },

  update: function () {
    // Do something when component's data is updated.
    //console.log('update', this)
  },

  remove: function () {
    // Do something the component or its entity is detached.
    console.log('remove', this)
  },

  tick: function (time, timeDelta) {
    // Do something on every scene tick or frame.
    var vel = timeDelta/1000;
    var velVec = (new THREE.Vector3(0,vel,0)).applyEuler(this.rotation);
    ['x','y','z'].forEach((k)=> this.pos[k] += velVec[k] );
  }
});

})();

AFRAME.registerComponent('boid', {
  schema: {},

  init: function () {
    // Do something when component first attached.
    //console.log('init', this);
    var pos = this.el.components.position.attrValue;
    this.x = pos.x;
    this.y = pos.y;
    this.z = pos.z;
    this.inc = 0.02;
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
    //console.log('tic', this.z, time, timeDelta)
    this.y += this.inc;
    if ( 0 > this.y || this.y > 3) this.inc *= -1;
    this.el.attributes.position.value = `${this.x} ${this.y} ${this.z}`;
  }
});

// * Keyboard.js v0.1
// * Simple mouse class
// * 2014 Giovanni Blu Mitolo, gioscarab@gmail.com
// * MIT License [http://www.opensource.org/licenses/mit-license.php]

(function(app){

  // MOUSE Class ----------------------------------------------------------------------------------
  app['Mouse'] = function(canvas, link) {
    console.group('Mouse');

    var self = this;
    this.canvas = canvas;
    this.link = link;
    this.state = { active: false, x: 0, y: 0, pressed: false, wheelCount: 0, clickCount: 0};

    addEventHandler(canvas, 'mousedown touchstart', function(e) {
      self.setPressed(true, e);
    }, false);

    addEventHandler(document.body, 'mouseup touchcancel touchend', function(e) {
      self.setPressed(false, e);
      self.state.clickCount++;
    }, false);
    console.log('Click event attached.');

    addEventHandler(document.body, 'mousemove touchmove', function(e) {
      self.move(e);
    }, false);
    console.log('Move event attached.');

    addEventHandler(canvas, 'mousewheel', function(e) {
      self.updateWheel(e);
      self.state.wheelCount++;
    }, false);
    console.log('Wheel event attached.');
    console.groupEnd('Mouse');
  };

  Mouse.prototype.setPressed = function(pressed, event) {
    this.state.pressed = pressed;
    if (pressed) this.move(event);
  };

  Mouse.prototype.updateWheel = function(event) {
    event.preventDefault();
    if(event.wheelDelta > 0) {
      this.link.state.scale = Math.floor(this.link.state.scale + (this.canvas.width / 300));
      $('.tool.general.scale .interface').val(this.link.state.scale);
    }
    else if(this.link.state.scale > 4) {
      this.link.state.scale = Math.floor(this.link.state.scale - (this.canvas.width / 300));
      $('.tool.general.scale .interface').val(this.link.state.scale);
    }
  };

  Mouse.prototype.move = function(event) {
    if (! this.state.pressed) return;
    event.preventDefault();
    var coords = { x: 0, y: 0 };

    if (event.clientX) {
      coords.x = event.clientX;
      coords.y = event.clientY;
    } else if (event.touches && event.touches.length) {
      coords.x = event.touches[0].clientX;
      coords.y = event.touches[0].clientY;
    }

    var bb = this.canvas.getBoundingClientRect();
    this.state.x = ((coords.x - bb.left) / bb.width ) * this.canvas.width;
    this.state.y = ((coords.y - bb.top ) / bb.height) * this.canvas.height;
  };


  // EVENT HANDLER ---------------------------------------------------------------------------------
  app['addEventHandler'] = function(element, eventTypes, handler) {
    var types = eventTypes.split(' ');
    for (var i = 0; i < types.length; i++)
      element.addEventListener(types[i], handler, false);
  };

})(window);

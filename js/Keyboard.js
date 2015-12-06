// * Keyboard.js v0.1
// * Simple keyboard class
// * 2014 Giovanni Blu Mitolo, gioscarab@gmail.com
// * MIT License [http://www.opensource.org/licenses/mit-license.php]

(function(app) {

  // KEYBOARD Class --------------------------------------------------------------------------------
  app['Keyboard'] = function() {
    console.group('Keyboard');
    var self = this;
    this.state =  { active: true, pressCount: 0 };
    this.keys = [];
    this.listeners = {};
    this.specials = { 16: 'SHIFT', 17: 'CTRL', 32: 'SPACE', 27: 'ESC' };
    this.pressedLastTime = false;

    document.addEventListener('keydown', function(event) {
      var key = self.getKey(event.which || event.keyCode);

      if (event.target.tagName == 'INPUT' && event.target.getAttribute('type') == 'text')
        return;

      if (self.isPressed(key))
        return;

      self.setPressed(key, true);

      if (self.listeners[key])
        for (var i in self.listeners[key])
          self.listeners[key][i].fn.call(self.listeners[key][i].obj, key, event);
    }, false);

    console.log('Keydown event attached.');

    document.addEventListener('keyup', function(event) {
      self.setPressed(self.getKey(event.which || event.keyCode), false);
    }, false);

    console.log('Keyup event attached.');
    console.groupEnd('Keyboard');
  };

  Keyboard.prototype.isPressed = function(key) {
    return !!this.keys[key];
  };

  Keyboard.prototype.setPressed = function(key, pressed) {
    this.state.pressCount++;
    this.keys[key] = pressed;
  };

  Keyboard.prototype.getKey = function(code) {
    return this.specials[code] || String.fromCharCode(code);
  };

  Keyboard.prototype.register = function(keys, listener, bind) {
    keys = _.flatten([keys]);
    for (var i in keys) {
      this.listeners[keys[i]] = this.listeners[keys[i]] || [];
      this.listeners[keys[i]].push({ fn: listener, obj: bind });
    }
  };

  // EVENT HANDLER ---------------------------------------------------------------------------------
  app['addEventHandler'] = function(element, eventTypes, handler) {
    var types = eventTypes.split(' ');
    for (var i = 0; i < types.length; i++)
      element.addEventListener(types[i], handler, false);
  };

})(window);

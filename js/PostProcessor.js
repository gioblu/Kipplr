(function(app) {

  function Effect(canvas, interface) {
    this.canvas = canvas;
    this.interface = interface;
  }

  Effect.prototype.filter = function() {
    var context = this.canvas.getContext('2d');
    var image = context.getImageData(0, 0, this.canvas.width, this.canvas.height);

    this.process(image.data);

    context.putImageData(image, 0, 0);
  };

  var filters = {};

  filters['noise'] = function(data) {
    for (var i = 0, n = data.length; i < n; i += 4) {
      data[i] = data[i] * (_.random(0, this.interface.state.fill.r) / (this.interface.state.fill.opacity * 100));
      data[i + 1] = data[i + 1] * (_.random(0, this.interface.state.fill.g) / (this.interface.state.fill.opacity * 100));
      data[i + 2] = data[i + 2] * (_.random(0, this.interface.state.fill.b) / (this.interface.state.fill.opacity * 100));
    }
  };

  filters['grayScale'] = function(data) {
    for (var i = 0, n = data.length; i < n; i += 4) {
      var r = data[i];
      var g = data[i + 1];
      var b = data[i + 2];
      // CIE luminance for the RGB
      // The human eye is bad at seeing red and blue, so we de-emphasize them.
      var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      data[i] = data[i + 1] = data[i + 2] = v;
    }
  };

  app['effects'] = {
    init: function(canvas, interface) {
      for (var filter in filters) {
        if (!filters.hasOwnProperty(filter))
          continue;

        var obj = function(){
          Effect.apply(this, arguments);
        };

        obj.prototype = Object.create(Effect.prototype);
        obj.prototype.process = filters[filter];

        this[filter] = new obj(canvas, interface);
      }
    }
  };

})(window);

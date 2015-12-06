// * Renderer.js v0.1
// * Application specific 2d canvas dynamic renderer
// * 2013 - 2014 Giovanni Blu Mitolo, gioscarab@gmail.com
// * MIT License [http://www.opensource.org/licenses/mit-license.php]

(function(app) {
  app['Renderer'] = function(canvas, interface, options) {

    var state = interface.state,
        padding = canvas.height / 10,
        polygon = new Polygon(),
        circle = new Circle(),
        line = new Line(),
        curve = new Curve();

    app['effects'].init(canvas, interface);

    if(options && options['padding']) padding = options['padding'];

    // DRAW FUNCTIONS
    this.draw = function() {
      var conditional = 0;
      var start = +Date.now();
      var frameDuration = 26;
      var shape;
      var sides = 0;

      if(options['random'])
        this.updateStylesRandomly();

      conditional = (state.density / 10) / (100 / frameDuration) + 1;
      for (var i = 1; +Date.now() - start < frameDuration; i++) {
        if(i >= conditional) break;
        shape = null;

        switch (state.drawMode) {
          case 'tri': sides = 3;
          case 'rect': if (!sides) sides = 4;
          case 'poly':
            if (!sides) sides = state.poly.active ? state.poly.sides : _.random(3, 12);
            shape = polygon;
            shape.sides = sides;
            shape.angle = (state.rotation / 360) * 2 * Math.PI;
            shape.radius = _.random( _.random(0, state.scale), state.scale);
            sides = 0;
            break;
          case 'circ':
            shape = circle;
            shape.radius = _.random( _.random(0, state.scale), state.scale);
            shape.startArc = 0;
            shape.endArc = (state.circ.active) ? (state.circ.degrees / 360) * 2 * Math.PI : 2 * Math.PI;
            break;
          case 'line':
            shape = line;
            shape.x1 = this.randomCoordinate('x');
            shape.y1 = this.randomCoordinate('y');
            break;
          case 'quad':
            shape = curve;
            shape.cpx = state.mouse.pressed ? state.mouse.x : this.randomCoordinate('x') - state.scale;
            shape.cpy = _.random(-padding, canvas.height - state.scale + padding);
            shape.epx = this.randomCoordinate('x');
            shape.epy = this.randomCoordinate('y');
            break;
          default:
            break;
        }

        if (shape) {
          if(state.origin.active)
            shape.setPosition(state.origin.x, state.origin.y);
          else
            shape.setPosition(
              state.mouse.pressed ? state.mouse.x : this.randomCoordinate('x'),
              state.mouse.pressed ? state.mouse.y : this.randomCoordinate('y')
            );
          shape.draw(interface.context);
        }

        this.setStyles();
        state.stroke.active && this.drawShape('stroke');
        state.fill.active && this.drawShape('fill');
        state.drawIndex++;
      }
    };

    this.randomCoordinate = function(axis) {
      return _.random(-padding, canvas[(axis == 'x') ? 'width' : 'height'] + padding);
    };

    this.drawShape = function(mode) {
      interface.context.lineWidth = _.random(1, state.stroke.width);

      if(state.drawMode == 'text') {
        interface.context.font =  state.scale + 'px Arial';
        var x = state.mouse.pressed ? state.mouse.x : state.origin.active ? state.origin.x : _.random(-padding, canvas.width + padding);
        var y = state.mouse.pressed ? state.mouse.y : state.origin.active ? state.origin.y : _.random(-padding, canvas.width + padding);


        if(state.text.mode == 'randomWords')
          interface.context[mode + 'Text']( getRandomWord(_.random(0, 25)), x, y );

        if(state.text.mode == 'randomLetters')
          interface.context[mode + 'Text']( getRandomWord(1), x, y );

        if(state.text.mode == 'customWords')
          interface.context[mode + 'Text']( interface.state.customWords[_.random(0, interface.state.customWords.length - 1)], x, y );

        if(state.text.mode == 'randomWordsType')
          interface.context[mode + 'Text'](
            app.texts[state.text.selectedWordTypes][_.random(0, app.texts[state.text.selectedWordTypes].length - 1)],
            x,
            y
          );

      } else interface.context[mode]();
    };

    this.setStyle = function(context, name, values) {
      context[name + 'Style'] = 'rgba(' +
        _.random(0, state[name].r) + ', ' +
        _.random(0, state[name].g) + ', ' +
        _.random(0, state[name].b) + ', ' +
        values.opacity + ')';
    };

    this.setStyles = function() {
      _.each(['stroke', 'fill'], function(style) {
        if (state[style].active) this.setStyle(interface.context, style, state[style]);
      }, this);

      interface.context.globalCompositeOperation = state.composite;
      interface.context.shadowColor = 'transparent';

      if(state.shadow.active) {
        interface.context.shadowColor = 'rgba(' +
          _.random(0, state.shadow.r) + ', ' +
          _.random(0, state.shadow.g) + ', ' +
          _.random(0, state.shadow.b) + ', ' +
          state.shadow.opacity + ')';

        interface.context.shadowBlur = state.shadow.blur;
        interface.context.shadowOffsetX = state.shadow.x * (canvas.width / 10);
        interface.context.shadowOffsetY = state.shadow.y * (canvas.height / 10);
      }
    };

    this.updateStylesRandomly = function() {
      state.fill.r = _.random(200, 255);
      state.fill.g = _.random(200, 255);
      state.fill.b = _.random(200, 255);
      state.fill.opacity = _.random(0.25, 0.5);
      state.stroke.r = _.random(200, 255);
      state.stroke.g = _.random(200, 255);
      state.stroke.b = _.random(200, 255);
      state.stroke.opacity = _.random(0.25, 0.5);
      state.scale = _.random(1, 75);
      state.stroke = _.random(1, 25);
      state.density = 1;
      state.drawMode = interface.modes[_.random(0, interface.modes.length  - 2)];
      state.origin.active = (_.random(0, 10) == 5) ? true : false;
      state.fractal.offsetX = 130;
      state.fractal.power = 1;
      state.composite = (_.random(0, 5) == 5) ? 'lighter' : 'source-over';
    };

    /* Research and development ............................................................................................ */

    this.drawPitagoraTree = function() {
      var branchWidth = Math.floor(state.scale);
      var startWidth = canvas.width / 2 - (branchWidth / 2);
      var startHeight =  canvas.height;
      var startA = new Point(startWidth, startHeight);
      var startB = new Point(startWidth + branchWidth, startHeight);
      this.drawBranch(startA, startB, 0);
    };

    this.drawBranch = function(a, b, depth) {
      var shapeNumber = Math.pow(2, state.fractal.depth);
      if(depth < state.fractal.depth) {
        depth++;
        var dx = b.x - a.x;
        var dy = a.y - b.y;
        var c = new Point(b.x - dy, b.y - dx);
        var d = new Point(a.x - dy, a.y - dx);
        var offSetX = mapValue(state.fractal.offsetX, 0, 180, 0, 1);
        var offSetY = - Math.sqrt( Math.pow(0.5, state.fractal.power) - Math.pow( (0.5 - offSetX), state.fractal.power) );
        var e = new Point( d.x + offSetX * (c.x - d.x) + offSetY * (a.y - b.y), d.y + offSetX * (c.y - d.y) + offSetY * (b.x - a.x));
        this.drawPolygon([a, b, c, d]);
        this.drawPolygon([c, d, e]);
        shapeNumber = shapeNumber + 2;
        var self = this;
        setTimeout(function(){
          self.drawBranch(d,  e, depth);
          self.drawBranch(e,  c, depth);
        }, 0);
      }
    };

    this.drawRandomTree = function() {
      var shapesNumber = state.fractal.depth * 100;
      var branchWidth = Math.floor(state.scale);
      var startWidth = canvas.width / 2 - (branchWidth / 2);
      var startHeight =  canvas.height;
      var startA = new Point(startWidth, startHeight);
      var startB = new Point(startWidth + branchWidth, startHeight);
      var a = startA;
      var b = startB;

      for(var actualDepth = 0; actualDepth < shapesNumber; actualDepth++ ) {
        var dx = b.x - a.x;
        var dy = a.y - b.y;
        var c = new Point(b.x - dy, b.y - dx);
        var d = new Point(a.x - dy, a.y - dx);
        var offSetX = mapValue(state.fractal.offsetX, 0, 180, 0, 1);
        var offSetY = - Math.sqrt( Math.pow(offSetX, state.fractal.power) - Math.pow(0, state.fractal.power));
        var e = new Point( d.x + offSetX * (c.x - d.x) + offSetY * (a.y - b.y), d.y + offSetX * (c.y - d.y) + offSetY * (b.x - a.x));

        this.drawPolygon([a, b, c, d]);
        this.drawPolygon([c, d, e]);

        if(_.random(0,1)) { a = d; b = e; }
        else { a = e;  b = c; }
      }
    };

    this.drawPolygon = function(vertices) {
      interface.context.beginPath();
      interface.context.moveTo(vertices[0].x, vertices[0].y);

      for(var i = 0; i < vertices.length; i++)
        interface.context.lineTo(vertices[i].x, vertices[i].y);

      interface.context.closePath();
      this.setStyles();
      if(state.fill.active) interface.context.fill();
      if(state.stroke.active) interface.context.stroke();
    };

    this.drawSpyral = function() {
      R = state.fractal.power;
      r = state.fractal.depth;
      O = state.fractal.offsetX;

      var x1 = R - O;
      var y1 = 0;
      var i  = 1;
      interface.context.beginPath();
      interface.context.moveTo(x1,y1);
      do {
        if (i > 200) break;
        var x2 = (R + r) * Math.cos(i * Math.PI / 72) - (r + O) * Math.cos(((R + r)/ r) * (i * Math.PI / 72));
        var y2 = (R + r) * Math.sin(i * Math.PI / 72) - (r + O) * Math.sin(((R + r) / r) * (i * Math.PI / 72));
        interface.context.lineTo(x2,y2);
        x1 = x2;
        y1 = y2;
        i++;
      } while (x2 != R - O && y2 != 0 );
      interface.context.stroke();
    };

    this.drawFlame = function() {
      var direction = _.random(0, 2);
      var strength = +state.scale;

      if(direction == 0) {
        var side = {
          x: _.random(+state.origin.x - strength, +state.origin.x),
          y: _.random(+state.origin.y - (strength * state.fractal.power), +state.origin.y)
        };

        var top = {
          x: _.random(+state.origin.x - strength, +state.origin.x),
          y: _.random(+state.origin.y - (strength * state.fractal.power), +state.origin.y)
        };
      }
      if(direction == 1)  {
        var side = {
          x: _.random(+state.origin.x, +state.origin.x + strength),
          y: _.random(+state.origin.y - (strength * state.fractal.power), +state.origin.y)
        };

        var top = {
          x: _.random(+state.origin.x, +state.origin.x + strength),
          y: _.random(+state.origin.y - (strength * state.fractal.power), +state.origin.y)
        };
      }
      if(direction == 2)  {
        var side = {
          x: _.random(+state.origin.x, +state.origin.x + strength),
          y: _.random(+state.origin.y - (strength * state.fractal.power), +state.origin.y)
        };

        var top = {
          x: _.random(+state.origin.x - strength, +state.origin.x + strength),
          y: +state.origin.y - (strength * state.fractal.power * 1.2)
        };
      }

      var vertices = [state.origin, side, top];
      this.drawPolygon(vertices);
    };

  };

  // MAP - Arduino like map function ---------------------------------------------------------------
  app['mapValue'] = function(value, originalMin, originalMax, newMin, newMax) {
    return (value - originalMin) * (newMax - newMin) / (originalMax - originalMin) + newMin;
  };

  app['getRandomWord'] = function(wordLenght) {
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var randomWord = '';
    for (var i = 0; i < wordLenght; i++) {
      var randomNumber = Math.floor(Math.random() * letters.length);
      randomWord += letters.substring(randomNumber, randomNumber + 1);
    }
    return randomWord;
  };

})(window);



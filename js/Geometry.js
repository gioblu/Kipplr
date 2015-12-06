// * Geometry.js v0.1
// * Geometry basic classes to draw with canvas 
// * 2013 - 2014 Giovanni Blu Mitolo, gioscarab@gmail.com
// * MIT License [http://www.opensource.org/licenses/mit-license.php]

var Shape = function(x, y) {
  this.name = 0;
  this.date = new Date();
  this.x = x;
  this.y = y;

  this.setPosition = function(x, y) {
    this.x = x;
    this.y = y;
  }
}

var Point = function() {
  Shape.apply(this, arguments);
  this.strokeColor = 0;
  this.strokeOpacity = 0;
  this.StrokeStyle = 0;
}

var Line = function() {
  Point.call(this);
  this.x1 = 0;
  this.y1 = 0;

  this.draw = function(context) {
    context.beginPath();
    context.moveTo(this.x, this.y);
    context.lineTo(this.x1,this.y1);
    context.closePath();
  }
}

var Curve = function() {
  Point.call(this);
  this.cpx = 0;
  this.cpy = 0;
  this.epx = 0;
  this.epy = 0;

  this.draw = function(context) {
    context.beginPath();
    context.moveTo(this.x, this.y);
    context.quadraticCurveTo(this.cpx, this.cpy, this.epx, this.epy);
    context.closePath();
  }
}

var Polygon = function() {
  Point.call(this);
  this.sides = 0;
  this.angle = - Math.PI / 2;
  this.radius = 0;
  this.fillColor = 0;
  this.fillOpacity = 0;
  this.regular = true;
  this.vertices = [];

  this.draw = function(context) {
    if (this.sides < 3) 
      return 'sides fail';
    
    context.beginPath();

    //if(this.regular) {
      var a = ((Math.PI * 2) / this.sides);
      context.translate(this.x, this.y);
      context.rotate(this.angle);
      context.moveTo(this.radius, 0);

      for (var i = 1; i < this.sides; i++) 
        context.lineTo( this.radius * Math.cos(a * i), this.radius * Math.sin(a * i) );

      context.closePath();
      context.rotate(-this.angle);
      context.translate(-this.x, -this.y);
    /*} else {
      context.moveTo(this.vertices[0].x, this.vertices[0].y);
      for(var i = 0; i < this.vertices.length; i++)
        context.lineTo(this.vertices[i].x, this.vertices[i].y);
      context.closePath();
    }*/
  }

}

var Circle = function() {
  Point.call(this);
  this.radius = 1;
  this.fillColor = 0;
  this.fillOpacity = 0;
  this.startArc = 0;
  this.endArc = 0;

  this.draw = function(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, this.startArc, this.endArc);
    context.closePath();
  }
}

// INHERITING SHAPE
Point.prototype = new Shape();
// REDIRECT CONSTRUCTOR TO SHAPE
Point.prototype.constructor = Shape;
// INHERITING POINT
Line.prototype = new Point();
// REDIRECT CONSTRUCTOR TO PONINT
Line.prototype.constructor = Point;
// INHERITING POINT
Polygon.prototype = new Point();
// REDIRECT CONSTRUCTOR TO PONINT
Polygon.prototype.constructor = Point;
// INHERITING POINT
Circle.prototype = new Point();
// REDIRECT CONSTRUCTOR TO PONINT
Circle.prototype.constructor = Point;

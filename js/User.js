
// USER Class 
(function(app) {
  app['User'] = function() {
    var self = this;
    this.platform = navigator.platform;
    this.language = navigator.language;
    this.os = 'unknown';
    this.browser = 'uknown';
  };
})(window);

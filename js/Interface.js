// * Interface.js v0.1
// * Application specific dynamic interface
// * 2013 - 2014 Giovanni Blu Mitolo, gioscarab@gmail.com
// * MIT License [http://www.opensource.org/licenses/mit-license.php]

// AVOID CONSOLE LOG errors in browsers that lack a console ---------------------------------------
(function() {
  var method;
  var noop = function() {};
  var methods = [
      'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
      'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
      'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
      'timeStamp', 'trace', 'warn'
  ];
  var length = methods.length;
  var console = (window.console = window.console || {});

  while (length--) {
    method = methods[length]; // Only stub undefined methods.
    if (!console[method]) console[method] = noop;
  }
}());

(function(app){
  'use strict';

  // EVENT HANDLER ---------------------------------------------------------------------------------
  function addEventListener(element, event, handler, bubbling) {
    var events = event.split(' ');
    for (var i = 0; i < events.length; i++)
      element.addEventListener(events[i], handler, bubbling);
  }

  // INTERFACE Class -------------------------------------------------------------------------------
  app['Interface'] = function(canvas, options) {
    var self = this;
    this.timer = 0;
    this.audio = 0;
    this.context = canvas.getContext('2d');
    this.tempImage = document.createElement('img');
    this.fingerPrint = [];

    this.compositeTypes = [
      'source-over', 'source-in', 'source-out', 'source-atop',
      'destination-over', 'destination-in', 'destination-out',
      'destination-atop', 'lighter', 'darker', 'copy', 'xor'
    ];

    this.modes = [ 'tri', 'rect', 'poly', 'circ', 'line', 'quad', 'text', 'fractal', 'filters' ];

    this.state = {
           circ: { active: false, degrees: 180 },
      composite: 'source-over',
        density: _.random(0, 100),
      drawIndex: 0,
       drawMode: this.modes[_.random(0, this.modes.length  - 2)],
        drawing: false,
           fill: { active: true, r: 128, g: 128, b: 128, opacity: 0.5 },
        filters: { active: false, type: 'noise'},
        fractal: { active: false, offsetX: 90, power: 2, depth: 5, drawEnd: true, type: 'drawRandomTree' },
          mouse: 0,
         origin: { active: false, x: canvas.width / 2, y: canvas.width / 2 },
       rotation: 0,
          scale: 100,
         shadow: { active: false, width: 1, r: 0, g: 0, b: 0, opacity: 0.5, x: 0, y: 0, blur: 0},
           poly: { active: false, sides: 5 },
         stroke: { active: true, width: _.random(1, 20), r: 128, g: 128, b: 128, opacity: 0.5 },
           text: { active: false, mode: 'randomLetters', customLetters: false, customWords: false, randomWordsType: false, randomLetters: true, randomWords: false, selectedWordTypes: 'nerd' },
    customWords: [],
    };

    this.tools = {
          tri:[ 'shadow', 'origin', 'scale', 'density', 'rotation', 'fill', 'stroke' ],
         rect:[ 'shadow', 'origin', 'scale', 'density', 'rotation', 'fill', 'stroke' ],
         poly:[ 'shadow', 'poly', 'origin', 'scale', 'density', 'rotation', 'fill', 'stroke' ],
         circ:[ 'shadow', 'circ', 'origin', 'scale', 'density', 'rotation', 'fill', 'stroke' ],
         line:[ 'shadow', 'origin', 'scale', 'density', 'rotation', 'stroke' ],
         quad:[ 'shadow', 'origin', 'scale', 'density', 'fill', 'rotation', 'stroke' ],
         text:[ 'shadow', 'origin', 'text', 'scale', 'density', 'rotation', 'fill', 'stroke' ],
      fractal:[ 'shadow', 'origin', 'fractal', 'scale', 'fill', 'stroke' ],
      filters:[ 'filters', 'scale', 'density', 'fill'],
          all:[ 'fractal', 'circ', 'poly',  'origin', 'text', 'scale', 'density', 'rotation', 'fill', 'stroke', 'shadow', 'filters' ]
    };

    // ACTIONS ---------------------------------------------------------------------------------------

    this.actions = {
      getCanvasUrl: function() {
        if (!!new Blob) {
          var data = atob( canvas.toDataURL( "image/png" ).substring( "data:image/png;base64,".length ) );
          var asArray = new Uint8Array(data.length);
          for( var i = 0, len = data.length; i < len; ++i )
            asArray[i] = data.charCodeAt(i);

          var blob = new Blob( [ asArray.buffer ], { type: "image/png" } );
          console.info('File saved with createObjectURL function.');
          return window.URL.createObjectURL(blob);
        } else {
          console.info('File saved with toDataURL function.');
          return canvas.toDataURL('image/png');
        }
      },
      save: function() {
        self.actions.generateFingerPrint();
        window.open(self.actions.getCanvasUrl(), '_blank');
      },
      hexToRGB: function(hex) {
        hex = (hex.charAt(0) == "#") ? hex.substring(1, 7) : hex;
        return {
          'r': parseInt(hex.substring(0, 2), 16),
          'g': parseInt(hex.substring(2, 4), 16),
          'b': parseInt(hex.substring(4, 6), 16)
        };
      },
      erase: function() {
        self.context.clearRect(0, 0, canvas.width, canvas.height);
        this.setStorage('state', null);
      },
      updateDimensions: function() {
        var dimensions = $('#dimensions').val();
        canvas.height = dimensions;
        canvas.width = dimensions;
        self.context = canvas.getContext('2d');
        $('.tool.scale input').attr('max' , dimensions);
        for(var i = 0; i < $('.tool.grid input').length; i++)
          $('.tool.grid input').attr('max' , dimensions);
        $('.tool.stroke.width input').attr('max', dimensions / 2);
      },
      info: function() {
        self.actions.toggleDialogBox();
        self.setValue(['drawing'], false);
      },
      toggleDialogBox: function() {
        $('#dialog-box').toggleClass('hidden');
        $('#page-shadow').toggleClass('hidden');
      },
      closeDialogBox: function() {
        $('#dialog-box').addClass('hidden');
        $('#page-shadow').addClass('hidden');
      },
      toggleTextMode: function(mode) {
        if(mode) self.setValue(['text', 'mode'], mode);
        var wordsType = document.getElementById('selectedWordTypes');
        for (var i = 1; i < Object.keys(self.state.text).length; i++) {
          var key = String(Object.keys(self.state.text)[i]);
          var checkBox = document.getElementById(key);

          if(key == 'active' || key == 'mode')
            continue;

          if(key == 'selectedWordTypes')
            self.setValue(['text', 'selectedWordTypes'], wordsType.options[wordsType.selectedIndex].value);

          else
            self.setValue(['text', key], key == mode);

          if(checkBox)
            checkBox.checked = mode == checkBox.id;
        }
      },
      addCustomWord: function() {
        self.state.customWords.push($('#customWord').val());
        self.update();
        $('.box.customWords').append('<small>' + $('#customWord').val() + '</small>');
        $('#customWords').val('checked', true);
        self.actions.toggleTextMode('customWords');
      },
      getCustomWordsFromStorage: function() {
        var words = self.state.customWords;
        if(words)
          for(var i = 0; i < self.state.customWords.length; i++)
            $('.box.customWords').append('<small>' + words[i] + '</small>');
      },
      play: function() {
        self.setValue(['drawing'], true);
      },
      pause: function() {
        self.setValue(['drawing'], false);
      },
      filter: function() {
        app['effects'][self.state.filters.type].filter();
      },
      generateFingerPrint: function() {
        self.tempImage = document.createElement('img');
        self.tempImage.src = self.actions.getCanvasUrl();

        self.tempImage.addEventListener('load', function () {
          var context2 = document.getElementById('fingerPrintCanvas').getContext('2d');
          context2.drawImage(self.tempImage, 0, 0, 5, 5);
          self.fingerPrint = context2.getImageData(0, 0, 5, 5).data;
          self.actions.sendStats();
        }, false);
      },
      sendStats: function() {
        console.log('Stats sending start');

        $.ajax({
          type: 'POST',
          url: 'stats.php',
          contentType: 'application/json; charset=utf-8',
          data: JSON.stringify({ 
            'state': self.state,
            'fingerPrint': self.fingerPrint,
            'user': user
          }),
          success: function(data) {
            console.log(data);
          },
          error: function(xhr, type) {
            console.log('Stats Ajax communication fail: ' + type);
          }
        });
      }
    };

    // ANIMATE FUNCTION ----------------------------------------------------------------
    this.animate = function() {
      // DRAWING FUNCTION
      if((self.state.drawing || self.state.mouse.pressed) && self.state.drawMode != 'filters')
        renderer.draw();

      if(self.state.drawMode == 'fractal' && self.state.drawing)
        renderer[self.state.fractal.type]();

      // REQUEST NEW FRAME
      newFrame(self.animate);
    };

    // INTERFACE BASIC FUNCTIONS --------------------------------------------------
    this.getValue = function(path) {
      var state = this.state;
      while (path.length) state = state[path.shift()];
      return state;
    };

    this.setValue = function(path, value) {
      var state = this.state;
      while(path.length - 1) state = state[path.shift()];
      state[path[0]] = value;
      self.update();
    };

    // USER OPTION FUNCTIONS -------------------------------------------------------
    this.checkOption = function(value) {
      return (value in options) ? options[value] : undefined;
    };

    this.setState = function(options) {
      if('state' in options)
        self.state = _.extend(this.state, options.state);
    };

    this.update = function() {
      if(this.timer)
        clearTimeout(this.timer);

      this.timer = setTimeout( this.setStorage('state', this.state) , 1000);
    };

    // LOCAL STORAGE FUNCTIONS -----------------------------------------------------

    this.getStorage = function(name) {
      if(app.localStorage)
        return JSON.parse(sessionStorage.getItem(name));
    };

    this.setStorage = function(name, value) {
      if (app.localStorage)
        sessionStorage.setItem(name, JSON.stringify(self.state));
    };

    // DOM MANIPULATION FUNCTIONS --------------------------------------------------
    this.toggleTool = function(tool) {
      if(!tool.data('tool'))
        return;
      var options = tool.data('tool').split('-');
      if(options.length > 1) {
        if(!this.state[options[0]][options[1]]) {
           self.setValue([options[0], options[1]], true);
           tool.addClass('selected');
           $('.' + options[0]).show();
        } else {
          self.setValue([options[0], options[1]], false);
          tool.removeClass('selected');
          $('.' + options[0]).hide();
        }
      } else {
        if(!this.state[tool.data('tool')]) {
          self.setValue([tool.data('tool')], true);
          tool.addClass('selected');
          $('.' + tool.data('tool')).show();
        } else {
          self.setValue([tool.data('tool')], false);
          tool.removeClass('selected');
          $('.' + tool.data('tool')).hide();
        }
      }
    };

    this.toggleTools = function(drawMode) {
      self.setValue(['drawMode'], drawMode);
      $('#modes .mode').removeClass('selected');
      $('#' + drawMode).addClass('selected');
      for(var i = 0; i < this.tools.all.length; i++) {
        var panel = $('#' + this.tools.all[i] + '-panel');
        if( _.contains(this.tools[drawMode], this.tools.all[i]) === false) {
          $(panel).addClass('hidden');
        } else {
          $(panel).removeClass('hidden');
        }
      }
      if(this.state[drawMode] && !this.state[drawMode].active)
        this.toggleTool($('#' + this.state.drawMode + '-panel .title-row small'));
    };

    // OPTIONS MERGE WITH STATE ------------------------------------------------------
    if(this.getStorage('state')) {
      //this.state = this.getStorage('state');
      this.actions.getCustomWordsFromStorage();
    }

    this.setState(options);

    // DOM INITIALIZE FUNCTION -------------------------------------------------------
    this.initialize = function() {
      var date = new Date();

      if(this.checkOption('mouse')) {
        app.mouse = new Mouse(canvas, self);
        this.setValue(['mouse'], mouse.state);
      }

      if(this.checkOption('keyboard')) {
        app.keyboard = new Keyboard();

        keyboard.register(_.range(0, self.modes.length + 1), function(key) {
            this.toggleTools(self.modes[key - 1]);
        }, this);

        keyboard.register('SPACE', function(key, e){
          this.setValue(['drawing'], !this.state.drawing);
          e.preventDefault();
        }, this);

        keyboard.register('ESC', function(key, e){
          this.actions.closeDialogBox();
          e.preventDefault();
        }, this);
      }

      console.group('Interface');

      // WIRE UP MODE BUTTONS - TOP BUTTONS ONCLICK ------------------------------------
      for(var i = 0; i < this.modes.length; i++) {
        document.getElementById(this.modes[i]).onclick = function() {
          self.toggleTools(this.id);
        };
      }
      console.log('".title-row small" set DOM state from interface.state.');

      // SET TOOL STATE READING INTERFACE MEMORY ---------------------------------------
      var titles = $('.title-row small');
      for(var i = 0; i < titles.length; i++) {
        if(!titles.data('tool')) continue;
        var title = $(titles[i]);
        var options = title.data('tool').split('-');

        if(options.length > 1) {
          if(this.state[options[0]][options[1]]) {
            $('.' + options[0]).show();
            title.addClass('selected');
          }
          else {
            $('.' + options[0]).hide();
            title.removeClass('selected');
          }
        } else {
          if(this.state[options[0]]) {
            $('.' + options[0]).show();
            title.addClass('selected');
          } else {
            $('.' + options[0]).hide();
            title.removeClass('selected');
          }
        }

        // WIRE UP TITLE HIDE / SHOW - ONCLICK ------------------------------------------
        $('.title-row small')[i].onclick = function() {
          self.toggleTool($(this));
        };

      }
      console.log('DOM setup according to interface.state / ".title-row small" toggle event attached.');

      // WIRE UP BUTTONS ACTIONS --------------------------------------------------------
      var buttons = $('input.interface.action');
      for(var i = 0; i < buttons.length; i++) {
        var action = buttons[i].getAttribute('data-action');
        if(action) addEventHandler(buttons[i], 'mousedown', this.actions[action]);
      }

      // WIRE UP MOUSE CLICK - event handler -> REVISION CONSIDERED HERE ----------------
      addEventHandler(document.getElementById('page-shadow'), 'mousedown', this.actions.toggleDialogBox);
      console.log('"input.interface.action" buttons click event attached / "#page-shadow" modal window click event attached.');

      // WIRE UP ALL TOOL INPUT WITH 'interface' CLASS ----------------------------------
      var tools = document.getElementsByClassName('interface');
      for(var toolIndex = 0; toolIndex < tools.length; toolIndex++) {
        var tool = tools[toolIndex];

        // CHECKBOX - NOW USED ONLY FOR TEXT MODE ---------------------------------------
        if(tool.type == 'checkbox') {
          tool.addEventListener('change', function() {
            if(!this.getAttribute('data-interface'))
              return;
            var options = this.getAttribute('data-interface').split('-');
            if(options[0] == 'text') self.actions.toggleTextMode([options[1]]);
          });
          continue;
        }

        // COLOR INPUT - TODO evaluate if is necessary to include this type of input ----
        if(tool.type == 'color') {
          tool.addEventListener('change', function() {
            if(!this.getAttribute('data-interface')) return;
            var options = this.getAttribute('data-interface').split('-');
            var color = self.actions.hexToRGB(this.value);
            self.state[options[0]].r = color.r;
            self.state[options[0]].g = color.g;
            self.state[options[0]].b = color.b;
          });
          continue;
        }

        // WIRE UP SELECT - event listener ----------------------------------------------
        if($(tool).children().length > 1) {
          $('select.interface option[value=' + this.getValue(tool.getAttribute('data-interface').split('-')) + ']').attr('selected', 'selected');
          tool.addEventListener('change', function() {
            if(!this.getAttribute('data-interface')) return;
            var options = this.getAttribute('data-interface').split('-');
            self.setValue(options, this.options[this.selectedIndex].value);
          });
          continue;
        }

        // SET VALUES FROM MEMORY TO STANDARD INPUT (all with value parameter) ----------
        if(!tool.getAttribute('data-interface')) continue;
        var input = tool.getAttribute('data-interface').split('-');

        if(input.length > 1) tool.value = this.state[input[0]][input[1]];
        else tool.value = this.state[input[0]];

        // WIRE UP STANDARD INPUT - event listener --------------------------------------
        tool.addEventListener(($.browser.ie) ? 'change' : 'input', function() {
          if(!this.getAttribute('data-interface')) return;
          var options = this.getAttribute('data-interface').split('-');
          self.setValue(options, this.value);
        }, false);
      }
      console.log('".interface" event setup for checkbox, select, color and range type using "data-interface".');

      // DRAG AND DROP IMAGE HANDLING ---------------------------------------------------
      this.tempImage.addEventListener('load', function () {
        self.context.drawImage(self.tempImage, 0, 0);
      }, false);

      document.addEventListener('drop', function (evt) {
        var files = evt.dataTransfer.files;
        if (files.length > 0) {
          var file = files[0];
          if (typeof FileReader !== 'undefined' && file.type.indexOf('image') != -1) {
            var reader = new FileReader();
            // Note: addEventListener doesn't work in Google Chrome for this event ------
            reader.onload = function (evt) {
              self.tempImage.src = evt.target.result;
            };
            reader.readAsDataURL(file);
          }
        }
        evt.preventDefault();
      }, false);

      document.addEventListener('dragover',function(e) {
        e.stopPropagation();
        e.preventDefault();
      });

      document.addEventListener('drop',function(e) {
        e.stopPropagation();
        e.preventDefault();
      });

      // SET THE ACTUAL MODE USING INTERFACE MEMORY SETUP -------------------------------
      this.toggleTools(this.state.drawMode);
      this.toggleTool($('#general-panel .title-row small'));
      this.actions.toggleTextMode('randomLetters');
      console.info('Interface initialized in ' + date.getMilliseconds() + ' milliseconds.');
      console.groupEnd('Interface');
    };

    if(this.checkOption('DOMinterface'))
      this.initialize();
  };

  // REQUEST ANIMATION FRAME ---------------------------------------------------------
  app.newFrame = (function(callback) {
    return window.requestAnimationFrame || window.questAnimationFrame ||
      window.mozRequestAnimationFrame || window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame || function(callback) {
       window.setTimeout(callback, 1000 / 60);
    };
  })();

})(window);


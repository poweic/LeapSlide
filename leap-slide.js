!function ($) {
 /* SLIDE_CONTROLLER PUBLIC CLASS DEFINITION
  * ================================ */
  var LeapSlide = function (element, options) {
    this.$element = $(element);
    this.options = $.extend({}, $.fn.leapSlide.defaults, options);
    this._init();

    // Change the event binding way (in 'slides.js') 	to jQuery style
    document.removeEventListener(this.options.event, handleBodyKeyDown, false);
    $(document).on(this.options.event, handleBodyKeyDown);
  };

  LeapSlide.prototype = {

    constructor: LeapSlide

  , _init: function () {
  		// Listen to Leap Motion
  		var gestureHandler = $.proxy(this.gestureHandler, this);

  		Leap.loop({enableGestures: true}, function(obj) {
  		  obj.gestures.forEach(gestureHandler);
  		});

  		this.arr = [0];
  		this.transitioning = false;
      this.timer = undefined;

      $.support.transition = {end: 'webkitTransitionEnd'};
      this.createArrow();
    }
  , createArrow: function () {
      var $arrow = $("<div class='arrow'>")
        .append("<div class='arrow-triangle'>")
        .append("<div class='arrow-rectangle'>")
        .append("<div class='arrow-trailing'>")
        .append("<div class='arrow-trailing'>");

      $arrow.appendTo("body");
    }
  , navigate: function (direction) {

  		if (this.locked()) return;
      if (this.onBoundary(direction)) return
      if (this.swipeBusted(direction)) return;

      this.resetSwipeBuster(direction);
      this.lock(direction);

      this.$element.trigger($.Event(this.options.event, { keyCode: 38 + direction } ));
	  }
  , locked: function () {
        return this.transitioning;
    }
  , onBoundary: function (direction) {
        return (direction == -1 && curSlide <= 0) || (direction == 1 && curSlide >= slideEls.length - 1)
    }
  , swipeBusted: function (direction) {
        return direction == -this.lastDirection;
    }
  , resetSwipeBuster: function (direction) {
        var $arrow = $('.arrow');
        this.lastDirection = direction;

        clearTimeout(this.timer);
        $arrow.stop(true, true);
        $arrow.show().addClass(direction == 1 ? 'arrow-left' : 'arrow-right').appendTo('.current');
        this.timer = window.setTimeout($.proxy(function () {
            this.lastDirection = null;
        }, this), this.options.timeout);

        $arrow.fadeOut(this.options.timeout, function () {
          $(this).removeClass('arrow-right arrow-left');
        });
    }
  , lock: function (direction) {
        this.transitioning = true;
        
        $('.current').one($.support.transition.end, $.proxy(function () {
            this.transitioning = false;

        }, this));
    }
  , gestureHandler: function (gesture) {
  		if (gesture.type != 'swipe')
  			return;

  		switch (gesture.state) {
  			case 'start': this.arr = [0]; break;
  			case 'update': this.arr.push(gesture.direction[0]); break;
  			case 'stop':
          var dir = sum(this.arr) > 0 ? -1 : 1;
  				this.navigate(this.options.reversed ? -dir : dir);
  				break;
  		}

      function sum (arr) {
        return arr.reduce(function (a, b) {return a+b; });
      }
  	}
  };

 /* SLIDE_CONTROLLER PLUGIN DEFINITION
  * ========================== */

  $.fn.leapSlide = function (option) {
    var args = Array.prototype.slice.call(arguments);
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('leapSlide')
        , options = $.extend({}, $.fn.leapSlide.defaults, $this.data(), typeof option == 'object' && option);
      if (!data) $this.data('leapSlide', (data = new LeapSlide(this, options)));
      if (typeof option == 'string') data[option]();
    });
  };
  $.fn.leapSlide.defaults = {
    timeout: 1500,
    reversed: false,
    event: 'keydown'
  };
  $.fn.leapSlide.Constructor = LeapSlide;

}(window.jQuery);

$(function () {
  $(document).leapSlide();
});
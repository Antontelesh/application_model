(function() {
  var _,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('lodash');

  module.exports = function(key) {
    var invisible, visible;
    visible = _.isEmpty(this.__visible) && _.keys(this) || this.__visible;
    invisible = _.isEmpty(this.__invisible) && [] || this.__invisible;
    return __indexOf.call(visible, key) >= 0 && __indexOf.call(invisible, key) < 0;
  };

}).call(this);

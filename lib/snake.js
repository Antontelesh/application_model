(function() {
  var lowercase, _;

  _ = require('lodash');

  lowercase = require('./lowercase');

  module.exports = function(value) {
    return _.map(value.match(/[A-Z]?[a-z]+/g), function(part) {
      return lowercase(part);
    }).join('_');
  };

}).call(this);

//# sourceMappingURL=snake.js.map

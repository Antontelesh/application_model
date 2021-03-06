(function() {
  var lowercase, _;

  _ = require('lodash');

  lowercase = require('./lowercase');

  module.exports = function(value) {
    var parts;
    parts = _.compact(value.match(/[A-Z0-9]?[a-z0-9]*/g));
    parts = _.map(parts, function(part) {
      return lowercase(part);
    });
    return parts.join('_');
  };

}).call(this);

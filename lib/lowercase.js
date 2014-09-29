(function() {
  var _;

  _ = require('lodash');

  module.exports = function(value) {
    if (_.isString(value)) {
      return value.toLowerCase();
    }
    return value;
  };

}).call(this);

//# sourceMappingURL=lowercase.js.map

!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self),o.ApplicationModel=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
(function() {
  var _;

  _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

  module.exports = function(value) {
    if (_.isString(value)) {
      return value.toLowerCase();
    }
    return value;
  };

}).call(this);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
(function (global){
(function() {
  var ApplicationModel, snake, valueFn, _;

  _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

  snake = require('./snake');

  valueFn = require('./valuefn');

  ApplicationModel = (function() {
    var createGetter, createSetter;

    createGetter = function(prop_name, attributes) {
      return function() {
        return attributes[prop_name];
      };
    };

    createSetter = function(prop_name, fn, attributes) {
      var self;
      self = this;
      return function(value) {
        return attributes[prop_name] = fn.call(self, value);
      };
    };

    function ApplicationModel(params, defaults) {
      var formatters, getters, getters_setters, parsers, setters;
      this.__attributes = {};
      getters = this.__getters = this.getGetters();
      setters = this.__setters = this.getSetters();
      parsers = this.__parsers = this.getParsers();
      formatters = this.__formatters = this.getFormatters();
      getters_setters = _.difference(_.union(_.keys(getters), _.keys(setters)), _.keys(parsers));
      _.each(parsers, function(functionName, prop_name) {
        return Object.defineProperty(this, prop_name, {
          enumerable: true,
          get: createGetter.call(this, prop_name, this.__attributes),
          set: createSetter.call(this, prop_name, this[functionName], this.__attributes)
        });
      }, this);
      _.each(getters_setters, function(prop_name) {
        return Object.defineProperty(this, prop_name, {
          enumerable: true,
          get: this[getters[prop_name]],
          set: this[setters[prop_name]]
        });
      }, this);
      _.assign(this, defaults, params);
    }

    ApplicationModel.prototype.toPlainObject = function() {
      var _resolve;
      _resolve = function(value) {
        if (value instanceof ApplicationModel) {
          return value.toPlainObject();
        }
        if (_.isArray(value)) {
          return _.map(value, _resolve);
        }
        if (value) {
          return JSON.parse(JSON.stringify(value));
        }
        return value;
      };
      return _.reduce(this.getOwnKeys(), function(result, key) {
        result[key] = _resolve(this[key]);
        return result;
      }, {}, this);
    };

    ApplicationModel.prototype.format = function() {
      var _resolve;
      _resolve = function(value) {
        if (value instanceof ApplicationModel) {
          return value.format();
        }
        if (_.isArray(value)) {
          return _.map(value, _resolve);
        }
        if (value) {
          return JSON.parse(JSON.stringify(value));
        }
        return value;
      };
      return _.reduce(this.getOwnKeys(), function(result, key) {
        var formatter;
        formatter = this[this.__formatters[key]] || valueFn;
        result[key] = _resolve(formatter.call(this, this[key]));
        return result;
      }, {}, this);
    };

    ApplicationModel.prototype.getOwnKeys = function() {
      return _.reject(_.keys(this), function(key) {
        return key.indexOf('__') === 0;
      });
    };

    ApplicationModel.prototype.getMutators = function(type) {
      var methods, mutators, pattern;
      methods = _.methods(this);
      pattern = new RegExp(type + '(\\w+)Attribute');
      mutators = _.filter(methods, function(method) {
        return pattern.test(method);
      });
      return _.reduce(mutators, function(result, mutator_name) {
        var prop_name;
        prop_name = snake(mutator_name.match(pattern)[1]);
        result[prop_name] = mutator_name;
        return result;
      }, {});
    };

    ApplicationModel.prototype.getGetters = function() {
      return this.getMutators('get');
    };

    ApplicationModel.prototype.getSetters = function() {
      return this.getMutators('set');
    };

    ApplicationModel.prototype.getParsers = function() {
      return this.getMutators('parse');
    };

    ApplicationModel.prototype.getFormatters = function() {
      return this.getMutators('format');
    };

    return ApplicationModel;

  })();

  module.exports = ApplicationModel;

}).call(this);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./snake":3,"./valuefn":4}],3:[function(require,module,exports){
(function (global){
(function() {
  var lowercase, _;

  _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

  lowercase = require('./lowercase');

  module.exports = function(value) {
    var parts;
    parts = _.compact(value.match(/[A-Z]?[a-z]*/g));
    parts = _.map(parts, function(part) {
      return lowercase(part);
    });
    return parts.join('_');
  };

}).call(this);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./lowercase":1}],4:[function(require,module,exports){
(function() {
  module.exports = function(value) {
    return value;
  };

}).call(this);

},{}]},{},[2])(2)
});
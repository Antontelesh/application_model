!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self),o.ApplicationModel=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
(function() {
  var _,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

  module.exports = function(key) {
    var invisible, visible;
    visible = _.isEmpty(this.__visible) && _.keys(this) || this.__visible;
    invisible = _.isEmpty(this.__invisible) && [] || this.__invisible;
    return __indexOf.call(visible, key) >= 0 && __indexOf.call(invisible, key) < 0;
  };

}).call(this);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
(function (global){
(function() {
  var ApplicationModel, isVisible, snake, valueFn, _;

  _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

  snake = require('./snake');

  valueFn = require('./valuefn');

  isVisible = require('./isVisible');

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
      this.__attributes = this.toPlainObject();
      this.__tmp_params = _.assign({}, defaults, params);
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
      _.assign(this, this.__tmp_params);
      this.__tmp_params = void 0;
    }

    ApplicationModel.prototype.toPlainObject = function() {
      var _resolve;
      _resolve = function(value) {
        if (_.isFunction(value)) {
          return;
        }
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
      return _.reduce(this.getVisibleKeys(), function(result, key) {
        result[key] = _resolve(this[key]);
        return result;
      }, {}, this);
    };

    ApplicationModel.prototype.format = function() {
      return _.reduce(this.getVisibleKeys(), function(result, key) {
        var formatter;
        formatter = this[this.__formatters[key]] || valueFn;
        result[key] = this.formatAttribute(formatter.call(this, this[key]), key);
        return result;
      }, {}, this);
    };

    ApplicationModel.prototype.getVisibleKeys = function() {
      return _.filter(_.keys(this), function(key) {
        return key.indexOf('__') < 0 && isVisible.call(this, key);
      }, this);
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

    ApplicationModel.prototype.parseAttribute = function(name) {
      var parser_name, value, _ref;
      value = ((_ref = this.__tmp_params) != null ? _ref[name] : void 0) || this[name];
      parser_name = this.__parsers[name];
      if (_.isFunction(this[parser_name])) {
        return this[parser_name](value);
      }
      return value;
    };

    ApplicationModel.prototype.formatAttribute = function(value, key) {
      if (_.isFunction(value)) {
        return;
      }
      if (value instanceof ApplicationModel) {
        return value.format();
      }
      if (_.isArray(value)) {
        return _.map(value, (function(_this) {
          return function(value) {
            return _this.formatAttribute(value, key);
          };
        })(this));
      }
      if (value) {
        return JSON.parse(JSON.stringify(value));
      }
      return value;
    };

    return ApplicationModel;

  })();

  module.exports = ApplicationModel;

}).call(this);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./isVisible":1,"./snake":4,"./valuefn":5}],4:[function(require,module,exports){
(function (global){
(function() {
  var lowercase, _;

  _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./lowercase":2}],5:[function(require,module,exports){
(function() {
  module.exports = function(value) {
    return value;
  };

}).call(this);

},{}]},{},[3])(3)
});
(function() {
  var ApplicationModel, snake, valueFn, _;

  _ = require('lodash');

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

    ApplicationModel.prototype.parseAttribute = function(name) {
      var parser_name, value;
      value = this.__tmp_params[name];
      parser_name = this.__parsers[name];
      if (_.isFunction(this[parser_name])) {
        return this[parser_name](value);
      }
      return value;
    };

    return ApplicationModel;

  })();

  module.exports = ApplicationModel;

}).call(this);

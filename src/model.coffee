_ = require('lodash')
snake = require('./snake')
valueFn = require('./valuefn')
isVisible = require('./isVisible')

class ApplicationModel

  createGetter = (prop_name, attributes) ->
    return ->
      return attributes[prop_name]

  createSetter = (prop_name, fn, attributes) ->
    self = this
    return (value) ->
      return attributes[prop_name] = fn.call(self, value)

  constructor: (params, defaults) ->
    @__attributes = {}
    @__tmp_params = _.assign({}, defaults, params)
    getters = @__getters = @getGetters()
    setters = @__setters = @getSetters()
    parsers = @__parsers = @getParsers()
    formatters = @__formatters = @getFormatters()
    getters_setters = _.difference(_.union(_.keys(getters), _.keys(setters)), _.keys(parsers))
    _.each(parsers, (functionName, prop_name) ->
      Object.defineProperty(this, prop_name, {
        enumerable: true
        get: createGetter.call(this, prop_name, @__attributes)
        set: createSetter.call(this, prop_name, this[functionName], @__attributes)
      })
    , this)
    _.each(getters_setters, (prop_name) ->
      Object.defineProperty(this, prop_name, {
        enumerable: true
        get: this[getters[prop_name]]
        set: this[setters[prop_name]]
      })
    , this)
    _.assign(this, @__tmp_params)
    @__tmp_params = undefined

  toPlainObject: ->
    _resolve = (value) ->
      if _.isFunction(value)
        return
      if value instanceof ApplicationModel
        return value.toPlainObject()
      if _.isArray(value)
        return _.map(value, _resolve)
      if value
        return JSON.parse(JSON.stringify(value))
      return value
    return _.reduce(@getVisibleKeys(), (result, key) ->
      result[key] = _resolve(this[key])
      return result
    , {}, this)

  format: ->
    return _.reduce(@getVisibleKeys(), (result, key) ->
      formatter = this[@__formatters[key]] || valueFn
      result[key] = @formatAttribute(formatter.call(this, this[key]), key)
      return result
    , {}, this)

  getVisibleKeys: ->
    return _.filter _.keys(this), (key) ->
      key.indexOf('__') < 0 && isVisible.call(this, key)
    , this

  getMutators: (type) ->
    methods = _.methods(this)
    pattern = new RegExp(type + '(\\w+)Attribute')
    mutators = _.filter methods, (method) -> pattern.test(method)
    return _.reduce(mutators, (result, mutator_name) ->
      prop_name = snake(mutator_name.match(pattern)[1])
      result[prop_name] = mutator_name
      return result
    , {})

  getGetters: ->
    @getMutators('get')

  getSetters: ->
    @getMutators('set')

  getParsers: ->
    @getMutators('parse')

  getFormatters: ->
    @getMutators('format')

  parseAttribute: (name) ->
    value = @__tmp_params?[name] || this[name]
    parser_name = @__parsers[name]
    if _.isFunction(this[parser_name])
      return this[parser_name](value)
    return value

  formatAttribute: (value, key) =>
    if _.isFunction(value)
      return
    if value instanceof ApplicationModel
      return value.format()
    if _.isArray(value)
      return _.map value, (value) => @formatAttribute(value, key)
    if value
      return JSON.parse(JSON.stringify(value))
    return value

module.exports = ApplicationModel

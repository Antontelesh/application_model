_ = require('lodash')
snake = require('./snake')
valueFn = require('./valuefn')

class ApplicationModel

  createGetter = (prop_name, attributes) ->
    return ->
      return attributes[prop_name]

  createSetter = (prop_name, fn, attributes) ->
    self = this
    return (value) ->
      return attributes[prop_name] = fn.call(self, value)

  _resolve = (value, method = 'toPlainObject') ->
    if _.isFunction(value)
      return
    if value instanceof ApplicationModel
      return value[method]()
    if _.isArray(value)
      return _.map value, (item) -> _resolve(item, method)
    if value
      return JSON.parse(JSON.stringify(value))
    return value

  __validators: []

  constructor: (params, defaults) ->
    @__attributes = @toPlainObject()
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
    return _.reduce(@getVisibleKeys(), (result, key) ->
      result[key] = _resolve(this[key])
      return result
    , {}, this)

  format: ->
    return _.reduce(@getVisibleKeys(), (result, key) ->
      formatter = this[@__formatters[key]] || valueFn
      value = formatter.call(this, this[key])
      result[key] = _resolve(value, 'format')
      return result
    , {}, this)

  validateAttribute: (key) ->
    return _.isEmpty(@getAttibuteErrors(key))

  getAttibuteErrors: (key) ->
    value = this[key]
    if value instanceof ApplicationModel
      return value.validate().errors
    if !_.isEmpty(@__validators[key])
      return _.keys _.pick @__validators[key], (validator) -> !validator(value)
    return []

  parseAttribute: (name) ->
    value = @__tmp_params?[name] || this[name]
    parser_name = @__parsers[name]
    if _.isFunction(this[parser_name])
      return this[parser_name](value)
    return value

  attributeIsVisible: (key) ->
    visible = _.isEmpty(@__visible) && _.keys(this) || @__visible
    invisible = _.isEmpty(@__invisible) && [] || @__invisible
    return key.indexOf('__') < 0 &&
           key in visible &&
           key not in invisible

  validate: ->
    errors = _.unique _.flatten _.map(@getVisibleKeys(), this.getAttibuteErrors, this)
    return {
      errors: errors
      result: _.isEmpty(errors)
    }

  getVisibleKeys: ->
    return _.filter(_.keys(this), this.attributeIsVisible, this)

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


module.exports = ApplicationModel

lowercase = (value) ->
  if _.isString(value)
    return value.toLowerCase()
  return value

snake = (value) ->
  _.map(value.match(/[A-Z]?[a-z]+/g), (part) -> lowercase(part)).join('_')

class ApplicationModel
  constructor: (params, defaults) ->
    getters = @getGetters()
    setters = @getSetters()
    getters_setters = _.union(_.keys(getters), _.keys(setters))
    _.each(getters_setters, (prop_name) ->
      Object.defineProperty(this, prop_name, {
        enumerable: true
        get: this[getters[prop_name]]
        set: this[setters[prop_name]]
      })
    , this)
    _.assign(this, defaults, params)

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


class Contractor extends ApplicationModel
  default_contractor =
    business_title: ''
    okpo_inn: ''
    kpgf_entry: 1
    kpgf_title: ''
    name_surname: ''
    name_name: ''
    name_patronymic: ''
    name: ''

  kpgf_titles =
    '1': 'ФОП'
    '-1': ''
    '240': 'ТОВ'

  constructor: (params) ->
    super(params, default_contractor)

  getNameAttribute: ->
    return _.compact([
      @name_surname
      @name_name
      @name_patronymic
    ]).join(' ')

  getBusinessTitleAttribute: ->
    return _.compact([
      @kpgf_title
      @name
    ]).join(' ')

  getKpgfTitleAttribute: ->
    return kpgf_titles[@kpgf_entry]

  setNameAttribute: (name = '') ->
    parts = name.toString().split(' ')
    @name_surname = parts.shift()
    @name_patronymic = parts.pop()
    @name_name = parts.join(' ')


window.contractor =  new Contractor({
  name: 'Телеш Антон Владимирович'
  kpgf_entry: 1
  okpo_inn: '3331515751'
})

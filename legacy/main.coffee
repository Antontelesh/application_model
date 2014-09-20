lowercase = (value) ->
  if _.isString(value)
    return value.toLowerCase()
  return value

snake = (value) ->
  _.map(value.match(/[A-Z]?[a-z]+/g), (part) -> lowercase(part)).join('_')

valueFn = (value) -> return value

class ApplicationModel

  createGetter = (prop_name, attributes) ->
    return ->
      return attributes[prop_name]

  createSetter = (prop_name, fn, attributes) ->
    return (value) ->
      return attributes[prop_name] = fn(value)

  constructor: (params, defaults) ->
    @__attributes = {}
    getters = @__getters = @getGetters()
    setters = @__setters = @getSetters()
    parsers = @__parsers = @getParsers()
    formatters = @__formatters = @getFormatters()
    getters_setters = _.difference(_.union(_.keys(getters), _.keys(setters)), _.keys(parsers))
    _.each(parsers, (functionName, prop_name) ->
      Object.defineProperty(this, prop_name, {
        enumerable: true
        get: createGetter(prop_name, @__attributes)
        set: createSetter(prop_name, this[functionName], @__attributes)
      })
    , this)
    _.each(getters_setters, (prop_name) ->
      Object.defineProperty(this, prop_name, {
        enumerable: true
        get: this[getters[prop_name]]
        set: this[setters[prop_name]]
      })
    , this)
    _.assign(defaults, params)
    _.assign(this, defaults)

  toPlainObject: ->
    _resolve = (value) ->
      if value instanceof ApplicationModel
        return value.toPlainObject()
      if _.isArray(value)
        return _.map(value, _resolve)
      if value
        return JSON.parse(JSON.stringify(value))
      return value
    return _.reduce(@getOwnKeys(), (result, key) ->
      result[key] = _resolve(this[key])
      return result
    , {}, this)

  format: ->
    _resolve = (value) ->
      if value instanceof ApplicationModel
        return value.format()
      if _.isArray(value)
        return _.map(value, _resolve)
      if value
        return JSON.parse(JSON.stringify(value))
      return value
    return _.reduce(@getOwnKeys(), (result, key) ->
      formatter = this[@__formatters[key]] || valueFn
      result[key] = _resolve(formatter.call(this, this[key]))
      return result
    , {}, this)

  getOwnKeys: ->
    return _.reject _.keys(this), (key) -> key.indexOf('__') == 0

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

class Business extends Contractor
  constructor: (params) ->
    super(params)


class Contract extends ApplicationModel
  default_contract =
    number: ''
    date_created: new Date().setHours(0,0,0,0)
    transactional: false
    private: false
  constructor: (params) ->
    super(params, default_contract)

class File extends ApplicationModel
  default_file =
    title: ''
    id: ''
    extension: ''
  constructor: (params) ->
    super(params, default_file)

  formatExtensionAttribute: ->
    return null

class Files
  constructor: (files) ->
    return _.map files, (file) -> new File(file)

class DocumentItem extends ApplicationModel
  default_item =
    title: ''
    unit: ''
    quantity: 1
    price: 0

  constructor: (params) ->
    super(params, default_item)

  getTotalAttribute: ->
    return @quantity * @price

  setTotalAttribute: (total) ->
    @price = total / @quantity

class DocumentItems
  constructor: (items) ->
    return _.map items, (item) -> new DocumentItem(item)

class PowerOfAttorney extends ApplicationModel
  defaults =
    enabled: false
    number: ''

  constructor: (params) ->
    super(params, defaults)

  formatEnabledAttribute: ->
    return null

class Account extends ApplicationModel
  default_account =
    mfo: ''
    number: ''
    mfo_title: ''
    description: ''
  constructor: (params) ->
    super(params, default_account)

class Document extends ApplicationModel
  default_document =
    amount_person: null
    date_created: new Date().setHours(0,0,0,0)
    direction: 'out'
    files: []
    items: []
    print_comment: false
    private: false
    type: 'bills'

  _accumulateAmounts = (sum, item) ->
    return sum + item.total

  constructor: (params) ->
    super(params, default_document)

  # ------------ parsers
  parseDateCreatedAttribute: (value) ->
    if _.isNumber(value)
      return value
    return new Date(value).valueOf()

  parseFilesAttribute: (files) ->
    if _.isEmpty(files) || files[0] instanceof File
      return files
    return new Files(files)

  parseItemsAttribute: (items) ->
    if _.isEmpty(items) || items[0] instanceof DocumentItem
      return items
    return new DocumentItems(items)

  parseBusinessAttribute: (business) ->
    if business instanceof Business
      return business
    return new Business(business)

  parseContractAttribute: (contract) ->
    if !contract || contract instanceof Contract
      return contract
    return new Contract(contract)

  parseContractorAttribute: (contractor) ->
    if !contractor || contractor instanceof Contractor
      return contractor
    return new Contractor(contractor)

  parseParentDocumentAttribute: (parent_document) ->
    if parent_document
      if parent_document instanceof Document
        return parent_document
      return new Document(parent_document)
    return null

  parsePowerOfAttorneyAttribute: (power_of_attorney) ->
    if power_of_attorney
      if power_of_attorney instanceof PowerOfAttorney
        return power_of_attorney
      return new PowerOfAttorney(power_of_attorney)
    return null

  parseAccountAttribute: (account) ->
    if account
      if account instanceof Account
        return account
      return new Account(account)
    return null

  # ------------ getters
  getAmountAttribute: ->
    return _.reduce(@items, _accumulateAmounts, 0)

  getBusinessDataAttribute: ->
    return _.pick(@business, ['_id', 'business_title', 'kpgf_entry', 'kpgf_title', 'okpo_inn'])

  getBusinessIdAttribute: ->
    return @business?._id

  getContractIdAttribute: ->
    return @contract?._id

  getContractorDataAttribute: ->
    return _.pick(@contractor, ['_id', 'business_title', 'kpgf_entry', 'kpgf_title', 'okpo_inn'])

  getContractorIdAttribute: ->
    return @contractor?._id

  getParentDocumentIdAttribute: ->
    if @parent_document
      return @parent_document._id
    return null

  getAccountIdAttribute: ->
    if @account
      return @account._id
    return null


  # ------------ formatters
  formatTitleAttribute: ->
    if @direction == 'out'
      return @title
    return null

  formatAmountPersonAttribute: ->
    if @direction == 'in' && @contractor && @contractor.kpgf_entry < 0
      return @amount_person
    return null

  formatDateCreatedAttribute: ->
    return new Date(@date_created).toISOString()

  formatPowerOfAttorneyAttribute: ->
    if @power_of_attorney?.enabled
      return @power_of_attorney.format()
    return null

  formatPlaceAttribute: ->
    if !@contractor.default
      return @place
    return null

  formatParentDocumentAttribute: ->
    return null

  formatContractAttribute: ->
    return null

console.log window.doc = new Document({
  files: [{extension: 'PDF'}]
  items: [
    {price: 10}
    {quantity: 12, price: 11, total: 100}
    {quantity: 45, total: 15000}
  ]
  business: {
    name: 'Будяков Эльдар Никонорович'
    kpgf_entry: '1'
    okpo_inn: '3331515751'
  }
  contractor: {
    name: 'Кривоухов Егор Павлович'
    kpgf_entry: '-1'
    okpo_inn: ''
  }
})

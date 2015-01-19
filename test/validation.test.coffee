_ = require('lodash')
ApplicationModel = require('../src/model.coffee')

required = (value) -> !_.isUndefined(value) && value?

numericText = (value) ->
  return _.isString(value) && !/\D/g.test(value)

class Model extends ApplicationModel

  __validators: {
    'created_at': {
      'required': required,
      'numeric': _.isNumber
    },
    'id': {
      'numericText': numericText
    }
  }

  constructor: ->
    super

describe 'Testing model validation', ->

  it 'should validate property provided', ->

    model = new Model({
      created_at: '123'
    })

    model.validateAttribute('created_at').should.be.false
    model.created_at = undefined
    model.validateAttribute('created_at').should.be.false
    model.created_at = 123
    model.validateAttribute('created_at').should.be.true

  it 'should validate all properties', ->

    model = new Model({
      created_at: '123',
      id: 'abc'
    })

    console.log model.validate().errors
    model.validate().result.should.be.false
    model.validate().errors.should.have.length(2)
    model.created_at = 123
    model.validate().result.should.be.false
    model.validate().errors.should.have.length(1)
    model.id = 123
    model.validate().result.should.be.false
    model.validate().errors.should.have.length(1)
    model.id = '123'
    model.validate().result.should.be.true
    model.validate().errors.should.have.length(0)

  it 'should validate nested models', ->

    class Parent extends ApplicationModel

      constructor: ->
        super

      parseChildAttribute: (value) ->
        return new Model(value)

    parent = new Parent({
      child: {
        created_at: '123',
        id: '123'
      }
    })

    parent.validate().result.should.be.false
    parent.validate().errors.should.have.length(1)
    parent.child.created_at = 123
    parent.validate().result.should.be.true
    parent.validate().errors.should.have.length(0)





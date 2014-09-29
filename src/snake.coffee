_ = require('lodash')
lowercase = require('./lowercase')

module.exports = (value) ->
  _.map(value.match(/[A-Z]?[a-z]+/g), (part) -> lowercase(part)).join('_')

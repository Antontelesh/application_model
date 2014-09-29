_ = require('lodash')

module.exports = (value) ->
  if _.isString(value)
    return value.toLowerCase()
  return value

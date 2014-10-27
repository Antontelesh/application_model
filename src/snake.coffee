_ = require('lodash')
lowercase = require('./lowercase')

module.exports = (value) ->
  parts = _.compact(value.match(/[A-Z]?[a-z]*/g))
  parts = _.map parts, (part) -> lowercase(part)
  return parts.join('_')

_ = require('lodash')
lowercase = require('./lowercase')

module.exports = (value) ->
  parts = _.compact(value.match(/[A-Z0-9]?[a-z0-9]*/g))
  parts = _.map parts, (part) -> lowercase(part)
  return parts.join('_')

_ = require('lodash')

module.exports = (key) ->
  visible = _.isEmpty(@__visible) && _.keys(this) || @__visible
  invisible = _.isEmpty(@__invisible) && [] || @__invisible
  return key in visible && key not in invisible

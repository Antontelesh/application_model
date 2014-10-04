angular = require('angular')

app = angular.module('ApplicationModel', [])

app.factory 'ApplicationModel', ->
  return require('./model')

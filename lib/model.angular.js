(function() {
  var angular, app;

  angular = require('angular');

  app = angular.module('ApplicationModel', []);

  app.factory('ApplicationModel', function() {
    return require('./model');
  });

}).call(this);

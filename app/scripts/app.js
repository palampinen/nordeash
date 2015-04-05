'use strict';

/**
 * @ngdoc overview
 * @name nordeashApp
 * @description
 * # nordeashApp
 *
 * Main module of the application.
 */
angular
  .module('nordeashApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'tc.chartjs'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/lataa', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/lataa'
      });
  });

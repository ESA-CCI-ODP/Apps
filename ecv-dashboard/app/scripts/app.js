'use strict';

/**
 * @ngdoc overview
 * @name ecvDashboardApp
 * @description
 * # ecvDashboardApp
 *
 * Main module of the application.
 */
angular
  .module('ecvDashboardApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngMaterial',
    'toastr',
    'dcbImgFallback'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/catalogue', {
        templateUrl: 'views/catalogue.html',
        controller: 'CatalogueCtrl',
        controllerAs: 'catalogue'
      })
      .otherwise({
        redirectTo: '/'
      });
  });

'use strict';

/**
 * @ngdoc function
 * @name ecvDashboardApp.controller:CatalogueCtrl
 * @description
 * # CatalogueCtrl
 * Controller of the ecvDashboardApp
 */
angular.module('ecvDashboardApp')
  .controller('CatalogueCtrl', function ($scope, cswService) {
    $scope.submitRequest = function(){
      $scope.responseObject = cswService.getRecords();
    };

  });

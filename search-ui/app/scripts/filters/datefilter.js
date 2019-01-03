'use strict';

/**
 * @ngdoc filter
 * @name searchUiApp.filter:dateFilter
 * @function
 * @description
 * # dateFilter
 * Filter in the searchUiApp.
 */
angular.module('searchUiApp')
  .filter('dateFilter', function () {
    return function (input) {
      return '!' + input;
    };
  });

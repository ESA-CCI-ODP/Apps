'use strict';

/**
 * @ngdoc directive
 * @name searchUiApp.directive:multiselect
 * @description
 * # multiselect
 */
angular.module('searchUiApp')
  .directive('multiselect', function ($timeout) {
    return {
      // Restrict it to be an attribute in this case
      restrict: 'A',
      scope: {
        parameters: '=',
        facets: '='
      },
      // responsible for registering DOM listeners as well as updating the DOM
      link: function (scope, element, attrs) {
        $timeout(function () {
          $(element).multiSelect({
            selectableHeader: "<div class='custom-header'>Available Facets</div>",
            selectionHeader: "<div class='custom-header'>Selected Facets</div>",
            selectableOptgroup: true,
            afterSelect: function (values) {
              var facetValue = JSON.parse(values[0]);
              scope.parameters.push(facetValue);
            },
            afterDeselect: function (values) {
              scope.$apply(function () {
                var facetValue = JSON.parse(values[0]);
                scope.parameters = _.filter(scope.parameters, function(param){
                  return param.uri !== facetValue.uri;
                });
              });

            }
          });
        }, 2000);
      }
    };
  });


'use strict';

/**
 * @ngdoc directive
 * @name searchUiApp.directive:dExpandCollapse
 * @description
 * # dExpandCollapse
 */
angular.module('searchUiApp')
  .directive('dExpandCollapse', function () {
    return {
      restrict: 'EA',
      link: function (scope, element) {
        var button = ($(element).find(".expand-button"));
        $(element).click(function () {

          //var show = "false";

          $(element).find(".fullResult").slideToggle('200', function () {
            // You may toggle + - icon
            //$(element).find("span").toggleClass('faqPlus faqMinus');
          });
        });

      }
    };
  });

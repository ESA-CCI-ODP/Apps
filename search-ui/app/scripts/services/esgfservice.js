'use strict';

/**
 * @ngdoc service
 * @name searchUiApp.esgfService
 * @description
 * # esgfService
 * Service in the searchUiApp.
 */
angular.module('searchUiApp')
  .service('esgfservice', function ($http) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var api = this;

    /**
     * Call the ESGF archive with selected facet values
     * @returns {*}
     */
    api.getRecords = function (offset, pageSize, facetParameters, esgfMapping, searchTerm, fileIdentifier) {

      if (!searchTerm) {
        searchTerm = '*';
      }
      //var reqUrl = 'http://esgf-index1.ceda.ac.uk/esg-search/search/?limit=' + pageSize + '&query=instance_id:' + fileIdentifier;
      var reqUrl = 'https://cci-odp-index.ceda.ac.uk/esg-search/search/?limit=' + pageSize + '&query=instance_id:' + fileIdentifier;


      //'&type=Dataset&replica=false&latest=true&project=esacci';

      var urlEnd = '&format=application%2Fsolr%2Bjson';


      var groupedParameters = (_.groupBy(facetParameters, function (param) {
        return param.id;
      }));

      return $http.get(reqUrl + urlEnd, {});
    };

    api.getFiles = function (reqUrl) {
      return $http.get(reqUrl, {});
    };

    return api;
  });

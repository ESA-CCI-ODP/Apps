'use strict';

/**
 * @ngdoc service
 * @name searchUiApp.cswservice
 * @description
 * # cswservice
 * Service in the searchUiApp.
 */
angular.module('searchUiApp')
  .service('cswservice', function ($q) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var api = this;
    var x2js = new X2JS();

    var cswConfig = [
      [
        OWS_1_0_0,
        DC_1_1,
        DCT,
        XLink_1_0,
        SMIL_2_0,
        SMIL_2_0_Language,
        GML_3_1_1,
        Filter_1_1_0,
        CSW_2_0_2,
        GML_3_2_0,
        ISO19139_GSS_20060504,
        ISO19139_GSR_20060504,
        ISO19139_GTS_20060504,
        ISO19139_GMD_20060504,
        ISO19139_GCO_20060504,
        ISO19139_SRV_20060504
      ],
      {
        namespacePrefixes: {
          "http://www.opengis.net/cat/csw/2.0.2": "csw",
          "http://www.opengis.net/ogc": 'ogc',
          "http://www.opengis.net/gml/3.2": "gml",
          "http://purl.org/dc/elements/1.1/": "dc",
          "http://purl.org/dc/terms/": "dct",
          "http://www.isotc211.org/2005/gmd": "gmd",
          "http://www.isotc211.org/2005/gco": "gco",
          "http://www.fao.org/geonetwork": "geonet"
        },
        mappingStyle: 'simplified'
      }
    ];

    //var csw = new Ows4js.Csw('http://csw1.cems.rl.ac.uk/geonetwork-CEDA/srv/eng/csw-CEDA-CCI', cswConfig);
    //var csw = new Ows4js.Csw('https://csw.ceda.ac.uk/geonetwork/srv/eng/csw-CEDA-CCI', cswConfig);
    //var csw = new Ows4js.Csw('https://csw-test.ceda.ac.uk/geonetwork/srv/eng/csw-CEDA-CCI', cswConfig);
    var csw = new Ows4js.Csw('https://csw-cci.ceda.ac.uk/geonetwork/srv/eng/csw-CEDA-CCI', cswConfig);

    Ows4js.Filter.JsonixContext = new Jsonix.Context(
      [
        OWS_1_0_0,
        DC_1_1,
        DCT,
        XLink_1_0,
        SMIL_2_0,
        SMIL_2_0_Language,
        GML_3_1_1,
        Filter_1_1_0,
        CSW_2_0_2,
        GML_3_2_0,
        ISO19139_GSS_20060504,
        ISO19139_GSR_20060504,
        ISO19139_GTS_20060504,
        ISO19139_GMD_20060504,
        ISO19139_GCO_20060504,
        ISO19139_SRV_20060504
      ],
      {
        namespacePrefixes: {
          "http://www.opengis.net/cat/csw/2.0.2": "csw",
          "http://www.opengis.net/ogc": 'ogc',
          "http://www.opengis.net/ows": 'ows',
          "http://www.opengis.net/gml/3.2": "gml",
          "http://purl.org/dc/elements/1.1/": "dc",
          "http://purl.org/dc/terms/": "dct",
          "http://www.isotc211.org/2005/gmd": "gmd",
          "http://www.isotc211.org/2005/gco": "gco",
          "http://www.fao.org/geonetwork": "geonet"
        },
        mappingStyle: 'simplified'
      });

    api.getRecords = function (term, facetParameters, displayResults) {
      if (!term) {
        term = '*';
      }
      var filter = new Ows4js.Filter().PropertyName(['AnyText']).isEqualTo('%' + term + '%');

      var groupedParameters = (_.groupBy(facetParameters, function (param){
        return param.label;
      } ));

      for (var param in groupedParameters) {
        var orFacetFilter = undefined;
        if (groupedParameters.hasOwnProperty(param)) {
          var paramArray = groupedParameters[param];
          _.each(paramArray, function(parameter){
            if (_.isUndefined(orFacetFilter)) {
              orFacetFilter = new Ows4js.Filter().PropertyName(['keywordUri']).isEqualTo(parameter.uri);
            } else {
              orFacetFilter = orFacetFilter.or(new Ows4js.Filter().PropertyName(['keywordUri']).isEqualTo(parameter.uri));
            }
          });
        }
        if (!_.isUndefined(orFacetFilter)) {
          filter.cgiAnd(orFacetFilter);
        }
      }
      
      var maxRecords = 1;
      
      if(displayResults) {
          maxRecords = 1000;
      }
      
      return getRecordsJSON(1, maxRecords, filter, 'http://www.isotc211.org/2005/gmd');
    };


    /**
     * TODO: use the Ows4js GetRecords function, and resolve unmarshalling issue
     *
     * Get the records in JSON, this can be removed once the unmarshallying issue is resolved using cws.getRecords instead.
     *
     * */

    function getRecordsJSON(startPosition, maxRecords, filter, outputSchema) {
      var query;
      if (filter === undefined || filter === null) {
        query = new Ows4js.Csw.Query('full');
      } else {
        // Create Query
        query = new Ows4js.Csw.Query('full', new Ows4js.Csw.Constraint(filter));
      }
      // Create de GetRecords Action.
      var recordAction = new Ows4js.Csw.GetRecords(startPosition, maxRecords, query, outputSchema);

      recordAction['csw:GetRecords'].resultType = 'results_with_summary';
      
      // XML to Post.
      var myXML = Ows4js.Csw.marshalDocument(recordAction);
      
      // Post XML
      return httpPostOverride(csw.url, "application/xml", myXML, csw.credentials).then(function (responseXML) {
        var jsonObject = x2js.xml2json(responseXML);
        jsonObject.request = (new XMLSerializer()).serializeToString(myXML);
        //console.log(jsonObject);
        return jsonObject;
      });
    }


    /**
     * The ows4js library uses native 'Promise' which doesn't work in IE,
     * Override the httpPost function with our own using $q
     * @param url
     * @param lang
     * @param request
     * @param credentials
     */
    var httpPostOverride = function (url, lang, request, credentials) {
      var deferred = $q.defer();
      var httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
          deferred.resolve(httpRequest.responseXML);
        }
      };
      httpRequest.open('POST', url, true);
      httpRequest.setRequestHeader('Accept-Language', lang);
      if (credentials !== undefined && credentials.user !== undefined && credentials.pass !== undefined) {
        httpRequest.setRequestHeader("Authorization", "Basic " + btoa(credentials.user + ":" + credentials.pass));
      }
      httpRequest.send(request);

      return deferred.promise;
    };

    /**
     * Override AND and OR logical operations for owa as they don't work
     */

      // Logical Operators

    Ows4js.Filter.prototype.cgiAnd = function (filter) {
      if (typeof this['ogc:Filter'].logicOps === 'undefined') {
        //console.debug('The first And');
        this['ogc:Filter'].logicOps = {
          'ogc:And': {
            TYPE_NAME: "Filter_1_1_0.BinaryLogicOpType",
            //comparisonOpsOrSpatialOpsOrLogicOps: []
          }
        };
        /**
         *   TODO We need to check if the filter/operator is a
         *   GeometryOperands, SpatialOperators(spatialOps), ComparisonOperators
         *   (comparisonOps), ArithmeticOperators or is a composition of them
         *   "comparisonOpsOrSpatialOpsOrLogicOps" at the moment only supports
         *   Filter.isLike().and(Filter.isLike()) or SpatialOps (ex: BBOX);
         */
        if (typeof this['ogc:Filter'].comparisonOps !== 'undefined') {
          // Only has one previous filter and it is a comparison operator.
          // Now is ops before was comparisonOpsOrSpatialOpsOrLogicOps
          this['ogc:Filter'].logicOps['ogc:And'].ops = [this['ogc:Filter'].comparisonOps].concat(Ows4js.Filter.getPreviousOperator(filter));
          delete this['ogc:Filter'].comparisonOps;
        } else if (typeof this['ogc:Filter'].spatialOps !== 'undefined') {
          // Only has one previous filter and it is a spatial operator.
          this['ogc:Filter'].logicOps['ogc:And'].ops = [this['ogc:Filter'].spatialOps].concat(Ows4js.Filter.getPreviousOperator(filter));
          delete this['ogc:Filter'].spatialOps;
        } else {
          throw 'Not Implemented yet, another operators';
        }
      } else {
        // It has two or more previous operators. CGI FIX
        if (!_.isUndefined(this['ogc:Filter'].logicOps['ogc:And'])) {
          this['ogc:Filter'].logicOps['ogc:And'].ops = this['ogc:Filter'].logicOps['ogc:And'].ops.concat(Ows4js.Filter.getPreviousOperator(filter));
        } else {
          this['ogc:Filter'].logicOps['ogc:Or'].ops = this['ogc:Filter'].logicOps['ogc:Or'].ops.concat(Ows4js.Filter.getPreviousOperator(filter));
        }

      }
      return this;
    };//*/

    Ows4js.Filter.prototype.cgiOr = function (filter) {
      if (typeof this['ogc:Filter'].logicOps === 'undefined') {
        //console.debug('The first Or');
        this['ogc:Filter'].logicOps = {
          'ogc:Or': {
            TYPE_NAME: "Filter_1_1_0.BinaryLogicOpType",
            //comparisonOpsOrSpatialOpsOrLogicOps: []
          }
        };
        /**
         *   TODO We need to check if the filter/operator is a
         *   GeometryOperands, SpatialOperators(spatialOps), ComparisonOperators
         *   (comparisonOps), ArithmeticOperators or is a composition of them
         *   "comparisonOpsOrSpatialOpsOrLogicOps" at the moment only supports
         *   Filter.isLike().and(Filter.isLike()) or SpatialOps (ex: BBOX);
         */
        if (typeof this['ogc:Filter'].comparisonOps !== 'undefined') {
          // Only has one previous filter and it is a comparison operator.
          this['ogc:Filter'].logicOps['ogc:Or'].ops = [this['ogc:Filter'].comparisonOps].concat(Ows4js.Filter.getPreviousOperator(filter));
          delete this['ogc:Filter'].comparisonOps;
        } else if (typeof this['ogc:Filter'].spatialOps !== 'undefined') {
          // Only has one previous filter and it is a spatial operator.
          this['ogc:Filter'].logicOps['ogc:Or'].ops = [this['ogc:Filter'].spatialOps].concat(Ows4js.Filter.getPreviousOperator(filter));
          delete this['ogc:Filter'].spatialOps;
        } else {
          throw 'Not Implemented yet, another operators';
        }
      } else {
        // It has two or more previous operators. CGI FIX
        if (!_.isUndefined(this['ogc:Filter'].logicOps['ogc:Or'])) {
          this['ogc:Filter'].logicOps['ogc:Or'].ops = this['ogc:Filter'].logicOps['ogc:Or'].ops.concat(Ows4js.Filter.getPreviousOperator(filter));
        } else {
          this['ogc:Filter'].logicOps['ogc:And'].ops = this['ogc:Filter'].logicOps['ogc:And'].ops.concat(Ows4js.Filter.getPreviousOperator(filter));
        }
      }
      return this;
    };

    return api;
  });

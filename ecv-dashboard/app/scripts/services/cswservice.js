'use strict';

/**
 * @ngdoc service
 * @name ecvDashboardApp.cswService
 * @description
 * # cswService
 * Service in the ecvDashboardApp.
 */
angular.module('ecvDashboardApp')
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

    api.getRecords = function (term) {
      var filter = new Ows4js.Filter().PropertyName(['AnyText']).isEqualTo('%' + term + '%');
      return getRecordsJSON(1, 300, filter, 'http://www.isotc211.org/2005/gmd');
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
      // XML to Post.
      var myXML = Ows4js.Csw.marshalDocument(recordAction);
      console.log(myXML);
      // Post XML
      return httpPostOverride(csw.url, "application/xml", myXML, csw.credentials).then(function (responseXML) {
        console.log(responseXML);
        var jsonObject = x2js.xml2json(responseXML);
        jsonObject.request = (new XMLSerializer()).serializeToString(myXML);

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

    return api;
  })
;

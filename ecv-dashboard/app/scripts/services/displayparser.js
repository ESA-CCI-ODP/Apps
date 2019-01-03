'use strict';

/**
 * @ngdoc service
 * @name ecvDashboardApp.displayParser
 * @description
 * # displayParser
 * Service in the ecvDashboardApp.
 */
angular.module('ecvDashboardApp')
  .service('displayParser', function () {
// AngularJS will instantiate a singleton by calling "new" on this function
    var api = this;

    /*
     displayObject{
     startDate:beginPosition
     endDate:endPosition
     result.date.__text :
     title: .identificationInfo.MD_DataIdentification.citation.CI_Citation.title.CharacterString.__text
     abstract: result.identificationInfo.MD_DataIdentification.abstract.CharacterString.__text
     statement: result.dataQualityInfo.DQ_DataQuality.lineage.LI_Lineage.statement.CharacterString.__text
     internalId
     esgfId
     datasetHomepage
     sampleImage
     productUserGuide
     }

     */

    function DisplayObject() {
      this.startDate = "";
      this.endDate = "";
      this.title = "";
      this.abstract = "";
      this.statement = "";
      this.internalId = "";
      this.esgfId = "";
      this.datasetHomepage = "";
      this.ftpDownload = "";
      this.sampleImage = false;
      this.productUserGuide = "";
      this.bbox = {
        upperCorner: '',
        lowerCorner: ''
      };

      return this;
    }


    /**
     * Takes the CSW JSON data and extracts the necessary fields
     * @param cswResults
     * @returns {Array}
     */
    api.parseCWSresultToDisplay = function (cswResults) {
      //check if results are an array, if one is returned the archive just gives an object
      if (Object.prototype.toString.call(cswResults) === '[object Object]') {
        //make an array;
        cswResults = [cswResults];
      }

      var displayArray = [];

      _.each(cswResults, function (res) {

        var disObject = new DisplayObject();

        disObject.title = res.identificationInfo.MD_DataIdentification.citation.CI_Citation.title.CharacterString.__text;
        disObject.abstract = res.identificationInfo.MD_DataIdentification.abstract.CharacterString.__text;
        disObject.statement = res.dataQualityInfo.DQ_DataQuality.lineage.LI_Lineage.statement.CharacterString.__text;
        disObject.datasetHomepage = uriFilter(res, 'Dataset Homepage');
        disObject.sampleImage = uriFilter(res, 'Sample Image');
        disObject.ftpDownload = replaceWithFTP(uriFilter(res, 'DOWNLOAD'));
        disObject.productUserGuide = uriFilter(res, 'Product User Guide');
        disObject.startDate = extractTemporalExtent(res, 'beginPosition');
        disObject.endDate = extractTemporalExtent(res, 'endPosition');

        disObject.internalId = getIdentifier(res);
        disObject.esgfId = getESGFIdentifier(res);

        displayArray.push(disObject);
      });
      return displayArray;
    };

    function replaceWithFTP(url) {
      //return url.replace('http://browse.ceda.ac.uk/browse', "ftp://anon-ftp.ceda.ac.uk");
      return url.replace('http://data.ceda.ac.uk', "ftp://anon-ftp.ceda.ac.uk");
    }

    /**
     * Get the value within the URI array for a given '_name'
     * @param name
     * @returns {Function}
     */
    function uriFilter(result, _name) {
      if (!_.isUndefined(result.distributionInfo)) {

        var items = result.distributionInfo.MD_Distribution.transferOptions;
        var foundObject = _.filter(items, function (item) {
            if(!_.isUndefined(item.MD_DigitalTransferOptions)) {
                return item.MD_DigitalTransferOptions.onLine.CI_OnlineResource.name.CharacterString.__text === _name;
            }
        });
        if (_.isUndefined(foundObject) || _.isEmpty(foundObject)) {
          return "Value not found";
        } else {
          return foundObject[0].MD_DigitalTransferOptions.onLine.CI_OnlineResource.linkage.URL.__text;
        }
      }
    }

    /**
     * Get the temporal extent from result object
     * @param result
     * @param position
     * @returns {*}
     */
    function extractTemporalExtent(result, position) {
      if (!_.isUndefined(result.distributionInfo)) {
        var extent = result.identificationInfo.MD_DataIdentification.extent;
        if (!_.isUndefined(extent[1])) {
            if(!_.isUndefined(extent[1].EX_Extent.temporalElement.EX_TemporalExtent.extent.TimePeriod[position])) {
                return (extent[1].EX_Extent.temporalElement.EX_TemporalExtent.extent.TimePeriod[position].__text);
            }
            
          //return (extent[1].EX_Extent.temporalElement.EX_TemporalExtent.extent.TimePeriod[position].__text);
        }
      }
    };


    /**
     * gets if the 'Alternative identifier' is available for a result
     * @param result
     */
    /*function getESGFIdentifier(result) {
      var available = false;
      if (!_.isUndefined(result.identificationInfo)) {
        var idents = result.identificationInfo.MD_DataIdentification.citation.CI_Citation.identifier;
        //check if idents is an array and therefore has more than the default identifier
        if (Object.prototype.toString.call(idents) === '[object Array]') {
          //id is position 1 in the array TODO perform a better check
          return idents[1].RS_Identifier.code.CharacterString.__text;
        }
      }

      return undefined;
    }*/
    
    function getESGFIdentifier(result) {
      var esgfIdArray = [];
      if(!_.isUndefined(result.identificationInfo)) {
        var idents = result.identificationInfo.MD_DataIdentification.citation.CI_Citation.identifier;
        //check if idents is an array and therefore has more than the default identifier
        if(Object.prototype.toString.call(idents) === '[object Array]') {
            for(var i = 1; i < idents.length; i++) {
                esgfIdArray.push(idents[i].RS_Identifier.code.CharacterString.__text);
            }
          
          return esgfIdArray;
        }
      }

      return undefined;
    }

    function getIdentifier(result) {
      if (!_.isUndefined(result.identificationInfo)) {
        var id = result.identificationInfo.MD_DataIdentification.citation.CI_Citation.identifier;
        //check if idents is an array and therefore has more than the default identifier
        if (Object.prototype.toString.call(id) === '[object Array]') {
          id = id[0];
        }
        return id.RS_Identifier.code.CharacterString.__text;
      }
    }


    return api;
  });

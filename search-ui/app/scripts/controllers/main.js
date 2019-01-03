'use strict';

/**
 * @ngdoc function
 * @name searchUiApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the searchUiApp
 */
angular.module('searchUiApp')
    .controller('MainCtrl', function($scope, $timeout, $http, cswservice, esgfservice, displayParser) {
        $scope.bboxURL = "http://maps.google.com/maps/api/staticmap?center=0.000,0.000&zoom=0&path=color:red|weight:4|85.000,-179.000|85.000,-59.000|85.000,59.000|85.000,179.000|-85.000,179.000|-85.000,59.000|-85.000,-59.000|-85.000,-179.000|85.000,-179.000&size=300x256&sensor=true";

        $scope.availableSearchParams = [];

        $scope.search = {};
        $scope.search.status = "";
        $scope.search.params = {};
        $scope.facets = [];
        $scope.facetParameters = [];

        $scope.advancedSearchOpen = false;

        //ESGF search values
        $scope.search.pageSize = 25;
        /**
         * read json file and add to facet array
         */
      
        $scope.catSelected = false;
        $scope.facetSelected = false;
        $scope.facetAdded = false;

        //var stripCollectionURL = 'http://vm62.nubes.stfc.ac.uk/collection/cci/';
        //var stripCollectionURL = 'http://vocab-test.ceda.ac.uk/collection/cci/';
        var stripCollectionURL = 'http://vocab.ceda.ac.uk/collection/cci/';
        //var stripSchemeURL = 'http://vocab-test.ceda.ac.uk/scheme/cci/';
        var stripSchemeURL = 'http://vocab.ceda.ac.uk/scheme/cci/';
        var stripURL = 'http://vm62.nubes.stfc.ac.uk/cci#';
        var vocabData;

        $scope.showLoading = true;

        function importJSONfile(fileUrl) {
            return $http.get(fileUrl);
        }
        
        /*
         * extract the facet parameters for a given collection
         * @param collection
        */
        function extractFromCollection(collection) {
            var id = collection['@id'];
            var name = id.replace(stripCollectionURL, "");
            var definition = collection['http://purl.org/dc/elements/1.1/description'][0]['@value'];
            var parameter = {id: id, name: name, definition: definition};
            parameter.suggestedValues = [];
            //set initial value for selectionbox
            /*if(parameter.name === 'http://vocab-test.ceda.ac.uk/collection/cci/ecv') {
                $scope.search.selectedFacetName = parameter.name;
            }*/
            $scope.search.selectedFacetName = '';

            var prefLabel = collection['http://www.w3.org/2004/02/skos/core#prefLabel'];
            if(!_.isUndefined(prefLabel) && !_.isUndefined(prefLabel[0])) {
                parameter.prefLabel = prefLabel[0]['@value'];
            }
            _.each(collection['http://www.w3.org/2004/02/skos/core#member'], function(member) {
                var text = member['@id'].replace(stripURL, "");
                var suggestionValue = {uri: text, facetValueUri: parameter.uri, facetValueLabel: parameter.prefLabel};
                //get additional info for each member
                extractFacetValues(member, suggestionValue);
                parameter.suggestedValues.push(suggestionValue);
            });
            //sort values alphabetically
            parameter.suggestedValues = _.sortBy(parameter.suggestedValues, function(value) {
                return value.prefLabel;
            });

            //set the initial value of facet options
            /*if(parameter.name === 'http://vocab-test.ceda.ac.uk/collection/cci/ecv') {
                $scope.search.selectedFacet = parameter;
                console.log(parameter);
            }*/
            $scope.facets.push(parameter);
        }
        
        function addNercSensorVocab(sensors) {
            _.each($scope.facets, function(facet) {
                if(facet.id === 'http://vocab.ceda.ac.uk/collection/cci/sensor') {
                    _.each(sensors, function(sensor) {
                        var sensorUri = sensor.Concept['_rdf:about'];
                        _.each(facet.suggestedValues, function(suggestedValue) {
                            if(suggestedValue.uri === sensorUri) {
                                suggestedValue.prefLabel = sensor.Concept.prefLabel.__text;
                                suggestedValue.definition = sensor.Concept.definition.__text;
                            }
                        });
                    });

                    facet.suggestedValues = _.sortBy(facet.suggestedValues, function(value) {
                        return value.prefLabel;
                    });
                }
            });
        }

        function extractFacetValues(member, suggestionValue) {
            var item = _.findWhere(vocabData, {'@id': member['@id']});
            var label = item['http://www.w3.org/2004/02/skos/core#prefLabel'];
            if(!_.isUndefined(label) && !_.isUndefined(label[0])) {
                suggestionValue.prefLabel = label[0]['@value'];
            }
            var definition = item['http://www.w3.org/2004/02/skos/core#definition'];
            if(!_.isUndefined(definition) && !_.isUndefined(definition[0])) {
                suggestionValue.definition = definition[0]['@value'];
            }
        }

        /**
         * Import the facets
         */
        //importJSONfile('http://vocab-test.ceda.ac.uk/ontology/cci/cci-content/cci-ontology.json').success(function(data) {
        importJSONfile('http://vocab.ceda.ac.uk/ontology/cci/cci-content/cci-ontology.json').success(function(data) {
            vocabData = data;
            //extract the collections from vocab data
            var collections = _.filter(vocabData, function(data) {
                if(!_.isUndefined(data['@type'][0])) {
                  return data['@type'][0] === 'http://www.w3.org/2004/02/skos/core#Collection';
                }
            });
            _.each(collections, function(col) {
                extractFromCollection(col);
            });

            /*
            $scope.search.performSearch(false);

            //order facets alphabetically
            $scope.facets = _.sortBy($scope.facets, function(value) {
                return value.prefLabel;
            });
            */
        }).then(function() {
            // Get new vocab for sensors from NERC
            var x2js = new X2JS();
            var nercSensorVocab;

            var httpRequest = new XMLHttpRequest();
            httpRequest.open("GET", "https://cors-anywhere.herokuapp.com/http://vocab.nerc.ac.uk/collection/L22/current/", true);
            httpRequest.setRequestHeader('Accept-Language', "application/xml");
            httpRequest.onreadystatechange = function () {
              if (httpRequest.readyState === 4 && httpRequest.status === 200)
                {
                    nercSensorVocab = x2js.xml2json(httpRequest.responseXML).RDF.Collection.member;
                    addNercSensorVocab(nercSensorVocab);

                    $scope.search.performSearch(false);

                    //order facets alphabetically
                    $scope.facets = _.sortBy($scope.facets, function(value) {
                    return value.prefLabel;
                });
                }
            };
            
            httpRequest.send(null);
        });

        function displayResultCounts(result) {
            var cswFacetCategories = result.GetRecordsResponse.Summary.dimension;
            var facetCategories = _.filter(cswFacetCategories, function(category) {
                return _.some($scope.facets, {id: category._name.replace(stripSchemeURL, stripCollectionURL)});
            });
            
            _.each($scope.facets, function(facet) {
                facet.count = 0;
                
                _.each(facet.suggestedValues, function(suggestedValue) {
                    suggestedValue.count = 0;
                    
                    _.each(facetCategories, function(facetCategory) {
                        if(!_.isUndefined(facetCategory.category)) {
                            if(!(facetCategory.category instanceof Array)) {
                                facetCategory.category = [facetCategory.category];
                            }
                        
                            _.each(facetCategory.category, function(category) {
                                if(suggestedValue.uri === category._value) {
                                    suggestedValue.count = category._count;
                                }
                            });
                        }
                    });

                    var count = parseInt(suggestedValue.count);

                    if(count) {
                        facet.count += count;
                    }
                });
            });
        }

        /**
         * Import the esgf facet mapping
         */
        //importJSONfile('http://vocab-test.ceda.ac.uk/ontology/cci/cci-content/esgf_mapping.json').success(function(data) {
        importJSONfile('http://vocab.ceda.ac.uk/ontology/cci/cci-content/esgf_mapping.json').success(function(data) {
            $scope.esgfMapping = data;
        });

        /**
         * Call the CSW catalogue
         */
        $scope.search.performSearch = function(displayResults) {
            $('.overlay').height($('.container')[0].scrollHeight);
            $scope.showLoading = true;
            //fetch records from csw            
            cswservice.getRecords($scope.search.term, $scope.facetParameters, displayResults).then(function(result) {
                displayResultCounts(result);
                
                if(displayResults) {
                    //convert returned results scheme to the format we will use
                    $scope.search.results = displayParser.parseCWSresultToDisplay(result.GetRecordsResponse.SearchResults.MD_Metadata);

                    _.each($scope.search.results, function(result) {
                        if(!_.isUndefined(result.esgfId)) {
                            $timeout(function() {
                                result.esgfExpanded = true;
                                $scope.toggleExpansionBox(result.internalId + '-esgf');
                                $scope.search.onExpandCSWResult(result);
                            });
                        }
                    });
                }
                else {
                    $scope.search.results = null;
                }
                
                $timeout(function() {
                    $scope.showLoading = false;
                });
            });

            //close the advanced search window if open
            if($scope.advancedSearchOpen) {
                $scope.toggleExpansionBox('advancedSearch');
                $scope.advancedSearchOpen = false;
            }
        };

        $scope.search.onExpandCSWResult = function(result) {
            if(_.isUndefined(result.esgfResults)) {
                $scope.search.populateESGFResults(result);
            }
        };

        /*
         * Get the esgft search RESULTS for a CSW record
         * @param result
         */
        $scope.search.populateESGFResults = function(result) {
            //fetch records from esgf
            /*esgfservice.getRecords($scope.search.start, $scope.search.pageSize, $scope.facetParameters, $scope.esgfMapping, $scope.search.term, result.esgfId)
                .success(function(results) {
                    result.esgfResults = results;
                    _.each(result.esgfResults, function(result) {
                        result.metadataExpanded = false;
                        result.filesExpanded = false;
                        result.number_of_files = results.number_of_files;
                    });
                })
                .error(function(err) {
                    console.log(err);
                });*/
          
            var tempResults = [];
            for(var i = 0; i < result.esgfId.length; i++) {
                esgfservice.getRecords($scope.search.start, $scope.search.pageSize, $scope.facetParameters, $scope.esgfMapping, $scope.search.term, result.esgfId[i])
                    .success(function(results) {
                        result.esgfResults = results;
                        tempResults = tempResults.concat(results.response.docs);
                        result.esgfResults.response.docs = tempResults;

                        _.each(result.esgfResults.response.docs, function(result) {
                            //result.metadataExpanded = false;
                            result.filesExpanded = false;
                            //result.number_of_files = results.number_of_files;
                            
                            _.each(result.url, function(_url) {
                                if(_url.includes('|WMS')) {
                                    result.wmsUrl = _url;
                                }
                                else if(_url.includes('|WCS')) {
                                    result.wcsUrl = _url;
                                }
                                else if(_url.includes('|OPENDAP')) {
                                    result.opendapUrl = _url;
                                }
                            });
                        });
                    })
                    .error(function(err) {
                        console.log(err);
                    });
            }
        };


        /*
         * Get next set of EGFF FILES for a given result
         * @param esgfResult
         */
        $scope.search.nextESGF = function(esgfResult) {
            esgfResult.startPosition += $scope.search.pageSize;
            $scope.fetchFilesForResult(esgfResult, esgfResult.startPosition, false);
        };


        /*
         * Get previous set of EGF FILES for a given result
         * @param esgfResult
         */
        $scope.search.previousESGF = function(esgfResult) {
            esgfResult.startPosition -= $scope.search.pageSize;
            $scope.fetchFilesForResult(esgfResult, esgfResult.startPosition, false);
        };
      
        var facetSelect = document.getElementById("selectFacet");
        var facetSelect2 = document.getElementById("selectFacet2");

        $scope.facetChanged = function(isReset) {
            if(isReset) {
                facetSelect.value = "";
            }

            $('#facetPlaceholder').prop('selected', true);

            if(facetSelect.value === "") {
                $(facetSelect).addClass('select-placeholder');
                $(facetSelect2).addClass('select-placeholder');
                $('#facetCatPlaceholder').prop('selected', true);

                $timeout(function() {
                    $scope.$apply(function() {
                        $scope.search.selectedFacetName = "";
                        $scope.search.selectedFacetValue = "";
                        $scope.catSelected = false;
                        
                        $scope.search.performSearch(false);
                    });
                });
            }
            else {
                $(facetSelect).removeClass('select-placeholder');
                $(facetSelect2).removeClass('select-placeholder');

                $scope.catSelected = true;
                $scope.search.selectedFacet = _.findWhere($scope.facets, {name: $scope.search.selectedFacetName});
                $scope.search.selectedFacetValue = "";
            }
        };
      
        $scope.facet2Changed = function() {
            if(facetSelect2.value === "") {
                //$scope.facetSelected = false;
            }
            else {
                //$scope.facetSelected = true;
                $scope.addFacet();
            }
        };
      
        $scope.getForNextResults = function(result) {
            if(!_.isUndefined(result.docFiles)) {
                if(result.number_of_files < result.startPosition + $scope.search.pageSize) {
                    return result.number_of_files;
                } else {
                    return result.startPosition + $scope.search.pageSize;
                }
            }
        };


        /*
         * Get the product user guide, theres no consistent key (usually '_name') therefore
         * the position in array has to be used.
         * @param uriArray
         * @returns {*}
         */
        $scope.getProductUserGuide = function(uriArray) {
            //user guide is the 5 element in array
            //TODO if the _name is consistent then this is not required.
            if(uriArray.length >= 6) {
                var foundObject = uriArray[5];
                if(_.isUndefined(foundObject)) {
                    return "Value not found";
                } else {
                    return foundObject.__text;
                }
            }
        };


        /*
         * Concatenate the keyword subjects into a string
         * @param subjectArray
         */
        $scope.getConcatSubjects = function(subjectArray) {
            var returnString = "";
            _.forEach(subjectArray, function(subject) {
                returnString += subject.__text + "; ";
            });
                
            return returnString;
        };


        /*
         * only show the bounding box if information is available
         * @param result
         */
        $scope.showBoundingBox = function(result) {
            if(!_.isUndefined(result.BoundingBox)) {
                if(result.BoundingBox.LowerCorner.__text === "180.0 -90.0") {
                    return true;
                }
            }
            
            return true;
        };

        $scope.generateMapForBBox = function(result) {
            if(!_.isUndefined(result.bbox.northBoundLatitude)) {
                var nlat = parseFloat(result.bbox.northBoundLatitude.Decimal.__text) - 5;
                var slat = parseFloat(result.bbox.southBoundLatitude.Decimal.__text) + 5;
                var wlong = parseFloat(result.bbox.westBoundLongitude.Decimal.__text) + 1;
                var elong = parseFloat(result.bbox.eastBoundLongitude.Decimal.__text) - 1;

                var path = 'path=color:red|weight:4|' + nlat + ',' + wlong + '|' + nlat + ',-59.000|' + nlat + ',59.000|' + nlat + ',' + elong + '|' + slat + ',' + elong + '|' + slat + ',59.000|' + slat + ',-59.000|' + slat + ',' + wlong + '|' + nlat + ',' + wlong + '&';
                //TODO need to fix the path drawing, temp hack for now checking for iceSheets results.
                if(result.title.indexOf("Ice Sheet") >= 0) {
                    path = 'path=color:red|weight:4|' + nlat + ',' + elong + '|' + nlat + ',' + wlong + '|' + slat + ',' + wlong + '|' + slat + ',' + elong + '|' + nlat + ',' + elong + '&';
                }

                return "http://maps.google.com/maps/api/staticmap?center=0.000,0.000&zoom=0&" + path + "size=300x256&sensor=true";
            }
            
            return '#';
        };

        $scope.toggleExpansionBox = function(id) {
            var documentResult = document.getElementById(id);
            $(documentResult).slideToggle('200', function() {
                // You may toggle + - icon
                //$(element).find("span").toggleClass('faqPlus faqMinus');
            });
        };

        $scope.fetchFilesForResult = function(esgfResult, startPosition, fromUI) {
            if(_.isUndefined(esgfResult.docFiles) || !fromUI) {
                if(_.isUndefined(esgfResult.startPosition)) {
                  esgfResult.startPosition = 0;
                }
                //var filesUrl = 'https://esgf-index1.ceda.ac.uk/search_files/' + esgfResult.id + '/esgf-index1.ceda.ac.uk/';
                //var reqUrl = 'http://esgf-index1.ceda.ac.uk/esg-search/search/?limit=' + pageSize + '&query=instance_id:' + fileIdentifier;
                //var filesUrl = 'http://esgf-index1.ceda.ac.uk/esg-search/search/?dataset_id=' + esgfResult.instance_id + '|esgf-data1.ceda.ac.uk&type=File&offset=' + esgfResult.startPosition + ' &limit=' + $scope.search.pageSize;
                var urlEnd = '&format=application%2Fsolr%2Bjson';
                var filesUrl = 'https://cci-odp-index.ceda.ac.uk/esg-search/search/?dataset_id=' + esgfResult.instance_id + '|cci-odp-data.ceda.ac.uk&type=File&offset=' + esgfResult.startPosition + ' &limit=' + $scope.search.pageSize;

                esgfservice.getFiles(filesUrl + urlEnd)
                    .success(function(data) {
                        esgfResult.docFiles = data.response.docs;
                
                        _.each(esgfResult.docFiles, function(docFile) {
                            _.each(docFile.url, function(_url) {
                                if(_url.includes('|OPENDAP')) {
                                    docFile.opendapUrl = _url;
                                }
                                else if(_url.includes('|HTTPServer')) {
                                    docFile.fileUrl = _url;
                                }
                            });
                        });
                    }).error(function(err) {
                        console.log(err);
                    });
            }
        };

        $scope.search.createThreddsURL = function(links) {
            /*
            if(_.isEmpty(links)) {
              return '#';
            }
            
            return links[0].split('.xml')[0] + '.html';
            */
           
            var threddsURL = '#';
            
            _.each(links, function(link) {
                if(link.includes('|THREDDS')) {
                    threddsURL = link.split('.xml')[0] + '.html';
                }
            });
            
            return threddsURL;
        };
        
        $scope.search.createOpendapURL = function(url) {
            if(!_.isUndefined(url)) {
                return url.split('|')[0] + '.html';
            }

            return '#';
        };

        $scope.search.createPeepURL = function(url) {
            if(!_.isUndefined(url)) {
                //return 'http://192.171.139.42/sites/default/searchui/PEEP/peep.html?server=' + $scope.search.stripPipeURL(url);
                return 'http://cci.esa.int/sites/default/searchui/PEEP/peep.html?server=' + $scope.search.stripPipeURL(url);
            }
            
            return '#';
        };

        $scope.search.stripPipeURL = function(url) {
            if(!_.isUndefined(url)) {
                return url.split('|')[0];
            }
            
            return '#';
        };

        $scope.search.createWgetURL = function(id) {
            var ids = id.split(",");
            //var index_node = 'esgf-index1.ceda.ac.uk';
            var index_node = 'cci-odp-index.ceda.ac.uk';
            var url = "https://" + index_node + "/esg-search/wget/";
            url += "?distrib=false";

            // add dataset ids
            for(var i = 0; i < ids.length; i++) {
                url += "&dataset_id=" + encodeURIComponent(ids[i]);
            }
            
            return url;
        };
      
        $scope.openPeepURL = function(url) {
            var peepURL = $scope.search.createPeepURL(url);

            window.open(peepURL, "popup", "menubar=1, resizable=1, width=1400, height=750, scrollbars=1");
            return false;
        };

        /*
         * adding facets
         */
        $scope.addFacet = function() {
            var facetValue = JSON.parse($scope.search.selectedFacetValue);
            $scope.facetParameters.push({
                id: $scope.search.selectedFacet.id,
                label: $scope.search.selectedFacet.prefLabel,
                valueLabel: facetValue.prefLabel,
                uri: facetValue.uri,
                joinType: $scope.selectedJoin
            });

            $scope.facetAdded = true;
            
            $scope.search.performSearch(false);
        };

        $scope.removeFacet = function(parameter) {
            $scope.facetParameters = _.without($scope.facetParameters, parameter);

            if($scope.facetParameters.length === 0) {
                $scope.facetAdded = false;
            }
            
            $scope.search.performSearch(false);
        };
      
        $scope.clearFacets = function() {
            $scope.facetParameters.length = 0;
            $scope.facetAdded = false;
            $scope.facetChanged(true);
        };

        $scope.nextDisabled = function(result) {
            return result.number_of_files < (result.startPosition + $scope.search.pageSize);
        };
        $scope.previousDisabled = function(result) {
            return result.startPosition === 0;
        };
    })
    .directive('bsTooltip', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.hover(function() {
                    element.tooltip('show');
                }, function() {
                    element.tooltip('hide');
                });
            }
        };
    });

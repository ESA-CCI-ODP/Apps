'use strict';

/**
 * @ngdoc function
 * @name ecvDashboardApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ecvDashboardApp
 */
angular.module('ecvDashboardApp')
  .controller('MainCtrl', function ($scope, $timeout, $http, cswservice, esgfservice, displayParser) {
    //Variables
    $scope.showLoading = true;
    var projectData, containerWidth;
    $scope.status = 'Fetching records...';
    
    //ESGF search values
    $scope.esgf = {};
    $scope.esgf.pageSize = 25;
    
    // read ecv json file
    $http.get('../resources/data.json').success(function (data) {
      // toastr.success('Search Started!', 'Requesting records from CSW');
      projectData = data.projects;
      $scope.selectedProject = projectData[0];

      //call the catalogue for the latest data
      cswservice.getRecords("*").then(function (result) {
        $scope.results = displayParser.parseCWSresultToDisplay(result.GetRecordsResponse.SearchResults.MD_Metadata);
        // toastr.success('Search Completed', 'Found ' + $scope.results.Record.length + ' records');
        $scope.showLoading = false;

        //check if results are available from archive, else use data from file
        if ($scope.results.length !== 0) {
          assignRecordsToProjects();
        } else {
          drawChart();
        }
      });


    });

    /**
     * Loop through all CSW records and assign them to their project (projectData oject)
     */
    function assignRecordsToProjects() {
      //TODO Dataset 'title' text is used to determine the publisher
      //TODO should be replaced with a more elegant/robust way such as using the faceted search which is currently not supported
      _.each(projectData, function (project) {
          var records = _.filter($scope.results, function (record) {
            var title = $scope.trimDatasetTitle(record.title, 0);

            return (title.search(new RegExp(project.titleName, "i")) > -1);
            //return (record.title.search(new RegExp(project.titleName, "i")) !== -1); //check if the project name is contained in the title text
          });

          records.sort(function(a, b) {return a.title.localeCompare(b.title);});

          var displayRecords = [];
          //override the dummy data
          if (records.length !== 0) {
            //update the keys to the format used by D3 timeline
            _.each(records, function (record, i) {
                if (!_.isUndefined(record.startDate)) {
                  var addRecord = true;
                  var startDate = new Date(record.startDate);
                  var endDate = new Date(record.endDate);

                  if (isNaN(startDate.getTime())) {
                    addRecord = false;
                  }
                  if (isNaN(endDate.getTime())) {
                    addRecord = false;
                  }
                  record.times = [{'starting_time': startDate.getTime(), 'ending_time': endDate.getTime()}];
                  //record.label = "#" + (i + 1);

                  if (addRecord) {
                    displayRecords.push(record);
                  }else{
                    console.log(record); //ouput record retrieved but not assigned to project
                  }
                }else{
                  console.log(record);
                }
              }
            );
            project.datasets = _.remove(displayRecords, function (rec) {
              return !_.isUndefined(rec.times);
            });

            if(project.titleName === "Aerosol") {
                _.each(project.datasets, function(dataset) {
                    dataset.aerosolIndex = {};
                    
                    if(dataset.title.indexOf("Level 2") > -1) {
                        dataset.aerosolIndex.level = 1;
                    }
                    else {
                        dataset.aerosolIndex.level = 2;
                    }
                    
                    if(dataset.title.indexOf("AATSR") > -1) {
                        dataset.aerosolIndex.type = 1;
                        dataset.aerosolIndex.name = 1;
                        
                        var trimTitle = $scope.trimDatasetTitle(dataset.title, 1);
                        dataset.aerosolIndex.algo = trimTitle.substring(trimTitle.indexOf("(") + 1);
                    }
                    else if(dataset.title.indexOf("ATSR2") > -1) {
                        dataset.aerosolIndex.type = 1;
                        dataset.aerosolIndex.name = 2;
                        
                        var trimTitle = $scope.trimDatasetTitle(dataset.title, 1);
                        dataset.aerosolIndex.algo = trimTitle.substring(trimTitle.indexOf("(") + 1);
                    }
                    else if(dataset.title.indexOf("MERIS") > -1) {
                        dataset.aerosolIndex.type = 2;
                    }
                    else if(dataset.abstract.indexOf("Absorbing Aerosol Index") > -1) {
                        dataset.aerosolIndex.type = 3;
                    }
                    //else if(dataset.title.indexOf("GOMOS") > -1 || dataset.title.indexOf("Multi-Sensor UVAI") > -1) {
                    else {
                        dataset.aerosolIndex.type = 4;
                    }
                });

                project.datasets.sort(
                    firstBy(function(a) {return a.aerosolIndex.level;})
                    .thenBy(function(a) {return a.aerosolIndex.type;})
                    .thenBy(function(a) {return a.aerosolIndex.algo;})
                    .thenBy(function(a) {return a.aerosolIndex.name;})
                );
            }

            //set the bar's total start and end date
            var endTimeObject = _.max(records, function (record) {
              if(!_.isUndefined(record.times)){
                return record.times[0].ending_time;
              }

            });
            var startTimeObject = _.min(records, function (record) {
              if(!_.isUndefined(record.times)){
                return record.times[0].starting_time;
              }
            });
            
            /*project.times = [{
              'starting_time': startTimeObject.times[0].starting_time,
              'ending_time': endTimeObject.times[0].ending_time
            }];*/
        
            project.times = [{}];
        
            if(!_.isUndefined(startTimeObject) && !_.isEmpty(startTimeObject)) {
                project.times[0].starting_time = startTimeObject.times[0].starting_time;
            }
            
            if(!_.isUndefined(endTimeObject) && !_.isEmpty(endTimeObject)) {
                project.times[0].ending_time = endTimeObject.times[0].ending_time;
            }
          }
        }
      )
      ;

      //filter projects with no available datasets
      projectData = _.filter(projectData, function (project) {
          return(!_.isUndefined(project.times) && 
                 !_.isUndefined(project.times[0].starting_time) && 
                 !_.isUndefined(project.times[0].ending_time));
          
        //return !_.isUndefined(project.times);
      });

      drawChart();
    }

    /**
     * Draw the ecv dashboard timeline chart
     */
    function drawChart() {
      //get the width and height for the svg container
      containerWidth = d3.select("#d3-container").node().getBoundingClientRect().width;

      var chart = d3.timeline()
        .stack() // toggles graph stacking
        .tickFormat({
          format: d3.time.format("%Y"),
          tickTime: d3.time.year,
          tickInterval: 10,
          tickSize: 6
        })
        .margin({left: 140, right: 30, top: 12, bottom: 0})
        .itemHeight(25);

      //var mainSvgHeight = (projectData.length * 35) + 35;
      var mainSvgHeight = (projectData.length * 35) + 55;
      
      var svg = d3.select("#d3-container").append("svg").attr("height", mainSvgHeight).attr("width", containerWidth).style("padding", "10px")
        .datum(projectData).call(chart);

      //set the project name label

      svg.selectAll("rect")
        .style('opacity', 0)
        .transition()
        .duration(function (d, i) {
          return 300 * i;
        })
        .style('opacity', 1)
        .style("fill", "")
        .attr("class", function (d, i) {
          var rectClass = projectData[i].project.replace(/\s+/g, "-").toLowerCase();
          return rectClass;
        });
      svg.selectAll("rect").on("click", function (d, i) {
          openProjectModal(projectData[i]);
        })
        .append("svg:title")
        .text(function (d, i) {
          var options = {year: "numeric", month: "short"};
          var startDate = new Date(projectData[i].times[0].starting_time);
          var endDate = new Date(projectData[i].times[0].ending_time);
          return startDate.toDateString("en-us", options) + " - " + endDate.toDateString("en-us", options);
        });


      svg.selectAll("text.timeline-label")
        .on("click", function (d, i) {
          openProjectModal(projectData[i]);
        })
        .text(function (d, i) {
          return d[i].project;
        })
        .attr('x', 35);

      svg.selectAll("image.timeline-label")
        .on("click", function (d, i) {
          openProjectModal(projectData[i]);
        })
        .attr('width', 35);

      var runResize;
      d3.select(window).on('resize', function () {
        clearTimeout(runResize);
        runResize = setTimeout(resize, 200);
      });

      function openProjectModal(project) {
        d3.event.stopPropagation();
        $scope.selectedProject = project;
        $scope.selectedDataset = null;
        $('#project-modal').modal('show');
        $scope.$apply();
        //add a slight delay so the modal is open before drawing the graph
        $timeout(function () {
          drawProjectTimeline();
        }, 200);
      }

      function resize() {
        //console.log(d3.select("#project-d3-container").html);
        //TODO Resizing the svg would be more efficient than destroying and redrawing the whole graph
        d3.select("#d3-container").html("");
        drawChart();
        //redraw project timeline if modal is open
        if ($('#project-modal').hasClass('in')) {
          d3.select("#project-d3-container").html("");
          drawProjectTimeline();
        }
      }
    }

    $scope.setSelectedDataset = function (dataset) {
        
      console.log('here set');
      console.log(dataset);
      console.log($scope.lastSelectedRect);
        
        
      if ($scope.lastSelectedRect) {
        $scope.lastSelectedRect.attr("class", function () {
          var rectClass = $scope.selectedProject.project.replace(/\s+/g, "-").toLowerCase();
          return rectClass;
        });
      }
      $scope.selectedDataset = dataset;
    };

    /**
     * Draw the dataset timeline for the selected project
     */
    function drawProjectTimeline() {
      //clear previous graph
      d3.select("#project-d3-container").html("");
      var modalWidth = d3.select("#project-d3-container").node().getBoundingClientRect().width;

      //get the width and height for the svg container
      //set the height based on number of datasets
      var svgheight = ($scope.selectedProject.datasets.length * 25) + 55;
      //   console.log($scope.selectedProject.datasets);

      //add index to each dataset
      _.each($scope.selectedProject.datasets, function (dataset, $index) {
        dataset.index = $index;
      });


      var min_startDate = _.min($scope.selectedProject.datasets, function(dataset){
        return new Date(dataset.startDate).getTime();
      });

      var max_endDate = _.max($scope.selectedProject.datasets, function(dataset){
        return new Date(dataset.endDate).getTime();
      });

      //getting time difference in years
      var diff = new Date(min_startDate.startDate).getTime() - new Date(max_endDate.endDate).getTime();
      var yearDate = new Date(diff); // miliseconds from epoch
      var years = Math.abs(yearDate.getUTCFullYear() - 1970);

      var intervalInYears = 5;
      if(years < 1){
        intervalInYears = 0;
      } else if(years < 5){
        intervalInYears = 1;
      } else if(years < 10){
        intervalInYears = 2;
      } else if(years < 15){
        intervalInYears = 3;
      } else if(years < 20){
        intervalInYears = 5;
      } else if(years < 50){
        intervalInYears = 10;
      } else {
        intervalInYears = 20;
      }

      var projectTimeline = d3.timeline()
        .stack() // toggles graph stacking
        .tickFormat({
          format: d3.time.format("%Y"),
          tickTime: d3.time.year,
          tickInterval: intervalInYears,
          tickSize: 6
        })
        .margin({left: 10, right: 10, top: 12, bottom: 0});

      var projectSvg = d3.select("#project-d3-container").append("svg").attr("width", modalWidth).attr("height", svgheight)
        .datum($scope.selectedProject.datasets).call(projectTimeline);

      projectSvg.selectAll("text.timeline-label")
        .append("svg:title")
        .text(function (d, i) {
          return d[i].title;
        });

      projectSvg.selectAll("rect")
        .on("click", function (d, i) {
          d3.select(this).attr("class", 'selected-rect');
          if ($scope.lastSelectedRect) {
            $scope.lastSelectedRect.attr("class", function () {
              var rectClass = $scope.selectedProject.project.replace(/\s+/g, "-").toLowerCase();
              return rectClass;
            });
          }
          $scope.lastSelectedRect = d3.select(this);
          $scope.selectedDataset = $scope.selectedProject.datasets[i];
          $scope.$apply();
        })
        .style('opacity', 0)
        .transition()
        .duration(650)
        .style('opacity', 1)
        .attr("class", function () {
          var rectClass = $scope.selectedProject.project.replace(/\s+/g, "-").toLowerCase();
          return rectClass;
        });


      projectSvg.selectAll("rect")
        .append("svg:title")
        .text(function (d, i) {
          return $scope.selectedProject.datasets[i].title;
        });

      /*
       projectSvg.selectAll("rect")
       .on("mouseover", function (d) {
       //Get this bar's x/y values, then augment for the tooltip
       var xPosition = parseFloat(d3.select(this).attr("x"));
       var yPosition = parseFloat(d3.select(this).attr("y"));
       //Update the tooltip position and value
       d3.select("#tooltip")
       .style("left", xPosition + "px")
       .style("top", yPosition + "px")
       .select("#value")
       .text(d);
       //Show the tooltip
       d3.select("#tooltip").classed("hidden", false);
       });
       */
    }

    $scope.trimDatasetTitle = function(title, index) {
        if(!_.isUndefined(title)) {
            if(title.indexOf(':') > -1) {
                title = title.split(':')[index];
            }
        }
        
        return title;
    };
    
    $scope.toggleExpansionBox = function(id, selectedDataset) {
        /*var documentResult = document.getElementById(id);
        $(documentResult).slideToggle('0', function() {
            if(scrollToId && !_.isUndefined(selectedDataset.esgfResults) && selectedDataset.esgfExpanded) {
                $('#project-modal').animate({
                    scrollTop: $("#" + scrollToId).offset().top - $("#modal-dialog").offset().top + parseInt($("#modal-dialog").css("margin-top"))
                }, 800);
            }
        });*/
        
        if(selectedDataset && selectedDataset.esgfExpanded) {
            $('#project-modal').animate({
                scrollTop: $("#esgf-results-container").offset().top - $("#modal-dialog").offset().top + parseInt($("#modal-dialog").css("margin-top"))
            }, 800);
        }
    };
    
    $scope.esgf.onExpandCSWResult = function(selectedDataset) {
        if(_.isUndefined(selectedDataset.esgfResults)) {
            $scope.esgf.populateESGFResults(selectedDataset);
        }
    };
    
    $scope.esgf.populateESGFResults = function(selectedDataset) {
        var tempResults = [];

        for(var i = 0; i < selectedDataset.esgfId.length; i++) {
            esgfservice.getRecords($scope.esgf.start, $scope.esgf.pageSize, selectedDataset.esgfId[i])
                .success(function(results) {
                    selectedDataset.esgfResults = results;
                    tempResults = tempResults.concat(results.response.docs);
                    selectedDataset.esgfResults.response.docs = tempResults;
                    
                    _.each(selectedDataset.esgfResults.response.docs, function(result) {
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
    
    $scope.esgf.nextESGF = function(esgfResult) {
        esgfResult.startPosition += $scope.esgf.pageSize;
        $scope.fetchFilesForResult(esgfResult, esgfResult.startPosition, false);
    };

    $scope.esgf.previousESGF = function(esgfResult) {
        esgfResult.startPosition -= $scope.esgf.pageSize;
        $scope.fetchFilesForResult(esgfResult, esgfResult.startPosition, false);
    };
    
    $scope.getForNextResults = function(selectedDataset) {
        if(!_.isUndefined(selectedDataset.docFiles)) {
            if(selectedDataset.number_of_files < selectedDataset.startPosition + $scope.esgf.pageSize) {
                return selectedDataset.number_of_files;
            } else {
                return selectedDataset.startPosition + $scope.esgf.pageSize;
            }
        }
    };
    
    $scope.fetchFilesForResult = function(esgfResult, startPosition, fromUI) {
        if(_.isUndefined(esgfResult.docFiles) || !fromUI) {
            if(_.isUndefined(esgfResult.startPosition)) {
              esgfResult.startPosition = 0;
            }
            //var filesUrl = 'https://esgf-index1.ceda.ac.uk/search_files/' + esgfResult.id + '/esgf-index1.ceda.ac.uk/';
            //var reqUrl = 'http://esgf-index1.ceda.ac.uk/esg-search/search/?limit=' + pageSize + '&query=instance_id:' + fileIdentifier;
            //var filesUrl = 'http://esgf-index1.ceda.ac.uk/esg-search/search/?dataset_id=' + esgfResult.instance_id + '|esgf-data1.ceda.ac.uk&type=File&offset=' + esgfResult.startPosition + ' &limit=' + $scope.esgf.pageSize;
            var urlEnd = '&format=application%2Fsolr%2Bjson';
            var filesUrl = 'https://cci-odp-index.ceda.ac.uk/esg-search/search/?dataset_id=' + esgfResult.instance_id + '|cci-odp-data.ceda.ac.uk&type=File&offset=' + esgfResult.startPosition + ' &limit=' + $scope.esgf.pageSize;

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
    
    $scope.esgf.createThreddsURL = function(links) {
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
    
    $scope.esgf.createOpendapURL = function(url) {
        if(!_.isUndefined(url)) {
            return url.split('|')[0] + '.html';
        }

        return '#';
    };

    $scope.esgf.createPeepURL = function(url) {
        if(!_.isUndefined(url)) {
            return 'http://cci.esa.int/sites/default/searchui/PEEP/peep.html?server=' + $scope.esgf.stripPipeURL(url);
        }

        return '#';
    };
    
    $scope.esgf.stripPipeURL = function(url) {
        if(!_.isUndefined(url)) {
            return url.split('|')[0];
        }

        return '#';
    };
    
    $scope.esgf.createWgetURL = function(id) {
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
        var peepURL = $scope.esgf.createPeepURL(url);

        window.open(peepURL, "popup", "menubar=1, resizable=1, width=1400, height=750, scrollbars=1");
        return false;
    };
    
    $scope.nextDisabled = function(result) {
        return result.number_of_files < (result.startPosition + $scope.esgf.pageSize);
    };
    $scope.previousDisabled = function(result) {
        return result.startPosition === 0;
    };
    
    function importJSONfile(fileUrl) {
        return $http.get(fileUrl);
    }
  }).directive('bsTooltip', function() {
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

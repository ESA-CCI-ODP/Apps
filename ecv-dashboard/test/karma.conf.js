// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-12-17 using
// generator-karma 1.0.0

module.exports = function(config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    // as well as any additional frameworks (requirejs/chai/sinon/...)
    frameworks: [
      "jasmine"
    ],

    // list of files / patterns to load in the browser
    files: [
      // bower:js
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/bootstrap/dist/js/bootstrap.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-touch/angular-touch.js',
      'bower_components/d3/d3.js',
      'bower_components/jsonix/dist/Jsonix-all.js',
      'bower_components/ogc-schemas/scripts/lib/ARML_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/CSW_2_0_2.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_Appearance_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_Building_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_CityFuntiture_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_CityObjectGroup_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_Generics_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_LandUse_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_Relief_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_TexturedSurface_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_Transportation_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_Vegetation_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_Waterbody_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_Appearance_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_Bridge_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_Building_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_CityFuntiture_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_CityObjectGroup_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_Generics_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_LandUse_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_Relief_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_TexturedSurface_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_Transportation_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_Tunnel_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_Vegetation_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/CityGML_Waterbody_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/DC_1_1.js',
      'bower_components/ogc-schemas/scripts/lib/DCT.js',
      'bower_components/ogc-schemas/scripts/lib/Filter_1_0_0.js',
      'bower_components/ogc-schemas/scripts/lib/Filter_1_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/Filter_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/GML_2_1_2.js',
      'bower_components/ogc-schemas/scripts/lib/GML_3_1_1.js',
      'bower_components/ogc-schemas/scripts/lib/GML_3_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/GML_3_2_1.js',
      'bower_components/ogc-schemas/scripts/lib/GML4WCS_1_0_0.js',
      'bower_components/ogc-schemas/scripts/lib/GMLCOV_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/SMIL_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/SMIL_2_0_Language.js',
      'bower_components/ogc-schemas/scripts/lib/IC_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/IC_2_1.js',
      'bower_components/ogc-schemas/scripts/lib/IndoorGML_Core_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/IndoorGML_Navigation_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/ISO19139_GCO_20070417.js',
      'bower_components/ogc-schemas/scripts/lib/ISO19139_GMD_20070417.js',
      'bower_components/ogc-schemas/scripts/lib/ISO19139_GMX_20070417.js',
      'bower_components/ogc-schemas/scripts/lib/ISO19139_GSR_20070417.js',
      'bower_components/ogc-schemas/scripts/lib/ISO19139_GSS_20070417.js',
      'bower_components/ogc-schemas/scripts/lib/ISO19139_GTS_20070417.js',
      'bower_components/ogc-schemas/scripts/lib/ISO19139_GCO_20060504.js',
      'bower_components/ogc-schemas/scripts/lib/ISO19139_GMD_20060504.js',
      'bower_components/ogc-schemas/scripts/lib/ISO19139_GMX_20060504.js',
      'bower_components/ogc-schemas/scripts/lib/ISO19139_GSR_20060504.js',
      'bower_components/ogc-schemas/scripts/lib/ISO19139_GSS_20060504.js',
      'bower_components/ogc-schemas/scripts/lib/ISO19139_GTS_20060504.js',
      'bower_components/ogc-schemas/scripts/lib/ISO19139_SRV_20060504.js',
      'bower_components/ogc-schemas/scripts/lib/ISO19139_2_GMI_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/KML_2_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/Atom_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/xAL_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/OM_1_0_0.js',
      'bower_components/ogc-schemas/scripts/lib/OM_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/OWC_0_3_1.js',
      'bower_components/ogc-schemas/scripts/lib/OWS_1_0_0.js',
      'bower_components/ogc-schemas/scripts/lib/OWS_1_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/OWS_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/Sampling_1_0_0.js',
      'bower_components/ogc-schemas/scripts/lib/Sampling_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/SamplingSpatial_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/SE_1_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/SensorML_1_0_1.js',
      'bower_components/ogc-schemas/scripts/lib/SensorML_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/SLD_1_0_0.js',
      'bower_components/ogc-schemas/scripts/lib/SLD_1_0_0_GeoServer.js',
      'bower_components/ogc-schemas/scripts/lib/SLD_1_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/SPS_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/SOS_1_0_0.js',
      'bower_components/ogc-schemas/scripts/lib/SOS_1_0_0_Filter.js',
      'bower_components/ogc-schemas/scripts/lib/SOS_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/SWE_1_0_1.js',
      'bower_components/ogc-schemas/scripts/lib/SWE_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/SWES_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/WSN_T_1.js',
      'bower_components/ogc-schemas/scripts/lib/WAMI_1_0_0.js',
      'bower_components/ogc-schemas/scripts/lib/WAMI_1_0_1.js',
      'bower_components/ogc-schemas/scripts/lib/WAMI_Common_1_0_1.js',
      'bower_components/ogc-schemas/scripts/lib/WAMI_1_0_2.js',
      'bower_components/ogc-schemas/scripts/lib/WAMI_Common_1_0_0.js',
      'bower_components/ogc-schemas/scripts/lib/WaterML_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/WCS_1_0_0.js',
      'bower_components/ogc-schemas/scripts/lib/WCS_1_1.js',
      'bower_components/ogc-schemas/scripts/lib/WCS_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/WFS_1_0_0.js',
      'bower_components/ogc-schemas/scripts/lib/WFS_1_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/WFS_2_0.js',
      'bower_components/ogc-schemas/scripts/lib/WMC_1_0_0.js',
      'bower_components/ogc-schemas/scripts/lib/WMC_1_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/WMS_1_0_0.js',
      'bower_components/ogc-schemas/scripts/lib/WMS_1_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/WMS_1_1_1.js',
      'bower_components/ogc-schemas/scripts/lib/WMS_1_3_0.js',
      'bower_components/ogc-schemas/scripts/lib/WMS_1_3_0_Exceptions.js',
      'bower_components/ogc-schemas/scripts/lib/WMSC_1_1_1.js',
      'bower_components/ogc-schemas/scripts/lib/WMTS_1_0.js',
      'bower_components/ogc-schemas/scripts/lib/WPS_1_0_0.js',
      'bower_components/ogc-schemas/scripts/lib/WPS_2_0.js',
      'bower_components/w3c-schemas/scripts/lib/Atom_1_0.js',
      'bower_components/w3c-schemas/scripts/lib/WS_Addr_1_0_Core.js',
      'bower_components/w3c-schemas/scripts/lib/XHTML_1_0_Strict.js',
      'bower_components/w3c-schemas/scripts/lib/XLink_1_0.js',
      'bower_components/w3c-schemas/scripts/lib/XSD_1_0.js',
      'bower_components/ows.js/dist/ows.min.js',
      'bower_components/lodash/lodash.js',
      'bower_components/angular-toastr/dist/angular-toastr.tpls.js',
      'bower_components/requirejs/require.js',
      'bower_components/angular-mocks/angular-mocks.js',
      // endbower
      "test/mock/**/*.js",
      "test/spec/**/*.js"
    ],

    // list of files / patterns to exclude
    exclude: [
    ],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      "PhantomJS"
    ],

    // Which plugins to enable
    plugins: [
      "karma-phantomjs-launcher",
      "karma-jasmine"
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};

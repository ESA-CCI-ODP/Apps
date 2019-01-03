'use strict';

describe('Filter: uriFilter', function () {

  // load the filter's module
  beforeEach(module('searchUiApp'));

  // initialize a new instance of the filter before each test
  var uriFilter;
  beforeEach(inject(function ($filter) {
    uriFilter = $filter('uriFilter');
  }));

  it('should return the input prefixed with "uriFilter filter:"', function () {
    var text = 'angularjs';
    expect(uriFilter(text)).toBe('uriFilter filter: ' + text);
  });

});

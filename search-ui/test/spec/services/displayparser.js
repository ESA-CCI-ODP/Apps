'use strict';

describe('Service: displayParser', function () {

  // load the service's module
  beforeEach(module('searchUiApp'));

  // instantiate service
  var displayParser;
  beforeEach(inject(function (_displayParser_) {
    displayParser = _displayParser_;
  }));

  it('should do something', function () {
    expect(!!displayParser).toBe(true);
  });

});

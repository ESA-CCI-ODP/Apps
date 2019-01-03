'use strict';

describe('Service: cswservice', function () {

  // load the service's module
  beforeEach(module('searchUiApp'));

  // instantiate service
  var cswservice;
  beforeEach(inject(function (_cswservice_) {
    cswservice = _cswservice_;
  }));

  it('should do something', function () {
    expect(!!cswservice).toBe(true);
  });

});

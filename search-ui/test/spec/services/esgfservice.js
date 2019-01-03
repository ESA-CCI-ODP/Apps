'use strict';

describe('Service: esgfService', function () {

  // load the service's module
  beforeEach(module('searchUiApp'));

  // instantiate service
  var esgfService;
  beforeEach(inject(function (_esgfService_) {
    esgfService = _esgfService_;
  }));

  it('should do something', function () {
    expect(!!esgfService).toBe(true);
  });

});

'use strict';

describe('Directive: dExpandCollapse', function () {

  // load the directive's module
  beforeEach(module('searchUiApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<d-expand-collapse></d-expand-collapse>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the dExpandCollapse directive');
  }));
});

'use strict';

describe('Directive: multiselect', function () {

  // load the directive's module
  beforeEach(module('searchUiApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<multiselect></multiselect>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the multiselect directive');
  }));
});

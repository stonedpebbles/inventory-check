///<reference path="../../../../typings/tsd-testing.d.ts"/>
namespace domainManagement {
  declare let punycode: any;

  describe('DomainManagementAddCtrl', () => {

    var Config, DomainManagmentAddCtrl;
    beforeEach(angular.mock.module('Core'));
    beforeEach(inject(function ($injector, $controller, $translate, _Config_) {
      Config = _Config_;
      DomainManagmentAddCtrl = $controller('DomainManageAddCtrl', {
        $stateParams: {loggedOnUser: ''},
        $previousState: null,
        DomainManagementService: {domainList: []},
        $translate: $translate
      });
    }));

    it('should have access to punycode.', () => {
      expect(punycode).not.toBeNull('punycode is undefined');
    });

    it('should encode IDN (top level and domain)', () => {
      let unEncoded = 'løv.no';
      let encoded = 'xn--lv-lka.no';
      DomainManagmentAddCtrl.domain = unEncoded;
      expect(DomainManagmentAddCtrl.encodedDomain).toBe(encoded);
    });
    it('should encode IDN (top level and domain)', () => {
      let unEncoded = 'Домены.бел';
      let encoded = 'xn--d1acufc5f.xn--90ais';
      DomainManagmentAddCtrl.domain = unEncoded;
      expect(DomainManagmentAddCtrl.encodedDomain).toBe(encoded);
    });

    it('should ignore UpperCase Domain names and treath them as valid', () => {
      let unEncoded = 'Test.com';
      let encoded = 'test.com';
      DomainManagmentAddCtrl.domain = unEncoded;
      expect(DomainManagmentAddCtrl.encodedDomain).toBe(encoded);
      expect(DomainManagmentAddCtrl.isValid).toBeTruthy();
      expect(DomainManagmentAddCtrl.intDomain).not.toBeNull();
      expect(DomainManagmentAddCtrl.intDomain.show).toBeFalsy('punycode should be qual to lowercase version of domain. e.g. no extra encoding');

    });


  });
}

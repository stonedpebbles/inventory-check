(function () {
  'use strict';

  describe('App Run', function () {
    var $rootScope, $httpBackend, $q, $state, Authinfo, HealthService, TrackingId;

    beforeEach(angular.mock.module('wx2AdminWebClientApp'));

    beforeEach(inject(function (_$rootScope_, _$httpBackend_, _$q_, _$state_, _Authinfo_, _HealthService_, _TrackingId_) {
      $rootScope = _$rootScope_;
      $httpBackend = _$httpBackend_;
      $q = _$q_;
      $state = _$state_;
      Authinfo = _Authinfo_;
      HealthService = _HealthService_;
      TrackingId = _TrackingId_;

      //hack the l10n json because entire module is loaded
      $httpBackend.whenGET('l10n/en_US.json').respond(200);

      spyOn(Authinfo, 'isInitialized').and.returnValue(true);
      spyOn(HealthService, 'getHealthStatus').and.returnValue($q.when('online'));
      spyOn(TrackingId, 'clear').and.callThrough();
      spyOn($state, 'go').and.callThrough();
    }));

    function goToState(state) {
      $state.go(state);
      $state.go.calls.reset();
      $rootScope.$apply();
    }

    describe('TrackingId', function () {
      beforeEach(function () {
        TrackingId.increment();
      });

      it('should clear the trackingId on every successful state change', function () {
        expect(TrackingId.get()).toBeDefined();

        goToState('login');

        expect(TrackingId.clear).toHaveBeenCalled();
        expect(TrackingId.get()).toBeUndefined();
      });

    });

    describe('$stateChangeStart server-maintenance logic', function () {
      beforeEach(function () {
        HealthService.getHealthStatus.and.returnValue($q.reject());
      });

      describe('if Authinfo is initialized', function () {
        beforeEach(function () {
          Authinfo.isInitialized.and.returnValue(true);
        });

        it('should not redirect on login if getHealthStatus has error', function () {
          goToState('login');
          expect($state.go).not.toHaveBeenCalledWith('server-maintenance');
        });

        it('should not redirect on authenticated state if getHealthStatus has error', function () {
          goToState('overview');
          expect($state.go).not.toHaveBeenCalledWith('server-maintenance');
        });
      });

      describe('if Authinfo is not initialized', function () {
        beforeEach(function () {
          Authinfo.isInitialized.and.returnValue(false);
        });

        it('should not redirect on login if getHealthStatus has error', function () {
          goToState('login');
          expect($state.go).not.toHaveBeenCalledWith('server-maintenance');
        });

        it('should redirect on authenticated state if getHealthStatus has error', function () {
          goToState('overview');
          expect($state.go).toHaveBeenCalledWith('server-maintenance');
        });

        it('should not redirect if getHealthStatus is online', function () {
          HealthService.getHealthStatus.and.returnValue($q.resolve('online'));
          goToState('overview');
          expect($state.go).not.toHaveBeenCalledWith('server-maintenance');
        });

        it('should not redirect if getHealthStatus is offline', function () {
          HealthService.getHealthStatus.and.returnValue($q.resolve('offline'));
          goToState('overview');
          expect($state.go).not.toHaveBeenCalledWith('server-maintenance');
        });
      });
    });

  });

})();

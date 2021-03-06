import { ServicesOverviewHybridCalendarCard } from './hybridCalendarCard';

describe('ServicesOverviewHybridCallCard', () => {

  let Authinfo, FusionClusterStatesService;
  let card: ServicesOverviewHybridCalendarCard;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_Authinfo_, _FusionClusterStatesService_) {
    Authinfo = _Authinfo_;
    FusionClusterStatesService = _FusionClusterStatesService_;
  }

  function initSpies() {
    spyOn(Authinfo, 'isFusionCal');
    spyOn(Authinfo, 'isFusionGoogleCal');
  }

  it('should have sane defaults', () => {
    card = new ServicesOverviewHybridCalendarCard(Authinfo, FusionClusterStatesService);
    expect(card.active).toBe(false);
    expect(card.loading).toBe(true);
  });

  it('should be displayed if the user has the hybrid cal entitlement but neither the hybrid google cal entitlement not the feature toggle', () => {
    Authinfo.isFusionCal.and.returnValue(true);
    Authinfo.isFusionGoogleCal.and.returnValue(false);
    card = new ServicesOverviewHybridCalendarCard(Authinfo, FusionClusterStatesService);
    card.googleCalendarFeatureToggleEventHandler(false);
    expect(card.display).toBe(true);
  });

  it('should be displayed if the user has the hybrid cal entitlement and the feature toggle but not the hybrid google cal entitlement', () => {
    Authinfo.isFusionCal.and.returnValue(true);
    Authinfo.isFusionGoogleCal.and.returnValue(false);
    card = new ServicesOverviewHybridCalendarCard(Authinfo, FusionClusterStatesService);
    card.googleCalendarFeatureToggleEventHandler(true);
    expect(card.display).toBe(true);
  });

  it('should be displayed if the user has the hybrid cal entitlement and the hybrid google cal entitlement but not the feature toggle', () => {
    Authinfo.isFusionCal.and.returnValue(true);
    Authinfo.isFusionGoogleCal.and.returnValue(true);
    card = new ServicesOverviewHybridCalendarCard(Authinfo, FusionClusterStatesService);
    card.googleCalendarFeatureToggleEventHandler(false);
    expect(card.display).toBe(true);
  });

  it('should not be displayed if the user the hybrid cal entitlement, the hybrid google cal entitlement and the feature toggle', () => {
    Authinfo.isFusionCal.and.returnValue(true);
    Authinfo.isFusionGoogleCal.and.returnValue(true);
    card = new ServicesOverviewHybridCalendarCard(Authinfo, FusionClusterStatesService);
    card.googleCalendarFeatureToggleEventHandler(true);
    expect(card.display).toBe(false);
  });

  it('should stay not active if services statuses do not say it is setup', () => {
    card = new ServicesOverviewHybridCalendarCard(Authinfo, FusionClusterStatesService);
    card.hybridStatusEventHandler([{ serviceId: 'squared-fusion-cal', setup: false, status: 'yolo' }]);
    expect(card.active).toBe(false);
  });

  it('should be active if services statuses say it is setup', () => {
    card = new ServicesOverviewHybridCalendarCard(Authinfo, FusionClusterStatesService);
    card.hybridStatusEventHandler([{ serviceId: 'squared-fusion-cal', setup: true, status: 'yolo' }]);
    expect(card.active).toBe(true);
  });

  it('should stop loading once it received the hybrid statuses event', () => {
    card = new ServicesOverviewHybridCalendarCard(Authinfo, FusionClusterStatesService);
    card.hybridStatusEventHandler([]);
    expect(card.loading).toBe(false);
  });
});

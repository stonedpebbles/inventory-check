/// <reference path="ServicesOverviewCard.ts"/>
/// <reference path="messageCard.ts"/>
/// <reference path="meetingCard.ts"/>
/// <reference path="cloudCallCard.ts"/>
/// <reference path="hybridManagementCard.ts"/>
/// <reference path="hybridManagementF410Card.ts"/>
/// <reference path="calendarCard.ts"/>
/// <reference path="hybridCallCard.ts"/>
/// <reference path="hybridMediaCard.ts"/>
/// <reference path="hybridContextCard.ts"/>
namespace servicesOverview {

  /* @ngInject */
  import ServicesOverviewCard = servicesOverview.ServicesOverviewCard;
  function ServicesOverviewCardFactory(Authinfo) {

    return {
      createCards: function ():Array<ServicesOverviewCard> {
        return [
          new ServicesOverviewMessageCard(Authinfo),
          new ServicesOverviewMeetingCard(Authinfo),
          new ServicesOverviewCallCard(Authinfo),
          new ServicesOverviewHybridManagementCard(),
          new ServicesOverviewHybridManagementF410Card(),
          new ServicesOverviewCalendarCard(),
          new ServicesOverviewHybridCallCard(),
          new ServicesOverviewHybridMediaCard(),
          // new ServicesOverviewHybridContextCard() //removed until feature is ready.
        ];
      }
    };
  }

  angular
    .module('Hercules')
    .factory('ServicesOverviewCardFactory', ServicesOverviewCardFactory);
}

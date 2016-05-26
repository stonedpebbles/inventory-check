/// <reference path="ServicesOverviewCard.ts"/>
namespace servicesOverview {

  export class ServicesOverviewCalendarCard extends ServicesOverviewCard {
    getShowMoreButton():servicesOverview.CardButton {
      return undefined;
    }

    private _setupButton:CardButton = {
      name: 'servicesOverview.genericButtons.setup',
      link: 'services/calendar',
      buttonClass: 'cta-btn'
    };

    private _buttons:Array<servicesOverview.CardButton> = [
      {name: 'servicesOverview.cards.calendar.buttons.resources', link: 'services/calendar', buttonClass: 'btn-link'},
      {
        name: 'servicesOverview.cards.calendar.buttons.settings',
        link: 'services/calendar/settings',
        buttonClass: 'btn-link'
      }];


    getButtons():Array<servicesOverview.CardButton> {
      if (this.active)
        return _.take(this._buttons, 3);
      return [this._setupButton];
    }

    public constructor() {
      super('modules/hercules/servicesOverview/serviceCard.tpl.html',
        'servicesOverview.cards.calendar.title', 'servicesOverview.cards.calendar.description', '', true, 'calendar', CardType.hybrid);
    }

    public hybridStatusEventHandler(services:Array<{id:string,status:string, enabled:boolean}>) {
      this._status = {
        status: this.filterAndGetCssStatus(services, ['squared-fusion-cal']),
        text: this.filterAndGetTxtStatus(services, ['squared-fusion-cal']),
        link: 'services/calendar'
      };
      this._active = this.filterAndGetEnabledService(services, ['squared-fusion-cal']);
      this._loading = false;
    }
  }
}
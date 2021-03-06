import { ServicesOverviewCard, ICardButton } from './ServicesOverviewCard';

export class ServicesOverviewCallCard extends ServicesOverviewCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private _buttons: Array<ICardButton> = [{
    name: 'servicesOverview.cards.call.buttons.numbers',
    routerState: 'huronlines',
    buttonClass: 'btn-link',
  }, {
    name: 'servicesOverview.cards.call.buttons.settings',
    routerState: 'huronsettings',
    buttonClass: 'btn-link',
  }];

  public getButtons(): Array<ICardButton> {
    if (this.active) {
      return this._buttons;
    }
    return [];
  }

  private showFeatureTab(pstnEnabled: boolean) {
    return this.Authinfo.getLicenses()
      .filter((license) => {
        return !pstnEnabled || (license.licenseType === this.Config.licenseTypes.COMMUNICATION);
      }).length > 0;
  }

  public csdmPstnFeatureToggleEventHandler(pstnEnabled: boolean) {
    this.active = pstnEnabled ? this.Authinfo.isAllowedState('huronsettings') : this.Authinfo.isSquaredUC();
    if (this.showFeatureTab(pstnEnabled)) {
      this._buttons.splice(1, 0, {
        name: 'servicesOverview.cards.call.buttons.features',
        routerState: 'huronfeatures',
        buttonClass: 'btn-link',
      });
    }
    this.loading = false;
  }

  /* @ngInject */
  public constructor(
    private Authinfo,
    private Config,
  ) {
    super({
      active: Authinfo.isAllowedState('huronsettings'),
      cardClass: 'cta-bar',
      description: 'servicesOverview.cards.call.description',
      icon: 'icon-circle-call',
      name: 'servicesOverview.cards.call.title',
    });
  }
}

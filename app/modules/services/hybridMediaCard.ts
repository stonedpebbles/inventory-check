import { ServicesOverviewHybridCard } from './ServicesOverviewHybridCard';
import { ICardButton, CardType } from './ServicesOverviewCard';

export class ServicesOverviewHybridMediaCard extends ServicesOverviewHybridCard {
  public getShowMoreButton(): ICardButton | undefined {
    return undefined;
  }

  private _setupButton: ICardButton = {
    name: 'servicesOverview.genericButtons.setup',
    routerState: 'media-service-v2.list',
    buttonClass: 'btn',
  };

  private _buttons: Array<ICardButton> = [
    {
      name: 'servicesOverview.cards.hybridMedia.buttons.resources',
      routerState: 'media-service-v2.list',
      buttonClass: 'btn-link',
    },
    {
      name: 'servicesOverview.cards.hybridMedia.buttons.settings',
      routerState: 'media-service-v2.settings',
      buttonClass: 'btn-link',
    }];

  public getButtons(): Array<ICardButton> {
    if (this.active) {
      return _.take(this._buttons, 3);
    }
    return [this._setupButton];
  }

  public hybridMediaFeatureToggleEventHandler(hasFeature: boolean) {
    this._display = hasFeature;
  }

  /* @ngInject */
  public constructor(FusionClusterStatesService) {
    super({
      name: 'servicesOverview.cards.hybridMedia.title',
      description: 'servicesOverview.cards.hybridMedia.description',
      activeServices: ['squared-fusion-media'],
      statusService: 'squared-fusion-media',
      routerState: 'media-service-v2.list',
      active: false,
      display : false,
      cardClass: 'media',
      cardType: CardType.hybrid,
    }, FusionClusterStatesService);
  }
}
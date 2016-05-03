namespace servicesOverview {

  export interface CardButton {
    name:String;
    buttonClass?:String;
    link:String;
  }
  export enum CardType{
    cloud,
    hybrid
  }

  export abstract class ServicesOverviewCard {

    protected _status;
    protected _loading = true;

    get active() {
      return this._active;
    }

    get loading() {
      return this._loading;
    }

    get cardClass() {
      return this._cardClass;
    }

    get cardType() {
      return this._cardType;
    }

    get description() {
      return this._description;
    }

    get icon() {
      return this._icon;
    }

    get name() {
      return this._name;
    }

    get status() {
      return this._status;
    }

    get template() {
      return this._template;
    }

    abstract getButtons():Array<CardButton>;

    abstract getShowMoreButton():CardButton;

    serviceStatusToCss = {
      ok: 'success',
      warn: 'warning',
      error: 'danger',
      disabled: 'disabled',
      undefined: 'warning'
    };

    serviceEnabledWeight = {
      'true': 2,
      'false': 1,
      undefined: 0
    };
    serviceStatusWeight = {
      ok: 1,
      warn: 2,
      error: 3,
      disabled: 4,
      undefined: 0
    };

    public constructor(private _template:String, private _name:String, private _description, private _icon:String,
                       protected _active:boolean = true, private _cardClass:String = 'cs-card', private _cardType:CardType = CardType.cloud) {
    }

    protected filterAndGetEnabledService(services:Array<{id:string,enabled:boolean}>, serviceIds:Array<String>):boolean {
      let startVal = false;
      let res = services.filter((service)=> {
        return _.indexOf(serviceIds, service.id) >= 0;
      }).reduce((result, serv)=> {
        return this.serviceEnabledWeight['' + serv.enabled] > this.serviceEnabledWeight['' + result] ? serv.enabled : result;
      }, startVal);
      return res;
      // return _.chain(services)
      //   .filter((service)=> {
      //     return _.indexOf(serviceIds, service.id) >= 0;
      //   })
      //   .reduce((result, serv:{enabled:boolean})=> {
      //     return this.serviceEnabledWeight[serv.enabled] > this.serviceEnabledWeight[result] ? serv.enabled : result;
      //   }, undefined)
      //   .value();
    }

    protected filterAndGetCssStatus(services:Array<{id:string,status:string}>, serviceIds:Array<string>):string {
      let startVal:string = undefined;
      let callServiceStatus:string = services.filter((service)=> {
        return _.indexOf(serviceIds, service.id) >= 0;
      }).reduce((result, serv)=> {
        return this.serviceStatusWeight[serv.status] > this.serviceStatusWeight[result] ? serv.status : result;
      }, startVal);
      // let callServiceStatus:string = _.chain(services)
      //   .filter((service)=> {
      //     return _.indexOf(serviceIds, service.id) >= 0;
      //   })
      //   .reduce((result, serv:{status:string})=> {
      //     return this.serviceStatusWeight[serv.status] > this.serviceStatusWeight[result] ? serv.status : result
      //   }, undefined)
      //   .value();
      if (callServiceStatus) {
        return this.serviceStatusToCss[callServiceStatus] || this.serviceStatusToCss['undefined'];
      }
      return undefined;
    }
  }

}

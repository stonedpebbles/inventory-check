import {
  ITimespan,
  IIntervalQuery,
  ICustomerIntervalQuery,
  IReportsCustomer,
  IReportTypeQuery,
  ITypeQuery,
} from '../partnerReportInterfaces';
import { Notification } from 'modules/core/notifications';

export class CommonReportService {
  // public API helpers
  public readonly DETAILED: string = 'detailed';
  public readonly TIME_CHARTS: string = 'timeCharts';

  // private API helpers
  private readonly CACHE: string = '&cache=';
  private readonly ICOUNT: string = '&intervalCount=';
  private readonly ITYPE: string = '&intervalType=';
  private readonly SCOUNT: string = '&spanCount=';
  private readonly STYPE: string = '&spanType=';
  private readonly CVIEW: string = '&isCustomerView=true';
  private readonly ORGID: string = '&orgId=';

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private Authinfo,
    private Notification: Notification,
    private ReportConstants,
    private UrlConfig,
  ) {}

  private readonly usageOptions: Array<string> = ['weeklyUsage', 'monthlyUsage', 'threeMonthUsage'];
  private readonly altUsageOptions: Array<string> = ['dailyUsage', 'monthlyUsage', 'yearlyUsage'];
  private readonly cacheValue: boolean = (parseInt(moment.utc().format('H'), this.ReportConstants.INTEGER_BASE) >= 8);
  private urlBase = this.UrlConfig.getAdminServiceUrl() + 'organization/' + this.Authinfo.getOrgId() + '/reports/';

  private getService(url: string, cancelPromise: ng.IDeferred<any>): ng.IHttpPromise<any> {
    if (cancelPromise) {
      return this.$http.get(url, {
        timeout: cancelPromise.promise,
      });
    } else {
      return this.$http.get(url);
    }
  }

  private getQuery(options: any): string {
    return this.ICOUNT + options.intervalCount + this.ITYPE + options.intervalType + this.SCOUNT + options.spanCount + this.STYPE + options.spanType + this.CACHE + options.cache;
  }

  private getCustomerQuery(customers: Array<IReportsCustomer>): string {
    let url: string = '';
    _.forEach(customers, (customer) => {
      url += this.ORGID + customer.value;
    });
    return url;
  }

  public getPartnerReport(options: IIntervalQuery, customers: Array<IReportsCustomer>, cancelPromise: ng.IDeferred<any>): ng.IHttpPromise<any> {
    let url = this.urlBase + options.action + '/managedOrgs/' + options.type + '?' + this.getQuery(options);
    if (customers) {
      url += this.getCustomerQuery(customers);
    }
    return this.getService(url, cancelPromise);
  }

  // TODO: remove unnecessary IIntervalQuery options once API stops requiring them
  public getPartnerReportByReportType(options: IReportTypeQuery, extraOptions: IIntervalQuery, customers: Array<IReportsCustomer>, cancelPromise: ng.IDeferred<any>): ng.IHttpPromise<any> {
    let url = this.urlBase + options.action + '/managedOrgs/' + options.type + '?type=' + options.reportType + this.getQuery(extraOptions) + this.getCustomerQuery(customers);
    return this.getService(url, cancelPromise);
  }

  public getCustomerReport(options: ICustomerIntervalQuery, cancelPromise: ng.IDeferred<any>): ng.IHttpPromise<any> {
    let url = this.urlBase + options.action + '/' + options.type + '?' + this.getQuery(options);
    if (options.customerView) {
      url += this.CVIEW;
    }
    return this.getService(url, cancelPromise);
  }

  public getCustomerReportByType(options: ITypeQuery, cancelPromise: ng.IDeferred<any>): ng.IHttpPromise<any> {
    let url = this.urlBase + options.name + '?type=' + options.type + this.CACHE + options.cache;
    return this.getService(url, cancelPromise);
  }

  public getCustomerAltReportByType(options: ITypeQuery, cancelPromise: ng.IDeferred<any>): ng.IHttpPromise<any> {
    let url = this.urlBase + options.name + '/' + options.type + '?' + this.CACHE + options.cache;
    return this.getService(url, cancelPromise);
  }

  public returnErrorCheck(error, message: string, returnItem: any): any {
    if (error.status === 401 || error.status === 403) {
      this.Notification.errorWithTrackingId(error, 'reportsPage.unauthorizedError');
    } else if ((error.status !== 0) || (error.config.timeout.$$state.status === 0)) {
      this.Notification.errorWithTrackingId(error, message);
    }
    return returnItem;
  }

  public getReturnGraph(filter: ITimespan, date: string, graphItem: any): Array<any> {
    let returnGraph: Array<any> = [];

    if (filter.value === 0) {
      for (let i = 7; i > 0; i--) {
        let tmpItem: any = _.clone(graphItem);
        tmpItem.date = moment().tz(this.ReportConstants.TIMEZONE)
          .subtract(i, this.ReportConstants.DAY)
          .format(this.ReportConstants.DAY_FORMAT);
        returnGraph.push(tmpItem);
      }
    } else if (filter.value === 1) {
      if (date === '') {
        date = moment().subtract(1, this.ReportConstants.DAY).format(this.ReportConstants.DAY_FORMAT);
      }
      let dayOffset: number = this.getOffset(parseInt(moment.tz(date, this.ReportConstants.TIMEZONE).format('e'), this.ReportConstants.INTEGER_BASE));
      for (let x = 3; x >= 0; x--) {
        let temp: any = _.clone(graphItem);
        temp.date = moment().tz(this.ReportConstants.TIMEZONE)
          .startOf(this.ReportConstants.WEEK)
          .subtract(dayOffset + (x * 7), this.ReportConstants.DAY)
          .format(this.ReportConstants.DAY_FORMAT);
        returnGraph.push(temp);
      }
    } else {
      for (let y = 2; y >= 0; y--) {
        let item: any = _.clone(graphItem);
        item.date = moment().tz(this.ReportConstants.TIMEZONE)
          .subtract(y, this.ReportConstants.MONTH)
          .startOf(this.ReportConstants.MONTH)
          .format(this.ReportConstants.MONTH_FORMAT);
        returnGraph.push(item);
      }
    }

    return returnGraph;
  }

  public getReturnLineGraph(filter: ITimespan, graphItem: any): Array<any> {
    let returnGraph: Array<any> = [];

    if (filter.value === 0) {
      for (let i = 8; i > 0; i--) {
        let tmpItem: any = _.clone(graphItem);
        tmpItem.date = moment().tz(this.ReportConstants.TIMEZONE)
          .subtract(i, this.ReportConstants.DAY)
          .format(this.ReportConstants.DAY_FORMAT);
        returnGraph.push(tmpItem);
      }
    } else if (filter.value === 1) {
      for (let x = 4; x >= 0; x--) {
        let temp: any = _.clone(graphItem);
        temp.date = moment().day(-1)
          .subtract(x, this.ReportConstants.WEEK)
          .format(this.ReportConstants.DAY_FORMAT);
        returnGraph.push(temp);
      }
    } else {
      for (let z = 52; z >= 0; z--) {
        let item = _.clone(graphItem);
        item.date = moment().day(-1)
          .subtract(z, this.ReportConstants.WEEK)
          .format(this.ReportConstants.DAY_FORMAT);
        returnGraph.push(item);
      }
    }

    return returnGraph;
  }

  private getOffset(date: number): number {
    if (date >= 4) {
      return 7 - date;
    } else {
      return -date;
    }
  }

  public getOptions(filter: ITimespan, type: string, action: string): IIntervalQuery {
    let reportOptions: IIntervalQuery = {
      action: action,
      type: type,
      intervalCount: 7,
      intervalType: this.ReportConstants.DAY,
      spanCount: 1,
      spanType: this.ReportConstants.DAY,
      cache: this.cacheValue,
    };
    if (filter.value === 1) {
      reportOptions.intervalCount = 31;
      reportOptions.spanCount = 7;
    } else if (filter.value === 2) {
      reportOptions.intervalCount = 3;
      reportOptions.intervalType = this.ReportConstants.MONTH;
      reportOptions.spanCount = 1;
      reportOptions.spanType = this.ReportConstants.MONTH;
    }
    return reportOptions;
  }

  public getOptionsOverPeriod(filter: ITimespan, type: string, action: string): IIntervalQuery {
    let reportOptions: IIntervalQuery = {
      action: action,
      type: type,
      intervalCount: 7,
      intervalType: this.ReportConstants.DAY,
      spanCount: 7,
      spanType: this.ReportConstants.DAY,
      cache: this.cacheValue,
    };
    if (filter.value === 1) {
      reportOptions.intervalCount = 31;
      reportOptions.spanCount = 31;
    } else if (filter.value === 2) {
      reportOptions.intervalCount = 92;
      reportOptions.spanCount = 92;
    }
    return reportOptions;
  }

  public getTrendOptions(filter: ITimespan, type: string, action: string): IIntervalQuery {
    let reportOptions: IIntervalQuery = {
      action: action,
      type: type,
      intervalCount: 7,
      intervalType: this.ReportConstants.DAY,
      spanCount: 1,
      spanType: this.ReportConstants.DAY,
      cache: this.cacheValue,
    };
    if (filter.value === 1) {
      reportOptions.intervalCount = 31;
    } else if (filter.value === 2) {
      reportOptions.intervalCount = 92;
    }
    return reportOptions;
  }

  public getReportTypeOptions(filter: ITimespan, type: string, action: string): IReportTypeQuery {
    return {
      action: action,
      type: type,
      reportType: this.usageOptions[filter.value],
      cache: this.cacheValue,
    };
  }

  public getTypeOptions(filter: ITimespan, name: string): ITypeQuery {
    return {
      name: name,
      type: this.usageOptions[filter.value],
      cache: this.cacheValue,
    };
  }

  public getLineTypeOptions(filter: ITimespan, name: string): ITypeQuery {
    return {
      name: name,
      type: this.altUsageOptions[filter.value],
      cache: this.cacheValue,
    };
  }

  public getCustomerOptions(filter: ITimespan, type: string, action: string, customerView: boolean): ICustomerIntervalQuery {
    let reportOptions: ICustomerIntervalQuery = {
      action: action,
      type: type,
      intervalCount: 7,
      intervalType: this.ReportConstants.DAY,
      spanCount: 1,
      spanType: this.ReportConstants.DAY,
      cache: this.cacheValue,
      customerView: customerView,
    };
    if (filter.value === 1) {
      reportOptions.intervalCount = 31;
      reportOptions.spanCount = 7;
    } else if (filter.value === 2) {
      reportOptions.intervalCount = 3;
      reportOptions.intervalType = this.ReportConstants.MONTH;
      reportOptions.spanCount = 1;
      reportOptions.spanType = this.ReportConstants.MONTH;
    }
    return reportOptions;
  }

  public getAltCustomerOptions(filter: ITimespan, type: string, action: string, customerView: boolean): ICustomerIntervalQuery {
    let reportOptions: ICustomerIntervalQuery = {
      action: action,
      type: type,
      intervalCount: 7,
      intervalType: this.ReportConstants.DAY,
      spanCount: 7,
      spanType: this.ReportConstants.DAY,
      cache: this.cacheValue,
      customerView: customerView,
    };
    if (filter.value === 1) {
      reportOptions.intervalCount = 31;
      reportOptions.spanCount = 31;
    } else if (filter.value === 2) {
      reportOptions.intervalCount = 93;
      reportOptions.spanCount = 93;
    }
    return reportOptions;
  }

  public getModifiedDate(date: string, filter: ITimespan): string {
    let modifiedDate: string = moment.tz(date, this.ReportConstants.TIMEZONE).format(this.ReportConstants.DAY_FORMAT);
    if (filter.value > 1) {
      modifiedDate = moment.tz(date, this.ReportConstants.TIMEZONE).format(this.ReportConstants.MONTH_FORMAT);
    }
    return modifiedDate;
  }

  public getModifiedLineDate(date: string): string {
    return moment.tz(date, this.ReportConstants.TIMEZONE).format(this.ReportConstants.DAY_FORMAT);
  }
}

angular.module('Core')
  .service('CommonReportService', CommonReportService);
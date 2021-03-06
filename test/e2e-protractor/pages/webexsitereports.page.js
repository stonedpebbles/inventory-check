'use strict';

var WebExSiteReportsPage = function () {
  this.webexReportCrumb1 = element(by.id('webexReportIFrameCrumb1'));
  this.webexReportCrumb2 = element(by.id('webexReportIFrameCrumb2'));

  this.conferencing = element(by.css('a[href="#/site-list"]'));
  this.webexReportsLink = element(by.css('a[href="#/reports/webex"]'));
  this.webexSiteReportsPanel = element(by.css('#reportsPanel'));
  this.webexCommonMeetingUsageLink = element(by.id('meeting_usage'));
  this.webexCommonMeetingsInProgressLink = element(by.id('meeting_in_progess'));
  this.webexCommonInactiveUserLink = element(by.id('inactive_user'));
  this.webexReportsIndexLoading = element(by.id('reportsIndexLoading'));
  this.webexCommonRecordingUsageLink = element(by.id('recording_usage'));
  this.webexCommonStorageUsageLink = element(by.id('storage_utilization'));

  this.reportEngagementId = element(by.id('engagementReports'));
  this.webexCommonReportsCardId = element(by.id('common_reports'));
  this.webexCommonMeetingsInProgressId = element(by.id('webexSiteReportIframe-meeting_in_progess'));
  this.webexCommonInactiveUserId = element(by.id('webexSiteReportIframe-inactive_user'));
  this.webexCommonMeetingUsageId = element(by.id('webexSiteReportIframe-meeting_usage'));
  this.webexCommonRecordingUsageId = element(by.id('webexSiteReportIframe-recording_usage'));
  this.webexCommonStorageUsageId = element(by.id('webexSiteReportIframe-storage_utilization'));

  this.siteAdminReportsUrl = '/webexreports';

  this.lastSyncElement = element(by.id('reportsRefreshData'));
};

module.exports = WebExSiteReportsPage;

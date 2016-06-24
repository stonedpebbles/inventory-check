'use strict';

/* global webExSiteSettings */
/* global webEx */
/* global webExCommon */

webExCommon.testInfo.describeCount = 0;
while (1 >= webExCommon.testInfo.describeCount) {
  switch (webExCommon.testInfo.describeCount) {
  case 1:
    webExCommon.testInfo.testType = 'T30';
    webExCommon.testInfo.describeText = 'WebEx site settings iframe test for ' + webExCommon.testInfo.testType + ' site ' + webExCommon.t30Info.siteUrl;
    break;

  default:
    webExCommon.testInfo.testType = 'T31';
    webExCommon.testInfo.describeText = 'WebEx site settings iframe test for ' + webExCommon.testInfo.testType + ' site ' + webExCommon.t31Info.siteUrl;
  }

  describe(webExCommon.testInfo.describeText, function () {
    var setup = false;

    if (webExCommon.testInfo.testType == "T31") {
      beforeAll(function () {
        var promise = webEx.setup(
          1,
          'wbx-t31RegressionTestAdmin',
          webExCommon.t31Info.testAdminUsername,
          webExCommon.t31Info.testAdminPassword,
          webExCommon.t31Info.siteUrl
        );

        promise.then(
          function success(ticket) {
            setup = (null !== ticket);
          },

          function error() {
            setup = false;
          }
        );
      });
    } else {
      beforeAll(function () {
        var promise = webEx.setup(
          1,
          'wbx-t30RegressionTestAdmin',
          webExCommon.t30Info.testAdminUsername,
          webExCommon.t30Info.testAdminPassword,
          webExCommon.t30Info.siteUrl
        );

        promise.then(
          function success(ticket) {
            setup = (null !== ticket);
          },

          function error() {
            setup = false;
          }
        );
      });
    }

    if (webExCommon.testInfo.testType == "T31") {
      it('shsetupould sign in as ' + webExCommon.t31Info.testAdminUsername + ' and navigate to webex site list', function () {
        if (setup) {
          navigation.clickServicesTab();
          utils.click(webExSiteSettings.conferencing);
        }
      });

      it('should click on configure site icon for ' + webExCommon.t31Info.siteUrl, function () {
        if (setup) {
          utils.click(webExCommon.t31ConfigureCog);
          utils.wait(webExSiteSettings.siteSettingsPanel);
          utils.wait(webExCommon.t31CardsSectionId);
        }
      });
    } else {
      it('should sign in as ' + webExCommon.t30Info.testAdminUsername + ' and navigate to webex site list', function () {
        if (setup) {
          navigation.clickServicesTab();
          utils.click(webExSiteSettings.conferencing);
        }
      });

      it('should click on configure site icon for ' + webExCommon.t30Info.siteUrl, function () {
        if (setup) {
          utils.click(webExCommon.t30ConfigureCog);
          utils.wait(webExSiteSettings.siteSettingsPanel);
          utils.wait(webExCommon.t30CardsSectionId);
        }
      });
    }

    it('should click on site list breadcrumb and navigate to site list', function () {
      if (setup) {
        utils.click(webExSiteSettings.siteListCrumb);
      }
    });

    if (webExCommon.testInfo.testType == "T31") {
      it('should click on configure site cog for ' + webExCommon.t31Info.siteUrl, function () {
        if (setup) {
          utils.click(webExCommon.t31ConfigureCog);
          utils.wait(webExSiteSettings.siteSettingsPanel);
          utils.wait(webExCommon.t31CardsSectionId);
        }
      });
    } else {
      it('should click on configure site cog for ' + webExCommon.t30Info.siteUrl, function () {
        if (setup) {
          utils.click(webExCommon.t30ConfigureCog);
          utils.wait(webExSiteSettings.siteSettingsPanel);
          utils.wait(webExCommon.t30CardsSectionId);
        }
      });
    }

    if (webExCommon.testInfo.testType == "T31") { // for T31 site only
      it('should click on common settings cmr link', function () {
        if (setup) {
          utils.click(webExSiteSettings.configureCommonCMRLink);
          utils.wait(webExSiteSettings.siteSettingPanel);
          utils.wait(webExSiteSettings.cmrId);
          utils.wait(webExSiteSettings.iFramePage);
        }
      });

      it('should click on settings index breadcrumb and navigate to site settings index', function () {
        if (setup) {
          utils.click(webExSiteSettings.siteSettingsCrumb);
          utils.wait(webExSiteSettings.siteSettingsPanel);
        }
      });

      it('should click on common settings scheduler link', function () {
        if (setup) {
          utils.click(webExSiteSettings.configureCommonSchedulerLink);
          utils.wait(webExSiteSettings.siteSettingPanel);
          utils.wait(webExSiteSettings.commonSchedulerId);
          utils.wait(webExSiteSettings.iFramePage);
        }
      });

      it('should click on settings index breadcrumb and navigate to site settings index', function () {
        if (setup) {
          utils.click(webExSiteSettings.siteSettingsCrumb);
          utils.wait(webExSiteSettings.siteSettingsPanel);
        }
      });

      it('should click on common settings security link ', function () {
        if (setup) {
          utils.click(webExSiteSettings.configureCommonSecurityLink);
          utils.wait(webExSiteSettings.siteSettingPanel);
          utils.wait(webExSiteSettings.commonSecurityId);
          utils.wait(webExSiteSettings.iFramePage);
        }
      });

      it('should click on settings index breadcrumb and navigate to site settings index', function () {
        if (setup) {
          utils.click(webExSiteSettings.siteSettingsCrumb);
          utils.wait(webExSiteSettings.siteSettingsPanel);
        }
      });

      it('should click on common settings session types link', function () {
        if (setup) {
          utils.click(webExSiteSettings.configureCommonSessionTypesLink);
          utils.wait(webExSiteSettings.siteSettingPanel);
          utils.wait(webExSiteSettings.commonSessionTypesId);
          utils.wait(webExSiteSettings.iFramePage);
        }
      });

      it('should click on settings index breadcrumb and navigate to site settings index', function () {
        if (setup) {
          utils.click(webExSiteSettings.siteSettingsCrumb);
          utils.wait(webExSiteSettings.siteSettingsPanel);
        }
      });

      it('should click on common settings user privileges link', function () {
        if (setup) {
          utils.click(webExSiteSettings.configureCommonUserPrivLink);
          utils.wait(webExSiteSettings.siteSettingPanel);
          utils.wait(webExSiteSettings.commonUserPrivId);
          utils.wait(webExSiteSettings.iFramePage);
        }
      });

      it('should click on settings index breadcrumb and navigate to site settings index', function () {
        if (setup) {
          utils.click(webExSiteSettings.siteSettingsCrumb);
          utils.wait(webExSiteSettings.siteSettingsPanel);
        }
      });
    } // For T31 site only

    it('should click on common settings company addresses link', function () {
      if (setup) {
        utils.click(webExSiteSettings.configureCommonCompanyAddressesLink);
        utils.wait(webExSiteSettings.siteSettingPanel);
        utils.wait(webExSiteSettings.companyAddressesId);
        utils.wait(webExSiteSettings.iFramePage);
      }
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      if (setup) {
        utils.click(webExSiteSettings.siteSettingsCrumb);
        utils.wait(webExSiteSettings.siteSettingsPanel);
      }
    });

    it('should click on common settings disclaimers link', function () {
      if (setup) {
        utils.click(webExSiteSettings.configureCommonDisclaimersLink);
        utils.wait(webExSiteSettings.siteSettingPanel);
        utils.wait(webExSiteSettings.disclaimersId);
        utils.wait(webExSiteSettings.iFramePage);
      }
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      if (setup) {
        utils.click(webExSiteSettings.siteSettingsCrumb);
        utils.wait(webExSiteSettings.siteSettingsPanel);
      }
    });

    it('should click on common settings mobile link', function () {
      if (setup) {
        utils.click(webExSiteSettings.configureCommonMobileLink);
        utils.wait(webExSiteSettings.siteSettingPanel);
        utils.wait(webExSiteSettings.commonMobileId);
        utils.wait(webExSiteSettings.iFramePage);
      }
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      if (setup) {
        utils.click(webExSiteSettings.siteSettingsCrumb);
        utils.wait(webExSiteSettings.siteSettingsPanel);
      }
    });

    it('should click on common settings navigation customization link', function () {
      if (setup) {
        utils.click(webExSiteSettings.configureCommonNavigationLink);
        utils.wait(webExSiteSettings.siteSettingPanel);
        utils.wait(webExSiteSettings.commonNavigationId);
        utils.wait(webExSiteSettings.iFramePage);
      }
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      if (setup) {
        utils.click(webExSiteSettings.siteSettingsCrumb);
        utils.wait(webExSiteSettings.siteSettingsPanel);
      }
    });

    it('should click on common settings productivity tools link', function () {
      if (setup) {
        utils.click(webExSiteSettings.configureCommonProductivityToolsLink);
        utils.wait(webExSiteSettings.siteSettingPanel);
        utils.wait(webExSiteSettings.commonProductivityToolsId);
        utils.wait(webExSiteSettings.iFramePage);
      }
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      if (setup) {
        utils.click(webExSiteSettings.siteSettingsCrumb);
        utils.wait(webExSiteSettings.siteSettingsPanel);
      }
    });

    it('should click on common settings partner delegated authentication link', function () {
      if (setup) {
        utils.click(webExSiteSettings.configureCommonPartnerAuthLink);
        utils.wait(webExSiteSettings.siteSettingPanel);
        utils.wait(webExSiteSettings.commonPartnerAuthId);
        utils.wait(webExSiteSettings.iFramePage);
      }
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      if (setup) {
        utils.click(webExSiteSettings.siteSettingsCrumb);
        utils.wait(webExSiteSettings.siteSettingsPanel);
      }
    });

    it('should click on common settings site options link', function () {
      if (setup) {
        utils.click(webExSiteSettings.configureCommonSiteOptionsLink);
        utils.wait(webExSiteSettings.siteSettingPanel);
        utils.wait(webExSiteSettings.commonSiteOptionsId);
        utils.wait(webExSiteSettings.iFramePage);
      }
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      if (setup) {
        utils.click(webExSiteSettings.siteSettingsCrumb);
        utils.wait(webExSiteSettings.siteSettingsPanel);
      }
    });

    it('should click on common settings site information link', function () {
      if (setup) {
        utils.click(webExSiteSettings.configureCommonSiteInformationLink);
        utils.wait(webExSiteSettings.siteSettingPanel);
        utils.wait(webExSiteSettings.commonSiteInformationId);
        utils.wait(webExSiteSettings.iFramePage);
      }
    });

    it('should click on settings index breadcrumb and navigate to site settings index', function () {
      if (setup) {
        utils.click(webExSiteSettings.siteSettingsCrumb);
        utils.wait(webExSiteSettings.siteSettingsPanel);
      }
    });

    it('should click on email all hosts btn', function () {
      if (setup) {
        utils.click(webExSiteSettings.emailAllHostsBtn);
        utils.wait(webExSiteSettings.siteSettingPanel);
        utils.wait(webExSiteSettings.emaillAllHostsId);
        utils.wait(webExSiteSettings.iFramePage);
      }
    });

    if (webExCommon.testInfo.testType == "T31") {
      it('should click on configure site cog and navigate to site settings index', function () {
        if (setup) {
          utils.click(webExSiteSettings.siteListCrumb);
          utils.wait(webExCommon.t31ConfigureCog);
        }
      });
    } else {
      it('should click on configure site cog and navigate to site settings index', function () {
        if (setup) {
          utils.click(webExSiteSettings.siteListCrumb);
          utils.wait(webExCommon.t30ConfigureCog);
        }
      });
    }

    // it('should pause', function () {
    //   browser.pause()
    // });

    it('should allow log out', function () {
      navigation.logout();
    });
  });

  ++webExCommon.testInfo.describeCount;
}

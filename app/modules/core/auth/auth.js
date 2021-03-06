(function () {
  'use strict';

  module.exports = angular
    .module('core.auth', [
      'pascalprecht.translate',
      'ui.router',
      require('angular-sanitize'),
      require('modules/core/auth/token.service'),
      require('modules/core/config/config'),
      require('modules/core/config/oauthConfig'),
      require('modules/core/config/urlConfig'),
      require('modules/core/scripts/services/authinfo'),
      require('modules/core/scripts/services/log'),
      require('modules/core/scripts/services/sessionstorage'),
      require('modules/core/scripts/services/storage'),
      require('modules/core/scripts/services/utils'),
      require('modules/core/window').default,
      require('modules/huron/compass').default,
    ])
    .factory('Auth', Auth)
    .name;

  /* @ngInject */
  function Auth($http, $injector, $q, $sanitize, $translate, Authinfo, Log, OAuthConfig, SessionStorage, TokenService, UrlConfig, Utils, WindowLocation, HuronCompassService) {

    var service = {
      logout: logout,
      logoutAndRedirectTo: logoutAndRedirectTo,
      authorize: authorize,
      getCustomerAccount: getCustomerAccount,
      isLoggedIn: isLoggedIn,
      setAccessToken: setAccessToken,
      redirectToLogin: redirectToLogin,
      getNewAccessToken: getNewAccessToken,
      refreshAccessToken: refreshAccessToken,
      refreshAccessTokenAndResendRequest: refreshAccessTokenAndResendRequest,
      verifyOauthState: verifyOauthState,
      getAuthorizationUrl: getAuthorizationUrl,
      getAuthorizationUrlList: getAuthorizationUrlList,
      isOnlineOrg: isOnlineOrg
    };

    var REFRESH_ACCESS_TOKEN_DEBOUNCE_MS = 1000;
    var debouncedRefreshAccessToken = _.debounce(
      refreshAccessToken,
      REFRESH_ACCESS_TOKEN_DEBOUNCE_MS,
      {
        leading: true,
        trailing: false
      }
    );

    return service;

    var deferredAll;

    function authorize(options) {
      var reauthorize = _.get(options, 'reauthorize');
      if (deferredAll && !reauthorize) {
        return deferredAll;
      }

      deferredAll = httpGET(getAuthorizationUrl())
        .then(function (res) {
          return $q.all([
            deferredAuth(res),
            getHuronDomain(res)
          ]);
        })
        .then(function (responseArray) {
          return _.get(responseArray, '[0]');
        })
        .catch(handleErrorAndResetAuthinfo);

      return deferredAll;
    }

    function deferredAuth(res) {
      return $q.when(res)
        .then(replaceOrTweakServices)
        .then(injectMessengerService)
        .then(initializeAuthinfo);
    }

    var onlineOrg;

    function isOnlineOrg() {
      return $q(function (resolve) {
        if (_.isNil(onlineOrg)) {
          getCustomerAccount(Authinfo.getOrgId()).then(function (res) {
            if (res.data.customers && !_.isEmpty(res.data.customers) && res.data.customers[0].customerType) {
              onlineOrg = res.data.customers[0].customerType === 'Online';
              resolve(onlineOrg);
            } else {
              resolve(false);
            }
          });
        } else {
          resolve(onlineOrg);
        }
      });
    }

    function getCustomerAccount(orgId) {
      if (!orgId || orgId === '') {
        return $q.reject('An Organization Id must be passed');
      }
      var url = UrlConfig.getAdminServiceUrl() + 'customers?orgId=' + orgId;
      return $http.get(url);
    }

    function getNewAccessToken(params) {
      var clientSessionId = TokenService.getOrGenerateClientSessionId();
      var url = OAuthConfig.getAccessTokenUrl();
      var data = OAuthConfig.getNewAccessTokenPostData(params.code, clientSessionId);
      var token = OAuthConfig.getOAuthClientRegistrationCredentials();

      // Security: verify authentication request came from our site
      if (service.verifyOauthState(params.state)) {
        return httpPOST(url, data, token)
          .then(updateOauthTokens)
          .catch(logErrorAndReject('Failed to obtain new oauth access token.'));
      } else {
        TokenService.clearStorage();
        return $q.reject();
      }
    }

    function refreshAccessToken() {
      var redirectUrl = OAuthConfig.getLogoutUrl();
      var refreshToken = TokenService.getRefreshToken();
      var url = OAuthConfig.getAccessTokenUrl();
      var data = OAuthConfig.getOauthAccessCodeUrl(refreshToken);
      var token = OAuthConfig.getOAuthClientRegistrationCredentials();

      var refreshPromise = refreshToken ? httpPOST(url, data, token) : $q.reject('refreshtoken not found');
      return refreshPromise
        .then(updateOauthTokens)
        .catch(function (response) {
          TokenService.completeLogout(redirectUrl);
          return logErrorAndReject('Failed to refresh access token')(response);
        });
    }

    function refreshAccessTokenAndResendRequest(response) {
      return debouncedRefreshAccessToken()
        .then(function () {
          var $http = $injector.get('$http');
          // replace the retried request with the new Authorization header
          _.set(response, 'config.headers.Authorization', _.get($http, 'defaults.headers.common.Authorization'));
          return $http(response.config);
        });
    }

    function setAccessToken() {
      var url = OAuthConfig.getAccessTokenUrl();
      var data = OAuthConfig.getAccessTokenPostData();
      var token = OAuthConfig.getOAuthClientRegistrationCredentials();

      return httpPOST(url, data, token)
        .then(updateOauthTokens)
        .catch(logErrorAndReject('Failed to obtain oauth access token'));
    }

    function logout() {
      var redirectUrl = OAuthConfig.getLogoutUrl();
      return service.logoutAndRedirectTo(redirectUrl)
        .finally(function () {
          return TokenService.triggerGlobalLogout();
        });
    }

    function logoutAndRedirectTo(redirectUrl) {
      var listTokensUrl = OAuthConfig.getOauthListTokenUrl();
      return httpGET(listTokensUrl)
        .then(function (response) {
          var promises = [];
          var clientTokens = _.filter(response.data.data, {
            client_id: OAuthConfig.getClientId(),
            user_info: {
              client_session_id: TokenService.getClientSessionId()
            }
          });

          _.each(clientTokens, function (tokenData) {
            var refreshTokenId = tokenData.token_id;
            var revoke = revokeAuthTokens(refreshTokenId, redirectUrl);
            promises.push(revoke);
          });

          return $q.all(promises)
            .catch(logErrorAndReject('Failed to revoke refresh tokens'));
        })
        .catch(logErrorAndReject('Failed to get and revoke refresh tokens'))
        .finally(function () {
          return TokenService.completeLogout(redirectUrl);
        });
    }

    function revokeAuthTokens(tokenId) {
      var revokeUrl = OAuthConfig.getOauthDeleteRefreshTokenUrl() + $sanitize(tokenId);
      return $http.delete(revokeUrl)
        .catch(logErrorAndReject('Failed to delete the oAuth token'));
    }

    function isLoggedIn() {
      return !!TokenService.getAccessToken();
    }

    function redirectToLogin(email, sso) {
      if (email) {
        WindowLocation.set(OAuthConfig.getOauthLoginUrl(email, getOauthState()));
      } else if (sso) {
        WindowLocation.set(OAuthConfig.getOauthLoginUrl(null, getOauthState()));
      } else {
        var $state = $injector.get('$state');
        $state.go('login');
      }
    }

    // authorize helpers

    function getAuthorizationUrl(org) {
      var url = UrlConfig.getAdminServiceUrl();

      if (org) {
        return url + 'organization/' + org + '/userauthinfo';
      }

      var customerOrgId = SessionStorage.get('customerOrgId');
      if (customerOrgId) {
        return url + 'organization/' + customerOrgId + '/userauthinfo';
      }

      var partnerOrgId = SessionStorage.get('partnerOrgId');
      if (partnerOrgId) {
        return url + 'organization/' + partnerOrgId + '/userauthinfo?launchpartnerorg=true';
      }

      return url + 'userauthinfo';
    }

    function getAuthorizationUrlList() {
      var authUrl = getAuthorizationUrl();
      return httpGET(authUrl);
    }

    function injectMessengerService(authData) {
      var url = UrlConfig.getMessengerServiceUrl() + '/orgs/' + authData.orgId + '/cisync/';
      return httpGET(url)
        .then(function (res) {
          var isMessengerOrg = _.has(res, 'data.orgName') && _.has(res, 'data.orgID');
          if (isMessengerOrg && res.data.wapiOrgStatus === 'inactive') {
            isMessengerOrg = false;
          }
          var isAdminForMsgr = _.intersection(['Full_Admin', 'Readonly_Admin'], authData.roles).length;
          var isPartnerAdmin = _.intersection(['PARTNER_ADMIN', 'PARTNER_READ_ONLY_ADMIN', 'PARTNER_USER'], authData.roles).length;
          if (isMessengerOrg && (isAdminForMsgr || !isPartnerAdmin)) {
            Log.debug('This Org is migrated from Messenger, add webex-messenger service to Auth data');
            authData.services.push({
              serviceId: 'jabberMessenger',
              displayName: 'Messenger',
              ciName: 'webex-messenger',
              type: 'PAID',
              isBeta: false,
              isConfigurable: false,
              isIgnored: true
            });
          }
          return authData;
        }).catch(function () {
          return authData;
        });
    }

    function replaceServices(authData) {
      var servicesUrl = UrlConfig.getAdminServiceUrl() + 'organizations/' + authData.orgId + '/services';
      return httpGET(servicesUrl).then(function (res) {
        authData.services = res.data.entitlements;
        return authData;
      });
    }

    function tweakServices(authData) {
      authData.services = _.map(authData.services, function (service) {
        return _.assign(service, {
          ciName: service.ciService || service.ciName,
          serviceId: service.sqService || service.serviceId,
          ciService: undefined,
          sqService: undefined
        });
      });
      return authData;
    }

    function initializeAuthinfo(authData) {
      Authinfo.initialize(authData);
      if (Authinfo.isAdmin() || Authinfo.isReadOnlyAdmin()) {
        return getCustomerAccount(Authinfo.getOrgId())
          .then(function (res) {
            Authinfo.updateAccountInfo(res.data);
            return authData;
          });
      } else {
        return authData;
      }
    }

    function replaceOrTweakServices(res) {
      var authData = _.get(res, 'data');
      var isAdmin = _.intersection(['Full_Admin', 'PARTNER_ADMIN', 'Readonly_Admin', 'PARTNER_READ_ONLY_ADMIN'], authData.roles).length;
      if (isAdmin) {
        return replaceServices(authData);
      } else {
        return tweakServices(authData);
      }
    }

    function handleErrorAndResetAuthinfo(res) {
      Authinfo.clear();
      if (res && res.status === 401) {
        return $q.reject($translate.instant('errors.status401'));
      }
      if (res && res.status === 403) {
        return $q.reject($translate.instant('errors.status403'));
      }
      return $q.reject($translate.instant('errors.serverDown'));
    }

    // helpers

    function httpGET(url) {
      var $http = $injector.get('$http');
      return $http.get(url);
    }

    function httpPOST(url, data, token) {
      var $http = $injector.get('$http');
      return $http({
        method: 'POST',
        url: url,
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + token
        }
      });
    }

    function updateOauthTokens(response) {
      var accessToken = _.get(response, 'data.access_token', '');

      if (_.has(response, 'data.refresh_token')) {
        var refreshToken = _.get(response, 'data.refresh_token');
        TokenService.setRefreshToken(refreshToken);
      }

      Log.info('Update Access Token');
      TokenService.setAccessToken(accessToken);
      TokenService.setAuthorizationHeader(accessToken);

      return accessToken;
    }

    function getOauthState() {
      var state = SessionStorage.get('oauthState') || generateOauthState();
      return state;
    }

    function generateOauthState() {
      var state = Utils.getUUID();
      SessionStorage.put('oauthState', state);
      return state;
    }

    function verifyOauthState(testState) {
      return _.isEqual(testState, getOauthState());
    }

    function logErrorAndReject(message) {
      return function (res) {
        Log.error(message, res && (res.data || res.text));
        return $q.reject(res);
      };
    }

    function getHuronDomain(res) {
      var authData = _.get(res, 'data');
      return HuronCompassService.fetchDomain(authData);
    }
  }
})();

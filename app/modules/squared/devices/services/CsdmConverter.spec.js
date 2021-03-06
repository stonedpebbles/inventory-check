'use strict';

describe('CsdmConverterSpec', function () {
  beforeEach(angular.mock.module('Squared'));

  var converter;

  beforeEach(inject(function (CsdmConverter) {
    converter = CsdmConverter;
  }));

  it('should convert tags', function () {
    var obj = {
      description: '["foo"]'
    };
    expect(converter.convertCloudberryDevice(obj).tags[0]).toBe('foo');
  });

  it('should convert tags for huron devices', function () {
    var obj = {
      description: '["foo", "bar"]'
    };
    expect(converter.convertHuronDevice(obj).tags[0]).toBe('foo');
    expect(converter.convertHuronDevice(obj).tags[1]).toBe('bar');
  });

  it('unknown product should be cleared', function () {
    var arr = [{
      product: 'UNKNOWN'
    }];
    expect(converter.convertCloudberryDevices(arr)[0].product).toBe('');
    expect(converter.convertHuronDevices(arr)[0].product).toBe('');
  });

  it('should set isOnline when status is CONNECTED', function () {
    var arr = [{
      status: {
        connectionStatus: 'CONNECTED'
      }
    }];
    expect(converter.convertCloudberryDevices(arr)[0].isOnline).toBeTruthy();
    expect(converter.convertHuronDevices(arr)[0].isOnline).toBeTruthy();
  });

  it('should not set isOnline when status isnt CONNECTED', function () {
    var arr = [{
      status: {
        connectionStatus: 'foo'
      }
    }];
    expect(converter.convertCloudberryDevices(arr)[0].isOnline).toBeFalsy();
    expect(converter.convertHuronDevices(arr)[0].isOnline).toBeFalsy();
  });

  describe('pass thru fields', function () {

    it('displayName', function () {
      var arr = [{
        displayName: 'bar'
      }];
      expect(converter.convertCloudberryDevices(arr)[0].displayName).toBe('bar');
      expect(converter.convertHuronDevices(arr)[0].displayName).toBe('bar');
    });

    it('mac', function () {
      var arr = [{
        mac: 'bar'
      }];
      expect(converter.convertCloudberryDevices(arr)[0].mac).toBe('bar');
      expect(converter.convertHuronDevices(arr)[0].mac).toBe('bar');
    });

    it('product', function () {
      var arr = [{
        product: 'bar'
      }];
      expect(converter.convertCloudberryDevices(arr)[0].product).toBe('bar');
      expect(converter.convertHuronDevices(arr)[0].product).toBe('bar');
    });

    it('serial', function () {
      var arr = [{
        serial: 'bar'
      }];
      expect(converter.convertCloudberryDevices(arr)[0].serial).toBe('bar');
    });

    it('url', function () {
      var arr = [{
        url: 'foo'
      }];
      expect(converter.convertCloudberryDevices(arr)[0].url).toBe('foo');
      expect(converter.convertHuronDevices(arr)[0].url).toBe('foo');
    });

    it('cisUuid', function () {
      var arr = [{
        cisUuid: 'foo'
      }];
      expect(converter.convertCloudberryDevices(arr)[0].cisUuid).toBe('foo');
      expect(converter.convertHuronDevices(arr)[0].cisUuid).toBe('foo');
    });

    it('accountType', function () {
      var arr = [{
        accountType: 'PERSON'
      }];
      expect(converter.convertCloudberryDevices(arr)[0].accountType).toBe('PERSON');
      expect(converter.convertHuronDevices(arr)[0].accountType).toBe('PERSON');
    });

    it('default accountType', function () {
      var arr = [{}];
      expect(converter.convertCloudberryDevices(arr)[0].accountType).toBe('MACHINE');
      expect(converter.convertHuronDevices(arr)[0].accountType).toBe('PERSON');
    });

    it('photos', function () {
      var arr = [{
        photos: [{
          url: 'foo'
        }]
      }];
      expect(converter.convertCloudberryDevices(arr)[0].photos[0].url).toBe('foo');
      expect(converter.convertHuronDevices(arr)[0].photos[0].url).toBe('foo');
    });

    it('huronId', function () {
      var arr = [{
        url: 'https://cmi.huron-int.com/api/v1/voice/customers/7e88d491-d6ca-4786-82ed-cbe9efb02ad2/sipendpoints/f0b72ba5-0121-452b-a0c8-f6680f660de6'
      }];
      expect(converter.convertHuronDevices(arr)[0].huronId).toBe('f0b72ba5-0121-452b-a0c8-f6680f660de6');
    });

  }); // pass thru fields

  describe('photos', function () {
    it('should handle empty', function () {
      var arr = [{
        photos: []
      }];
      expect(converter.convertCloudberryDevices(arr)[0].photos).toBe(null);
      expect(converter.convertHuronDevices(arr)[0].photos).toBe(null);
    });
    it('should handle null', function () {
      var arr = [{
        photos: null
      }];
      expect(converter.convertCloudberryDevices(arr)[0].photos).toBe(null);
      expect(converter.convertHuronDevices(arr)[0].photos).toBe(null);
    });
  });

  describe('image', function () {
    it('should convert sx10 to correct image', function () {
      var arr = [{
        product: "Cisco TelePresence SX10",
        imageFilename: "tralala.png"
      }];
      expect(converter.convertCloudberryDevices(arr)[0].image).toBe('images/devices-hi/tralala.png');
    });

    it('should convert MODEL_CISCO_7811 to correct image', function () {
      var arr = [{
        product: "MODEL_CISCO_7811",
        imageFilename: "nfdsøafnkdløf.png"
      }];
      expect(converter.convertHuronDevices(arr)[0].image).toBe('images/devices-hi/nfdsøafnkdløf.png');
    });
  });

  describe('state and cssColorClass', function () {
    it('should convert device with issues yellow color and show status', function () {
      var arr = [{
        state: 'CLAIMED',
        status: {
          level: "error",
          connectionStatus: 'CONNECTED'
        }
      }];
      expect(converter.convertCloudberryDevices(arr)[0].state.readableState).toBe('CsdmStatus.OnlineWithIssues');
      expect(converter.convertCloudberryDevices(arr)[0].state.priority).toBe("1");
      expect(converter.convertCloudberryDevices(arr)[0].cssColorClass).toBe('warning');
    });

    it('should convert device with issues yellow color but keep status', function () {
      var arr = [{
        status: {
          level: "error",
          connectionStatus: 'CONNECTED'
        }
      }];
      expect(converter.convertCloudberryDevices(arr)[0].state.readableState).toBe('CsdmStatus.OnlineWithIssues');
      expect(converter.convertCloudberryDevices(arr)[0].state.priority).toBe("1");
      expect(converter.convertCloudberryDevices(arr)[0].cssColorClass).toBe('warning');
    });

    it('should convert state UNCLAIMED to Requires Activation and gray', function () {
      var arr = [{
        state: 'UNCLAIMED'
      }];
      expect(converter.convertCloudberryDevices(arr)[0].state.readableState).toBe('CsdmStatus.RequiresActivation');
      expect(converter.convertCloudberryDevices(arr)[0].state.priority).toBe("3");
      expect(converter.convertCloudberryDevices(arr)[0].cssColorClass).toBe('disabled');
    });

    it('should convert state CLAIMED and connection status CONNECTED to Online and green', function () {
      var arr = [{
        state: 'CLAIMED',
        status: {
          connectionStatus: 'CONNECTED'
        }
      }];
      expect(converter.convertCloudberryDevices(arr)[0].state.readableState).toBe('CsdmStatus.Online');
      expect(converter.convertCloudberryDevices(arr)[0].state.priority).toBe("5");
      expect(converter.convertCloudberryDevices(arr)[0].cssColorClass).toBe('success');
    });

    it('should convert connection status CONNECTED to Online and green', function () {
      var arr = [{
        status: {
          connectionStatus: 'CONNECTED'
        }
      }];
      expect(converter.convertCloudberryDevices(arr)[0].state.readableState).toBe('CsdmStatus.Online');
      expect(converter.convertCloudberryDevices(arr)[0].state.priority).toBe("5");
      expect(converter.convertCloudberryDevices(arr)[0].cssColorClass).toBe('success');
    });

    it('should convert state CLAIMED and connection status UNKNOWN to Offline and red', function () {
      var arr = [{
        state: 'CLAIMED',
        status: {
          connectionStatus: 'UNKNOWN'
        }
      }];
      expect(converter.convertCloudberryDevices(arr)[0].state.readableState).toBe('CsdmStatus.Offline');
      expect(converter.convertCloudberryDevices(arr)[0].state.priority).toBe("2");
      expect(converter.convertCloudberryDevices(arr)[0].cssColorClass).toBe('danger');
    });

    it('should convert connection status UNKNOWN to Offline and red', function () {
      var arr = [{
        status: {
          connectionStatus: 'UNKNOWN'
        }
      }];
      expect(converter.convertCloudberryDevices(arr)[0].state.readableState).toBe('CsdmStatus.Offline');
      expect(converter.convertCloudberryDevices(arr)[0].state.priority).toBe("2");
      expect(converter.convertCloudberryDevices(arr)[0].cssColorClass).toBe('danger');
    });

    it('should convert state CLAIMED and no connection status to Offline and red', function () {
      var arr = [{
        state: 'CLAIMED'
      }];
      expect(converter.convertCloudberryDevices(arr)[0].state.readableState).toBe('CsdmStatus.Offline');
      expect(converter.convertCloudberryDevices(arr)[0].state.priority).toBe("2");
      expect(converter.convertCloudberryDevices(arr)[0].cssColorClass).toBe('danger');
    });

  }); // aggregatedState & cssColorClass

  describe("software event", function () {
    it('should convert software', function () {
      var arr = [{
        status: {
          events: [{
            type: 'software',
            level: 'INFO',
            description: 'sw_version'
          }]
        }
      }];
      expect(converter.convertCloudberryDevices(arr)[0].software).toBe('sw_version');
    });

    it('should not fail when no software events', function () {
      var arr = [{
        status: {}
      }];
      expect(converter.convertCloudberryDevices(arr)[0].software).toBeFalsy();
    });
  });

  describe("ip event", function () {
    it('should convert ip', function () {
      var arr = [{
        status: {
          events: [{
            type: 'ip',
            level: 'INFO',
            description: 'ip_addr'
          }]
        }
      }];
      expect(converter.convertCloudberryDevices(arr)[0].ip).toBe('ip_addr');
    });
  });

  describe("diagnostics events", function () {
    xit('should show localized tcpfallback', function () {
      var arr = [{
        status: {
          events: [{
            type: 'mediaProtocol',
            level: 'warn',
            description: 'tcpfallback_description',
            references: {
              mediaProtocol: 'TCP'
            }
          }]
        }
      }];
      expect(converter.convertCloudberryDevices(arr)[0].diagnosticsEvents[0].type).toBe('Potential Loss of Video Quality');
      expect(converter.convertCloudberryDevices(arr)[0].diagnosticsEvents[0].message).toBe('This device is communicating via the TCP protocol, which could cause higher latency and therefore reduced media streaming experience. If you are experiencing issues with your media streaming, you can try to open UDP port 33434 on your local firewall to aid media streaming issues.');
    });

    it('should show unknown error occured when not in translate file and no description', function () {
      var arr = [{
        status: {
          level: 'omg',
          connectionStatus: 'CONNECTED',
          events: [{
            type: 'foo',
            level: 'warn'
          }]
        }
      }];
      expect(converter.convertCloudberryDevices(arr)[0].diagnosticsEvents[0].type).toBe('CsdmStatus.errorCodes.unknown.type');
      expect(converter.convertCloudberryDevices(arr)[0].diagnosticsEvents[0].message).toBe('CsdmStatus.errorCodes.unknown.message');
    });
  });

  describe("has issues", function () {
    it('has issues when status.level is not ok', function () {
      var arr = [{
        status: {
          level: 'not_ok',
          connectionStatus: 'CONNECTED'
        }
      }];
      expect(converter.convertCloudberryDevices(arr)[0].hasIssues).toBeTruthy();
    });

    it('has does not have issues when status.level is not ok and device is OFFLINE', function () {
      var arr = [{
        status: {
          level: 'not_ok',
          connectionStatus: 'OFFLINE'
        }
      }];
      expect(converter.convertCloudberryDevices(arr)[0].hasIssues).toBeFalsy();
    });

    it('has does not have issues when status.level is ok', function () {
      var arr = [{
        status: {
          level: 'OK',
          connectionStatus: 'CONNECTED'
        }
      }];
      expect(converter.convertCloudberryDevices(arr)[0].hasIssues).toBeFalsy();
    });
  });

  describe("lastConnectionTime", function () {
    it('when long ago', function () {
      var arr = [{
        status: {
          lastStatusReceivedTime: '2015-01-09T08:00:00Z',
          connectionStatus: 'UNKNOWN'
        }
      }];
      expect(converter.convertCloudberryDevices(arr)[0].lastConnectionTime.substring(0, 11) == "Jan 9, 2015").toBeTruthy();
    });

    it('when today', function () {
      var arr = [{
        status: {
          lastStatusReceivedTime: new Date(),
          connectionStatus: 'UNKNOWN'
        }
      }];
      expect(converter.convertCloudberryDevices(arr)[0].lastConnectionTime.substring(0, 8) == "Today at").toBeTruthy();
    });

    it('when null', function () {
      var arr = [{
        status: {
          connectionStatus: 'UNKNOWN'
        }
      }];
      expect(converter.convertCloudberryDevices(arr)[0].lastConnectionTime).toBeFalsy();
    });
  });

  describe("remote support user", function () {
    it('rsuKey is taken from remoteSupportUser on device', function () {
      var token = 'this_is_a_very_secret_token';
      var arr = [{
        remoteSupportUser: {
          token: token
        }
      }];
      expect(converter.convertCloudberryDevices(arr)[0].rsuKey).toBe(token);
    });

    it('no remoteSupportUser means no rsuKey, no nullReferences', function () {
      expect(converter.convertCloudberryDevices([{}]).rsuKey).toBeFalsy();
    });
  });
});

'use strict';
angular.module('uc.callrouter')

.constant('CustomComboboxconfig', {
  openClass: 'open',
  focusClass: 'focus'
})

.controller('CustomComboboxCtrl', CustomComboboxCtrl);
/* @ngInject */
function CustomComboboxCtrl($scope, $attrs, $parse, CustomComboboxconfig, dropdownService, $animate) {
  var self = this,
    scope = $scope.$new(), // create a child scope so we are not polluting original one
    openClass = CustomComboboxconfig.openClass,
    getIsOpen,
    setIsOpen = angular.noop,
    focusClass = CustomComboboxconfig.focusClass,
    getIsFocused,
    setIsFocused = angular.noop,
    toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop;

  this.changeFunction = function () {
    if (angular.isFunction(this.onChangeFn)) {
      this.onChangeFn();
    }
  };

  this.init = function (element) {
    self.$element = element;

    if ($attrs.isOpen) {
      getIsOpen = $parse($attrs.isOpen);
      setIsOpen = getIsOpen.assign;

      $scope.$watch(getIsOpen, function (value) {
        scope.isOpen = !!value;
      });
    }
    if ($attrs.isFocused) {
      getIsFocused = $parse($attrs.isFocused);
      setIsFocused = getIsFocused.assign;

      $scope.$watch(getIsFocused, function (value) {
        scope.isFocused = !!value;
      });
    }
  };

  this.toggle = function (open) {
    scope.isOpen = arguments.length ? !!open : !scope.isOpen;
    return scope.isOpen;
  };

  // Allow other directives to watch status
  this.isOpen = function () {
    return scope.isOpen;
  };

  this.isFocused = function () {
    return scope.isFocused;
  };

  scope.getToggleElement = function () {
    return self.toggleElement;
  };

  scope.focusToggleElement = function () {
    if (self.toggleElement) {
      self.toggleElement[0].focus();
    }
  };

  scope.$watch('isOpen', function (isOpen, wasOpen) {
    $animate[isOpen ? 'addClass' : 'removeClass'](self.$element, openClass);

    if (isOpen) {
      scope.focusToggleElement();
      dropdownService.open(scope);
    } else {
      dropdownService.close(scope);
    }

    setIsOpen($scope, isOpen);
    if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
      toggleInvoker($scope, {
        open: !!isOpen
      });
    }
  });

  scope.$watch('isFocused', function (isFocused, wasFocused) {
    $animate[isFocused ? 'addClass' : 'removeClass'](self.$element, focusClass);

    setIsFocused($scope, isFocused);
    if (angular.isDefined(isFocused) && isFocused !== wasFocused) {
      toggleInvoker($scope, {
        focus: !!isFocused
      });
    }
  });

  $scope.$on('$locationChangeSuccess', function () {
    scope.isOpen = false;
    scope.isFocused = false;
  });

  $scope.$on('$destroy', function () {
    scope.$destroy();
  });
}

angular.module('uc.callrouter').directive('customCombobox', function () {
  return {
    restrict: 'CA',
    require: '?^csCustomCombobox',
    link: function (scope, element, attrs, cbCtrl) {
      cbCtrl.init(element);
    }
  };
})

.directive('csCustomComboboxToggle', function () {
  return {
    require: '?^csCustomCombobox',
    restrict: 'CA',
    link: function (scope, element, attrs, cbCtrl) {
      if (!cbCtrl) {
        return;
      }
      cbCtrl.toggleElement = element;

      var toggleCombobox = function (event) {
        event.preventDefault();

        var input = element.find('input');

        if (!element.hasClass('disabled') && !attrs.disabled && !cbCtrl.isOpen()) {
          scope.$apply(function () {
            cbCtrl.toggle();
            input[0].focus();
          });
        }
      };

      element.bind('click', toggleCombobox);

      // WAI-ARIA
      element.attr({
        'aria-haspopup': true,
        'aria-expanded': false
      });
      scope.$watch(cbCtrl.isOpen, function (isOpen) {
        element.attr('aria-expanded', !!isOpen);
      });

      scope.$on('$destroy', function () {
        element.unbind('click', toggleCombobox);
      });
    }
  };
})

.directive('customComboSearch', function () {
  return {
    controller: 'CustomComboboxCtrl',
    restrict: 'A',
    require: 'ngModel',
    scope: {
      onChangeFn: '&'
    },
    link: function (scope, element, attrs, ngModel) {
      scope.newValue = ngModel.$viewValue;
      ngModel.$parsers.push(function (value) {
        scope.onChangeFn();
        scope.newValue = value;
        return value;
      });
    }
  };
})

.directive('csCustomCombobox', function () {
  return {
    restrict: 'E',
    // replace: true,
    templateUrl: 'modules/huron/callRouter/companyNumber/CustomCombobox.tpl.html',
    require: 'ngModel',
    controller: 'CustomComboboxCtrl',
    scope: {
      id: '=',
      name: '@',
      value: '=ngModel',
      list: '=',
      required: '=',
      onChangeFn: '&',
      addText: '=addtext',
      myOptions: '=options',
      maxLength: '=ngMaxlength'
    },
    compile: function compile() {
      return {
        pre: function preLink(scope, element, attrs, cbCtrl) {

          scope.onChangeFn();
          // If options were not provided, initialize an empty default
          scope.options = scope.myOptions || {
            validation: {}
          };

          scope.$watch('value', function (newValue) {
            scope.onChangeFn();
            scope.newValue = newValue;
          });
        },
        post: function postLink(scope, element, attrs, cbCtrl) {
          var input = element.find('input');

          scope.$watch('value', function (newValue) {
            scope.newValue = newValue;
          });

          scope.selectItem = function () {
            cbCtrl.$setViewValue(this.item);
            scope.value = this.item;
            input[0].focus();

          };
          scope.addItem = function () {
            scope.value = '';
            input[0].focus();
            cbCtrl.toggleElement[0].focus();
          };
        }
      };
    }
  };
})

;
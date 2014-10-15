angular.module('foundation.tabs', []);

angular.module('foundation.tabs')
  .controller('FaTabsController', ['$scope', 'FoundationApi', function FaTabsController($scope, foundationApi) {
    var controller = this;
    var tabs = controller.tabs = $scope.tabs = [];
    var id = '';

    controller.select = function(selectTab) {
      angular.forEach(tabs, function(tab) {
        tab.active = false;
        tab.scope.active = false;

        if(tab.scope == selectTab) {
          foundationApi.publish(id, ['activate', tab]);

          tab.active = true;
          tab.scope.active = true;
        }
      });
    };

    controller.addTab = function addTab(tabScope) {
      tabs.push({ scope: tabScope});

      if(tabs.length === 1) {
        tabs[0].active = true;
        tabScope.active = true;
      }
    };

    controller.getId = function() {
      return id;
    };

    controller.setId = function(newId) {
      id = newId;
    };
}]);

/* Foundation Tabs
 * creates a tabs collection and displays header tabs
 *
 */
angular.module('foundation.tabs')
  .directive('faTabs', ['FoundationApi', function(foundationApi) {
  return {
    restrict: 'EA',
    transclude: 'true',
    replace: true,
    templateUrl: '/partials/tabs.html',
    controller: 'FaTabsController',
    scope: true, //creates new scope
    compile: function(tElement, tAttr) {
      return {
        pre: function preLink(scope, element, attrs, controller) {
        },
        post: function postLink(scope, element, attrs, controller) {
          scope.id = attrs.id || foundationApi.generateUuid();
          attrs.$set('id', scope.id);
          controller.setId('1');
          console.log(scope.id);

          //update tabs in case tab-content doesn't have them
          var updateTabs = foundationApi.publish(scope.id, scope.tabs);

          foundationApi.subscribe(scope.id + '-get-tabs', function() {
            updateTabs();
          });
        }
      };
    }
  };
}]);

/* uses Tab collection to display tabs and activates them when needed */
angular.module('foundation.tabs')
  .directive('faTabContent', ['FoundationApi', function(foundationApi) {
  return {
    restrict: 'A',
    transclude: 'true',
    replace: true,
    scope: {
      tabs: '=?',
      target: '@'
    },
    templateUrl: 'partials/tab-content.html',
    compile: function(tElement, tAttr) {
      return {
        post: function postLink(scope, element, attrs, ctrl) {
          scope.tabs = scope.tabs || [];
          var id = scope.target;

          foundationApi.subscribe(id, function(msg) {
            if(msg[0] == 'activate') {
              var tabId = msg[1];
              angular.forEach(scope.tabs, function (tab) {
                tab.scope.active = false;
                tab.active = false;

                if(tab.scope.id === id) {
                  tab.scope.active = true;
                  tab.active = true;
                }
              });
            }
          });


          //if tabs empty, request tabs
          if(scope.tabs === []) {
            foundationApi.subscribe(id + '-tabs', function(tabs) {
              scope.tabs = tabs;
            });

            foundationApi.publish(id + '-get-tabs', '');
          }
        }
      };
    }
  };
}]);

angular.module('foundation.tabs')
  .directive('faTab', ['FoundationApi', function(foundationApi) {
    return {
      restrict: 'EA',
      templateUrl: '/partials/tab.html',
      transclude: true,
      scope: {
        title: '@'
      },
      require: '^faTabs',
      controller: function() { },
      replace: true,
      compile: function(tElement, tAttr) {

        return {
          post: function postLink(scope, element, attrs, controller, transclude) {
            console.log(scope);
            scope.id = attrs.id || foundationApi.generateUuid();
            scope.active = false;
            scope.transcludeFn = transclude;
            controller.addTab(scope);

            scope.makeActive = function() {
              controller.select(scope);
            };
          }
        };
      }
    };
}]);

angular.module('foundation.tabs')
  .directive('faTabIndividual', ['FoundationApi', function(foundationApi) {
    return {
      restrict: 'A',
      transclude: 'true',
      replace: false,
      link: function postLink(scope, element, attrs, ctrl, transclude) {
        var tab = scope.$eval(attrs.tab);

        tab.scope.transcludeFn(tab.$parent, function(tabContent) {
          element.append(tabContent);
        });

      }
    };
}]);

angular.module('foundation.tabs')
  .directive('faTabHref', ['FoundationApi', function(foundationApi) {
    return {
      restrict: 'A',
      replace: false,
      link: function postLink(scope, element, attrs, ctrl) {
        var target = attrs['fa-tab-href'];
      }
    };
}]);
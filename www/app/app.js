// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('romina', ['ionic', 'ngSanitize'])

.run(function($ionicPlatform, $rootScope) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

  $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
    console.log("stateChangeError:");
    console.log(error);
  });

  $rootScope.$on("$stateNotFound", function(event, unfoundState, fromState) {
    console.log("stateNotFound:");
    console.log(unfoundState);
    console.log(fromState);
  });

})

.config(function($stateProvider, $urlRouterProvider, $httpProvider){

      $httpProvider.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';



      $stateProvider

          .state('app', {
              'url' : '/app',
              'abstract' : true,
              'templateUrl' : 'app/nav.html',
              'controller'  : 'NavCtrl' 
          })
          .state('app.menu', {
              url : '/menu',
              views : {
                  'menuContent' :{
                    templateUrl : "app/home.html",
                   'controller'  : 'MenuCtrl'
                  }

              },
          })
           .state('app.events', {
               url : '/events',
               views : {
                   'menuContent' :{
                     templateUrl : "app/events.html",
                    'controller'  : 'EventsCtrl'
                   }

               },
           }) 
          .state('app.landing', {
              'url' : '/landing',
              views : {
                'menuContent' : {
                  'templateUrl' : 'app/landing.html'
                }
              }
          })

          .state('app.group', {
              'url' : '/group/:index',
              views : {
                'menuContent' : {
                  'templateUrl' : 'app/group.html',
                   'controller'  : 'GroupCtrl',
                }
              }
              
          });
          //.state('menu', {
          //  //'controller'  : 'MenuCtrl',
          //  'url'  : '/menu',
          //  'templateUrl' : 'app/menu.html'
          //});

            $urlRouterProvider.otherwise('/app/landing');

})

.controller('MenuCtrl', function($scope, menu, $ionicLoading){


        $ionicLoading.show({
            'template' : '<i class="ion-loading-c"></i><br>Loading...'
        });

        menu.ready.then(function(){
            $ionicLoading.hide();
            $scope.menu = menu.list;
        });

})


.factory('group', function($http){

    var group = {};
    group.list = [];
    var slug;
    group.init = function($params)
    {
        slug = $params;
    };

    group.getFoods = function( slug ){

    var location = window.localStorage['location'];
    
        var url = 'http://romina.app:8888/api/?location=' + location + '&groupSlug=' + slug;


        return $http.get(url)
                 .then(function(response){
                  group.list = response.data;      


                })
    };

    return group;
})

.factory('menu', function($http, $q){

        var menu = {};
        var n = 0;
        menu.list = [];


        var location = window.localStorage['location'] || 'kazanchis';

        menu.get = function(){
            return $http.get('http://romina.app:8888/api/?location=' + location +'&groups=all')
                .then(function(response){
                   menu.list = response.data;
                })
        }

        menu.ready = $q.all([
            menu.get()
        ]);

        return menu;
})


.controller('GroupCtrl', function($ionicLoading, $scope, $stateParams, group){

        $scope.groupName = $stateParams['index'];
        $ionicLoading.show({
            'template' : '<i class="ion-loading-c"></i><br>Loading...'
        });

        group.getFoods($stateParams['index']).then(function(){
            $ionicLoading.hide();
            $scope.foods = group.list;
        });

        
})

.controller('EventsCtrl', ['$scope', '$sce', 'RominaEvents', '$ionicLoading',function($scope,  $sce, RominaEvents, $ionicLoading){

        $ionicLoading.show({
            'template' : '<i class="ion-loading-c"></i><br>Loading...'
        });

        RominaEvents.get().then(function(){
            $ionicLoading.hide();
            $scope.events = RominaEvents.list;
        });

        $scope.deliberatelyTrustDangerousSnippet = function($title) {
               return $sce.trustAsHtml($title);
          };

        
}])

.factory('RominaEvents', function($http, $q){

  var RominaEvents = {};
  var n = 0;
  RominaEvents.list = [];

  RominaEvents.get = function(){

      return $http.get('http://romina.app:8888/api/?events=all', {
        headers: {
            'Accept': 'application/json, text/javascript',
                'Content-Type': 'application/json; charset=utf-8'
        },
      })
          .then(function(response){
             RominaEvents.list = response.data;
          })
  }

  RominaEvents.ready = $q.all([
      RominaEvents.get()
  ]);

  return RominaEvents;

})


.controller('NavCtrl', function(menu, $state, $scope, $ionicPopover,$ionicLoading,$window) {

  // .fromTemplateUrl() method
  $ionicPopover.fromTemplateUrl('my-popover.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });


  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
  

$scope.Locations = [
{text: 'Kazanchis', value: 'kazanchis'},
{text: '4 Killo', value: '4killo'}
];
  $scope.selectedLocation = window.localStorage['Selectedlocation'] || 'Kazanchis';

  window.localStorage['location'] = 'kazanchis';
  window.localStorage['Selectedlocation'] = 'Kazanchis';

  $scope.setLocation = function(RominaLocation)
  {

      window.localStorage['Selectedlocation'] = RominaLocation.text;

      window.localStorage['location'] = RominaLocation.value;
      
      $scope.selectedLocation = RominaLocation.text;


      //this would have hidden the pop over up on selection
       $scope.popover.hide();

      // reload it to bust the cache 
      $state.go('app.menu', {}, {reload: true}).then(function(){
        setTimeout(function() {
          $window.location.reload(true);
        }, 0);
      })
      
  }
})

.filter('beautify', function(){

    return function(text)
    {
      return text.replace(/(-\S+)/gi,"");
    }

})

.filter('utf8decode', function(){
  return function(str_data) {
    return unescape(encodeURIComponent(str_data));
}
})
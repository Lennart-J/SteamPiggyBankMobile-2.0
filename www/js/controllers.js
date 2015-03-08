'use strict';
angular.module('SteamPiggyBank.controllers', ['ngAnimate'])

.controller('IntroCtrl', function($scope, requestService, $state, $http, $q, $ionicScrollDelegate, $ionicSideMenuDelegate, $ionicBackdrop, $ionicSlideBoxDelegate, $ionicGesture, $ionicNavBarDelegate) {
  
  var mainSlider = angular.element(document.querySelector('.slider-slides')),
    swipeGesture = null;

  var promiseDailyDeal = requestService.getFrontPageDeals();
  promiseDailyDeal.then(function(data) {
    $scope.dailyDeal = data;
    console.log("DailyDeal: ", data);
  });

  var promiseFeaturedDeals = requestService.getFeaturedDeals();
  promiseFeaturedDeals.then(function(data) {
    $scope.featuredDeals = data;
    $ionicSlideBoxDelegate.$getByHandle('gallery-slider').update();
    console.log("FeaturedDeals: ", data);
  });

  var promiseAllApps = requestService.getAllApps();
  promiseAllApps.then(function(data) {
    console.log(data);
  }, function(reason) {
    console.log(reason);
  }, function(update) {
    console.log(update);
    $scope.appItems = update;
  });


  // Called to navigate to the main app
  $scope.startApp = function() {
    $state.go('main');
  };
  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };
  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  };
  $scope.slide = function(index) {
    $ionicSlideBoxDelegate.slide(index);
  };

  // Called each time the slide changes
  $scope.slideChanged = function(index) {
    $scope.slideIndex = index;
    if (index === 0) {
      setNavTitle('Special Deals');

    } else if(index === 1){
      setNavTitle('All Current Deals');

    }
  };

  var setNavTitle = function(title) {
    $ionicNavBarDelegate.title(title);
  };

    $scope.toggleLeft = function() {
      $ionicSideMenuDelegate.toggleLeft();

    };

  $scope.$watch($ionicSideMenuDelegate.isOpenLeft, function(bool) {
    console.log("watch isOpenLeft: ", bool);
    if (bool) {
      $ionicSlideBoxDelegate.$getByHandle('main-slider').enableSlide(false);
      $ionicSlideBoxDelegate.$getByHandle('gallery-slider').enableSlide(false);
    } else {
      $ionicSlideBoxDelegate.$getByHandle('main-slider').enableSlide(true);
      $ionicSlideBoxDelegate.$getByHandle('gallery-slider').enableSlide(true);
    }
  });

// ????
//    $scope.$watch($ionicSlideBoxDelegate.currentIndex, function(index) {
//      console.log("watch slideIndex: ", index);
//      if (index === 0) {
//        swipeGesture = $ionicGesture.on('swiperight', showSideMenuOnSwipe, mainSlider);
//      } else if (swipeGesture !== null) {
//        $ionicGesture.off(swipeGesture, 'swiperight', showSideMenuOnSwipe);
//     }
//    });

 $scope.sliding = function() {
    var scrollPos = $ionicScrollDelegate.getScrollPosition().top;
    $ionicScrollDelegate.scrollTo(15, scrollPos, false);
    $ionicSlideBoxDelegate.$getByHandle('main-slider').enableSlide(true);

  };
  $scope.scrolling = function() {
    $ionicSlideBoxDelegate.$getByHandle('main-slider').enableSlide(false);
  };

 })

.controller('MainCtrl', function($scope, $state) {
  console.log('MainCtrl');

  $scope.toIntro = function() {
    $state.go('intro');
  };
})

.controller('GalleryCtrl', function($scope, $ionicSlideBoxDelegate) {
  $scope.showNext = function() {
    $ionicSlideBoxDelegate.next();
  };
  $scope.showPrev = function() {
    $ionicSlideBoxDelegate.previous();
  };
  $scope.slide = function(index) {
    $ionicSlideBoxDelegate.slide(index);
  };
  $scope.slideChanged = function(index) {
    $scope.slideIndex = index;
  };
  $scope.onTouch = function() {
    $ionicSlideBoxDelegate.$getByHandle('main-slider').enableSlide(false);
    $ionicScrollDelegate.getScrollView().options.scrollingY = false;

  };
  $scope.onRelease = function() {
    $ionicSlideBoxDelegate.$getByHandle('main-slider').enableSlide(true);
    $ionicScrollDelegate.getScrollView().options.scrollingY = true;
  };

  $scope.getDealName = function() {
    return "Featured Deals";
  };
});
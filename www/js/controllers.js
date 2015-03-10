'use strict';
angular.module('SteamPiggyBank.controllers', ['ngAnimate'])

.controller('IntroCtrl', function($scope, requestService, $state, $http, $q, $ionicScrollDelegate, $ionicSideMenuDelegate, $ionicBackdrop, $ionicSlideBoxDelegate, $ionicGesture, $ionicNavBarDelegate, $ionicLoading) {

  var mainSlider = angular.element(document.querySelector('.slider-slides')),
    swipeGesture = null;

  var promiseDailyDeal = requestService.getFrontPageDeals();
  promiseDailyDeal.then(function(data) {
    $scope.dailyDeal = data;
    console.log("DailyDeal: ", data);
    updateLoadingIndicator();
  });

  var promiseFeaturedDeals = requestService.getFeaturedDeals();
  promiseFeaturedDeals.then(function(data) {
    $scope.featuredDeals = data;
    $ionicSlideBoxDelegate.$getByHandle('gallery-slider').update();
    console.log("FeaturedDeals: ", data);
    updateLoadingIndicator();
  });

  var promiseAllApps = requestService.getAllApps();
  promiseAllApps.then(function(data) {
    //console.log(data);
  }, function(reason) {
    //console.log(reason);
  }, function(update) {
    //console.log(update);
    $scope.appItems = update;
    updateLoadingIndicator();
  });

  $scope.loadingIndicator = $ionicLoading.show({
    content: 'Loading Data',
    animation: 'fade-in',
    showBackdrop: false,
    maxWidth: 200,
    showDelay: 500
  });

  var updateLoadingIndicator = function() {
    if ($scope.dailyDeal && $scope.featuredDeals.length > 0 && $scope.appItems.length > 10) {
      $scope.loadingIndicator.hide();
    } else {
      $scope.loadingIndicator = $ionicLoading.show({
        template: '<i class="icon ion-loading-c" style="font-size: 32px"></i>',
        animation: 'fade-in',
        noBackdrop: false
      });
    }
  };

  // Called to navigate to the main app
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

    } else if (index === 1) {
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
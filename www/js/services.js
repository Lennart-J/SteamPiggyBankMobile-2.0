'use strict';
angular.module('SteamPiggyBank.services', [])

.service('util', function() {
  var currencyLocaleMap = {
    "GBP": "en-GB",
    "USD": "en-US",
    "EUR": "de-DE",
    "RUB": "ru-AD",
    "BRL": "br-DF",
    "JPY": "ja-JP",
    "IDR": "en",
    "MYR": "en",
    "PHP": "ph",
    "SGD": "en",
    "THB": "th",
    "AUD": "en-AU",
    "NZD": "en-NZ",
    "CAD": "en-CA",
    "NOK": "no",
    "KRW": "en",
    "TRY": "en",
    "MXN": "en"
  };

  this.formatPrice = function(val, currency) {
    var locale = currencyLocaleMap[currency];

    if (locale !== "") {
      return Number(val.toFixed(2) / 100).toLocaleString(locale, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2
      }).replace(/\s/g,'');
    } else {
      return Number(val.toFixed(2) / 100).toLocaleString({
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2
      }).replace(/\s/g,'');
    }
  }
})

.service('requestService', function($http, $q, util) {

  var allAppsOnSale = [];

  this.getCurrentApp = function(appId) {
    for (var i = 0; i < allAppsOnSale.length; i++) {
        if (allAppsOnSale[i].appid === appId) {
          return allAppsOnSale[i];
        }
      }
      return null;
  };


  this.getAllApps = function() {
    var XHRs = [],
      response = '',
      parent = {},
      currentPage = 1,
      maxPage = 0,
      tmpList = [],
      allItemsOnSale = [],
      $data,
      status = 0,
      allUserTags = [],
      defer = $q.defer();

    // first call to access information like maxPage
    $http.get('http://store.steampowered.com/search/?specials=1')
      .success(function(data) {
        $data = $(data.replace(/<img\b[^>]*>/ig, ''));
        parent = $data.find('#search_result_container');
        maxPage = findLastSalePage($data);
        tmpList = findSaleItems(parent);
        allUserTags = findAllUserTags($data);

        allItemsOnSale = allItemsOnSale.concat(parseDOMElementList(tmpList));
        currentPage++;
        tmpList = [];

        for (; currentPage <= maxPage; currentPage++) {
          XHRs.push(
            $http.get('http://store.steampowered.com/search/?specials=1&page=' + currentPage)
            .success(function(data) {
              $data = $(data.replace(/<img\b[^>]*>/ig, ''));
              parent = $data.find('#search_result_container');
              tmpList = findSaleItems(parent);
              allItemsOnSale = allItemsOnSale.concat(parseDOMElementList(tmpList));
              defer.notify(allItemsOnSale);
              allAppsOnSale = allItemsOnSale;
              tmpList = [];
            })
          );
          //TODO resolve when all done
        }
      });

    // defer.resolve(allItemsOnSale);

    return defer.promise;
  };

  this.getFrontPageDeals = function() {
    var $data,
      defer = $q.defer(),
      dailyDeal = {};

    $http.get('http://store.steampowered.com/?forceMobile=0')
      .success(function(data) {
        $data = $(data.replace(/<img\b[^>]*>/ig, ''));
        // parent = $data.find('#search_result_container');

        dailyDeal = findDailyDeal($data);
        defer.resolve(dailyDeal);
      });

    return defer.promise;
  };

  this.getFeaturedDeals = function() {
    var defer = $q.defer(),
      featuredDeals = [];

    $http.get('http://store.steampowered.com/api/featuredcategories/')
      .success(function(data) {
        featuredDeals = parseFeaturedDeals(data);
        defer.resolve(featuredDeals);
      });

    return defer.promise;
  };


  //private functions
  var findLastSalePage = function(parent) {
    return parent.find('.pagebtn').prev().html();
  };

  var findSaleItems = function(parent) {
    return parent.find('.search_rule').next().children('a');
  };

  var findAllUserTags = function(parent) {
    var tagArray = [],
      tagElements = parent.find('#TagFilter_Container .tab_filter_control');

    $.each(tagElements, function(key, el) {
      tagArray.push($(el).data('loc'));
    });

    return tagArray;
  };

  var parseDOMElementList = function(list) {
    var appitems = [],
      appitem = {};
    $.each(list, function(key, el) {
      var $el = $(el),
        urcText = getUserReviewScoreText($el);


      appitem.appid = getAppId($el);
      appitem.packageid = getPackageId($el);
      appitem.name = getName($el);
      appitem.released = getReleaseDate($el);
      appitem.originalprice = getOriginalPrice($el);
      appitem.finalprice = getFinalPrice($el);
      appitem.discount = getDiscount($el);
      appitem.urcText = urcText;
      appitem.urcScore = getUrcScore(urcText);
      appitem.urcClass = getUserReviewScoreClass($el);
      appitem.imageUrl = appitem.packageid ? getPackageImage(appitem.packageid) : getAppImage(appitem.appid);



      appitems.push(appitem);
      appitem = {};
    });

    return appitems;

    function getAppId(element) {
      return element.data('dsAppid').toString();
    }

    function getPackageId(element) {
      var pid = element.data('dsPackageid');
      return pid ? pid.toString() : undefined;
    }

    function getName(element) {
      return element.find('.title').html();
    }

    function getReleaseDate(element) {
      return element.find('.search_released').html();
    }

    function getOriginalPrice(element) {
      return element.find('strike').html();
    }

    function getFinalPrice(element) {
      return element.find('.search_price.discounted').contents()
        .filter(function() {
          return this.nodeType === Node.TEXT_NODE;
        }).last().text();
    }

    function getDiscount(element) {
      return element.find('.search_discount span').text();
    }

    function getAppImage(appid) {
      return "http://cdn.akamai.steamstatic.com/steam/apps/" + appid + "/capsule_184x69.jpg";
    }

    function getPackageImage(packageid) {
      return "http://cdn.akamai.steamstatic.com/steam/subs/" + packageid + "/capsule_sm_120.jpg";
    }

    function getUserReviewScoreClass(element) {
      var el = element.find('.search_reviewscore span');

      if (el.hasClass('positive')) {
        return 'positive';
      } else if (el.hasClass('positive')) {
        return 'mixed';
      } else if (el.hasClass('negative')) {
        return 'negative';
      }
    }

    function getUserReviewScoreText(element) {
      return element.find('.search_reviewscore span').data('storeTooltip');
    }

    function getUrcScore(str) {
      if (str === undefined) return;
      var urcPercent = findUrcPercent(str) / 100,
        urcCount = findUrcCount(str.replace(/\d+%/g));

      return (urcPercent - (1 - urcPercent)) * urcCount;

      function findUrcPercent(str) {
        var pattern = /\d+%/g;
        return parseInt(pattern.exec(str)[0].replace('%', ''));
      }

      function findUrcCount(str) {
        var pattern = /\d+(,)?\d+/g,
          result = pattern.exec(str);
        if (result !== null) {
          return parseInt(result[0].replace(',', ''));
        }
      }
    }

    function parseUserTags(parent) {
      var arr = [];

      $.each(parent.find('.app_tag'), function(key, el) {
        arr.push($(el).html());
      });
      console.log('usertags: ', arr);

      return arr;
    }
  };

  var findDailyDeal = function(page) {
    var parent = page.find('.dailydeal_ctn'),
      dealitem = {};

    //console.log(parent, page);
    // dealitem.name = getName(parent);
    dealitem.appid = getAppId(parent);
    dealitem.packageid = getPackageId(parent);
    dealitem.originalprice = getOriginalPrice(parent);
    dealitem.finalprice = getFinalPrice(parent);
    dealitem.discount = getDiscountPercent(parent);
    dealitem.timeremaining = getTimeRemaining(parent);

    return dealitem;

    function getAppId(parent) {
      return parent.find('.dailydeal_cap').data('dsAppid').toString();
    }

    function getPackageId(parent) {
      var pid = parent.find('dailydeal_cap').data('dsPackageid');
      return pid ? pid.toString() : undefined;
    }

    function getOriginalPrice(parent) {
      return parent.find('.discount_original_price').html();
    }

    function getFinalPrice(parent) {
      return parent.find('.discount_final_price').html();
    }

    function getDiscountPercent(parent) {
      return parent.find('.discount_pct').html();
    }

    function getTimeRemaining(parent) {
      return parent.find('.dailydeal_countdown').html();
    }
  };

  var parseFeaturedDeals = function(json) {
    var featuredDeals = [];

    if (json.specials && json.specials.items) {
      $.each(json.specials.items, function(key, el) {
        var deal = {};

        if (el.discounted) {
          if (el.type === 0) {
            deal.appid = el.id;
            deal.packageid = null;
          } else if (el.type === 1) {
            deal.packageid = el.id;
            deal.appid = null;
          }
          deal.name = el.name;
          deal.originalprice = util.formatPrice(el.original_price, el.currency);
          deal.finalprice = util.formatPrice(el.final_price, el.currency);
          deal.discount = "-" + el.discount_percent + "%";
          deal.imageUrl = el.large_capsule_image;
          deal.currency = el.currency;
          deal.platforms = {
            windows: el.windows_available,
            mac: el.mac_available,
            linux: el.linux_available,
          }


          featuredDeals.push(deal);
        }

      });
    }

    return featuredDeals;
  };
});
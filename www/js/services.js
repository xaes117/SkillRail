angular.module('app.services', ['ngResource'])

  .service('Login', function ($http, $httpParamSerializerJQLike, $state, PopUpManager, Token, ProfileManager, Loading) {
    // POSTs login details and returns object containing either
    return {
      login: function (user) {
        Loading.show();

        this.attemptLogin(user).then(function (value) {

          if (value.status == 200) {

            var token = value.data['access_token'];
            Token.setProperty(token);

            ProfileManager.loadProfile(Token.getProperty()).then(function (response) {

              if (response.data.isStudent) {
                $state.go("tabsController.home");
              } else {
                PopUpManager.alert("You need a student account to login");
              }
            });
          }
        }, function (error) {
          PopUpManager.alert(error.statusText);
          console.log(error);
        }).finally(function(){
          Loading.hide();
        });
      },

      attemptLogin: function (user) {
        return $http({
          method: 'POST',
          url: url + '/Token',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: $httpParamSerializerJQLike(user)
        });
      }
    }
  })

  .factory('SignUp', function ($http, $httpParamSerializerJQLike, $state, PopUpManager, Token, ProfileManager, Loading) {
    return {
      attemptToRegister: function (newUser) {
        return $http({
          method: 'POST',
          url: url + '/api/Account/Register',
          headers: {
            'Content-Type': 'application/json'
          },
          data: newUser
        })
      },
      login: function (user) {
        Loading.show();

        this.attemptLogin(user).then(function (value) {

          if (value.status == 200) {

            var token = value.data['access_token'];
            Token.setProperty(token);

            ProfileManager.loadProfile(Token.getProperty()).then(function (response) {

              if (response.data.isStudent) {
              } else {
                PopUpManager.alert("You need a student account to login");
              }
            });
          }
        }, function (error) {
          PopUpManager.alert(error.statusText);
          console.log(error);
        }).finally(function(){
          Loading.hide();
        });
      },

      attemptLogin: function (user) {
        return $http({
          method: 'POST',
          url: url + '/Token',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: $httpParamSerializerJQLike(user)
        });
      }
    }
  })

  .service('PublicProjects', function ($http, Token) {
    return {
      getPublicProjects: function () {
        return $http({
          method: 'GET',
          url: url + '/api/PublicProject',
          headers: {
            'Authorization': 'Bearer ' + Token.getProperty()
          }
        })
      }
    }
  })

  .service('ProfileManager', function ($http) {

    var profileDetails = {};
    var interests  = {};

    return {

      loadProfile: function (token) {
        return $http({
          method: 'GET',
          url: url + '/api/MyProfile',
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });
      },

      editProfile: function (newSettings, Token) {
        return $http({
          method: 'PUT',
          url: url + '/api/MyProfile',
          data: newSettings,
          headers: {
            'Authorization': 'Bearer ' + Token,
            'Content-Type': 'application/json'
          }
        });
      },

      getProfileDetails: function () {
        return profileDetails;
      },

      setProfileDetails: function (value) {
        profileDetails = value;
      },

      setInterests: function (value) {
        interests = value;
      }
    }
  })

  .service('BidManager', function ($http, Token) {

    var viewableBids = [];
    var allBids = [];
    var bid = {};
    var ActiveProject = {};

    return {
      postBid: function (bid) {
        return $http({
          method: 'POST',
          url: url + '/api/Bid',
          headers: {
            'Authorization' : 'Bearer ' + Token.getProperty(),
            'Content-Type': 'application/json'
          },
          data: bid
        })
      },
      retrieveBids: function () {
        return $http({
          method: 'GET',
          url: url + '/api/Bid',
          headers: {
            'Authorization' : 'Bearer ' + Token.getProperty()
          }
        })
      },
      increment: function () {
        viewableBids = viewableBids.concat(allBids.slice(viewableBids.length, viewableBids.length + 10));
        if (viewableBids.length == allBids.length) {
          document.getElementById('viewableBids').style.visibility = 'hidden';
        }
      },
      getViewableBids: function () {
        return viewableBids;
      },
      setViewableBids: function () {
        if (allBids.length < 10) {
          viewableBids = allBids.slice(0,allBids.length);
        } else {
          viewableBids = allBids.slice(0, 10);
        }
      },
      setAllBids: function (bids) {
        allBids = bids;
      },
      setBid: function (newBid) {
        bid = newBid;
      },
      getBid: function () {
        return bid;
      },
      setActiveProject: function (value) {
        ActiveProject = value;
      },
      getActiveProject: function () {
        return ActiveProject;
      },
      getActiveProjects: function () {
        return $http({
          method: 'GET',
          url: url + '/api/Bid/ActiveProjects',
          headers: {
            'Authorization' : 'Bearer ' + Token.getProperty()
          }
        })
      }
    }
  })

  .service('JobManager', function () {

    var allJobs = [];
    var viewAbleJobs = [];
    var tempJob = {};

    return {
      postBid: function (bid) {
        return $http({
          method: 'POST',
          url: url + '/api/Bid',
          headers: {
            'Authorization': 'application/json'
          },
          data: bid
        })
      },
      increment: function () {
        viewAbleJobs = viewAbleJobs.concat(allJobs.slice(viewAbleJobs.length, viewAbleJobs.length + 10));
        if (viewAbleJobs.length == allJobs.length) {
          document.getElementById('viewableJobs').style.visibility = 'hidden';
        }
      },
      getViewableJobs: function () {
        return viewAbleJobs;
      },
      setViewableJobs: function () {
        if (allJobs.length < 10) {
          viewAbleJobs = allJobs.slice(0,allJobs.length);
        } else {
          viewAbleJobs = allJobs.slice(0, 10);
        }
      },
      getTempJob: function () {
        return tempJob;
      },
      setTempJob: function (jobListing) {
        tempJob = jobListing;
      },
      setAllJobs: function (data) {
        allJobs = data;
      }
    }
  })

  .service('PopUpManager', function ($ionicPopup) {
    return {
      alert: function (message) {
        $ionicPopup.alert({
          title: '',
          template: message,
          okText: 'OK'
        });
      }
    }
  })

  .service('Token', function () {
    // Stores Token
    var Token = 'Token';

    return {
      getProperty: function () {
        return Token;
      },
      setProperty: function (value) {
        Token = value;
      }
    };
  })

  .service('SearchManager', function () {
    var categoryID = 0;
    var categoryTitle = "";
    var categoryIconUrl = "";
    var searchResult = "";
    return {
      getCategoryID: function () {
        return categoryID;
      },
      setCategoryID: function (value) {
        categoryID = value;
      },
      getCategoryTitle: function () {
        return categoryTitle;
      },
      setCategoryTitle: function (value) {
        categoryTitle = value;
      },
      getCategoryIconUrl: function () {
        return categoryIconUrl;
      },
      setCategoryIconUrl: function (value) {
        categoryIconUrl = value;
      },
      getSearchResult: function() {
        return searchResult;
      },
      setSearchResult: function(value) {
        searchResult = value;
      }
    };
  })

  // .factory('CategoriesGET', function ($resource, Loading) {
  //   Loading.show();
  //   return $resource(url + '/api/Categories').finally(function() {Loading.hide()});
  // })

  .service('CategoriesGET', function($http) {
    return {
      getCategories: function() {
        return $http({
          method: 'GET',
          url: url + '/api/Categories',
          headers: {
            'Authorization': 'application/json'
          }
        })
      }
    }
  })

  .service('Loading', function($ionicLoading){
    return {
      show: function() {
        $ionicLoading.show({
          template: '<p>Loading...</p><ion-spinner></ion-spinner>'
        });
      },
      hide: function() {
        $ionicLoading.hide();
      }
    }
  });

  var url = 'https://skillraildemo.azurewebsites.net';

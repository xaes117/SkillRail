angular.module('app.controllers', ['ngRoute'])

  // nathan.liu.15@ucl.ac.uk

  .controller('profileCtrl', function ($ionicScrollDelegate, $ionicSlideBoxDelegate, $scope, $rootScope, $route, $state, $timeout, Token, ProfileManager, Loading) {

    $scope.user = {};

    function setUser(input) {
      $scope.user = input;
    }

    $scope.initProfileCtrl = function () {
      Loading.show();
      ProfileManager.loadProfile(Token.getProperty()).then(function (response) {

        console.log(response.data);
        setUser(response.data);
        ProfileManager.setProfileDetails(response.data);

      }, function (value) {
        console.log(value);
      }).finally( function() {
        Loading.hide();
      });
    };

    $scope.refresh = function () {
      $scope.initProfileCtrl();
    };

    $rootScope.$on('saveSuccess', function (event, data) {
      setUser(data);
    });

    $scope.initProfileCtrl();

    //**********************************CSS*********************************//

    $ionicSlideBoxDelegate.update();
    $scope.onUserDetailContentScroll = function onUserDetailContentScroll() {
      var scrollDelegate = $ionicScrollDelegate.$getByHandle('userDetailContent');
      var scrollView = scrollDelegate.getScrollView();
      $scope.$broadcast('userDetailContent.scroll', scrollView);
    }

  })


  .controller('editProfileCtrl', function ($state, $rootScope, $route, $scope, PopUpManager, ProfileManager, Token, Loading, CategoriesGET) {

    Loading.show();
    $scope.user = ProfileManager.getProfileDetails();
    $scope.temp = $scope.user;

    CategoriesGET.getCategories().then(function(value) {
    $scope.categories = value.data;
    var interestStatusChecker = function (title) {
      if ($scope.user.interests == null) {
        return false;
      } else {
      for (var itemNum = 0; itemNum < $scope.user.interests.length; itemNum++) {
        if ($scope.user.interests[itemNum].title == title) {
          return true;
        }
      }
      return false;
    }
    };

    var interestsGetter = function() {
      var tempInterests = [];
      for(var temp = 0; temp < $scope.categories.length; temp++) {
        tempInterests[temp] = { title : $scope.categories[temp].title, group: $scope.categories[temp].group, description: $scope.categories[temp].description, iconUrl: $scope.categories[temp].iconUrl , id: $scope.categories[temp].id, checked: interestStatusChecker($scope.categories[temp].title)};
      }
      return tempInterests;
    };
    $scope.interests = interestsGetter();
    }, function (error) {
        console.log("An error has occured");
    }).finally(function () {
        Loading.hide();
    });

    $scope.saveProfileSettings = function () {

    /************Interest Edit******************/
    $scope.newInterests = [];
    var counter = 0;
    for (var itemNum = 0; itemNum < $scope.interests.length; itemNum++) {
      if ($scope.interests[itemNum].checked) {
        $scope.newInterests[counter] = {
          "title": $scope.interests[itemNum].title,
          "group": $scope.interests[itemNum].group,
          "description": $scope.interests[itemNum].description,
          "iconUrl": $scope.interests[itemNum].iconUrl,
          "id": $scope.interests[itemNum].id
        };
        counter++;
      }
    }

    var newSettings = {
      "firstName": $scope.user.firstName,
      "lastName": $scope.user.lastName,
      "title": $scope.user.title,
      "uniqueUrl": $scope.user.uniqueUrl,
      "aboutMe": $scope.user.aboutMe,
      "pictureUrl": $scope.user.pictureUrl,
      "description": $scope.user.description,
      "averageRating": $scope.user.averageRating,
      "completedProjects": $scope.user.completedProjects,
      "isStudent": $scope.user.isStudent,
      "studentEmail": $scope.user.studentEmail,
      "companyName": $scope.user.companyName,
      "interests":$scope.newInterests,
      "isActive": $scope.user.isActive,
      "skills": $scope.user.skills,
      "ongoingProjects": $scope.user.ongoingProjects,
      "completeProjects": $scope.user.completeProjects,
      "failedProjects": $scope.user.failedProjects,
      "currentUniversity": $scope.user.currentUniversity,
      "currentCourse": $scope.user.currentCourse,
      "graduationYear": $scope.user.graduationYear,
      "location": $scope.user.location,
      "id": $scope.user.id
    };

    ProfileManager.editProfile(newSettings, Token.getProperty()).then(function (response) {
      ProfileManager.setProfileDetails(response.data);
      ProfileManager.setInterests($scope.newInterests);
      $rootScope.$emit('saveSuccess', newSettings);
      PopUpManager.alert('Your settings have been successfully saved');
    }, function (response) {
      ProfileManager.setProfileDetails(newSettings);
    })
   };
  })


  .controller('homeCtrl', function ($scope, $rootScope, PublicProjects, $state, JobManager, Loading) {

    Loading.show();
    PublicProjects.getPublicProjects().then(function (value) {

      JobManager.setAllJobs(value.data.items);
      JobManager.setViewableJobs();
      $scope.items = JobManager.getViewableJobs();

      $scope.iconFilter = function(imageUrl) {
        if (imageUrl == "http://www.tomharrisonnorthseachallenge.com/widget/image/placeholder.png" || imageUrl == undefined) {
          return "https://skillrail4photos.blob.core.windows.net/websiteicons/icon-placeholder.png";
        } else {
          return imageUrl;
        }
      };

    }, function (error) {

      console.log(error);

    }).finally(function () {

      Loading.hide();

    });

    $scope.showMoreJobs = function () {

      JobManager.increment();
      $scope.items = JobManager.getViewableJobs();

    };

    $rootScope.jobSelected = function () {

      Loading.show();
      PublicProjects.getPublicProjects().then(function (value) {
        $scope.items = value.data.items;
        console.log(value.data.items);
      }, function (error) {
        console.log(error);
      }).finally(function () {
        Loading.hide();
      });

    };

    $rootScope.jobSelected = function (listing) {

      JobManager.setTempJob(listing);
      $state.go('tabsController.publicJobs');

    };

  })


  .controller('publicJobsCtrl', function ($scope, JobManager, $state) {

    $scope.viewedListing = {};

    $scope.initMyJobsCtrl = function () {
      $scope.viewedListing = JobManager.getTempJob();
      console.log($scope.viewedListing);
    };

    $scope.newBid = function () {
      $state.go('tabsController.createBid');
    };

    $scope.initMyJobsCtrl();

  })


  .controller('createBidCtrl', function ($scope, JobManager, BidManager, PopUpManager) {

    $scope.viewedListing = JobManager.getTempJob();

    $scope.postBid = function () {

      var bid = {
        // Configure Bid
        "offer": JobManager.getTempJob().budget,
        "project": {
          "id": JobManager.getTempJob().id
        },
        "proposal": this.newDescription
      };

      console.log(bid);

      BidManager.postBid(bid).then(function (value) {
        // Configure if POST is successful
        PopUpManager.alert("Your bid has been successfully submitted");
      }, function (error) {
        // Handle error
        console.log(error);
      });
    }
  })


  .controller('myJobsCtrl', function ($state, $scope, BidManager, PopUpManager, Loading) {


    //--------------------Sent Bids/ Proposals-----------------

    $scope.initSearchCtrl = function () {

      Loading.show();

      BidManager.retrieveBids().then( function (value) {
        BidManager.setAllBids(value.data);
        console.log(value.data);
        BidManager.setViewableBids();
        $scope.bidList = BidManager.getViewableBids();
      }, function (error) {
        console.log(error);
        $scope.bidList = [{'proposal': "You currently have no bids"}];
      }).finally(function () {
          Loading.hide();
     });


      BidManager.getActiveProjects().then( function(value) {
        $scope.activeProjects = value.data;
      }, function(error) {
        PopUpManager.alert("Problem with loading your active Jobs");
      })

    };

    $scope.showMore = function () {
      BidManager.increment();
      $scope.bidList = BidManager.getViewableBids();
    };

    $scope.viewProposal = function (item) {

      if (item.proposal == "You currently have no bids") {
        PopUpManager.alert("You currently have no bids");
      } else {
        BidManager.setBid(item);
        $state.go('tabsController.viewBid');
      }
    };

    $scope.initSearchCtrl();

    //----------------------ActiveProjects------------------

    $scope.openActiveProject = function(item) {
      BidManager.setActiveProject(item);
      console.log(item);
      console.log(BidManager.getActiveProject());
    }

    //------------------------Liked Jobs--------------------

  })

  .controller('viewBidCtrl', function ($state, $scope, BidManager) {

    $scope.bid = {};

    $scope.initViewBidController = function () {
      $scope.bid = BidManager.getBid();
      console.log("hello");
      console.log($scope.bid);
    };

    $scope.initViewBidController();

  })


  .controller('searchCtrl', function ($scope, $state, SearchManager, CategoriesGET, Loading) {

    Loading.show();
    CategoriesGET.getCategories().then(function (value) {
    $scope.searchResult= "";
    $scope.categories = value;
    }, function (error) {
        console.log("An error has occured");
    }).finally(function () {
        Loading.hide();
    });

    $scope.openCategory = function (categoryID, categoryTitle, categoryIconUrl) {
      SearchManager.setCategoryID(categoryID);
      SearchManager.setCategoryTitle(categoryTitle);
      SearchManager.setCategoryIconUrl(categoryIconUrl);
      $state.go("tabsController.search3");
    };

    $scope.openSearchResult = function (searchFor) {
      SearchManager.setSearchResult(searchFor);
      $state.go("tabsController.search2");
    }
  })

  .controller('search2Ctrl', function ($rootScope, $state, $scope, JobManager, SearchManager, PublicProjects, Loading) {

    Loading.show();
    PublicProjects.getPublicProjects().then(function (value) {
      $scope.items = value.data.items;
      $scope.iconFilter = function(imageUrl) {
        if (imageUrl == "http://www.tomharrisonnorthseachallenge.com/widget/image/placeholder.png" || imageUrl == undefined) {
          return "https://skillrail4photos.blob.core.windows.net/websiteicons/icon-placeholder.png";
        } else {
          return imageUrl;
        }
      };

      }, function (error) {
        console.log(error);
    }).finally( function () {
        Loading.hide();
    });

    $scope.filterBySearchResult = function () {
      return SearchManager.getSearchResult();
    };

  })


  .controller('search3Ctrl', function($rootScope, $state, $scope, JobManager, SearchManager, PublicProjects, Loading) {

    Loading.show();
    $scope.categoryTitle= SearchManager.getCategoryTitle();
    $scope.jobsIcon = SearchManager.getCategoryIconUrl();
    PublicProjects.getPublicProjects().then(function (value) {
      $scope.items = value.data.items;
      }, function (error) {
        console.log(error);
    }).finally( function () {
      Loading.hide();
    });

    $scope.filterByCategoryTitle = function () {
      return { id : SearchManager.getCategoryID() } ;
    }

  })

  // **********************************************************
  // **                                                      **
  // **                 Business Sign Up                     **
  // **                                                      **
  // **********************************************************

  .controller('businessProfileCtrl', function ($scope) {

  })

  .controller('businessHomeCtrl', function ($scope) {

  })

  .controller('businessSearchCtrl', function ($scope) {

  })

  .controller('businessSearch2Ctrl', function ($scope) {

  })

  // **********************************************************
  // **                                                      **
  // **                 Login and Sign Up                    **
  // **                                                      **
  // **********************************************************

  .controller('loginCtrl', function ($scope, Login) {

    $scope.postData = {};

    $scope.login = function () {

      var user = {
        grant_type: 'password',
        username: $scope.postData.username,
        password: $scope.postData.password
      };

      Login.login(user);

    };
  })

  .controller('signupCtrl', function ($scope, $exceptionHandler, PopUpManager, $state, SignUp, Login) {

    $scope.initSignupCtrl = function () {
      console.log("hello");
    };

    $scope.signup = function () {

      try {

        if ($scope.postData.password != null && $scope.postData.confirmPassword != null && $scope.postData.email != null && $scope.postData.firstName != null && $scope.postData.lastName != null && $scope.postData.phoneNumber != null) {
          if ($scope.postData.password == $scope.postData.confirmPassword) {
            var newUser = {
              "username": $scope.postData.email,
              "password": $scope.postData.password,
              "firstName": $scope.postData.firstName,
              "lastName": $scope.postData.lastName,
              "phoneNumber": $scope.postData.phoneNumber,
              "isStudent": true,
              "interests": null,
              "studentEmail": $scope.postData.email,
              "companyName": ""
            };

            var user = {
              grant_type: 'password',
              username: newUser.username,
              password: newUser.password
            };

            SignUp.attemptToRegister(newUser).then(function () {

              SignUp.login(user);
              $state.go('editProfile');

            }, function (error) {

              // Handle error

              if (error.statusText == "Internal Server Error") {
                // Log in the user
                Login.login(user);
              } else {
                // Popup showing error message
                PopUpManager.alert($scope.postData.email + ' has already been taken :(');
              }
            })
          } else {
            PopUpManager.alert("Passwords do not match");
          }
        } else {
          PopUpManager.alert("Please fill in all fields");
        }
      } catch (TypeError) {
        PopUpManager.alert("Please fill in all fields");
        $exceptionHandler(TypeError);
      }
    };

    $scope.initSignupCtrl();

  });

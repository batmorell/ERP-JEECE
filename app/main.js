var app = angular.module('jeeceapp', [
    'ui.router',
    'angularSpinner',
    'angular-ladda',
    'toaster',
    'ngAnimate'
]);

app.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('list', {
            url: "/",
            views: {
                'main-container': {
                    templateUrl: 'template/list.html',
                    controller: 'formController'
                },
                'slidebar': {
                    templateUrl: 'template/slide-bar.html',
                    controller: 'formController'
                }
            }
        })
        .state('mission', {
            url: "/mission/:ref",
            views: {
                'main-container': {
                    templateUrl: 'template/mission.html',
                    controller: 'missionDetailController'
                }
            }
        })
        .state('newMission', {
            url: "/newMission",
            views: {
                'main-container': {
                    templateUrl: 'template/newMission.html',
                    controller: 'newMissionController'
                }
            }
        })
        .state('edit', {
            url: "/edit/:ref",
            views: {
                'main-container': {
                    templateUrl: 'template/newMission.html',
                    controller: 'editMissionController'
                }
            }
        });

    $urlRouterProvider.otherwise('/');
});

app.controller('missionDetailController', function ($scope, $stateParams, MissionService) {
    $scope.selectedMission = null;
    $scope.missions = MissionService;

    $scope.missions.getMission($stateParams.ref);

});

app.controller('newMissionController', function ($scope, $http, MissionService,$state) {
    $scope.missions = MissionService;
    $scope.mode = 'create';

    $scope.save = function () {
        $scope.missions.create()
            .then(function(){
                $state.go("list");
            })
    };
});

app.controller('editMissionController', function ($scope, MissionService,$state) {
    $scope.mode = 'edit';
    $scope.missions = MissionService;

    $scope.save = function () {
        $scope.missions.update()
            .then(function(){
                $state.go("list");
            })
    };

    $scope.delete = function () {
        $scope.missions.delete().then(function(){
                $state.go("list");
            })
    };
});

app.controller('formController', function ($scope, MissionService) {
    $scope.missions = MissionService;
    $scope.selectedIndex = null;
    $scope.selectedMission = null;
    $scope.search = "";

    $scope.selectMission = function (mission, index) {
        $scope.selectedIndex = index;
        $scope.selectedMission = mission;
    };

    $scope.sensitiveSearch = function (mission) {
        if ($scope.search) {
            return mission.manager.indexOf($scope.search) == 0 ||
                mission.ref.indexOf($scope.search) == 0;
        }
        return true;
    };

});

app.service('MissionService', function ($rootScope, $http, $q,toaster) {
    var self = {
            'getMission': function (ref) {
                var req = {
                    method: 'GET',
                    url: `http://dev.jeece.fr:6009/dashboard/missions/${ref}`
                };

                $http(req).success(function (response) {
                    console.log(response);
                    self.mission = response[0];
                }).error(function (data) {
                    console.log("Erreur avec le get de missions")
                });
            },
            'missions': [],
            'mission': null,
            'isLoading': false,
            'isDeleting': false,
            'isSaving': false,
            'loadMissions': function () {
                self.isloading = true;
                $http.get('http://dev.jeece.fr:6009/dashboard/missions').success(function (data) {
                    self.missions = data;
                    self.isloading = false;
                }).error(function (data) {
                    console.log("Erreur avec le get de missions")
                });
            },
            'update': function () {
                self.isSaving = true;
                var d = $q.defer();
                var data = $.param({
                    ref: self.mission.ref,
                    client: self.mission.client,
                    type: self.mission.type,
                    type_ao: self.mission.type_ao,
                    date_signature: self.mission.date_signature,
                    date_end: self.mission.date_end,
                    quality_manager: self.mission.quality_manager,
                    next_contact: self.mission.next_contact,
                    price: self.mission.price,
                    description: self.mission.description,
                    manager: self.mission.manager
                });
                $http.put('http://dev.jeece.fr:6009/dashboard/missions', data).success(function (response) {
                    console.log(response);
                    self.isSaving = false;
                    d.resolve()
                }).error(function (response) {
                    console.log(response);
                });
                return d.promise;
            },
            'delete': function () {
                self.isDeleting = true;
                var d = $q.defer();
                var data = $.param({
                    id: self.mission.id
                });
                $http.delete('http://dev.jeece.fr:6009/dashboard/missions', data).success(function (response) {
                        console.log(response);
                        self.isDeleting = false;
                        toaster.pop('info', 'Deleted ' + self.mission.ref);
                        d.resolve()
                    }
                ).error(function (response) {
                    console.log(response);
                });
                return d.promise;
            },
            'create': function (){
                self.isSaving = true;
                var d = $q.defer();
                var data = $.param({
                    ref: self.mission.ref,
                    client: self.mission.client,
                    type: self.mission.type,
                    type_ao: self.mission.type_ao,
                    date_signature: self.mission.date_signature,
                    date_end: self.mission.date_end,
                    quality_manager: self.mission.quality_manager,
                    next_contact: self.mission.next_contact,
                    price: self.mission.price,
                    description: self.mission.description,
                    manager: self.mission.manager
                });

                var config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                    }
                };

                $http.post('http://dev.jeece.fr:6009/dashboard/missions', data, config)
                    .success(function (data, status, headers, config) {
                        self.isSaving = false;
                        console.log(data);
                        self.loadMissions();
                        d.resolve()
                    })
                    .error(function (data) {
                        console.log(data)
                    });
                return d.promise;
            }
        }
        ;

    self.loadMissions();

    return self;
})
;

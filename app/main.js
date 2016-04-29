var app = angular.module('jeeceapp', [
    'ngRoute'
]);

app.config(function($routeProvider,$locationProvider){
    $locationProvider.html5Mode({
        enable: true,
        requireBase: false
    });
    $routeProvider.
        when("/",{templateUrl:"Table-form.html"}).
        when("/mission",{templateUrl:"Table-form.html"})

});

app.controller('formController', function ($scope, $http) {
    $scope.missions = [];
    $scope.selectedIndex = null;
    $scope.selectedMission = null;
    $scope.search = "";

    $http.get('http://dev.jeece.fr:6009/dashboard/missions').success(function (data) {
        $scope.missions = data
    }).error(function (data) {
        console.log("Erreur avec le get de missions")
    });

    $scope.selectMission = function (mission, index) {
        $scope.selectedIndex = index;
        $scope.selectedMission = mission;
    };

    $scope.sensitiveSearch = function(mission) {
        if ($scope.search) {
            return mission.manager.indexOf($scope.search) == 0 ||
                mission.ref.indexOf($scope.search) == 0;
        }
        return true;
    };

});

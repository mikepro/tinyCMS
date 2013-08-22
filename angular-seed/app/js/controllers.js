'use strict';

/* Controllers */

angular.module('tinyCMS.controllers', []).
    controller('navigationController', ['$scope','$http',function($scope,$http) {
        $http({method: 'GET', url: '/brands/list.json'})
        .success(function(data, st, header,config){
            $scope.brands = data;
        })

        .error(function(data){
            $scope.message = "something went really wrong";
        });
    }]
);

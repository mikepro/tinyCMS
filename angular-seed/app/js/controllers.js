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

    }])
        
    .controller('selectedBrandController',['$scope','$http',function($scope,$http){
        $scope.isDisplayMode = false;
        
        $scope.showHomePageContent = function(){
            return !$scope.isDisplayMode;
        }; 
        
        $scope.selectBrand = function(brandInfo){
            $http({method: 'GET', url: '/brands/get.json',params:{'code':brandInfo.brandCode}})
            .success(function(data, st, header, config){
                $scope.isDisplayMode = true;
                $scope.selectedBrandData= data;
            })
    
            .error(function(data){
                $scope.message = data.msg;
            });
        };


    }]);

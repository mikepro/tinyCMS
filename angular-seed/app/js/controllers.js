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
        $scope.isEditMode = false;        
        $scope.showHomePageContent = function(){
            return !$scope.isDisplayMode;
        }; 

        $scope.viewMode = "published";
        function BrandViewModel(data)
        {
            self = this;
            self.brandData ={};
            if(data.published)
            {
                self.brandData = data.published;
                self.brandData.importantText = convertArrayToTextItem(self.brandData.importantText);
                self.brandData.Benefits =  convertArrayToTextItem(self.brandData.Benefits);
                
                self.status = 'published';
            }

            if(data.draft)
            {
                self.brandData = data.draft;
                self.status = 'draft';
            }

            function convertArrayToTextItem(array)
            {
                var convertedArray = [];
                angular.forEach(array,function(value, key){
                    this.push(new TextItem(value));
                },convertedArray);
                return convertedArray;
            }

            function TextItem(value)
            {
                return {"text": value};
            }
        }
        
        $scope.viewPublishedContent = function()
        {
            $scope.viewMode = "published";
        }

        $scope.viewDraftContent = function()
        {
            $scope.viewMode = "draft";
        }

        $scope.viewContent = function()
        {
            if($scope.viewMode =="published")
            {
                return $scope.selectedFullBrandData.published;
            }else
            {
                return $scope.selectedFullBrandData.draft;
            }
        }

        function goToHomePageContent(){
        
            $scope.isDisplayMode = null;
            $scope.selectedFullBrandData= null;
            $scope.viewData = null;
            $scope.isEditMode =false;        
        }
        $scope.goToHomePageContent = function()
        {
            goToHomePageContent();
        }

        $scope.edit = function()
        {
            $scope.isEditMode =true;        
        }

        $scope.save = function()
        {
            $http.post('/brands/save', {descriptor: {id: $scope.selectedFullBrandData._id, version: $scope.selectedFullBrandData.version}, data:$scope.viewData.brandData} )
            .success(function(data, st, header,config){
                $scope.brands = data;
                alert("saved");
            })

            .error(function(data){
                $scope.message = "something went really wrong";
                alert("error");
            });
        }

        $scope.shouldDisplaySelectedBrand = function()
        {
            return $scope.isDisplayMode == true &&
                    $scope.isEditMode == false;
        }

        $scope.shouldEditSelectedBrand = function()
        {
            return $scope.isDisplayMode == true &&
                    $scope.isEditMode ==true;
        }

        $scope.addImportantText = function()
        {
            $scope.viewData.brandData.importantText.push({'text':''});
        }

        $scope.removeImportantText = function(index){
            $scope.viewData.brandData.importantText.splice(index,1);
        }
        
        $scope.addBenefits =  function()
        {
            $scope.viewData.brandData.Benefits.push({'text':''});
        }

        $scope.removeBenefits = function(index){
            $scope.viewData.brandData.Benefits.splice(index,1);
        }

        $scope.cancelEditing = function()
        {
            goToHomePageContent();
        }
        $scope.selectBrand = function(brandInfo){
            $http({method: 'GET', url: '/brands/get.json',params:{'code':brandInfo.brandCode}})
            .success(function(data, st, header, config){
                $scope.isDisplayMode = true;
                $scope.selectedFullBrandData= data;
                $scope.viewData = new BrandViewModel(data);
            })
    
            .error(function(data){
                $scope.message = data.msg;
            });


        };
    }]);

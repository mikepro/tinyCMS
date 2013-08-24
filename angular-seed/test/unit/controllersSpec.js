'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function(){
    var $httpBackend, $http, $rootScope, createController;

    beforeEach(module('tinyCMS'));
    beforeEach(inject(function($injector){
        $httpBackend = $injector.get('$httpBackend');
        $rootScope = $injector.get('$rootScope');
        $http = $injector.get('$http');

        var $controller = $injector.get('$controller');

        createController = function(name){
            return $controller(name,{'$scope':$rootScope,"$http":$http});
        };
    }));

    afterEach(function() {
         $httpBackend.verifyNoOutstandingExpectation();
         $httpBackend.verifyNoOutstandingRequest();
    });

    describe('navigation',function(){
        var controllerName = "navigationController";
        it('should call http service when controller is intialised and set data on model', function() {
            $httpBackend.when('GET','/brands/list.json').respond([{name:'a'},{name:'b'}]);
            var controller = createController(controllerName);
            $httpBackend.flush();
            expect($rootScope.brands.length).toBe(2);
        });

        it("should set a message on the model if the url returns an error", function(){
            $httpBackend.when('GET','/brands/list.json').respond(404,'');
            var controller = createController(controllerName);
            $httpBackend.flush();
            expect($rootScope.message).toBe("something went really wrong");
        });

    });

    describe('selectedBrand',function(){
        var controllerName = "selectedBrandController";
        it('should make a call to http service when brand is selected',function(){
            $httpBackend.expect('GET','/brands/get.json?code=A').respond({data:'dumyData'});
            var controller = createController(controllerName);
            $rootScope.selectBrand({brandCode:'A'});
            $httpBackend.flush();
        });

        it('should update model when brand is selected',function(){
            $httpBackend.expect('GET','/brands/get.json?code=A').respond({name:'brandName'});
            var controller = createController(controllerName);
            $rootScope.selectBrand({brandCode:'A'});
            $httpBackend.flush();
            expect($rootScope.selectedBrandData.name).toBe('brandName');
        });

        it('should set display mode when brand is selected',function(){
            $httpBackend.expect('GET','/brands/get.json?code=A').respond({name:'brandName'});
            var controller = createController(controllerName);
            $rootScope.selectBrand({brandCode:'A'});
            $httpBackend.flush();
            expect($rootScope.isDisplayMode).toBe(true);
        });

        it('should set an error message when there is a problem geting the brand',function(){
            $httpBackend.expect('GET','/brands/get.json?code=A').respond(500,{msg:'Error trying to get brand a info'});
            createController(controllerName);

            $rootScope.selectBrand({brandCode:'A'});
            $httpBackend.flush();
            expect($rootScope.message).toBe('Error trying to get brand a info');
        });
        
        it("should display home content by default",function(){
            createController(controllerName);
            expect($rootScope.showHomePageContent()).toBe(true);
        });

        it("should display the navigation menu when a brand is not in display mode",function(){
            createController(controllerName);
            $rootScope.isDisplayMode =false;
            expect($rootScope.showHomePageContent()).toBe(true);
        });

        it("should not show the home page content when a brand is in display mode",function(){
            createController(controllerName);
            $rootScope.isDisplayMode =true;
            expect($rootScope.showHomePageContent()).toBe(false);
        });
    });
});

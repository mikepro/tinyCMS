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

        createController = function(){
            return $controller("navigationController",{'$scope':$rootScope,"$http":$http});
        };
    }));


    it('should call http service when controller is intialised and set data on model', function() {
        $httpBackend.when('GET','/brands/list.json').respond([{name:'a'},{name:'b'}]);
        var controller = createController();
        $httpBackend.flush();
        expect($rootScope.brands.length).toBe(2);
    });

    it("should set a message on the model if the url returns an error", function(){
        $httpBackend.when('GET','/brands/list.json').respond(404,'');
        var controller = createController();
        $httpBackend.flush();
        expect($rootScope.message).toBe("something went really wrong");
    });
});

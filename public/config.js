'use strict';



//--------------------------------- 1. [APP-CONFIGURATION]----------------------------------------------

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {

	// Init module configuration options
	var applicationModuleName = 'mean';
	var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ui.router', 'ui.bootstrap', 'ui.utils'];





	/*
	*	registerModule helper function
	*		// 1. Create angular module
	*		// 2. Add the [CUSTOM] [MODULES] into [APP] [MAIN] [MODULE]	--as dependency
	*
	*	Note:
	*		-- [APP][MAIN][MODULE] is the only main angular module in the application which has all the [CUSTOM][MODULES] as dependency in order to work
	*		-- [CUSTOM][MODULES] is nothing but 'public/modules/folder123'
	*
	* */

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {

		//E.g.
		// moduleName = 'users'
		// dependencies = ['ui-bootstrap','some-plugin']


		// 1. Create angular module  //Registering each [CUSTOM] [MODULE] with angular
		// angular.module('users', ['ui-bootstrap','some-plugin']);
		angular.module(moduleName, dependencies || []);



		// 2. Add the [CUSTOM] [MODULES] into [APP] [MAIN] [MODULE]	--as dependency
		// angular.module('mean', [....,'users']);
		angular.module(applicationModuleName).requires.push(moduleName);


	};




	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};


})();

'use strict';


//------------------------------2. [ANGULAR][APP][MAIN][MODULE] ---------------------------------------
//angular.module('mean', [.....]);

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);





// Setting HTML5 Location Mode
// http://localhost:3000/#!/   --> prefixed with !

angular.module(ApplicationConfiguration.applicationModuleName)
		.config(['$locationProvider',
						function($locationProvider) {
							$locationProvider.hashPrefix('!');
						}
					]);





//------------------------------3. [ANGULAR][APP][INIT]/[BOOTSTRAP] ---------------------------------------

//Then define the init function for starting up the application
angular.element(document).ready(function() {

	// 3.0 FIXING BUGS -or- WORK AROUND  --before angular initialization (thatsy we r doing manual initialization)
			//Fixing facebook bug with redirect
			if (window.location.hash === '#_=_') window.location.hash = '#!';

			// Fixing google bug with redirect
			if (window.location.href[window.location.href.length - 1] === '#' &&
					// for just the error url (origin + /#)
					(window.location.href.length - window.location.origin.length) === 2) {
					window.location.href = window.location.origin + '/#!';
			}



	// 3.1. Manual Initialization  --If you need to have more control over the initialization process
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);


	/*
		How 'Automatic Initialization' works?  --Using ng-app
			 <html ng-app="mean">
			 </html>
	 */

	/*
		1. Angular initializes automatically
			-when 'DOMContentLoaded' event
			-or when the angular.js script is evaluated if at that time document.readyState is set to 'complete'.


		 2. Angular looks for the 'ngApp' directive in your HTML application root.
		 	If the ngApp directive is found then Angular will:
				3. load the 'module' associated with the directive
				4. create the application 'injector'
				5. 'compile' the DOM treating the ngApp directive as the root of the compilation.
					-This allows you to tell it to treat only a portion of the DOM as an Angular application.
	*/
});

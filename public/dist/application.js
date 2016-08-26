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

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('articles');

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('core');


// 1. Register a new angular module

// 2. Add the this 'core' [CUSTOM] [MODULES] into [APP] [MAIN] [MODULE]	--as dependency

/**
 * 1. Create 'new module' folder (jstudent)   //Register your new module 'jstudent' with angular & adding this new module as dependency in [APP] [MODULE]
 * 2. Create jstudent.client.module.js
 * 3. Create 'config' folder
 * 		3.1 Create 'jstudents.client.config.js'
 * 		3.2 Create 'jstudents.client.routes.js'
 *
 * 4. Create 'controllers' , 'views', 'services' folder
 *
 */



ApplicationConfiguration.registerModule('jstudents');

'use strict';

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Configuring the Articles module
angular.module('articles').run(['Menus',
	function(Menus) {

		//addMenuItem(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position)
		//addSubMenuItem(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position)


		// Set top bar menu items

		//Articles
		Menus.addMenuItem('topbar', 'Articles', 'articles', 'dropdown', '/articles(/create)?');
		Menus.addSubMenuItem('topbar', 'articles', 'List Articles', 'articles');
		Menus.addSubMenuItem('topbar', 'articles', 'New Article', 'articles/create');

	}
]);

'use strict';

// Setting up route
angular.module('articles').config(['$stateProvider',
	function($stateProvider) {
		// Articles state routing
		$stateProvider.
		state('listArticles', {
			url: '/articles',
			templateUrl: 'modules/articles/views/list-articles.client.view.html'
		}).
		state('createArticle', {
			url: '/articles/create',
			templateUrl: 'modules/articles/views/create-article.client.view.html'
		}).
		state('viewArticle', {
			url: '/articles/:articleId',
			templateUrl: 'modules/articles/views/view-article.client.view.html'
		}).
		state('editArticle', {
			url: '/articles/:articleId/edit',
			templateUrl: 'modules/articles/views/edit-article.client.view.html'
		});
	}
]);
'use strict';

// Articles controller
angular.module('articles').controller('ArticlesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Articles',
	function($scope, $stateParams, $location, Authentication, Articles) {
		$scope.authentication = Authentication;

		// Create new Article
		$scope.create = function() {
			// Create new Article object
			var article = new Articles({
				title: this.title,
				content: this.content
			});

			// Redirect after save
			article.$save(function(response) {
				$location.path('articles/' + response._id);

				// Clear form fields
				$scope.title = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Article
		$scope.remove = function(article) {
			if (article) {
				article.$remove();

				for (var i in $scope.articles) {
					if ($scope.articles[i] === article) {
						$scope.articles.splice(i, 1);
					}
				}
			} else {
				$scope.article.$remove(function() {
					$location.path('articles');
				});
			}
		};

		// Update existing Article
		$scope.update = function() {
			var article = $scope.article;

			article.$update(function() {
				$location.path('articles/' + article._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Articles
		$scope.find = function() {
			$scope.articles = Articles.query();
		};

		// Find existing Article
		$scope.findOne = function() {
			$scope.article = Articles.get({
				articleId: $stateParams.articleId
			});
		};
	}
]);
'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('articles').factory('Articles', ['$resource',
	function($resource) {


		return $resource('articles/:articleId', {
			articleId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});



	}
]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {


		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');



		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});



	}
]);

'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus',
	function($scope, Authentication, Menus) {

		// This provides Authentication context.
		$scope.authentication = Authentication;


		// Getting all the Menus mapped with the User
		$scope.menu = Menus.getMenu('topbar');


		console.log($scope.menu);


		//---------------Collapse Menu--------------------
		$scope.isCollapsed = false;

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});



	}
]);

'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
	function($scope, Authentication) {

		// This provides Authentication context.
		$scope.authentication = Authentication;


	}
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
]);
'use strict';

// Configuring the Articles module
angular.module('jstudents').run(['Menus',
	function(Menus) {


		//addMenuItem(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position)
		//addSubMenuItem(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position)


		//Students
		Menus.addMenuItem('topbar', 'Students', 'students', 'dropdown', '/jstudents(/create)?');
		Menus.addSubMenuItem('topbar', 'students', 'List Students', 'jstudents');
		Menus.addSubMenuItem('topbar', 'students', 'New Student', 'jstudents/create');

	}
]);

'use strict';

// Setting up route
angular.module('jstudents').config(['$stateProvider',
	function($stateProvider) {

		//Registering the Routes with $stateProvider (--part of ui-router)

		// Articles state routing
		$stateProvider.
			state('listJStudents', {
				url: '/jstudents',
				templateUrl: 'modules/jstudents/views/list-jstudents.client.view.html'
			}).
			state('createJStudent', {
				url: '/jstudents/create',
				templateUrl: 'modules/jstudents/views/create-jstudent.client.view.html'
			}).
			state('viewJStudent', {
				url: '/jstudents/:jstudentId',
				templateUrl: 'modules/jstudents/views/view-jstudent.client.view.html'
			}).
			state('editJStudent', {
				url: '/jstudents/:jstudentId/edit',
				templateUrl: 'modules/jstudents/views/edit-jstudent.client.view.html'
			});


	}
]);

'use strict';

// Articles controller
angular.module('jstudents').controller('JStudentsController', ['$scope', '$stateParams', '$location', 'Authentication', 'JStudents',
	function($scope, $stateParams, $location, Authentication, JStudents) {

		$scope.authentication = Authentication;




		// Create new JStudent
		$scope.create = function() {
			// Create new JStudent object
			var jstudent = new JStudents({
				title: this.title,
				content: this.content
			});

			// Redirect after save
			jstudent.$save(function(response) {
				$location.path('jstudents/' + response._id);

				// Clear form fields
				$scope.title = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};




		// Remove existing JStudent
		$scope.remove = function(jstudent) {
			if (jstudent) {
				jstudent.$remove();

				for (var i in $scope.jstudents) {
					if ($scope.jstudents[i] === jstudent) {
						$scope.jstudents.splice(i, 1);
					}
				}
			} else {
				$scope.jstudent.$remove(function() {
					$location.path('jstudents');
				});
			}
		};




		// Update existing JStudent
		$scope.update = function() {
			var jstudent = $scope.jstudent;

			jstudent.$update(function() {
				$location.path('jstudents/' + jstudent._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};




		// Find a list of JStudents
		$scope.find = function() {
			$scope.jstudents = JStudents.query();
		};




		// Find existing JStudent
		$scope.findOne = function() {

			$scope.jstudent = JStudents.get({
				jstudentId: $stateParams.jstudentId
			});
		};



	}
]);

'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('articles').factory('JStudents', ['$resource',
	function($resource) {


		return $resource('jstudents/:jstudentId', {
			jstudentId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});



	}
]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {



		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {


				return {
					responseError: function(rejection) {


						switch (rejection.status) {

							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;


							case 403:
								// Add unauthorized behaviour
								break;

						}




						return $q.reject(rejection);


					}
				};



			}




		]);
	}
]);

'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {



		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).

		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).

		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).

		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).


		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).


		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).


		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).


		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).


		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		});



	}
]);

'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {


		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');



		//SignUp
		$scope.signup = function() {


			$http.post('/auth/signup', $scope.credentials).success(function(response) {

				// If successful we assign the response to the global user model
				$scope.authentication.user = response;


				// And redirect to the index page
				$location.path('/');


			}).error(function(response) {
				$scope.error = response.message;
			});


		};



		//Sign In
		$scope.signin = function() {


			$http.post('/auth/signin', $scope.credentials).success(function(response) {

				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');


			}).error(function(response) {
				$scope.error = response.message;
			});


		};



	}
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window', function($window) {


	var auth = {
		user: $window.user
	};


	return auth;
}]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
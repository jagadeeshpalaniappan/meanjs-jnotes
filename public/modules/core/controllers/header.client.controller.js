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

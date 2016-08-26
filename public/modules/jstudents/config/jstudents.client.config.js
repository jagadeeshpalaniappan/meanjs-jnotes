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

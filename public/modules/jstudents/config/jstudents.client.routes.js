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

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

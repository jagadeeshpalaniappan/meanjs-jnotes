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

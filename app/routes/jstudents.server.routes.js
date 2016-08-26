'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	jstudents = require('../../app/controllers/jstudents.server.controller');

module.exports = function(app) {
	// Article Routes
	app.route('/jstudents')
		.get(jstudents.list)
		.post(users.requiresLogin, jstudents.create);

	app.route('/jstudents/:jstudentId')
		.get(jstudents.read)
		.put(users.requiresLogin, jstudents.hasAuthorization, jstudents.update)
		.delete(users.requiresLogin, jstudents.hasAuthorization, jstudents.delete);



	// Finish by binding the article middleware
	app.param('jstudentId', jstudents.jstudentByID);


};

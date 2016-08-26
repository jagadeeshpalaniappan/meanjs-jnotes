'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	User = require('mongoose').model('User'),
	path = require('path'),
	config = require('./config');

/**
 * Module init function.
 */
module.exports = function() {

	console.log('############################## 5. Bootstrap PASSPORT config ###################################');



	/*
	 -------Login Sessions---------
	 --
	 In a typical web application, the credentials used to authenticate a user will only be transmitted during the login request.
	 If authentication succeeds, a session will be established and maintained via a cookie set in the user's browser.
	 Each subsequent request will not contain credentials, but rather the unique cookie that identifies the session.
	 --

	 ** In order to support login sessions, Passport will serialize and deserialize user instances to and from the session.
	 */



	//serializeUser and deserializeUser functions --> to store the 'user' in SESSION

	// Serialize sessions
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});


	// Deserialize sessions
	passport.deserializeUser(function(id, done) {

		User.findOne({_id: id},
					 '-salt -password',
					 function(err, user) {

						done(err, user);

					});



	});







	// Initialize strategies
	config.getGlobbedFiles('./config/strategies/**/*.js').forEach(function(strategy) {

		//console.log(strategy); //local.js //facebook.js //github.js //google.js //linkedin.js //twitter.js

		require(path.resolve(strategy))();
	});


};

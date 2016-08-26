'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	User = require('mongoose').model('User'),
	chalk = require('chalk');

module.exports = function() {

	console.log(chalk.grey('\t------- (5.1) Initializing [passport-local] Strategy ==> For Local Database Authentication '));





		/*
		 ### PASSPORT -AUTHENTICATION -PROCESS ###

		 passport.authenticate(...., callbackFn)
		 	--> internally calls [LocalStrategy function]
				 --> this internally calls database to fetch the 'user' collection by username

						 -- (1) if the user collection NOT found  //Authentication FAILURE [ Incorrect username ]
						 -- (2) if the user collection found
						 -- (2.1) compares the user entered password & db password
									 --(2.1.1) If password doesn't match  //Authentication FAILURE [ Incorrect Password ]
									 --(2.1.2) If password match  //Authentication SUCCESS //send the 'user' collection


						 --if the Authentication SUCCESS or FAILURE  //(1) or (2.1.1) or (2.1.2)
						 --calls the callbackFn(err, user, info)


		 */








		//Local Strategy
	var myLocalStrategy = new LocalStrategy(

		{ usernameField: 'username', passwordField: 'password'},

		function(username, password, done) {


			//Actual Authentication Happens -here

			//console.log(username+" --- "+password);   //jaganttp --- jaganttp


			User.findOne({
				username: username
			}, function(err, user) {

				//DB Error
				if (err) {
					return done(err);
				}


				//(1) if the user collection NOT found in db  //Authentication FAILURE [ Incorrect username ]
				if (!user) {
					return done(null, false, {
						message: 'Incorrect Username'
					});
				}


				//(2.1.1) If password doesn't match  //Authentication FAILURE [ Incorrect Password ]
				if (!user.authenticate(password)) {

					return done(null, false, {
						message: 'Incorrect Password'
					});

				}


				//Authentication SUCCESS
				return done(null, user);



				/*
					NOTE:

				 	done(...) fn is nothing but ### PASSPORT -AUTHENTICATION -PROCESS ### -- callback fn

				 									done(err, user, info)
					passport.authenticate('local', function(err, user, info) { ................ }

				 */



			});
		});



	// Use local strategy
	passport.use(myLocalStrategy);


};

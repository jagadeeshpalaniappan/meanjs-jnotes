'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User');


/*

 ### Login the user Programmatically ###

 Passport exposes a login() function on 'req' object
 					--req.login(...)  or  req.logIn(...)
 					--that can be used to establish a Login session.

 Invoking req.login() will completes login operation
 	--make the login session
 	--sets the req.user property


 Note:
 	passport.authenticate() middleware invokes req.login() automatically.
 	This function is primarily used when users sign up, during which req.login() can be invoked to automatically log in the newly registered user.


 */






/**
 * Signup
 */
exports.signup = function(req, res) {


	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;


	// Init Variables
	var user = new User(req.body);
	var message = null;



	// Add missing user fields
	user.provider = 'local';
	user.displayName = user.firstName + ' ' + user.lastName;



	// Then save the user
	user.save(function(err) {


		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {

			//User Saved Successfully

			// Remove sensitive data before login
			user.password = undefined;
			user.salt = undefined;


			//Once Sign Up is success, Don't ask User to enter username & password again to login --Login Programmatically
			//Refer ## in the top

			req.login(user, function(err) {

				//Authentication Failure
				if (err) {
					res.status(400).send(err);


				//Authentication Success
				} else {

					res.json(user);

				}
			});


		}



	});
};





/**
 * Signin after passport authentication
 */
exports.signin = function(req, res, next) {


	/*
		### PASSPORT -AUTHENTICATION -PROCESS ###

	 	passport.authenticate(...., callbackFn)
	 		--> internally calls [LocalStrategy function]
	 				--> this internally calls database to fetch the 'user' collection by username

							-- (1) if the user collection NOT found  //Authentication FAILURE [ Incorrect username ]
							-- (2) if the user collection found
									-- (2.1) compares the user entered password & db password
										-- (2.1.1) If password doesn't match  //Authentication FAILURE [ Incorrect Password ]
										-- (2.1.2) If password match  //Authentication SUCCESS //send the 'user' collection


							--if the Authentication SUCCESS or FAILURE  //(1) or (2.1.1) or (2.1.2)
									--calls the callbackFn(err, user, info)


	 */






	//Local Authentication
	passport.authenticate('local', function(err, user, info) {


		//REFER:  ### PASSPORT -AUTHENTICATION -PROCESS ###   --callbackFn

		//Authentication FAILURE
		//If any error is there -or- user obj not available
		if (err || !user) {

			//console.log(info);  //{ message: 'Incorrect Username' }  //{ message: 'Incorrect Password' }

			//400 BAD Request
			res.status(400).send(info);



		//Authentication SUCCESS
		} else {

			// Remove sensitive data before login
			user.password = undefined;
			user.salt = undefined;




			//REFER:    ### Login the user Programmatically ###

			req.login(user, function(err) {
				if (err) {
					res.status(400).send(err);
				} else {
					res.json(user);
				}
			});


		}


	})(req, res, next);



};




/*

 ## LogOut the user Programmatically ##

 Passport exposes a logout() function on 'req' object
 --req.logout(...)  or  req.logOut(...)
 --that can be called from any route handler which needs to terminate a login session.


 ** Invoking req.logout() will remove the req.user property and clear the login session (if any).


 */





/**
 * Signout
 */
exports.signout = function(req, res) {

	req.logout();
	res.redirect('/');

};








//------------------------------------ OAuth --------------------------------------------



/**
 * OAuth callback
 */
exports.oauthCallback = function(strategy) {
	return function(req, res, next) {
		passport.authenticate(strategy, function(err, user, redirectURL) {
			if (err || !user) {
				return res.redirect('/#!/signin');
			}
			req.login(user, function(err) {
				if (err) {
					return res.redirect('/#!/signin');
				}

				return res.redirect(redirectURL || '/');
			});
		})(req, res, next);
	};
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function(req, providerUserProfile, done) {
	if (!req.user) {
		// Define a search query fields
		var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
		var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

		// Define main provider search query
		var mainProviderSearchQuery = {};
		mainProviderSearchQuery.provider = providerUserProfile.provider;
		mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

		// Define additional provider search query
		var additionalProviderSearchQuery = {};
		additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

		// Define a search query to find existing user with current provider profile
		var searchQuery = {
			$or: [mainProviderSearchQuery, additionalProviderSearchQuery]
		};

		User.findOne(searchQuery, function(err, user) {
			if (err) {
				return done(err);
			} else {
				if (!user) {
					var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

					User.findUniqueUsername(possibleUsername, null, function(availableUsername) {
						user = new User({
							firstName: providerUserProfile.firstName,
							lastName: providerUserProfile.lastName,
							username: availableUsername,
							displayName: providerUserProfile.displayName,
							email: providerUserProfile.email,
							provider: providerUserProfile.provider,
							providerData: providerUserProfile.providerData
						});

						// And save the user
						user.save(function(err) {
							return done(err, user);
						});
					});
				} else {
					return done(err, user);
				}
			}
		});
	} else {
		// User is already logged in, join the provider data to the existing user
		var user = req.user;

		// Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
		if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
			// Add the provider data to the additional provider data field
			if (!user.additionalProvidersData) user.additionalProvidersData = {};
			user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

			// Then tell mongoose that we've updated the additionalProvidersData field
			user.markModified('additionalProvidersData');

			// And save the user
			user.save(function(err) {
				return done(err, user, '/#!/settings/accounts');
			});
		} else {
			return done(new Error('User is already connected using this provider'), user);
		}
	}
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function(req, res, next) {
	var user = req.user;
	var provider = req.param('provider');

	if (user && provider) {
		// Delete the additional provider
		if (user.additionalProvidersData[provider]) {
			delete user.additionalProvidersData[provider];

			// Then tell mongoose that we've updated the additionalProvidersData field
			user.markModified('additionalProvidersData');
		}

		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.login(user, function(err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});
			}
		});
	}
};

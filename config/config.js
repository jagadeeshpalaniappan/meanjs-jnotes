'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	glob = require('glob'),
	fs = require('fs');





/**
 * Resolve environment configuration by extending each env configuration file,
 *
 * and lastly merge/override that with any local repository configuration that exists
 * in local.js
 */
var resolvingConfig = function() {

	console.log('############################## 2. Load Configuration ###################################');


	var conf = {};
	var finalConf = {};

	conf = _.extend(
		require('./env/all'),	//all.js property file will be included
		require('./env/' + process.env.NODE_ENV) || {}   //depending on the NODE_ENV, environment specific property file will be included --[E.g. If NODE_ENV=development,  development.js will be included]
	);

	//Merging the conf and local.js file
	finalConf = _.merge(conf, (fs.existsSync('./config/env/local.js') && require('./env/local.js')) || {});




	/*
		_.merge(destObject, [sourceObjects]);     //Merge it
		_.extend(destObject, [sourceObjects]);	  //Updates it only if available
												  //destObject <-- [sourceObjects]
	 E.g.
	 ----

	 var dest = {
	 	p: { x: 10, y: 20},
	 };

	 var src = {
	 	p: { x: 20, z: 30},
	 };

	 console.log(_.merge(dest, src));  // p { x: 20,  y: 20, z: 30 }
	 console.log(_.extend(dest, src)); // p { x: 20, z: 30 }

    */

	return finalConf;
};





/**
 * Load app configurations
 */
module.exports = resolvingConfig();




/**
 * Get files by glob patterns
 */
module.exports.getGlobbedFiles = function(globPatterns, removeRoot) {
	// For context switching
	var _this = this;

	// URL paths regex
	var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

	// The output array
	var output = [];

	// If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob
	if (_.isArray(globPatterns)) {
		globPatterns.forEach(function(globPattern) {
			output = _.union(output, _this.getGlobbedFiles(globPattern, removeRoot));
		});
	} else if (_.isString(globPatterns)) {
		if (urlRegex.test(globPatterns)) {
			output.push(globPatterns);
		} else {
			glob(globPatterns, {
				sync: true
			}, function(err, files) {
				if (removeRoot) {
					files = files.map(function(file) {
						return file.replace(removeRoot, '');
					});
				}

				output = _.union(output, files);
			});
		}
	}

	return output;
};





/**
 * Get the modules JavaScript files
 */
module.exports.getJavaScriptAssets = function(includeTests) {
	var output = this.getGlobbedFiles(this.assets.lib.js.concat(this.assets.js), 'public/');

	// To include tests
	if (includeTests) {
		output = _.union(output, this.getGlobbedFiles(this.assets.tests));
	}

	return output;
};




/**
 * Get the modules CSS files
 */
module.exports.getCSSAssets = function() {
	var output = this.getGlobbedFiles(this.assets.lib.css.concat(this.assets.css), 'public/');

	//console.log('-----------------');
	//console.log(this.assets.lib.css);	//[ 'public/lib/bootstrap/dist/css/bootstrap.css','public/lib/bootstrap/dist/css/bootstrap-theme.css' ]
	//console.log(this.assets.css);		//[ 'public/modules/**/css/*.css' ]
	//console.log('-----------------');

	return output;
};



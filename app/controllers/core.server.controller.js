'use strict';

/**
 * Module dependencies.
 */
exports.index = function(req, res) {


	//Swig Template [index]
	res.render('index', {
		user: req.user || null,
		request: req
	});



};

'use strict';

module.exports = function(app) {


	// Root routing
	var core = require('../../app/controllers/core.server.controller');


	//Single Page Application (SPA)
	//-----Only Main Html file (index.server.view.html) will be loaded
	//-----AngularJS helps reduce the use of server side templating


	//Only One Main Page Route
	app.route('/').get(core.index);



};

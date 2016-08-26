'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
	http = require('http'),
	https = require('https'),
	express = require('express'),
	morgan = require('morgan'),
	logger = require('./logger'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	compression = require('compression'),
	methodOverride = require('method-override'),
	cookieParser = require('cookie-parser'),
	helmet = require('helmet'),
	passport = require('passport'),
	mongoStore = require('connect-mongo')({
		session: session
	}),
	flash = require('connect-flash'),
	config = require('./config'),
	consolidate = require('consolidate'),
	path = require('path'),
	chalk = require('chalk');





/**
 *
 * EXPRESS --- configuration
 *
 */


module.exports = function(db) {

	console.log('############################## 4. Initializing the EXPRESS configuration ###################################');


	// Initialize express app
	var app = express();



	//--------------------------[REQUIRE -ALL -MODEL -FILES]--------------------------------

	console.log(chalk.grey('\t------------* MODEL *-------------'));
	console.log(chalk.grey('\t------- (4.1) Including -all -MODEL -files ==> require(../app/models/**/*.js...) '));
	console.log(chalk.grey('\t------------* /MODEL *------------'));

	// Globbing model files
	config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
		require(path.resolve(modelPath));
	});



	//--------------------------[CONFIG VARIABLE -to- APPLICATION VARIABLE]--------------------------------
	console.log(chalk.grey('\t------- (4.2) CONFIG variable -to- APPLICATION variable [title, description, keywords, facebookAppId]'));

	// Setting application local variables
	app.locals.title = config.app.title;
	app.locals.description = config.app.description;
	app.locals.keywords = config.app.keywords;
	app.locals.facebookAppId = config.facebook.clientID;


	console.log(chalk.grey('\t------- (4.2) CONFIG variable -to- APPLICATION variable [allJsFiles, allCssFiles]'));
	app.locals.jsFiles = config.getJavaScriptAssets();
	app.locals.cssFiles = config.getCSSAssets();





	//--------------------------[PASSING REQ URL -to- ENV LOCALS]--------------------------------
	console.log(chalk.grey('\t------- (4.3) Passing the request url to environment locals'));

	// Passing the request url to environment locals
	app.use(function(req, res, next) {
		res.locals.url = req.protocol + '://' + req.headers.host + req.url;

		//console.log('----------');
		//console.log('URL #### '+res.locals.url);

		next();
	});



	//--------------------------[COMPRESSION]--------------------------------
	console.log(chalk.grey('\t------- (4.4) Configuring [compression] --Compress these content type [/json|text|javascript|css/]'));

	// Should be placed before express.static
	app.use(compression({


		// only compress files for the following content types
		filter: function(req, res) {
			return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
		},


		// zlib option for compression level
		level: 3
	}));



	//--------------------------[ENABLING -SHOW STACK ERRORS]--------------------------------
	console.log(chalk.grey('\t------- (4.5) Enabling -Show stack errors'));


	// Showing stack errors
	app.set('showStackError', true);



	//------------------------[Logger]----------------------------------
	console.log(chalk.grey('\t------- (4.6) Configuring -[morgan] ==> Logger'));

	// Enable logger (morgan)
	app.use(morgan(logger.getLogFormat(), logger.getLogOptions()));





	//------------------------[SWIG] ==> JavaScript Template Engine----------------------------------
	console.log(chalk.grey('\t------- (4.7) Configuring -[swig] ==> JavaScript Template Engine'));

	// Set swig as the template engine
	app.engine('server.view.html', consolidate[config.templateEngine]);

	// Set views path and view engine
	app.set('view engine', 'server.view.html');
	app.set('views', './app/views');



	//------------------------[VIEW] [CACHE]----------------------------------
	console.log(chalk.grey('\t------- (4.8) [VIEW] [CACHE] --for development [disabled] --for production [enabled]'));

	// Environment dependent middleware
	if (process.env.NODE_ENV === 'development') {
		// Disable views cache
		app.set('view cache', false);
	} else if (process.env.NODE_ENV === 'production') {
		app.locals.cache = 'memory';
	}



	//------------------------[body-parser]----------------------------------
	//body-parser will take the value from POST/PUT -HTTP Requests body
	// 	and parse it to (JSON, URL encoded, text, raw) whatever server expects

	console.log(chalk.grey('\t------- (4.9) Configuring -[body-parser] ==> POST/PUT -HTTP Requests body'));

	// Request body parsing middleware should be above methodOverride
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());



	//------------------------[helmet]----------------------------------
	//helps in handling insecure request
	// Hackers: Cross-Site Scripting (Xss), Script Injection, Click-Jacking
	console.log(chalk.grey('\t------- (4.10) Configuring -[helmet] ==> Handling INSECURE request [Cross-Site Scripting (Xss), Script Injection, Click-Jacking] '));

	// Use helmet to secure Express headers
	app.use(helmet.xframe());
	app.use(helmet.xssFilter());
	app.use(helmet.nosniff());
	app.use(helmet.ienoopen());
	app.disable('x-powered-by');



	//------------------------[HTML Static Folder Configuration]----------------------------------
	console.log(chalk.grey('\t------- (4.11) Configuring -HTML -static Folder ==> to provide direct static access'));


	// Setting the app router and static folder
	app.use(express.static(path.resolve('./public')));



	//------------------------[cookie-parser]----------------------------------
	//helper module for express-session
	console.log(chalk.grey('\t------- (4.12) Configuring -[cookie-parser] ==> helper module for [express-session]'));


	// CookieParser should be above session
	app.use(cookieParser());




	//------------------------[MongoDB Session]----------------------------------
	console.log(chalk.grey('\t------- (4.13) Configuring -MongoDB [session] --using [express-session]'));

	// Express MongoDB session storage
	app.use(session({
		saveUninitialized: true,
		resave: true,
		secret: config.sessionSecret,
		store: new mongoStore({
			db: db.connection.db,
			collection: config.sessionCollection
		}),
		cookie: config.sessionCookie,
		name: config.sessionName
	}));



	//------------------------[passport]----------------------------------
	//Authentication Module:
	console.log(chalk.grey('\t------- (4.14) Configuring -[passport] in [express]'));


	// use passport session
	app.use(passport.initialize());
	app.use(passport.session());



	//------------------------[connect-flash]----------------------------------
	console.log(chalk.grey('\t------- (4.15) Configuring -[connect-flash] messages ==>  used to store and retrieve messages from the session'));

	// connect flash for flash messages
	app.use(flash());



	//------------------------[ROUTE -CONFIGURATION]----------------------------------
	console.log(chalk.grey('\t------------* ROUTE *-------------'));
	console.log(chalk.grey('\t------- (4.16) Including -ALL ROUTES ==> require(../app/routes/**/*.js...) '));
	console.log(chalk.grey('\t------------* /ROUTE *------------'));

	// Globbing routing files
	config.getGlobbedFiles('./app/routes/**/*.js').forEach(function(routePath) {
		require(path.resolve(routePath))(app);
	});




	//--------------------------------[404 / NOT FOUND -CONFIG]-----------------------------------
	console.log(chalk.grey('\t------- (4.17) Configuring -ERROR [500] [404]'));

	// Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
	app.use(function(err, req, res, next) {
		// If the error object doesn't exists
		if (!err) return next();

		// Log it
		console.error(err.stack);

		// Error page
		res.status(500).render('500', {
			error: err.stack
		});
	});

	// Assume 404 since no middleware responded
	app.use(function(req, res) {
		res.status(404).render('404', {
			url: req.originalUrl,
			error: 'Not Found'
		});
	});



	//--------------------------------[HTTPS -CONFIG]-----------------------------------
	console.log(chalk.grey('\t------- (4.18) Configuring -HTTPS'));

	if (process.env.NODE_ENV === 'secure') {
		// Load SSL key and certificate
		var privateKey = fs.readFileSync('./config/sslcerts/key.pem', 'utf8');
		var certificate = fs.readFileSync('./config/sslcerts/cert.pem', 'utf8');

		// Create HTTPS Server
		var httpsServer = https.createServer({
			key: privateKey,
			cert: certificate
		}, app);

		// Return HTTPS server instance
		return httpsServer;
	}







	// Return Express server instance
	return app;
};

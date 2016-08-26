'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),		//1. Initialization
	config = require('./config/config'),	//2. Load Configuration
	mongoose = require('mongoose'),			//Mongoose Connection
	chalk = require('chalk');				//Chalk is for console output with highlighted colors



/**
 * Main application entry file. (MAIN)
 * Please note that the order of loading is important.
 */



//----------------------------------MONGO-DB------------------------------------
// 3. Bootstrap MONGO-DB connection
console.log('############################## 3. Bootstrap MONGO-DB connection ###################################');

var db = mongoose.connect(config.db.uri, config.db.options, function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	}

	/*else{
		//Connection Established
		console.log('##################### 3. Bootstrap DB connection [MONGODB- CONNECTION -ESTABLISHED] ');
	}*/
});
mongoose.connection.on('error', function(err) {
	console.error(chalk.red('MongoDB connection error: ' + err));
	process.exit(-1);
	}
);

//--------------------------------- / MONGO-DB------------------------------------


//----------------------------------EXPRESS------------------------------------

// 4. Init the EXPRESS configuration
var app = require('./config/express')(db);

// 5. Bootstrap PASSPORT config
require('./config/passport')();		//


// Start the app by listening on <port>
app.listen(config.port);

// Expose app
exports = module.exports = app;


//---------------------------------- / EXPRESS------------------------------------


//----------------------------------APP STARTED [MSG]------------------------------------

// Logging initialization
console.log(chalk.green('------------------------------------------------'));
console.log(chalk.green(config.app.title + ' (title) --Application Started'));
console.log(chalk.green('Environment:\t\t\t' + process.env.NODE_ENV));
console.log(chalk.green('Port:\t\t\t\t' + config.port));
console.log(chalk.green('Database:\t\t\t' + config.db.uri));

if (process.env.NODE_ENV === 'secure') {
	console.log(chalk.green('HTTPs:\t\t\t\ton'));
}
console.log(chalk.green('------------------------------------------------'));

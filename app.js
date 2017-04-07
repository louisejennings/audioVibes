//import modules required for the project
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressHandlebars = require('express-handlebars');
var expressValidator = require('express-validator');
var connectFlash = require('connect-flash');
var expressSession = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/test');
var fs = require('fs'); //file system

 //routes are defined here
var routes = require('./routes/index');
var users = require('./routes/users');
var music = require('./routes/music');

//Initialize an Express Application
var app = express();

//View Engine
app.set('views', path.join(__dirname, 'views')); //folder called 'views'
app.engine('handlebars', expressHandlebars({defaultLayout:'layout'})); //set handlebars as the app.engine and the default layout file is 'layout.handlebars'
app.set('view engine', 'handlebars'); //set the view engine to handlebars

//BodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

//Declare public directory to be used as a store for static files
app.use(express.static(path.join(__dirname, 'public'))); 

//Express Session (Middleware for Express Session)
app.use(expressSession({
	secret: 'Dweb0906',
	saveUninitialized: true,
	resave: true
}));

//Passport Initialisation
app.use(passport.initialize());
app.use(passport.session());

//Express Validator (Middleware for Express Validator)
app.use(expressValidator({
	errorFormatter: function(param, msg, value){
		var namespace = param.split('.'),
		root = namespace.shift(),
		formParam = root;

		while(namespace.length){
			formParam += '[' + namespace.shift() + ']';
		}
		return{
			param : formParam,
			msg : msg,
			value : value
		};
	}
}));

//Connect Flash (Middleware for Connect Flash)
app.use(connectFlash());

//Global Variables for Flash Connect
app.use(function (req, res, next){
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error'); //this line is needed because flash set their own flash messages
	res.locals.user = req.user || null; //if user is there we can access from anywhere otherwise null
	next();
});

//Middleware for route files
app.use('/', routes); //brings you to index file
app.use('/users', users);
app.use('/music', music); 

//Set Port
app.set('port', (process.env.PORT || 3033)); //port 3033  

app.listen(app.get('port'), function(){
	console.log('The application is listening on port ' + app.get('port'));
});



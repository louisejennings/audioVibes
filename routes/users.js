var express = require('express'); //include express
var router = express.Router();	//set up Router
var User = require('../models/user'); //Model User
var Music = require('../models/music'); //Model Music
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://localhost/test');
var assert = require('assert'); //check for errors


//Register
router.get('/register', function(req, res){ //get request for /register 
	res.render('register');	//render register.handlebars view
});

//Login
router.get('/login', function(req, res){ //get request for /login 
	res.render('login');	//render login.handlebars view
});

//Register User
router.post('/register', function(req, res){ //post register user details
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	var photo = req.body.photo;
	var twitter = req.body.twitter;
	var facebook = req.body.facebook;

	//Validation
	req.checkBody('name','Name is required').notEmpty();
	req.checkBody('email','Email is required').notEmpty();
	req.checkBody('email','Email is not valid').isEmail();
	req.checkBody('username','Username is required').notEmpty();
	req.checkBody('password','Password is required').notEmpty();
	req.checkBody('password2','Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();
	//if errors render register view again
	if(errors){
		res.render('register',{ 
			errors:errors
		});
	}else{
		var newUser = new User({	
			name: name,
			email: email,
			username: username,
			password: password,
			photo: photo,
			twitter: twitter,
			facebook: facebook
								
		});
		//else create user
		User.createUser(newUser, function(err, user){
			if (err) throw err;
		});

		req.flash('success_msg', 'You are registered and can now login'); //success message
		res.redirect('/users/login');	//redirect 
	}
});

passport.use(new LocalStrategy( //gets username finds if there is one that matches, then validates password.
	function(username, password, done){
		User.getUserByUsername(username, function(err, user){	//get username
			if (err) throw err;
			if (!user){											//check if exists
				return done(null, false, {message: 'Unknown User'});
			}
			User.comparePassword(password, user.password, function(err, isMatch){ //get password 
				if (err) throw err;
				if (isMatch){													//check if matches users password that is saved
					return done(null,user);
				}else{
					return done(null,false, {message:'Invalid password'});		
				}
			});
		});
	}));

passport.serializeUser(function(user,done){	//user.id saved in session
	done(null,user.id);
});

passport.deserializeUser(function(id,done){
	User.getUserById(id, function(err,user){ //whole object retrieved using user.id
		done(err,user);	//object attached to req.user
	});
});

router.post('/login', passport.authenticate('local', {}),
  function(req, res) {
	res.cookie('userID',req.user.id, { maxAge: 900000, httpOnly: true }); //remembers userID = req.user.id for 15min 
    res.redirect('/');
  }
);


//Logout
router.get('/logout', function(req, res){
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/users/login');
});

//Display user details on UserProfile page
router.get('/userprofile/', function(req, res) {	
	var userID = req.cookies.userID;
	User.getUserById(userID, function(err,user){
		res.render('userProfile', { user: user }); //display user details from collection
	});    
});


//Get User Profile details from db
router.get('/edit/:id', function(req, res){
	var id = req.params.id;
  User.findById(id, function(err, user) {
     res.render('edit',
     	{user : user});
  });
});

//Edit User profile and save new details to db
router.post('/edit/:id', function(req, res){
	var id = req.params.id;
	User.findById(id, function(err, user){
		user.name=req.body.name;
		user.username=req.body.username;
		user.password=req.body.password;
		user.password2=req.body.password2;
		user.email=req.body.email;
		user.photo=req.body.photo;
		user.twitter=req.body.twitter;
		user.facebook=req.body.facebook;
		user.save();

		res.redirect('/users/userProfile');
	});
});

//Display Favourites
router.get('/favourites/musicProfile/',function(req, res) {
	var userID = req.cookies.userID;
	User.getUserById(userID, function(err,user){
		res.render('musicProfile', { user: user });	//render the details on Music Profile page
	});    
});

//Add Favourite 
router.get('/favourites/:id',function(req, res) { //get music by id
	var id = req.params.id;
	var userID = req.cookies.userID;
	Music.getMusicById(id, function(err, music){	//go to Music model and use method getMusicById
		User.addFavourites(userID, music, function(err, user){ //go to User model and use addFavourites
			res.redirect('/'); //redirect to MusicProfile
		})
	})
});

//Delete Favourite 
router.get('/favourites/delete/:id',function(req, res) { //get music by id
	var id = req.params.id;
	var userID = req.cookies.userID;
	User.deleteFavourite(userID, id, function(err, user){ //go to User model and use deleteFavourite
		res.redirect('/users/favourites/musicProfile'); //redirect to MusicProfile
	})

});


module.exports = router;






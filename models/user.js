var mongo = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://localhost/test');
var bcrypt = require('bcryptjs');

//User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	name: {
		type: String
	},
	photo:{
		type: String
	},
	twitter:{
		type: String
	},
	facebook: {
		type: String
	},
	favourites:[{	//array of objectIds
        type: mongoose.Schema.Types.ObjectId, //stores document_ids from Music
        ref: 'Music', //use Music model during population
        required: false
    }]
});

var User = module.exports = mongoose.model('User',UserSchema);

//User Functions
//Create User
module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt){	//hash the password 
		bcrypt.hash(newUser.password, salt, function(err, hash){
			newUser.password = hash;//Store has in your password DB
			newUser.save(callback);
		});
	});
}
//Get Username
module.exports.getUserByUsername = function(username, callback) {
	var query = {username: username};
	User.findOne(query, callback);
}
//Get user by ID
module.exports.getUserById= function(id, callback){
	User.findOne({_id: id})
        .populate('favourites')	//get favourites once UserById called
        .exec(callback);
}

//Compare Password
module.exports.comparePassword= function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err,isMatch){
		if(err) throw err;
		callback(null,isMatch);
	});
}

//Add to Favourites
module.exports.addFavourites= function(id, music, callback){
	User.findByIdAndUpdate(id,{$addToSet: {"favourites": music}}, callback); //adds to favourites array in music collection in db if does not exist
}


//Delete from Favourites
module.exports.deleteFavourite= function(id, music, callback){
	User.findByIdAndUpdate(id,{$pull: {"favourites": music}}, callback);
}



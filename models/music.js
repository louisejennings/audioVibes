var mongo = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://localhost/test');

var MusicSchema = mongoose.Schema({
	title: {
		type: String,
		index: true
	},
	album: {
		type: String
	},
	artist: {
		type: String
	},
	genre: {
		type: String
	},
	play:{
		type: String
	},
	artwork:{
		type: String
	}
});

var Music = module.exports = mongoose.model('Music',MusicSchema);

//Get Music by ID
module.exports.getMusicById = (id, callback) =>{ 
	Music.findById(id, callback);	
}




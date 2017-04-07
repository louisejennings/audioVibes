var express = require('express'); //include express
var router = express.Router();	//set up Router
var fs = require('fs'); //file system
var Music = require('../models/music');

var mongo = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://localhost/test');

function ensureAuthenticated(req, res, next){ //only allow dashboard to show if logged in
	if(req.isAuthenticated()){
		return next();
	} else {
		res.redirect('/users/login');
	}
}

//Display all music on homepage
router.get('/',ensureAuthenticated,function(req, res) { //Music Collection - show all music in db
  Music.find(function(err, musics) {
    res.render('index', { musics: musics });
  });
});


//Play Music
var songsDir = __dirname.substring(0, __dirname.lastIndexOf("/") + 1); //remove routes from __dirname

router.get('/music', function(req,res){	
	var fileId = req.query.id; //Get song 
	var file = songsDir+'/songs/' + fileId; //create path pointing to that song
	fs.exists(file,function(exists){ //opens the file as a readable stream
		if(exists)
		{
			var rstream = fs.createReadStream(file);	
			rstream.pipe(res); //pipes the read stream to the response object (which goes to the client)
		}
		else
		{
			res.send("Its a 404");	//else display 404
			//res.redirect('/');
		}
	
	});
});

router.get('/download', function(req,res){
	var fileId = req.query.id;
	var file = songsDir + '/songs/' + fileId;
	fs.exists(file,function(exists){
		if(exists)
		{						//add two headers 
			res.setHeader('Content-disposition', 'attachment; filename=' + fileId); //tells browser content is an attachment and to download it 
			res.setHeader('Content-Type', 'application/audio/mpeg3') //mp3
			var rstream = fs.createReadStream(file);
			rstream.pipe(res);
		}
		else
		{
			res.send("Its a 404");
			res.end();
		}
	});
});

module.exports = router; 
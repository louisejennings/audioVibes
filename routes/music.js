var Music = require('../models/music');
var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var router = express.Router();
var db = mongoose.createConnection('mongodb://localhost/test');

module.exports = router;
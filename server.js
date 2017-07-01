var express = require('express');
var request = require('request');
var logger = require('morgon');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cheerio = require('cheerio');
var Comment = require('./models/Comment.js');
var Article = require('./models/Article.js');




var app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded)({
	extended: false
}));

app.use(express.static(process.cwd() + '/public'));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

mongoose.connect('mongodb://heroku_q4q21tm5:fs1s7hbshadgb3acaroqf1hf42@ds139362.mlab.com:39362/heroku_q4q21tm5');

var db = mongoose.connection;

db.on('error', function(err) {
	console.log('Error:', err);
});

db.once('open', function() {
	console.log('Connected successful');
});

var router = require('./controllers/controller.js');
app.use('/', router);

var port = process.env.PORT || 7134;
app.listen(port, function() {
	console.log('App running on port: ' port);
});


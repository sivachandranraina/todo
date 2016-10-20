var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var config = require('./config');
var mongoose = require('mongoose');

var app = express();

app.listen(config.port, function(err) {
    if (err) {
        console.log(err)
    } else {
        console.log("Port enabled")
    }
});

mongoose.connect(config.db, function(err){
	if(err) {
		console.log(err);
	} else {
		console.log('Server connected');
	}
});

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.use(express.static(__dirname + '/public'));

var api = require('./app/routes/api')(app, express);
app.use('/api', api)

app.get('*', function(req, res) {
	res.sendFile(__dirname + '/public/views/index.html');
});
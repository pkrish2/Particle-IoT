// // You will need to customize the settings in the config.js file!
// var config = require('./config.js');

// // Particle cloud API 
// var Particle = require('particle-api-js');
// var particle = new Particle();

// // https://github.com/mysqljs/mysql
// var mysql = require('mysql');

// // Make database connection
// console.log("starting database connection");
// var connection = mysql.createConnection(config.mysql);
// connection.connect();




	
// // Make cloud connection
// console.log("starting event stream listener");
// particle.getEventStream({ deviceId: '3c0038000c47363433353735', name: 'capacity', auth: config.authToken }).then(
// 	function(stream) {
// 		stream.on('event', cloudEventHandler);
// 	},
// 	function(err) {
// 		console.log("error starting event listener", err);			
// 		process.exit(1);		
// 	});



// cloudEventHandler = function(data) {
// 	// console.log("Event", data);

// 	storeData(JSON.parse(data.data));
	
// }

// function storeData(data) {
// 	console.log("storeData", data);
	
// 	connection.query('INSERT INTO test1 SET ?', {'a': data.a}, function(err, result) {
// 		if (err) throw err;

// 		console.log("id=" + result.insertId);
// 	});
// }








var Particle= require("particle-api-js");
var express=require('express');
var server=new express();

var particle=new Particle();
var content;

var token= "55945cd94f9aef5d28e83525d9480384ef127034";

server.set('view engine', 'ejs');


//Setting up MONGODB database
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/particleDB");

var nameSchema = new mongoose.Schema({
 DeviceName: String,
 EventName: String,
 Time: String,
 Measurement: String
});

var particleModel= mongoose.model("Particle Data", nameSchema);

name_to_deviceID={"peter":'3c0038000c47363433353735', "hulk":'480029000151353532373238',"tony":'4d0044000351353530373132'}



//get publishing stream from Peter

particle.getEventStream({ deviceId: name_to_deviceID["peter"], name:'capacity', auth: token}).then(function(stream) {
  
	stream.on('event', function(output) {
		console.log("Event: ", output);
		content=output.name+"("+output.published_at+"): "+output.data;

		//post to MongoDB
		var particledb = new particleModel({
											 DeviceName: "peter",
											 EventName: output.name,
											 Time: output.published_at,
											 Measurement: output.data
											});

			 
		particledb.save().then(item => {
			console.log("item saved to database");
		}).catch(err => {
			console.log("unable to save to database");
		});

	})},

	function(err) {
		console.log("error", err);			
		process.exit(1);		
});



//when users visit the main webpage, print out the most recent pushed content
server.get('/',function(req,res){
	res.render('index',{
		cons:content
	});

});


server.listen('3000', function(){
	console.log("Accessing particle data...");
});

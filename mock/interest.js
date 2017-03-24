const mongoose = require('mongoose');
const faker = require('faker/locale/tr');
const NearBySearch = require("googleplaces");
const config = require('../src/config/config');

var nearBySearch = new NearBySearch(config.api.google.mapsApiKey, "json").nearBySearch;


nearBySearch(parameters, function (error, response) {
    console.log(error, response);
    if (error) throw error;
});


const lat = 41.0786524;
const lon = 29.0223256;

// mongoose.connect(config.mongoDbConnectionString);
var User = require('../src/models/User');
var Interest = require('../src/models/Interest');


User.find(function (err, users) {
    if (err) {
        console.log(err);
    } else {

        users.forEach(function (user) {

            const x = {
                location: { type: "Point", coordinates: [ lat + Math.random(), lon.random() ] }
            }
        });
    }
});



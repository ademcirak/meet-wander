const mongoose = require('mongoose');
const faker = require('faker/locale/tr');
const NearBySearch = require("googleplaces");
const config = require('../src/config/config');

var nearBySearch = new NearBySearch(config.api.google.mapsApiKey, "json").nearBySearch;

const lat = 41.0786524;
const lon = 29.0223256;

var from = new Date(2017, 3, 26, 9, 11, 0, 0);
var to = new Date(2017, 4, 2, 10, 12, 0, 0);

Date.prototype.addRandomHours= function(){
    const h = Math.floor((Math.random() * 48) + 1);
    const copiedDate = new Date(this.getTime());
    copiedDate.setHours(copiedDate.getHours()+h);
    return copiedDate;
}

var User = require('../src/models/User');
var Interest = require('../src/models/Interest');


User.find(function (err, users) {
    if (err) {
        console.log(err);
    } else {

        users.forEach(function (user) {

            const x = lat + Math.random()/100;
            const y = lon + Math.random()/100;


            nearBySearch({
                location: [x, y]
            }, function (error, response) {
                if (error){
                    console.log('nearBySearch error:' , error);
                }else {
                    console.log('found places: ', response.results.length);
                    if(response && response.results && response.results.length > 0){
                        response.results.forEach(function (place) {

                            const startDate = faker.date.between(from, to);
                            const endDate = startDate.addRandomHours();
                            const obj = {
                                user: user._id,
                                place: place,
                                placeId: place.id,
                                location: { type: "Point", coordinates: [ place.geometry.location.lat, place.geometry.location.lng ] },
                                startDate: startDate,
                                endDate: endDate,
                                status: true
                            };

                            const ins = new Interest(obj);

                            ins.save(function (err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('ok');
                                }
                            });
                        })

                    }
                }

            });

        });
    }
});



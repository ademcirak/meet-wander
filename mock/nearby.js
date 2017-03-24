const NearBySearch = require("googleplaces");
const config = require('../src/config/config');
var nearBySearch = new NearBySearch(config.api.google.mapsApiKey, "json").nearBySearch;

var parameters = {
    location: [40.7127, -74.0059]
};

nearBySearch(parameters, function (error, response) {
    console.log(error, response);
    if (error) throw error;
});
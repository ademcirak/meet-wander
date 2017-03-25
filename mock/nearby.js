const NearBySearch = require("googleplaces");
const config = require('../src/config/config');

console.log('key:', config.api.google.mapsApiKey);
var nearBySearch = new NearBySearch(config.api.google.mapsApiKey, "json").nearBySearch;

var parameters = {
    location: [40.7127, -74.0059]
};

nearBySearch(parameters, function (error, response) {
    if (error){
        console.log('nearBySearch error:' , error);
    }else {
        console.log(response);
        if(response && response.results && response.results.length > 0){
            console.log('found: ', response.results.length);

            console.log(JSON.stringify(response.results[0]));
        }
    }
});
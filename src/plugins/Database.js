const Mongoose = require('mongoose');
const Config = require('../config/config');

//load database
Mongoose.connect(Config.mongoDbConnectionString);
const db = Mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback() {
    console.log("Connection with database succeeded.");
});


module.exports = {
    Mongoose: Mongoose,
    db: db
};
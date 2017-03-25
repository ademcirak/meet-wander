var Mongoose = require('../plugins/Database').Mongoose;

//create the schema
var userSchema = new Mongoose.Schema({
    name:     {    type: String,   required: true },
    surname:  {    type: String,   required: true },
    createdAt: { type: Date,     required: true, default: Date.now },
});

module.exports =  Mongoose.model('Place', userSchema);
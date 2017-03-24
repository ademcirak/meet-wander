var Mongoose = require('../plugins/Database').Mongoose;

//create the schema
var userSchema = new Mongoose.Schema({
    user: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    location: { type: {type:String}, coordinates: [Number]},
    startDate: { type: Date },
    endDate: { type: Date},
    status: Boolean,
    createdAt: { type: Date,     required: true, default: Date.now }

});

module.exports =  Mongoose.model('Interest', userSchema);
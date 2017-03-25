var Mongoose = require('../plugins/Database').Mongoose;

//create the schema
var schema = new Mongoose.Schema({
    interest: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'Interest'
    },
    user: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    owner: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: String,
    createdAt: { type: Date, required: true, default: Date.now }
});

module.exports =  Mongoose.model('ParticipantRequest', schema);
var Mongoose = require('../plugins/Database').Mongoose;

//create the schema
var schema = new Mongoose.Schema({
    user: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    place: { type: Mongoose.Schema.Types.Mixed },
    placeId: { type: String },
    location: { type: {type:String}, coordinates: [Number]},
    startDate: { type: Date },
    endDate: { type: Date},
    status: Boolean,
    createdAt: { type: Date,     required: true, default: Date.now }

});

schema.statics.getNearby = function (longitude, latitude, callback) {

    if ((longitude || latitude) === undefined) return new ModelError("location or radius is missing");

    var Interest = this;
    var point = {type: "Point", coordinates: [longitude, latitude]};
    Interest.geoNear(point, {minDistance: 0, maxDistance: 1000000},
        function (err, activities, stats) {
            if (err)  return callback(err);
            callback(null, activities);
        }
    );
};

module.exports =  Mongoose.model('Interest', schema);
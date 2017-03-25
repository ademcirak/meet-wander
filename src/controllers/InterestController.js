const Joi = require('joi');
const config = require('../config/config');
const Boom = require('boom');
const validations = require('../config/validations');
const crypto = require('crypto');
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const moment = require('moment');
exports.register = function (server, options, next) {

    server.log(['info'], 'Loading interest controller');


    const User = server.plugins['db'].models.User;
    const Interest = server.plugins['db'].models.Interest;

    const getNearby = function(request, reply) {

        Interest.aggregate([

            {
                $geoNear: {
                    near: { type: "Point", coordinates: [41.0786524, 29.0223256] },
                    distanceField: "dist.calculated",
                    maxDistance: 1000,
                    includeLocs: "dist.location",
                    spherical: true
                }
            },
            {
                $group: {
                    _id: "$placeId",
                    place : { $first: '$place' },
                    count: {$sum: 1}
                }
            },
            {
                $sort:{
                    "count":-1
                }
            }
        ], function (err, result) {
            if (err)
                return reply(Boom.badImplementation(err));

            reply(result);
        });

    };

    server.route({
        method: ['POST'],
        path: '/nearby',
        config: {
            auth: false,
            handler: getNearby,
            description: 'Returns nearby events',
            notes: 'Returns nearby events',
            tags: ['api', 'user'],
            validate: {
                payload: {
                    lat: validations.point,
                    lng: validations.point
                }
            }
        }
    });



    const search = function(request, reply) {

        const startDate = moment(request.payload.startDate).toDate();
        const endDate = moment(request.payload.endDate).toDate();
        Interest.find({
            placeId: request.payload.placeId,
            startDate: {
                $lte: endDate
            },
            endDate: {
                $gte: startDate
            }
        }, function (err, result) {
            if (err)
                return reply(Boom.badImplementation(err));

            reply(result);
        });

    };


    server.route({
        method: ['POST'],
        path: '/search',
        config: {
            auth: false,
            handler: search,
            description: 'Returns nearby events',
            notes: 'Returns nearby events',
            tags: ['api', 'user'],
            validate: {
                payload: {
                    placeId: validations.slug,
                    startDate: Joi.date().required(),
                    endDate: Joi.date().min(Joi.ref('startDate')).required()
                }
            }
        }
    });




    server.log(['info'], 'Interest controller loaded');
    next(); //IMPORTANT
};

exports.register.attributes = {
    name: 'InterestController'
};

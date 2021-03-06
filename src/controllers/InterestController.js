const Joi = require('joi');
const config = require('../config/config');
const Boom = require('boom');
const validations = require('../config/validations');
const crypto = require('crypto');
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const moment = require('moment');
const googleplaces = require("googleplaces");
var onesignal = require('node-opensignal-api');
var onesignal_client = onesignal.createClient();


const sendNotificationToUser = function(userId, message, data, buttons) {

    var params = {
        app_id: config.api.oneSignal.appId,
        contents: {
            'en': message
        },
        tags: [{ "key": "user", "relation": "=", "value": userId.toString()}]
    };

    if(data)
    {
        params.data = data;
    }

    if(buttons)
    {
        params.buttons = buttons;
    }

    onesignal_client.notifications.create(config.api.oneSignal.apiKey, params, function (err, response) {
        if (err) {
            console.log('Notification send error: ', err);
        } else {
            console.log('Notification sent: ', response);
        }
    });
};


exports.register = function (server, options, next) {

    server.log(['info'], 'Loading interest controller');

    const User = server.plugins['db'].models.User;
    const Interest = server.plugins['db'].models.Interest;
    const ParticipantRequest = server.plugins['db'].models.ParticipantRequest;

    const participantStatus = {
        PENDING: 'pending',
        APPROVED: 'approved',
        DECLINED: 'declined'
    };

    var placeDetailsRequest = new googleplaces(config.api.google.mapsApiKey, "json").placeDetailsRequest;

    const declinedInterest = function(request, reply) {


        ParticipantRequest.update({ _id: new ObjectId(request.payload.requestId ) }, { status: participantStatus.DECLINED }, function (err, obj) {
            if (err) {
                return reply(Boom.internal(err));
            } else {

                reply({});
            }
        });

    };

    server.route({
        method: ['POST'],
        path: '/decline',
        config: {
            auth: false,
            handler: declinedInterest,
            description: 'decline interest',
            notes: 'decline interest',
            tags: ['api', 'interest'],
            validate: {
                payload: {
                    requestId: validations.slug
                }
            }
        }
    });

    const approveInterest = function(request, reply) {


        ParticipantRequest.update({ _id: new ObjectId(request.payload.requestId ) }, { status: participantStatus.APPROVED }, function (err, obj) {
            if (err) {
                return reply(Boom.internal(err));
            } else {

                ParticipantRequest.findOne({ _id: new ObjectId(request.payload.requestId ) }, function (err, result) {
                    if (err)
                        return reply(Boom.internal(err));

                    if(result) {
                        Interest.update({ _id: result.interest }, { $addToSet: { participants: new ObjectId(result.user.toString()) } }, function (err) {
                            if (err)
                                return reply(Boom.internal(err));

                            sendNotificationToUser(result.user, 'Etkinliğe girme isteğiniz onaylandı! İyi gezmeler :)', { interestId: result.interest.toString() });
                            reply({});
                        });
                    } else {
                        return reply(Boom.badRequest('Request not found!'));
                    }


                });
            }
        });

    };

    server.route({
        method: ['POST'],
        path: '/approve',
        config: {
            auth: false,
            handler: approveInterest,
            description: 'approve interest',
            notes: 'approve interest',
            tags: ['api', 'interest'],
            validate: {
                payload: {
                    requestId: validations.slug
                }
            }
        }
    });

    const joinInterest = function(request, reply) {


        const obj = {
            owner: new ObjectId(request.payload.ownerId),
            user: new ObjectId(request.payload.userId),
            interest: new ObjectId(request.payload.interestId),
            status: participantStatus.PENDING
        };

        new ParticipantRequest(obj).save(function (err, obj) {
            if (err) {
                return reply(Boom.internal(err));
            } else {
                sendNotificationToUser(
                    request.payload.ownerId,
                    'Yeni bir kullanıcı etkinliğinize katılmak istiyor.',
                    { interestId: request.payload.interestId, requestId: obj._id.toString() },
                    [{"id":"approve","text":"Onayla","icon":""},{"id":"decline","text":"Reddet","icon":""},{"id":"","text":"","icon":""}]
                );
                return reply(obj);
            }
        });

    };

    server.route({
        method: ['POST'],
        path: '/join',
        config: {
            auth: false,
            handler: joinInterest,
            description: 'Join interest',
            notes: 'Join interest',
            tags: ['api', 'interest'],
            validate: {
                payload: {
                    ownerId: validations.slug,
                    interestId: validations.slug,
                    userId: validations.slug
                }
            }
        }
    });

    const createInterest = function(request, reply) {

        placeDetailsRequest({placeid: request.payload.placeId }, function (error, response) {
            if (error) {
                return reply(Boom.internal(error));
            }

            console.log(response);

            if(!response || !response.result) {
                return reply(Boom.badRequest('Place not found'));
            }

            const startDate = moment(request.payload.startDate).toDate();
            const endDate = moment(request.payload.endDate).toDate();

            const place = response.result;

            const obj = {
                user: new ObjectId(request.payload.userId),
                title: request.payload.title,
                description: request.payload.description,
                place: place,
                placeId: place.place_id,
                location: { type: "Point", coordinates: [ place.geometry.location.lat, place.geometry.location.lng ] },
                startDate: startDate,
                endDate: endDate,
                status: true
            };

            const ins = new Interest(obj);

            ins.save(function (err, obj) {
                if (err) {
                    return reply(Boom.internal(error));
                } else {
                    return reply(obj);
                }
            });

        });

    };

    server.route({
        method: ['POST'],
        path: '/interest',
        config: {
            auth: false,
            handler: createInterest,
            description: 'Create interest',
            notes: 'Creates interest',
            tags: ['api', 'interest'],
            validate: {
                payload: {
                    title: Joi.string().required(),
                    description: Joi.string().optional(),
                    userId: validations.slug,
                    placeId: validations.slug,
                    startDate: Joi.date().required(),
                    endDate: Joi.date().min(Joi.ref('startDate')).required()
                }
            }
        }
    });

    const getNearby = function(request, reply) {

        Interest.aggregate([

            {
                $geoNear: {
                    near: { type: "Point", coordinates: [request.query.lat, request.query.lng] },
                    distanceField: "distance",
                    maxDistance: 200,
                    limit: 50000,
                    query: { status: true },
                    spherical: true
                }
            },
            {
                $group: {
                    _id: "$placeId",
                    location : { $first: '$location.coordinates' },
                    distance: { $first: "$distance" },
                    place : { $first: '$place' },
                    count: {$sum: 1}
                }
            },
            {
                $sort:{
                    "count":-1
                }
            },
            { $limit : 10 }
        ], function (err, result) {
            if (err)
                return reply(Boom.badImplementation(err));

            reply({results: result});
        });

    };

    server.route({
        method: ['GET'],
        path: '/nearby',
        config: {
            auth: false,
            handler: getNearby,
            description: 'Returns nearby events',
            notes: 'Returns nearby events',
            tags: ['api', 'interest'],
            validate: {
                query: {
                    lat: validations.point,
                    lng: validations.point
                }
            }
        }
    });

    const search = function(request, reply) {

        const startDate = moment(request.payload.startDate).toDate();
        const endDate = moment(request.payload.endDate).toDate();

        console.log(startDate, endDate);


        Interest.find({
            $and : [
                { "place.place_id": request.payload.placeId },
                {
                    endDate: {
                        $gte: new Date()
                    }
                },
                {
                    $and: [
                        {
                            endDate: {
                                $lte: endDate
                            }
                        },
                        {
                            startDate: {
                                $gte: startDate
                            }
                        }
                    ]
                }
            ]
        })
            .sort({'createdAt': -1})
            .limit(100)
            .populate('user')
            .populate('participants')
            .exec(function(err, result) {
                if (err)
                    return reply(Boom.badImplementation(err));

                // remove point from location data
                // delete not working on mongo response: http://stackoverflow.com/questions/32272937/javascript-delete-object-property-not-working
                const jsonResult = JSON.parse(JSON.stringify(result));

                jsonResult.forEach(function (item) {
                    item.location = item.location.coordinates;
                });

                reply({ results: jsonResult });
            })

    };

    server.route({
        method: ['POST'],
        path: '/search',
        config: {
            auth: false,
            handler: search,
            description: 'Search events',
            notes: 'Search events',
            tags: ['api', 'interest'],
            validate: {
                payload: {
                    placeId: Joi.string().required(),
                    startDate: Joi.date().required(),
                    endDate: Joi.date().min(Joi.ref('startDate')).required()
                }
            }
        }
    });

    const deleteInterests = function(request, reply) {


        Interest.remove({ _id: new ObjectId(request.payload.interestId ) }, function (err) {
            if (err) {
                return reply(Boom.internal(err));
            } else {

                reply({});
            }
        });

    };

    server.route({
        method: ['DELETE'],
        path: '/interest',
        config: {
            auth: false,
            handler: deleteInterests,
            description: 'Delete interest',
            notes: 'Delete an interest',
            tags: ['api', 'interest'],
            validate: {
                payload: {
                    interestId: validations.slug
                }
            }
        }
    });


    const getInterestById = function(request, reply) {


        Interest
            .findOne({
                _id: new ObjectId(request.params.id)
            })
            .populate('user')
            .populate('participants')
            .exec(function(err, item) {

                if (err)
                    return reply(Boom.badImplementation(err));

                // remove point from location data
                // delete not working on mongo response: http://stackoverflow.com/questions/32272937/javascript-delete-object-property-not-working
                item = JSON.parse(JSON.stringify(item));
                item.location = item.location.coordinates;

                reply(item);
            })

    };

    server.route({
        method: ['GET'],
        path: '/interest/{id}',
        config: {
            auth: false,
            handler: getInterestById,
            description: 'Get event by id',
            notes: 'Get event by id',
            tags: ['api', 'interest'],
            validate: {
                params: {
                    id: validations.slug
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

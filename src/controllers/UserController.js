const Joi = require('joi');
const config = require('../config/config');
const Boom = require('boom');
const validations = require('../config/validations');
const crypto = require('crypto');
const mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

exports.register = function (server, options, next) {

    server.log(['info'], 'Loading user controller');


    const User = server.plugins['db'].models.User;
    const Interest = server.plugins['db'].models.Interest;
    const ParticipantRequest = server.plugins['db'].models.ParticipantRequest;

    const getUsers = function(request, reply) {
        server.log(['info'], 'getting all users');

        console.log(User);

        User.find(function (err, users) {
            if (!err) {
                reply(users);
            } else {
                reply(Boom.badImplementation(err)); // 500 error
            }
        });
    };

    server.route({
        method: ['GET'],
        path: '/user',
        config: {
            auth: false,
            handler: getUsers,
            description: 'Get all users',
            notes: 'Returns all users',
            tags: ['api', 'user']
        }
    });

    const getProfile = function(request, reply) {

        let userId =request.auth.credentials.id;

        User.findOne({
            _id : userId
        }, function(err, user) {
            if (!err) {
                reply(user);
            } else {
                reply(Boom.badImplementation(err)); // 500 error
            }
        });
    };


    server.route({
        method: ['GET'],
        path: '/user/profile',
        config: {
            handler: getProfile,
            description: 'get user profile',
            notes: 'get current user\'s profile info',
            tags: ['api', 'profile', 'user']
        }
    });


    const getUser = function(request, reply) {

        let userId = request.params.id;

        User.findOne({
            _id : userId
        }, function(err, user) {
            if (!err) {
                reply(user);
            } else {
                reply(Boom.badImplementation(err)); // 500 error
            }
        });
    };


    server.route({
        method: ['GET'],
        path: '/user/{id}',
        config: {
            auth: false,
            handler: getUser,
            description: 'Get user info by id',
            notes: 'Returns user by id.',
            tags: ['api', 'user'],
            validate: {
                params: {
                    id : validations.slug.description('user id')
                }
            }
        }
    });


    const getInterests = function(request, reply) {

        let userId = request.params.id;

        let query = {
            user : new ObjectId(userId),
            status: true
        };

        if(request.query.type==='past') {
            query.endDate = {
                $lte: new Date()
            };
        }
        else if(request.query.type==='future') {
            query.startDate = {
                $gt: new Date()
            };
        }

        Interest
            .find(query)
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
            });
    };


    server.route({
        method: ['GET'],
        path: '/user/{id}/interest',
        config: {
            auth: false,
            handler: getInterests,
            description: 'Get user interests',
            notes: 'Returns user interests',
            tags: ['api', 'user'],
            validate: {
                params: {
                    id : validations.slug.description('user id')
                },
                query: {
                    type: Joi.any().valid(['past', 'future']).optional().description('type')
                }
            }
        }
    });


    const pendingRequests = function(request, reply) {


        ParticipantRequest.find({
            owner: new ObjectId(request.params.id),
            status: 'pending'
        })
            .sort({'createdAt': -1})
            .populate('user')
            .populate('interest')
            .exec(function(err, result) {
                if (err)
                    return reply(Boom.badImplementation(err));

                const jsonResult = JSON.parse(JSON.stringify(result));

                jsonResult.forEach(function (item) {
                    item.interest.location = item.interest.location.coordinates;
                });

                reply({ results: jsonResult });
            })

    };

    server.route({
        method: ['GET'],
        path: '/user/{id}/requests',
        config: {
            auth: false,
            handler: pendingRequests,
            description: 'Returns pending requests',
            notes: 'Returns pending requests',
            tags: ['api', 'user'],
            validate: {
                params: {
                    id : validations.slug.description('user id')
                }
            }
        }
    });




    server.log(['info'], 'User controller loaded');
    next(); //IMPORTANT
};

exports.register.attributes = {
    name: 'UserController'
};

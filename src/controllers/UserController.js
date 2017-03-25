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

    const changeAbleUserAttributes = [
        'name',
        'surname',
        'email',
        'phone_number',
        'is_private',
        'bio'
    ];


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

        Interest.find({
            user : new ObjectId(userId),
            status: true
        }, function(err, interests) {
            if (!err) {
                reply(interests);
            } else {
                reply(Boom.badImplementation(err)); // 500 error
            }
        });
    };


    server.route({
        method: ['GET'],
        path: '/user/{id}/interest',
        config: {
            auth: false,
            handler: getInterests,
            description: 'Get user interests by id',
            notes: 'Returns user interests by id.',
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

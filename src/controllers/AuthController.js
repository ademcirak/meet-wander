const Joi = require('joi');
const Boom = require('boom');
const config = require('../config/config');
const validations = require('../config/validations');
const jwt = require('jsonwebtoken');

exports.register = function (server, options, next) {

    server.log(['info'], 'Loading AuthPlugin');

    const User = server.plugins['db'].models.User;

    const register = function(request, reply) {

        var newUser = new User(request.payload);
        newUser.save(function (err) {
            if (err) {
                reply(Boom.badImplementation(err));
            } else {
                reply({});
            }
        });
    };

    const login = function(request, reply) {

        User.findOne({
            name: request.payload.name
        }, function(err, user) {
            if (err) {
                return reply(user);
            }

            let userData = {
                _id: user.id,
                username: user.username,
                name: user.name,
                surname: user.surname
            };

            userData.token = jwt.sign(userData, config.keys.secret32);
            reply(userData);
            server.log(['info'], 'user logged in: ' + JSON.stringify(userData));
        });

    };

    server.route({
        method: ['POST'],
        path: '/login',
        config: {
            auth: false,
            handler: login,
            description: 'local login with phone number',
            notes: 'Returns token and basic user info.',
            tags: ['api', 'auth', 'pre-login', 'login'],
            validate: {
                payload : {
                    name: validations.name
                }
            }
        }
    });

    server.route({
        method: ['POST'],
        path: '/register',
        config: {
            auth: false,
            description: 'register to system',
            notes: 'Register and log in a new user.',
            tags: ['api', 'auth', 'pre-login', 'register'],
            validate: {
                payload : {
                    name: validations.name.description('name'),
                    surname: validations.surname.description('surname'),
                }
            }
        },
        handler: register
    });


    server.log(['info'], 'Auth plugin loaded');
    next(); //IMPORTANT
};

exports.register.attributes = {
    name: 'AuthController'
};

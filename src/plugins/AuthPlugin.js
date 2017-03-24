"use strict";


const Joi = require('joi');
const Boom = require('boom');
const config = require('../config/config');
const validations = require('../config/validations');
const jwt = require('jsonwebtoken');

exports.register = function (server, options, next) {

    server.log(['info'], 'Loading AuthPlugin');

    server.auth.strategy(
        'jwt',
        'jwt',
        {
            key: config.keys.secret32,
            validateFunc: function(decoded, request, callback) {
                return callback(null, true);
            },
            verifyOptions: {
                algorithms: [ 'HS256' ],
                expiresIn: '30d'
            }
        }
    );

    server.auth.default('jwt');

    server.log(['info'], 'Auth plugin loaded');
    next(); //IMPORTANT
};

exports.register.attributes = {
    name: 'AuthPlugin'
};

const Joi = require('joi');

module.exports =  {

    // user
    username: Joi.string().alphanum().min(3).max(32).required(),
    password: Joi.string().min(6).max(32).required(),
    name: Joi.string().min(2).max(120).required(),
    surname: Joi.string().min(1).max(120).required(),
    id : Joi.number().integer().min(1).required(),
    email: Joi.string().email(),
    phoneNumber: Joi.string().length(10).required(),
    slug: Joi.string().min(1).max(511).regex(/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/).required(),
    optionalId : Joi.number().integer().min(1).optional(),


    optionalName: Joi.string().min(2).max(120).optional(),
    optionalSurname: Joi.string().min(1).max(120).optional(),
    optionalEmail: Joi.string().email().optional(),
    optionalPassword: Joi.string().min(6).max(32).optional(),
    optionalPhoneNumber: Joi.string().length(10).optional(),
    optionalBoolean: Joi.number().integer().allow(0,1).optional(),
    optionalCount: Joi.number().integer().min(0).optional(),

    // app
    clientKey: Joi.string().max(40).required(),
    platform: Joi.string().max(20).required(),
    optionalString: Joi.string().allow('').optional(),
    requiredString: Joi.string().required(),
    token: Joi.string().optional()

};


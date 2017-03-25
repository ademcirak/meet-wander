const Joi = require('joi');

module.exports =  {

    // user
    username: Joi.string().alphanum().min(3).max(32).required(),
    name: Joi.string().min(2).max(120).required(),
    surname: Joi.string().min(1).max(120).required(),
    id : Joi.number().integer().min(1).required(),
    slug: Joi.string().min(1).max(511).regex(/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/).required(),
    point: Joi.number().required(),

    token: Joi.string().optional()

};


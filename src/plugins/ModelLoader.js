const glob = require('glob');
const path = require('path');
var Mongoose = require('./Database').Mongoose;
const config = require('../config/config');

const register = (server, options, next) => {
    server.log(['info'], 'Loading ModelLoader');

    const modelSelectQuery = path.join(config.paths.root,'src', 'models', '*.js');
    const modelFiles = glob.sync(modelSelectQuery);

    const models = {};
    modelFiles.forEach((modelPath) => {
        const modelDef = require(modelPath);
        const modelName = path.basename(modelPath).split('.')[0];
        models[modelName] = modelDef;
    });

    server.expose('models', models);
    server.expose('mongoose', Mongoose);

    server.log(['info'], 'ModelLoader loaded');
    next();
};

register.attributes = {
    name: 'db',
    version: '1.0.0'
};

module.exports = register;
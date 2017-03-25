const hapi = require('hapi');
const path = require('path');
const Boom = require('boom');

const config = require('./config/config');

const server = new hapi.Server();
server.connection({
    port: config.app.port,
    host: config.app.host,
    router: {
        stripTrailingSlash: true
    },
    routes: {
        log: true
    }
});

const plugins = [];


/* important module and plugins */

plugins.push({
    register: require('vision'),
});

plugins.push({
    register: require('inert'),
});

plugins.push({
    register: require('good'),
    options: config.good,
});

plugins.push({
    register: require('tv'),
    options: config.tv
});

plugins.push({
    register: require('hapi-swagger'),
    options: config.swagger
});


plugins.push({
    register: require('hapi-auth-jwt2'),
    options: config.jwt
});

plugins.push({
    register: require('./plugins/ModelLoader')
});

plugins.push({
    register: require('./plugins/AuthPlugin')
});

plugins.push({
    register: require('./controllers/AuthController')
});

plugins.push({
    register: require('./controllers/UserController')
});

plugins.push({
    register: require('./controllers/InterestController')
});

server.register(plugins, (err) => {
    if (err) {
        server.log(['error'], err);
        throw err;
    }

    server.log(['info'], JSON.stringify(config));

    // serve upload
    server.route({
        method: 'GET',
        path: '/upload/{path*}',
        config: {
            auth: false,
            log: false,
            handler: {
                directory: {
                    path: path.join(config.paths.upload),
                    index: false,
                    listing: true,
                    redirectToSlash: false,
                },
            },
        },
    });

    server.route({
        method: '*',
        path: '/',
        config: {
            auth: false,
            handler: (request, reply) => {
                reply({ message: 'Working!' });
            }
        }
    });

    // not found
    server.route({
        method: '*',
        path: '/{p*}',
        config: {
            auth: false,
            handler: (request, reply) => {
                return reply(Boom.notFound());
            }
        }
    });

    server.ext('onPreResponse', (request, reply) => {
        if (request.response instanceof Error) {
            const message = request.response.message || '';
            server.log(['error'], `${message} Trace: ${request.response.stack}`);
        }
        return reply.continue();
    });

    server.on('request-error', (request, error) => {
        server.log(['error'], `Error response (500) sent for request: ${request.id} because: ${JSON.stringify(error)}`);
    });

    server.start(() => {
        server.log(['info'], `Server running at: ${server.info.uri}`);
    });

});
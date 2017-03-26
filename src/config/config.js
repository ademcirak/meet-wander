const dotEnv = require('dotenv').config();
const path = require('path');
const os = require('os');

const Package = require('../../package.json');

const app = {
    host: process.env.SERVER_HOST,
    port: process.env.PORT || process.env.SERVER_PORT || 8080
};

module.exports = {
    environment: process.env.ENV,
    app: app,
    mongoDbConnectionString: process.env.MONGODB,
    parameters: {
        resultPerPage: 100,
        url: process.env.URL
    },
    paths: {
        root: process.cwd(),
        upload: path.join(process.cwd(), 'upload'),
        cache: path.join(process.cwd(), 'cache'),
    },
    keys: {
        secret32: 'vJw29cbSn01b7cG0oeGcnkRva2yaGfAo',
        cookie: 'SESSION_ID'
    },
    api: {
        facebook: {
            consumerKey: '',
            consumerSecret: ''
        },
        google: {
            mapsApiKey: process.env.GOOGLE_KEY
        },
        oneSignal: {
            appId: process.env.ONESIGNAL_APP_ID,
            apiKey: process.env.ONESIGNAL_API_KEY
        }
    },

    image: {
        avatar: {
            height: 256,
            width: 256
        },
        thumbnail: {
            maxHeight: 512,
            mexWidth: 512
        },
        image: {
            maxHeight: 1600,
            maxWidth: 2500
        }
    },

    good: {
        ops: {
            interval: 1000
        },
        reporters: {
            console: [{
                module: 'good-squeeze',
                name: 'Squeeze',
                args: [{
                    log: '*',
                    response: '*'
                }]
            }, {
                module: 'good-console'
            }, 'stdout']
        }
    },
    swagger: {
        info: {
            title: 'API Documentation',
            version: Package.version
        },
        jsonPath: '/development/swagger/swagger.json',
        documentationPath: '/development/swagger/docs',
        swaggerUIPath: '/development/swagger/'
    },
    tv: {
        endpoint: '/development/debug/console'
    },
    jwt : {
        expiresIn: '30 days',
        ignoreExpiration: false
    }
};
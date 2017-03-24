const mongoose = require('mongoose');
const faker = require('faker/locale/de');
const limit= 5000;

const config = require('../src/config/config');

// mongoose.connect(config.mongoDbConnectionString);

var User = require('../src/models/User');

let i = 0;
while(i < limit)
{
    const obj = {
        name: faker.name.firstName(),
        surname: faker.name.lastName()
    };

    const usr = new User(obj);

    usr.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('ok');
        }
    });

    i++;
}


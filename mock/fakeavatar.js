const mongoose = require('mongoose');
const faker = require('faker/locale/tr');
const config = require('../src/config/config');
const ObjectId = require('mongoose').Types.ObjectId;


var User = require('../src/models/User');


// {_id: new ObjectId('58d584e97a47a21f18092839') }
User.find(function (err, users) {
    if (err) {
        console.log(err);
    } else {

        users.forEach(function (user) {
            const image = faker.image.avatar();
            /*
            console.log('user', user._id);
            console.log('image: ', image);
            */
            User.update({ _id: new ObjectId(user._id.toString()) }, { image: image }, function (err,result) {
                console.log(err, result);
                if (err) {
                    console.log(err);
                } else {
                    console.log('ok');
                }
            });

        });
    }
});



var express = require('express');
var router = express.Router();
var encryptor = require('../lib/encryptor');

let errRes = {
    'message': '',
    'errors': {}
}

function resetErrorsRes() {
    errRes.errors = {}
}

function setErrorRes(field, errMessage) {
    resetErrorsRes();
    errRes.message = 'validation fail';
    errRes.errors[field] = errMessage;
}

const isFloat = (number) => {
    return Number(number) === number && number % 1 !== 0;
}

router.post('/', async function(req, res) {
    let body = req.body;
    const userCollection = req.db.collection('users');

    if (!body.full_name) {
        setErrorRes('full_name', 'full_name is required');
        res.status(422).json(errRes);
        return;
    }

    if (!body.address) {
        setErrorRes('address', 'address is required');
        res.status(422).json(errRes);
        return;
    }

    if (!body.email) {
        setErrorRes('email', 'email is required');
        res.status(422).json(errRes);
        return;
    }

    // Validation is email exist
    let user;
    try {
        const query = { email: body.email };
        user = await userCollection.findOne(query);
    } catch (error) {
        console.error('Error creating user', error);
        res.status(500).json({ error: 'Failed to create user' });
        return;
    }

    if (user) {
        setErrorRes('email', 'email is already exist, change email !!');
        res.status(422).json(errRes);
        return
    }

    if (!body.password) {
        setErrorRes('password', 'password is required');
        res.status(422).json(errRes);
        return
    }

    if (!body.role) {
        setErrorRes('role', 'role is required');
        res.status(422).json(errRes);
        return
    }

    let roles = ['Admin', 'Seller', 'Customer'];
    let isRoleFind = false;
    roles.forEach((role) => {
        if (role == body.role) {
            isRoleFind = true;
            return;
        }
    });

    if (!isRoleFind) {
        setErrorRes('role', 'role must Admin, Seller, Customer');
        res.status(422).json(errRes);
        return
    }

    if (body.role == 'Customer') {
        if (!body.location) {
            setErrorRes('location', 'location is required');
            res.status(422).json(errRes);
            return;
        }

        if (!body.location.latitude) {
            setErrorRes('location.latitude', 'location.latitude is required');
            res.status(422).json(errRes);
            return;
        }

        if (!isFloat(body.location.latitude)) {
            setErrorRes('location.latitude', 'location.latitude must numeric');
            res.status(422).json(errRes);
            return;
        }

        if (!body.location.longitude) {
            setErrorRes('location.longitude', 'location.longitude is required');
            res.status(422).json(errRes);
            return;
        }

        if (!isFloat(body.location.longitude)) {
            setErrorRes('location.longitude', 'location.longitude must numeric');
            res.status(422).json(errRes);
            return;
        }

        body.location = {
            'type': 'Point',
            'coordinates': [body.location.longitude, body.location.latitude]
        };

    }

    // Encrypt Password
    body.password = await encryptor.encrypt(body.password);

    // Insert Data to DB
    try {
        await userCollection.insertOne(body);
    } catch (error) {
        console.error('Error creating user', error);
        res.status(500).json({ error: 'Failed to create user' });
        return;
    }

    body.password = "";
    res.status(201).json({
        'message': 'success create user',
        'data': body,
    });
    return;

});

module.exports = router;

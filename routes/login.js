var express = require('express');
var encryptor = require('../lib/encryptor');
var jwt = require('jsonwebtoken');

var router = express.Router();

let errRes = {
    'message': '',
    'errors': {}
}

function resetErrorsRes() {
    errRes.errors = {}
}

function setErrorRes(field, errMessage,) {
    resetErrorsRes();
    errRes.message = 'validation fail';
    errRes.errors[field] = errMessage;
}


router.post('/', async function(req, res) {
    let body = req.body;

    if (!body.email) {
        setErrorRes('email', 'email is required');
        res.status(422).json(errRes);
        return;
    }

    if (!body.password) {
        setErrorRes('password', 'password is required');
        res.status(422).json(errRes);
        return;
    }

    // Query User To DB 
    let userCollection = req.db.collection('users');
    let query = { email: body.email }
    let user = await userCollection.findOne(query);

    if (!user) {
        res.status(401).json({ "message": "user unauthorized, check email or password !" });
        return;
    }

    let isValidPassword = await encryptor.compare(body.password, user.password);

    if (!isValidPassword) {
        res.status(401).json({ "message": "user unauthorized, check email or password !" });
        return;
    }

    // Generate Token
    let tokenPayload = { 'id': user._id, 'email': user.email, 'role': user.role }
    let token = jwt.sign(tokenPayload, process.env.TOKEN_SECRET, { expiresIn: '1h' });
    res.status(200).json({
        'message': 'success login',
        'token': token
    });
    return;
});

module.exports = router

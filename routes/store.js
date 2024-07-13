var express = require('express');
var router = express.Router();
var { Decimal128, ObjectId } = require('mongodb');
const { route } = require('./users');

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

router.post('/', async (req, res) => {

    if (req.user.role != 'Admin') {
        setErrorRes('user_role', 'only admin can create store');
        res.status(401).json(errRes);
        return;
    }

    let bodyReq = req.body;

    if (!bodyReq.user_id) {
        setErrorRes('user_id', 'user_id is required');
        res.status(422).json(errRes);
        return;
    }

    if (!bodyReq.store_name) {
        setErrorRes('store_name', 'store_name is required');
        res.status(422).json(errRes);
        return;
    }

    if (!bodyReq.address) {
        setErrorRes('address', 'address is required');
        res.status(422).json(errRes);
        return;
    }

    if (!bodyReq.location) {
        setErrorRes('location', 'location is required');
        res.status(422).json(errRes);
        return;
    }

    if (!bodyReq.location.latitude) {
        setErrorRes('location.latitude', 'location.latitude is required');
        res.status(422).json(errRes);
        return;
    }

    if (!isFloat(bodyReq.location.latitude)) {
        setErrorRes('location.latitude', 'location.latitude must numeric');
        res.status(422).json(errRes);
        return;
    }

    if (!bodyReq.location.longitude) {
        setErrorRes('location.longitude', 'location.longitude is required');
        res.status(422).json(errRes);
        return;
    }

    if (!isFloat(bodyReq.location.longitude)) {
        setErrorRes('location.longitude', 'location.longitude must numeric');
        res.status(422).json(errRes);
        return;
    }

    if (!bodyReq.products) {
        setErrorRes('products', 'products is required');
        res.status(422).json(errRes);
        return;
    }


    // convert user_id to objectId
    let objectIdUser;
    try {
        objectIdUser = ObjectId.createFromHexString(bodyReq.user_id);
    } catch (error) {
        setErrorRes('user_id', 'not valid user_id');
        res.status(422).json(errRes);
        return;
    }

    // Find User 
    let user;
    const userCollection = req.db.collection('users');

    try {
        const queryFindUser = { '_id': objectIdUser };
        user = await userCollection.findOne(queryFindUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
        return;
    }

    if (!user) {
        setErrorRes('user_id', 'user_id not found change user_id');
        res.status(422).json(errRes);
        return;
    }

    bodyReq.location = {
        'type': 'Point',
        'coordinates': [bodyReq.location.longitude, bodyReq.location.latitude]
    };

    // Insert Data To Db 
    const storeCollection = req.db.collection('stores');
    try {
        await storeCollection.insertOne(bodyReq);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
        return;
    }

    res.status(201).json({
        'message': 'success create store',
        'data': bodyReq,
    });
    return;

});

router.get('/nears', async (req, res) => {
    if (req.user.role != "Customer") {
        res.status(422).json({ "message": "only user with role 'Customer' can't find store !!" });
        return;
    }

    // convert user_id to objectId
    let objectIdUser;
    try {
        objectIdUser = ObjectId.createFromHexString(req.user.id);
    } catch (error) {
        setErrorRes('user_id', 'not valid user_id');
        res.status(422).json(errRes);
        return;
    }

    let user;
    const userCollection = req.db.collection('users');

    try {
        const queryFindUser = { '_id': objectIdUser };
        user = await userCollection.findOne(queryFindUser);
    } catch (error) {
        res.status(500).json({ error: 'Fail to find user' });
        return;
    }

    // query nears location stores
    const storesCollection = req.db.collection('stores');
    let query = {
        location:
        {
            $near:
            {
                $geometry: {
                    type: "Point", coordinates: [
                        parseFloat(user.location.coordinates[0]),
                        parseFloat(user.location.coordinates[1])
                    ]
                },
                $maxDistance: 1000
            }
        }
    }

    let stores = [];
    try {
        let cursor = storesCollection.find(query);
        for await (const store of cursor) {
            stores.push(store);
        }
    } catch (error) {
        res.status(500).json({ error: 'Fail to find stores' });
        return;
    }

    res.status(200).json({
        'message': 'success find nears store',
        'data': stores,
    });
    return;
});

module.exports = router

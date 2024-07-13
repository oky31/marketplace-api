const { MongoClient } = require("mongodb");
const dotenv = require('dotenv');

dotenv.config();

// const uri = "mongodb+srv://oky:susilo123@cluster0.leypris.mongodb.net/";
const uri = process.env.DB_URI;
const client = new MongoClient(uri);

let db;

const connectDB = async (req, res, next) => {
    if (!db) {
        try {
            await client.connect();
            db = client.db('market-place-api');
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('Could not connect to MongoDB', error);
            return res.status(500).json({ error: 'Database connection failed' });
        }
    }

    req.db = db;
    next();
}

module.exports = connectDB;


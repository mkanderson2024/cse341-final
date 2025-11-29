const { MongoClient } = require('mongodb');
require('dotenv').config();

let _db;

const initDb = (callback) => {
  if (_db) {
    console.log('Database is already initialized');
    return callback(null, _db);
  }

  MongoClient.connect(process.env.MONGODB_URI)
    .then((client) => {
      _db = client.db();
      console.log('Database connected successfully');
      callback(null, _db);
    })
    .catch((err) => {
      console.error('Database connection failed:', err);
      callback(err);
    });
};

const getDb = () => {
  if (!_db) {
    throw Error('Database not initialized. Call initDb first.');
  }
  return _db;
};

module.exports = {
  initDb,
  getDb
};
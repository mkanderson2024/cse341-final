const mongoose = require('mongoose');
require('dotenv').config();

let _db;

const initDb = async (callback) => {
  if (_db) {
    console.log('Database is already initialized');
    return callback(null, _db);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB || undefined,
    });

    _db = conn.connection;

    console.log('Mongoose connected successfully');
    callback(null, _db);
  } catch (err) {
    console.error('Mongoose connection failed:', err);
    callback(err);
  }
};

const getDb = () => {
  if (!_db) {
    throw new Error('Database not initialized. Call initDb first.');
  }
  return _db;
};

module.exports = {
  initDb,
  getDb
};
const mongoose = require('mongoose');

module.exports = async function connectDB() {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('MongoDB connected to ' + process.env.MONGO_URI);
  } catch (err) {
    console.log('Local MongoDB connection failed (' + err.message + '). Starting MongoMemoryServer fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('MongoDB Memory Server connected at ' + uri);
    } catch (memErr) {
      console.error('Failed to start MongoMemoryServer:', memErr.message);
      throw err;
    }
  }

  try {
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database empty, running initial auto-seed...');
      const seedDB = require('../utils/seed');
      await seedDB();
    }
  } catch (seedErr) {
    console.warn('Auto-seed check warning:', seedErr.message);
  }
};

const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies';

  try {
    // Attempt standard connection with 2-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] MongoDB connected successfully to: ${uri}`);
    return true;
  } catch (primaryError) {
    console.warn(`[Database] Local MongoDB not detected. Initializing fallback in-memory MongoDB instance...`);

    try {
      if (mongoMemoryServer) {
        try {
          await mongoMemoryServer.stop();
        } catch (_) {}
      }

      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          storageEngine: 'ephemeralForTest',
        },
      });
      const inMemoryUri = mongoMemoryServer.getUri();

      await mongoose.connect(inMemoryUri);
      console.log(`[Database] In-memory MongoDB connected successfully at: ${inMemoryUri}`);
      return true;
    } catch (memError) {
      console.warn('[Database] In-memory Mongo initialization error:', memError.message);
      console.log('[Database] Running with memory store fallback for auth/OTP.');
      return false;
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (e) {
    // ignore
  }
};

module.exports = { connectDB, disconnectDB };

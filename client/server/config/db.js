const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // On Vercel Serverless: only connect if a real remote MongoDB (like Atlas) URI is provided
  if (process.env.VERCEL || process.env.VERCEL_ENV || process.env.NODE_ENV === 'production') {
    if (uri && (uri.startsWith('mongodb+srv://') || uri.startsWith('mongodb://') && !uri.includes('127.0.0.1') && !uri.includes('localhost'))) {
      try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
        console.log('[Database] Remote MongoDB connected on Vercel.');
        return true;
      } catch (err) {
        console.warn('[Database] Remote MongoDB connection failed on Vercel:', err.message);
      }
    }
    console.log('[Database] Vercel Serverless: Using ultra-fast in-memory catalog store.');
    return false;
  }

  // Local development
  const localUri = uri || 'mongodb://127.0.0.1:27017/imovies';
  try {
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 });
    console.log(`[Database] MongoDB connected successfully to: ${localUri}`);
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
      mongoMemoryServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoMemoryServer.getUri();

      await mongoose.connect(inMemoryUri);
      console.log(`[Database] In-memory MongoDB connected successfully at: ${inMemoryUri}`);
      return true;
    } catch (memError) {
      console.warn('[Database] In-memory Mongo initialization note:', memError.message);
      console.log('[Database] Running with memory store fallback.');
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

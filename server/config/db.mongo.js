import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let isMongoConnected = false;

export const connectMongoDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/futurememory';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    isMongoConnected = true;
    console.log(`✅ [MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ [MongoDB] Local connection failed. Starting Embedded MongoDB Server...`);
    try {
      const mongoServer = await MongoMemoryServer.create();
      const memUri = mongoServer.getUri();
      const memConn = await mongoose.connect(memUri);
      isMongoConnected = true;
      console.log(`✅ [MongoDB] Connected successfully to Embedded Memory Server at: ${memUri}`);
      return memConn;
    } catch (memErr) {
      isMongoConnected = false;
      console.error(`❌ [MongoDB] Embedded Server also failed to start. Falling back to in-memory array arrays.`, memErr.message);
      return null;
    }
  }
};

export const getMongoStatus = () => isMongoConnected;

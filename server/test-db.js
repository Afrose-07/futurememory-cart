import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/futurememory';

console.log(`\n======================================================`);
console.log(`🔍 Testing MongoDB Connection`);
console.log(`📡 Target URI: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
console.log(`======================================================\n`);

try {
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
  });

  console.log(`✅ [MongoDB CONNECTED!] Successfully connected to host: ${conn.connection.host}`);
  console.log(`📁 Database Name: ${conn.connection.name}`);
  console.log(`📊 State: READY & ACTIVE\n`);

  await mongoose.disconnect();
  process.exit(0);
} catch (err) {
  console.error(`❌ [MongoDB CONNECTION FAILED]: ${err.message}\n`);
  console.log(`ℹ️ [HOW TO FIX]:`);
  console.log(`1. Cloud MongoDB (Easiest - Free):`);
  console.log(`   - Go to https://www.mongodb.com/cloud/atlas`);
  console.log(`   - Create a free cluster & copy your connection string.`);
  console.log(`   - Paste it in server/.env under MONGO_URI, like:`);
  console.log(`     MONGO_URI=mongodb+srv://user:pass@cluster0.abcde.mongodb.net/futurememory?retryWrites=true&w=majority\n`);
  console.log(`2. Local MongoDB on Windows:`);
  console.log(`   - Download & install MongoDB Community Server MSI from:`);
  console.log(`     https://www.mongodb.com/try/download/community`);
  console.log(`   - Ensure "Run MongoDB as a Service" is checked during setup.\n`);
  process.exit(1);
}

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // 5 seconds timeout so it falls back quickly if blocked or offline
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected successfully`);
    global.useLocalDB = false;
  } catch (error) {
    console.error(`\n⚠️ MongoDB Connection Failed: ${error.message}`);
    console.log(`ℹ️ Falling back to local JSON database (backend/data/local_db.json)`);
    console.log(`You can run the application offline or under hotspot networks.\n`);
    global.useLocalDB = true;
  }
};

module.exports = connectDB;
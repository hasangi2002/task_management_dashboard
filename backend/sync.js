require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'data/local_db.json');

// Mongoose schema description to interact with DB directly
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  details: { type: String },
  status: { type: String, default: 'Pending' },
  priority: { type: String, default: 'Medium' },
  phase: { type: String, required: true },
  dueDate: { type: Date, required: true }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

async function syncData() {
  console.log("Connecting to MongoDB Atlas...");
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000
    });
    console.log("Connected successfully to MongoDB Atlas!");
  } catch (error) {
    console.error("\n❌ Connection Failed:", error.message);
    console.log("\nPossible solutions:");
    console.log("1. Go to MongoDB Atlas (https://cloud.mongodb.com) -> Network Access.");
    console.log("2. Click 'Add IP Address' and select 'Allow Access From Anywhere' (0.0.0.0/0).");
    console.log("   (This is highly recommended for mobile hotspots as your IP address changes constantly.)");
    console.log("3. Make sure the database user credentials in backend/.env are correct.\n");
    process.exit(1);
  }

  if (!fs.existsSync(FILE_PATH)) {
    console.log("No local database file found. Nothing to sync.");
    process.exit(0);
  }

  try {
    const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
    const localTasks = data.tasks || [];

    if (localTasks.length === 0) {
      console.log("No local tasks found in your local database file.");
      process.exit(0);
    }

    console.log(`Found ${localTasks.length} tasks in local database. Syncing to Atlas...`);

    let addedCount = 0;
    let updatedCount = 0;

    for (const localTask of localTasks) {
      // Check if task already exists in Atlas by title
      const existingTask = await Task.findOne({ title: localTask.title });

      if (existingTask) {
        // Update task status, priority, phase, etc.
        existingTask.status = localTask.status;
        existingTask.priority = localTask.priority;
        existingTask.phase = localTask.phase;
        existingTask.details = localTask.details;
        existingTask.dueDate = localTask.dueDate;
        await existingTask.save();
        updatedCount++;
      } else {
        // Create new task
        await Task.create({
          title: localTask.title,
          details: localTask.details,
          status: localTask.status,
          priority: localTask.priority,
          phase: localTask.phase,
          dueDate: localTask.dueDate
        });
        addedCount++;
      }
    }

    console.log(`\n🎉 Synchronization complete!`);
    console.log(`- Created in Atlas: ${addedCount} tasks`);
    console.log(`- Updated in Atlas: ${updatedCount} tasks`);

  } catch (error) {
    console.error("Error syncing tasks:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

syncData();

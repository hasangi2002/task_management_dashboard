require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Project = require('./models/Project');
const Task = require('./models/Task');
const User = require('./models/User');
const KPI = require('./models/KPI');
const TaskTemplate = require('./models/TaskTemplate');

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');

  const args = process.argv.slice(2);
  const adminEmail = args[0];
  const adminPassword = args[1];
  const adminName = args[2] || 'Admin';

  if (!adminEmail || !adminPassword) {
    console.log('Usage: node migrate.js <adminEmail> <adminPassword> [adminName]');
    process.exit(1);
  }

  let admin = await Admin.findOne({ email: adminEmail });
  if (!admin) {
    admin = await Admin.create({ name: adminName, email: adminEmail, password: adminPassword });
    console.log(`Created admin account: ${adminEmail}`);
  } else {
    console.log(`Admin account already exists: ${adminEmail}`);
  }

  let project = await Project.findOne({ name: 'Mai Mara Prasangaya' });
  if (!project) {
    project = await Project.create({ name: 'Mai Mara Prasangaya', admins: [admin._id] });
    console.log('Created project: Mai Mara Prasangaya');
  } else if (!project.admins.some(a => a.toString() === admin._id.toString())) {
    project.admins.push(admin._id);
    await project.save();
  }

  const taskResult = await Task.updateMany({ project: { $exists: false } }, { $set: { project: project._id } });
  console.log(`Tasks migrated: ${taskResult.modifiedCount}`);

  const kpiResult = await KPI.updateMany({ project: { $exists: false } }, { $set: { project: project._id } });
  console.log(`KPIs migrated: ${kpiResult.modifiedCount}`);

  const templateResult = await TaskTemplate.updateMany({ project: { $exists: false } }, { $set: { project: project._id } });
  console.log(`Templates migrated: ${templateResult.modifiedCount}`);

  // Existing team members won't have a password or project — set project and a
  // temporary password. You (admin) should reset each member's password via
  // the Team page after this, and share the new credentials with them.
const users = await User.find();

let migratedCount = 0;

for (const user of users) {
  let changed = false;

  if (!user.project) {
    user.project = project._id;
    changed = true;
  }

  if (!user.password) {
    user.password = 'ChangeMe123';
    changed = true;
  }

  if (changed) {
    await user.save();
    migratedCount++;
  }
}

console.log(`Team members migrated: ${migratedCount}`);

  console.log('\nMigration complete.');
  console.log(`Project ID: ${project._id}`);
  console.log(`Log in with: ${adminEmail} / (the password you passed in)`);

  await mongoose.connection.close();
  process.exit(0);
}

migrate();
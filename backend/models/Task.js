const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  details: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium'
  },
  phase: {
    type: String,
    enum: ['Trailer Drop Day', 'Trailer Release', 'Pre Release Campaign', 'Cinema Launch', 'Post Release'],
    required: true
  },
  kpi: {
    type: String,
  },
  dueDate: {
    type: Date,
    required: false
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  lastOverdueNotifiedDate: {
    type: Date,
    default: null
  },
  month: {
    type: String,
    default: null
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  }
}, { timestamps: true });

const MongooseModel = mongoose.model('Task', taskSchema);
const wrapModel = require('./modelWrapper');
module.exports = wrapModel(MongooseModel, 'tasks');
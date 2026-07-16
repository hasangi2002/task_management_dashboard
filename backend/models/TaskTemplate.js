const mongoose = require('mongoose');

const taskTemplateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  details: { type: String },
  phase: {
    type: String,
    enum: ['Trailer Drop Day', 'Trailer Release', 'Pre Release Campaign', 'Cinema Launch', 'Post Release'],
    default: 'Pre Release Campaign'
  },
  priority: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium'
  },
  role: { type: String, default: '' },
  dayOfMonth: { type: Number, default: null },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  }
}, { timestamps: true });

const MongooseModel = mongoose.model('TaskTemplate', taskTemplateSchema);
const wrapModel = require('./modelWrapper');
module.exports = wrapModel(MongooseModel, 'templates');
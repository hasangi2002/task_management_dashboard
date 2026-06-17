const mongoose = require('mongoose');

const kpiSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  target: {
    type: Number,
    required: true,
  },
  currentValue: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['On Track', 'Off Track', 'Over-performing'],
    default: 'On Track'
  }
}, { timestamps: true });

const MongooseModel = mongoose.model('KPI', kpiSchema);
const wrapModel = require('./modelWrapper');
module.exports = wrapModel(MongooseModel, 'kpis');

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
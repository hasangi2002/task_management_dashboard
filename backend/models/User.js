const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
  }
}, { timestamps: true });

const MongooseModel = mongoose.model('User', userSchema);
const wrapModel = require('./modelWrapper');
module.exports = wrapModel(MongooseModel, 'users');

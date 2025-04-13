const mongoose = require('mongoose');

const Assignment = require('../models/assignmenModel');

const jobSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },

  status: {
    type: String,
    enum: ['open', 'done', 'in progress'],
    default: 'open',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  title: {
    type: String,
    required: [true, 'Please provide job title'],
  },
  assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }],
  description: { type: String, required: true },
  image: { type: String },

  skillsRequired: {
    type: [String],
    required: false,
    default: ['CSS', 'Git', 'React'],
  },
});

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;

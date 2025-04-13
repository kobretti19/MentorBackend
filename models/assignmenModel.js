const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  applicationType: {
    type: String,
    enum: ['mentorToCompany', 'companyToMentor'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'closed', 'canceled'],
    default: 'pending',
  },
  acceptedStatus: {
    type: String,
    enum: ['rejected', 'in progress', 'done', 'canceled'],
    default: 'in progress',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

assignmentSchema.pre('save', async function (next) {
  try {
    const assignment = this;

    if (assignment.isNew) {
      // Find the mentor and add the job to the mentorJobs array
      const user = await mongoose.model('User').findById(assignment.mentorId);

      if (user === 'mentor') {
        user.mentorJobs.push(assignment.jobId); // Add the jobId to the mentorJobs array
        await user.save(); // Save the updated mentor document
      } else if (user === 'startup') {
        user.jobsPosted.push(assignment.jobId);
        await user.save();
      }
    }

    // Continue with saving the assignment
    next();
  } catch (err) {
    next(err);
  }
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
module.exports = Assignment;

const Job = require('./../models/jobsModel');
const User = require('./../models/userModel');
const Assignment = require('./../models/assignmenModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const { ObjectId } = require('mongoose').Types;

const AppError = require('./../utils/appError');

// exports.getAllJobs = factory.getAll(Job);
exports.getJob = factory.getOne(Job, 'mentorId companyId');
// exports.createJob = factory.createOne(Job);
exports.updateJob = factory.updateOne(Job);
exports.deleteJob = factory.deleteOne(Job);
// exports.getAllJobs = factory.getAll(Job, {
//   populate: {
//     path: 'mentorId', // Populate the user in the assignments
//     select: 'name email phone photo',
//   },
//   populate: {
//     path: 'companyId', // Populate the user in the assignments
//     select: 'name email phone photo',
//   },
// });

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('companyId assignments');

    res.json(jobs); // Send jobs with assigned users
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createJob = async (req, res) => {
  try {
    const { companyId, title, description, skillsRequired, status } = req.body;

    const company = await User.findById(companyId);
    if (!company || company.role !== 'startup') {
      return res
        .status(400)
        .json({ error: 'Invalid company ID or company is not a startup.' });
    }

    // Create the new job
    const job = new Job({
      companyId: company._id,
      title,
      description,
      skillsRequired,
      status,
    });

    await job.save();

    company.jobsPosted.push(job._id);
    await company.save();

    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.acceptJob = async (req, res) => {
  const { jobId, mentorId } = req.body;
  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return res
        .status(400)
        .json({ error: 'Invalid mentor ID or user is not a mentor' });
    }

    job.mentorId = mentor._id;
    json.status = 'Accepted';

    await job.save();

    mentor.mentorJobs.push(job._id);
    await mentor.save();

    res.status(200).json(job);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getJobWithUsers = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId)
      .populate('companyId') // Populate the company details (User)
      .populate('mentorId'); // Populate the mentor details (User)

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Return the populated job details
    res.status(200).json(job);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getJobWithUserId = async (req, res) => {
  try {
    const id = req.params.id.trim();

    const job = await Job.find({ companyId: id })
      .populate('companyId')
      .populate('mentorId')
      .populate({
        path: 'assignments',
        populate: { path: 'mentorId' },
      })
      .lean();

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.status(200).json({
      results: job.length,
      data: job,
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getJobWithAcceptedStatus = async (req, res) => {
  try {
    const jobId = req.params.id;

    const job = await Job.findById(jobId).populate({
      path: 'companyId',
      select: 'name email role photo',
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Query the Assignment model to get all assignments related to this job
    const assignments = await Assignment.find({ jobId: jobId })
      .populate({
        path: 'mentorId',
        select: 'name email',
      })
      .populate({
        path: 'companyId',
        select: 'name email role',
      })
      .select('acceptedStatus mentorId companyId');

    job.assignments = assignments;

    res.status(200).json(job);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.getOverview = catchAsync(async (req, res) => {
  const id = req.user._id;

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const assignedJobs = await Assignment.find({
    companyId: id,
    createdAt: { $gte: lastMonth },
  }).populate('mentorId', 'photo name adress phone email');
  const finishedJobs = assignedJobs.filter((job) => job.status === 'closed');

  const uniqueMentors = [];
  const mentorIds = new Set();

  assignedJobs.forEach((job) => {
    const mentor = job.mentorId;
    if (mentor && !mentorIds.has(mentor._id.toString())) {
      mentorIds.add(mentor._id.toString());
      uniqueMentors.push(mentor);
    }
  });
  res.status(200).json({
    status: 'success',
    resultsAssigned: assignedJobs.length,
    resultsFinished: finishedJobs.length,
    resultsMentors: uniqueMentors.length,
    assignedJobs,
    finishedJobs,
    mentors: uniqueMentors,
  });
});

exports.getAllStartUp = catchAsync(async (req, res) => {
  const users = await User.find();
  const startup = users.filter((user) => user.role === 'startup');

  res.status(200).json({
    status: 'success',
    results: startup.length,
    data: startup,
  });
});

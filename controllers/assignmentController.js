const Assignment = require('./../models/assignmenModel');
const Job = require('./../models/jobsModel');
const User = require('./../models/userModel');
const factory = require('./handlerFactory');

exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('mentorId', 'name email') // Populate the user assigned to the job
      .populate('jobId', 'title description'); // Populate the job details

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignment); // Send back the populated assignment
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId)
      .populate('jobId') // Populate job details
      .populate('mentorId') // Populate mentor details
      .populate('companyId'); // Populate company details

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    res.status(200).json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const { jobId, mentorId, companyId, applicationType, acceptedStatus } =
      req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    const mentor = await User.findById(mentorId);
    const company = await User.findById(companyId);
    if (!mentor || mentor.role !== 'mentor') {
      return res
        .status(400)
        .json({ error: 'Invalid mentor ID or user is not a mentor.' });
    }
    if (!company || company.role !== 'startup') {
      return res
        .status(400)
        .json({ error: 'Invalid company ID or user is not a startup.' });
    }

    const assignment = new Assignment({
      jobId,
      mentorId,
      companyId,
      applicationType,
      acceptedStatus,
    });

    await assignment.save();

    mentor.assignments.push(assignment);
    mentor.mentorJobs.push(jobId);
    company.assignments.push(assignment);
    job.assignments.push(assignment);
    await company.save();
    await mentor.save();

    job.status = 'in progress';
    await job.save();

    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateAssignmentStatus = async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;
    const { acceptedStatus, jobId } = req.body;

    // Find the assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    // Update acceptedStatus
    assignment.acceptedStatus = acceptedStatus;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    job.assignments.push(assignmentId);
    if (acceptedStatus === 'in progress') {
      job.status = 'in progress';
    } else if (acceptedStatus === 'done') {
      assignment.status = 'closed';
      job.status = 'done';
    } else if (acceptedStatus === 'rejected') {
      job.status = 'open';
      assignment.status = 'closed';
    } else if (acceptedStatus === 'canceled') {
      job.status = 'open';
      assignment.status = 'canceled';
    }

    await job.save();
    await assignment.save();

    res.status(200).json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAssignmentsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    const assignments = await Assignment.find({
      $or: [{ mentorId: userId }, { companyId: userId }],
    })
      .populate({
        path: 'jobId',
        select: 'title description skillsRequired status',
      })
      .populate({
        path: 'mentorId',
        select: 'name email',
      })
      .populate({
        path: 'companyId',
        select: 'name email role photo',
      })
      .select('acceptedStatus mentorId companyId applicationType createdAt');

    // Check if assignments exist for the user
    if (assignments.length === 0) {
      return res
        .status(404)
        .json({ message: 'No assignments found for this user' });
    }

    res.status(200).json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching assignments' });
  }
};

exports.getAssignmentsByUserIdNoRejected = async (req, res) => {
  try {
    const userId = req.params.userId;

    const assignments = await Assignment.find({
      $or: [{ mentorId: userId }, { companyId: userId }],
      acceptedStatus: { $ne: 'rejected' },
    })
      .populate({
        path: 'jobId',
        select: 'title description skillsRequired status',
      })
      .populate({
        path: 'mentorId',
        select: 'name email',
      })
      .populate({
        path: 'companyId',
        select: 'name email role photo',
      })
      .select('acceptedStatus mentorId companyId applicationType createdAt');

    if (!assignments || assignments.length === 0) {
      return res
        .status(404)
        .json({ message: 'No assignments found for this user' });
    }

    res.status(200).json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching assignments' });
  }
};

exports.getAllAssignments = factory.getAll(Assignment);

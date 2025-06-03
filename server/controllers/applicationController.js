const Application = require('../models/Application');
const Job = require('../models/job');
const mongoose = require('mongoose');

const sendError = (res, status, message, error = null) => {
  const response = { message };
  if (error) response.error = error;
  return res.status(status).json(response);
};

exports.applyJob = async (req, res) => {
  const { resumeLink, coverLetter, jobId } = req.body;

  if (!resumeLink || !coverLetter || !jobId) {
    return sendError(res, 400, 'All fields are required.');
  }

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return sendError(res, 400, 'Invalid job ID');
  }

  try {
    const existingApplication = await Application.findOne({ applicant: req.user._id, job: jobId });
    if (existingApplication) {
      return sendError(res, 400, 'You have already applied for this job.');
    }

    const newApplication = new Application({
      applicant: req.user._id,
      job: jobId,
      resumeLink,
      coverLetter,
    });

    await newApplication.save();
    res.status(201).json({ message: 'Application submitted successfully', application: newApplication });
  } catch (error) {
    console.error('Apply Job Error:', error);
    return sendError(res, 500, 'Server error', error.message);
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title company location createdBy');
    res.status(200).json(applications);
  } catch (error) {
    console.error('Error in getMyApplications:', error);
    return sendError(res, 500, 'Failed to fetch applications', error.message);
  }
};

exports.getApplicantsForJob = async (req, res) => {
  const jobId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return sendError(res, 400, 'Invalid job ID');
  }

  try {
    const job = await Job.findById(jobId);
    if (!job) return sendError(res, 404, 'Job not found');

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 401, 'Not authorized');
    }

    const applicants = await Application.find({ job: jobId })
      .populate('applicant', 'name email');
    res.status(200).json(applicants);
  } catch (err) {
    console.error('Error fetching applicants:', err);
    return sendError(res, 500, 'Server error', err.message);
  }
};

exports.updateApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, 'Invalid application ID');
  }

  const allowedStatuses = ['Pending', 'Accepted', 'Rejected'];
  if (!allowedStatuses.includes(status)) {
    return sendError(res, 400, 'Invalid status value');
  }

  try {
    const application = await Application.findById(id);
    if (!application) return sendError(res, 404, 'Application not found');

    const job = await Job.findById(application.job);
    if (!job) return sendError(res, 404, 'Job not found');

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 401, 'Not authorized');
    }

    application.status = status;
    await application.save();

    res.status(200).json({ message: 'Application status updated successfully', application });
  } catch (error) {
    console.error('Error updating status:', error);
    return sendError(res, 500, 'Server error', error.message);
  }
};

exports.deleteApplication = async (req, res) => {
  const applicationId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    return sendError(res, 400, 'Invalid application ID');
  }

  try {
    const application = await Application.findById(applicationId);
    if (!application) return sendError(res, 404, 'Application not found');

    if (application.applicant.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Unauthorized');
    }

    await application.deleteOne();
    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    return sendError(res, 500, 'Server error', error.message);
  }
};

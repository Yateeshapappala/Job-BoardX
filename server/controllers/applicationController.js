const Application = require('../models/Application');
const Job = require('../models/job');
const mongoose = require('mongoose');
const sendInterviewInvitationEmail = require('../utils/sendInterviewInvie');
const sendFinalScheduleEmail = require('../utils/sendFinalScheduleEmail');

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
      status: 'Applied',
      interviewStatus: 'NotInvited',
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

  const allowedStatuses = ['Applied', 'Reviewed', 'Accepted', 'Rejected'];
  if (!allowedStatuses.includes(status)) {
    return sendError(res, 400, 'Invalid status value');
  }

  try {
    const application = await Application.findById(id).populate('applicant', 'email name');
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

exports.sendInterviewInvitation = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid application ID' });
  }

  try {
    const application = await Application.findById(id).populate('applicant', 'email name');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.status !== 'Accepted') {
      return res.status(400).json({ message: 'Only accepted applicants can be invited.' });
    }

    const job = await Job.findById(application.job);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const company = await mongoose.model('Company').findById(job.company);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    if (!application.applicant?.email) {
      return res.status(400).json({ message: 'Applicant email is missing.' });
    }
const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      const availabilityLink = `${baseUrl}/submit-availability/${application._id}`;

    await sendInterviewInvitationEmail(
     application.applicant.email,   // toEmail
  availabilityLink,             // availabilityLink (URL)
  application.applicant.name,   // applicantName
  job.title   
    );

    application.interviewStatus = 'Invited';
    await application.save();

    res.status(200).json({ message: 'Interview invitation sent successfully.' });
  } catch (err) {
    console.error('Error sending interview invitation:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.submitAvailability = async (req, res) => {
  const { id } = req.params;
  const { slots } = req.body;

  if (!Array.isArray(slots) || !slots.length) {
    return res.status(400).json({ message: 'Slots are required' });
  }

  try {
    const application = await Application.findById(id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    application.availability = {
      slots,
      submittedAt: new Date()
    };
    application.interviewStatus = 'SlotsSubmitted';

    await application.save();

    res.status(200).json({ message: 'Availability submitted successfully' });
  } catch (error) {
    console.error('Submit Availability Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.setInterviewSlotsForJob = async (req, res) => {
  const { id } = req.params;
  const { slots } = req.body;

  if (!Array.isArray(slots) || slots.length === 0) {
    return res.status(400).json({ message: 'At least one interview slot must be provided.' });
  }

  try {
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    job.interviewSlots = slots;
    await job.save();

    res.status(200).json({ message: 'Interview slots set successfully', interviewSlots: job.interviewSlots });
  } catch (error) {
    console.error('Error setting interview slots:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('job');
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({
      _id: application._id,
      jobId: application.job._id,
      applicant: application.applicant,
      status: application.interviewStatus || application.status,
    });
  } catch (err) {
    console.error('Error fetching application:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.scheduleInterviews = async (req, res) => {
  const { jobId } = req.params;
  const interviewDuration = parseInt(req.body.interviewDuration, 10);
  const numInterviewers = parseInt(req.body.numInterviewers, 10);

  if (!interviewDuration || !numInterviewers || interviewDuration <= 0 || numInterviewers <= 0) {
  console.log('Invalid input:', { interviewDuration, numInterviewers });
  return res.status(400).json({ message: 'Invalid interviewDuration or numInterviewers' });
}

if (!mongoose.Types.ObjectId.isValid(jobId)) {
  console.log('Invalid job ID:', jobId);
  return res.status(400).json({ message: 'Invalid job ID' });
}


  try {
   const job = await Job.findById(jobId).populate('company').populate('createdBy');
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (!job.createdBy || !job.createdBy._id) {
      console.error('Job.createdBy is null:', job);
      return res.status(500).json({ message: 'Job has no creator info (createdBy is null)' });
    }
    if (job.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const company = job.company;
    if (!company) {
      return res.status(500).json({ message: 'Job company not found or not populated' });
    }
    const interviewers = company.interviewers || [];
   if (interviewers.length < numInterviewers) {
  console.log(`Not enough interviewers. Required: ${numInterviewers}, Available: ${interviewers.length}`);
  return res.status(400).json({ message: `Company has only ${interviewers.length} interviewers but ${numInterviewers} required` });
}

    const applications = await Application.find({
      job: jobId,
      status: 'Accepted',
      interviewStatus: 'SlotsSubmitted',
      'availability.slots': { $exists: true, $ne: [] }
    }).populate('applicant', 'email name');

    if (applications.length === 0) {
  console.log('No applicants with valid slot availability');
  return res.status(400).json({ message: 'No applicants with valid slot availability.' });
}

    const slotDurationMs = interviewDuration * 60 * 1000;
    const interviewerLoad = new Array(numInterviewers).fill(0);
    const assignments = {};

    for (const app of applications) {
      const sortedSlots = [...app.availability.slots].sort();
      let assigned = false;

      for (const slot of sortedSlots) {
        // Pick interviewer with minimum load
        const minLoad = Math.min(...interviewerLoad);
        const interviewerIndex = interviewerLoad.findIndex(load => load === minLoad);

        if (interviewerIndex === -1) {
          // Should never happen if interviewerLoad is correctly initialized
          break;
        }

        // Assign slot to this interviewer and increase their load
        interviewerLoad[interviewerIndex] += slotDurationMs;
        assignments[app._id.toString()] = {
          slot: slot.toISOString(),
          interviewer: interviewers[interviewerIndex]
        };
        assigned = true;
        break;
      }

      if (!assigned) {
        assignments[app._id.toString()] = null; // Could not schedule
      }
    }

    // Prepare bulk update operations for applications
    const bulkOps = applications.map(app => {
      const assignment = assignments[app._id.toString()];
      return {
        updateOne: {
          filter: { _id: app._id },
          update: assignment
            ? {
                scheduledInterview: {
                  slot: assignment.slot,
                  interviewers: [assignment.interviewer] // matches schema
                },
                interviewStatus: 'Scheduled'
              }
            : {
                scheduledInterview: null,
                interviewStatus: 'NotScheduled'
              }
        }
      };
    });

    await Application.bulkWrite(bulkOps);

    // Send emails in parallel for faster performance
    await Promise.all(applications.map(async (app) => {
      const assignment = assignments[app._id.toString()];
      if (assignment) {
        return sendFinalScheduleEmail(
          app.applicant.email,
          assignment.slot,
          assignment.interviewer.name,
          app.applicant.name,
          job.title
        );
      }
    }));

    return res.status(200).json({ message: 'Interviews scheduled successfully', assignments });

  } catch (err) {
    console.error('Error scheduling interviews:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.getInterviewSlots = async (req, res) => {
  const { id } = req.params;

  try {
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    return res.json({ slots: job.interviewSlots || [] });
  } catch (error) {
    console.error('Error getting interview slots:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

async function calculateMinimumDays(jobId, numInterviewers, interviewDuration) {
  // Fetch accepted applications with valid availability slots
  const applications = await Application.find({
    job: jobId,
    status: 'Accepted',
    interviewStatus: 'SlotsSubmitted',
    'availability.slots': { $exists: true, $ne: [] }
  });

  const totalApplicants = applications.length;
  if (totalApplicants === 0) return 0; // no interviews needed

  // Fetch job with interview slots
  const job = await Job.findById(jobId);
  if (!job) throw new Error('Job not found');
  if (!job.interviewSlots || job.interviewSlots.length === 0) {
    throw new Error('No interview slots configured for this job');
  }

  // Calculate number of slots per day
  // Assuming job.interviewSlots represent distinct slots in a day (e.g., 9am, 10am, ...)
  const slotsPerDay = job.interviewSlots.length;

  // Calculate daily interview capacity = interviewers * slots per day
  const dailyCapacity = numInterviewers * slotsPerDay;

  // Binary search for minimum days
  let low = 1;
  let high = totalApplicants; // worst case: 1 applicant per day
  let result = high;

  // Helper function to check if scheduling all interviews is possible within given days
  function canScheduleAll(days) {
    return (days * dailyCapacity) >= totalApplicants;
  }

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (canScheduleAll(mid)) {
      result = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return result;
}

exports.calculateHiringTimeline = async (req, res) => {
  const { jobId } = req.params;
  const { numInterviewers, interviewDuration } = req.body;

  if (!numInterviewers || !interviewDuration) {
    return res.status(400).json({ message: 'numInterviewers and interviewDuration are required' });
  }

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ message: 'Invalid job ID' });
  }

  try {
    const minDays = await calculateMinimumDays(jobId, numInterviewers, interviewDuration);
    return res.status(200).json({ minimumDays: minDays });
  } catch (error) {
    console.error('Error calculating minimum days:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
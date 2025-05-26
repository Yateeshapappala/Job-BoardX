const Application = require('../models/Application');
const Job = require('../models/job');


const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `resume-${Date.now()}${path.extname(file.originalname)}`);
  },
});

exports.upload = multer({
  storage,
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(pdf)$/)) {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
});


// Apply to a job
exports.applyJob = async (req, res) => {
  const { resumeLink, coverLetter, jobId } = req.body;

  if (!resumeLink || !coverLetter || !jobId) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  console.log('Applying with:', { resumeLink, coverLetter, jobId, user: req.user._id });

  // Proceed to save the application to MongoDB...
  try {
    const newApplication = new Application({
      applicant: req.user._id,
      job: jobId,
      resumeLink: resumeLink,
      coverLetter,
    });

    await newApplication.save();
    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Apply Job Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title company location');
      
    res.status(200).json(applications);
  } catch (error) {
    console.error('Error in getMyApplications:', error);
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
};


// Get applicants for a specific job (Employer)
exports.getApplicantsForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const applicants = await Application.find({ job: req.params.id })
      .populate('applicant', 'name email'); // Include name/email from User

    res.status(200).json(applicants);
  } catch (err) {
    console.error('Error fetching applicants:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const job = await Job.findById(application.job);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    res.status(200).json({ message: 'Application status updated successfully', application });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Delete an application
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Ensure the user deleting it is the applicant
    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await application.deleteOne();
    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

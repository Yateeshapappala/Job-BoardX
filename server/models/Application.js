const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeLink: { type: String, required: true },
  coverLetter: { type: String },
  status: {
    type: String,
    enum: ['Applied', 'Reviewed', 'Accepted', 'Rejected'],
    default: 'Applied'
  },
  interviewStatus: {
  type: String,
  enum: ['NotInvited', 'Invited','SlotsSubmitted', 'Scheduled', 'NotScheduled'],
  default: 'NotInvited'
},

 availability: {
  slots: { type: [Date], default: [] },
  submittedAt: { type: Date }
},
scheduledInterview: {
  slot: { type: String, default: null },
  interviewers: [{
    _id: false,
    name: String,
    email: String,
    role: String
  }]
}

}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);

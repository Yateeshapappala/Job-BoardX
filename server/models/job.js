const mongoose = require('mongoose');
const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: String },
  employmentType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'] },
  experienceLevel: { type: String, enum: ['Entry', 'Mid', 'Senior'] },
  skillsRequired: [{ type: String }],
  applicationDeadline: { type: Date },
  isRemote: { type: Boolean, default: false },
  industry: { type: String },
  jobBenefits: [{ type: String }],
  numberOfOpenings: { type: Number, default: 1 },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports=mongoose.model('job', JobSchema);

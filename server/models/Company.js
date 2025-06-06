const mongoose = require('mongoose');
const { Schema } = mongoose;

const InterviewerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, default: 'Interviewer' }
}, { _id: false });

const CompanySchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  industry: { type: String },
  location: { type: String },
  website: { type: String },
  surveys: [{
    question: String,
    responses: [{
      employeeId: { type: Schema.Types.ObjectId, ref: 'User' },
      score: Number
    }],
    sentiment: String
  }],
  interviewers: [InterviewerSchema] // ✅ Add this line
}, { timestamps: true });

module.exports = mongoose.model('Company', CompanySchema);

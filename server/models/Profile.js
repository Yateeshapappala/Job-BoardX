const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  from: { type: Date, required: true },
  to: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String }
});

const educationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String },
  from: { type: Date, required: true },
  to: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String }
});

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  headline: { type: String, maxlength: 100 }, // e.g., "Full Stack Developer"
  bio: { type: String, maxlength: 1000 },
  avatar: { type: String }, // URL to profile picture
  phone: { type: String },
  location: { type: String },
  website: { type: String },
  linkedin: { type: String },
  github: { type: String },
  skills: [String],
  experience: [experienceSchema],
  education: [educationSchema],
}, {
  timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema);

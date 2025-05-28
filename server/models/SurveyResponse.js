const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  answer: mongoose.Schema.Types.Mixed, // Can be string, array, number, or date
});

const SurveyResponseSchema = new mongoose.Schema({
  survey: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true },
  email: { type: String }, // Optional (for anonymous)
  answers: [AnswerSchema],
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SurveyResponse', SurveyResponseSchema);

const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'multiple_choice', 'checkbox', 'rating', 'date'],
    required: true,
  },
  label: { type: String, required: true },
  options: [String], // Only for multiple_choice and checkbox
});

const SurveySchema = new mongoose.Schema({
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  questions: [QuestionSchema],
  recipients: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
  analytics: {
  averageRatings: [
    {
      questionIndex: Number,
      avg: Number
    }
  ],
  optionCounts: [
  {
    questionIndex: Number,
    counts: {
      type: Map,
      of: Number
    },
    _id: false
  }
],

  textAnswers: [
    {
      questionIndex: Number,
      answers: [String]
    }
  ],
  updatedAt: { type: Date }
},

});

module.exports = mongoose.model('Survey', SurveySchema);
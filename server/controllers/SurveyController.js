const Survey = require('../models/Survey');
const SurveyResponse = require('../models/SurveyResponse');
const { sendSurveyEmail } = require('../utils/email');

async function updateSurveyAnalytics(surveyId) {
  const responses = await SurveyResponse.find({ survey: surveyId });
  const survey = await Survey.findById(surveyId);
  if (!survey) return;

  const avgRatings = [];
  const optionCounts = [];
  const textAnswers = [];

  survey.questions.forEach((question, index) => {
    const answers = responses.map(resp =>
      resp.answers.find(ans => ans.questionIndex === index)?.answer
    ).filter(a => a !== undefined && a !== null);

    if (question.type === 'rating') {
      const numericAnswers = answers.filter(a => typeof a === 'number');
      const sum = numericAnswers.reduce((acc, val) => acc + val, 0);
      const avg = numericAnswers.length ? (sum / numericAnswers.length).toFixed(2) : null;
      if (avg !== null) {
        avgRatings.push({ questionIndex: index, avg: parseFloat(avg) });
      }
    }

    if (['multiple_choice', 'checkbox'].includes(question.type)) {
      const counts = {};

const validOptions = new Set(question.options || []);

answers.forEach(answer => {
  const selected = Array.isArray(answer) ? answer : [answer];
  selected.forEach(opt => {
    const match = question.options?.find(qOpt => qOpt === opt);
    if (match) {
      counts[match] = (counts[match] || 0) + 1;
    }
  });
});
      if (Object.keys(counts).length > 0) {
        optionCounts.push({ questionIndex: index, counts });
      }
    }

    if (question.type === 'text') {
      const texts = answers.filter(a => typeof a === 'string' && a.trim() !== '');
      if (texts.length > 0) {
        textAnswers.push({ questionIndex: index, answers: texts });
      }
    }
  });

  survey.analytics = {
    averageRatings: avgRatings,
    optionCounts,
    textAnswers,
    updatedAt: new Date(),
  };
  
  const ratingOnly = avgRatings.map(q => q.avg);
  const overallAvg = ratingOnly.length
    ? ratingOnly.reduce((a, b) => a + b, 0) / ratingOnly.length
    : 0;

  let sentiment = 'neutral';
  if (overallAvg >= 4) sentiment = 'positive';
  else if (overallAvg < 2.5) sentiment = 'negative';

  survey.sentiment = sentiment;

  console.log('AvgRatings:', avgRatings);
  console.log('OptionCounts:', optionCounts);
  console.log('TextAnswers:', textAnswers);

  await survey.save();
}


exports.createSurvey = async (req, res) => {
  try {
    const { title, questions, recipients } = req.body;

    if (!title || !questions?.length || !recipients?.length) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const survey = await Survey.create({
      employer: req.user._id,
      title,
      questions,
      recipients
    });

    const populatedSurvey = await Survey.findById(survey._id).populate('employer', 'name');
    
    for (let email of recipients) {
      await sendSurveyEmail(email, populatedSurvey);
    }

    res.status(201).json(survey);
  } catch (err) {
    console.error('Error creating survey:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.submitSurveyResponse = async (req, res) => {
  console.log("📝 submitSurveyResponse invoked for survey:", req.params.id, "body:", req.body);
  try {
    const { id } = req.params;
    const { email, answers } = req.body;

    const survey = await Survey.findById(id);
    if (!survey) return res.status(404).json({ message: 'Survey not found' });

    if (answers.length !== survey.questions.length) {
      return res.status(400).json({ message: 'Answer count mismatch' });
    }

const existing = await SurveyResponse.findOne({ survey: id, email });
if (existing) {
  return res.status(400).json({ message: 'You have already submitted this survey.' });
}

const response = await SurveyResponse.create({
  survey: id,
  email,
  answers
});

    await updateSurveyAnalytics(id);

    res.status(201).json({ message: 'Response submitted', response });
  } catch (err) {
    console.error('Error submitting response:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getSurveyResponses = async (req, res) => {
  try {
    const { id } = req.params;
    const survey = await Survey.findById(id).populate('employer');

    if (!survey) return res.status(404).json({ message: 'Survey not found' });

    if (!survey.employer || survey.employer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const responses = await SurveyResponse.find({ survey: id });

    const enrichedResponses = responses.map(response => {
      const enrichedAnswers = response.answers.map(ans => {
        const question = survey.questions[ans.questionIndex];
        return {
          questionIndex: ans.questionIndex,
          questionLabel: question ? question.label : 'Unknown question',
          answer: ans.answer,
          questionType: question?.type || 'unknown',
          options: question?.options || []
        };
      });

      return {
        _id: response._id,
        email: response.email,
        submittedAt: response.submittedAt,
        answers: enrichedAnswers
      };
    });

    res.status(200).json({
      survey: {
        _id: survey._id,
        title: survey.title,
        questions: survey.questions,
        sentiment: survey.sentiment,
        analytics: survey.analytics,
      },
      responses: enrichedResponses,
    });
  } catch (err) {
    console.error('Error fetching responses:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getEmployerSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find({ employer: req.user._id }).sort({ createdAt: -1 });

    const surveyIds = surveys.map(s => s._id);
    const responseCounts = await SurveyResponse.aggregate([
      { $match: { survey: { $in: surveyIds } } },
      { $group: { _id: "$survey", count: { $sum: 1 } } }
    ]);

    const countsMap = {};
    responseCounts.forEach(rc => {
      countsMap[rc._id.toString()] = rc.count;
    });

    const enrichedSurveys = surveys.map(s => ({
      ...s.toObject(),
      responsesCount: countsMap[s._id.toString()] || 0
    }));

    res.status(200).json(enrichedSurveys);
  } catch (err) {
    console.error('Error fetching employer surveys:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getSurveyById = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    const isEmployer = req.user && survey.employer.toString() === req.user._id.toString();
    const email = req.query.email;

    if (!isEmployer && (!email || !survey.recipients.includes(email))) {
      return res.status(403).json({ message: 'Unauthorized access to this survey' });
    }

    res.status(200).json({
      _id: survey._id,
      title: survey.title,
      questions: survey.questions,
      sentiment: survey.sentiment,
      analytics: survey.analytics, 
    });
  } catch (err) {
    console.error('Error fetching survey:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.deleteSurvey = async (req, res) => {
  try {
    const { id } = req.params;

    const survey = await Survey.findById(id);
    if (!survey) return res.status(404).json({ message: 'Survey not found' });

    if (survey.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await SurveyResponse.deleteMany({ survey: id });
    await survey.deleteOne();

    res.status(200).json({ message: 'Survey deleted successfully' });
  } catch (err) {
    console.error('Error deleting survey:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.checkIfSubmitted = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existing = await SurveyResponse.findOne({ survey: id, email });
    return res.status(200).json({ submitted: !!existing });
  } catch (err) {
    console.error('Error checking submission:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

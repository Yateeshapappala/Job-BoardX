const Job = require('../models/job');
const Survey = require('../models/Survey');
const { enhanceDescription } = require('../utils/GeminiClient');
const mongoose = require('mongoose');

async function improveJobDescription(job, topicSentiments) {
  try {
    const topicsSummary = Object.entries(topicSentiments)
      .map(([topic, sentiment]) => `${topic}: "${sentiment || 'Not much data available'}"`)
      .join('\n');

    const prompt = `
Here's a job description for the role of "${job.title}" in the "${job.industry}" industry:

---
${job.description}
---

Survey feedback from employees on this role suggests the following about these topics:
${topicsSummary}

Please revise and enhance the job description to better highlight these aspects (career growth, mentorship, work-life balance, culture, salary, etc.) to attract high-quality candidates.
    `;

    const response = await enhanceDescription(prompt);
    return response;
  } catch (err) {
    console.error("OpenAI enhancement failed, using fallback:", err.message);
    return job.description + "\n\nJoin us for growth opportunities, mentorship, work-life balance, and excellent culture!";
  }
}

async function optimizeJobPost(job) {
  const surveys = await Survey.find({ employer: job.createdBy }).lean();
  if (!surveys.length) return job;

  const questions = surveys[0]?.questions || [];

  const topicKeywords = ['growth', 'mentorship', 'work-life balance', 'culture', 'salary'];
  const topicIndexes = {};
  for (const topic of topicKeywords) {
    const index = questions.findIndex(q => q.label.toLowerCase().includes(topic));
    if (index !== -1) topicIndexes[topic] = index;
  }

  const topicSentiments = {};
  let lowBenefitFlag = false;

  for (const [topic, idx] of Object.entries(topicIndexes)) {
    const ratings = surveys.map(s => {
      if (!s.analytics || !s.analytics.averageRatings) return null;
      const ratingObj = s.analytics.averageRatings.find(r => r.questionIndex === idx);
      return ratingObj?.avg || null;
    }).filter(r => r !== null);

    const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : null;

    const textAnswers = surveys.flatMap(s => {
      if (!s.analytics || !s.analytics.textAnswers) return [];
      const answersObj = s.analytics.textAnswers.find(t => t.questionIndex === idx);
      return answersObj?.answers || [];
    });

    const negativeWords = ['poor', 'low', 'bad', 'none', 'lack', 'insufficient'];
    const negativeCount = textAnswers.reduce((count, answer) => {
      const lower = answer.toLowerCase();
      return count + (negativeWords.some(w => lower.includes(w)) ? 1 : 0);
    }, 0);

    if (avgRating !== null && avgRating < 3) {
      topicSentiments[topic] = 'negative';
      lowBenefitFlag = true;
    } else if (negativeCount > (textAnswers.length / 2)) {
      topicSentiments[topic] = 'negative';
      lowBenefitFlag = true;
    } else {
      topicSentiments[topic] = 'positive or neutral';
    }
  }

  if (lowBenefitFlag) {
    if (!job.jobBenefits.includes('mentorship program')) {
      job.jobBenefits.push('mentorship program');
    }
    if (!job.jobBenefits.includes('work-life balance initiatives')) {
      job.jobBenefits.push('work-life balance initiatives');
    }
  }

  job.optimizedDescription = await improveJobDescription(job, topicSentiments);

  await job.save();
  return job;
}

exports.previewOptimizedDescription = async (req, res) => {
  try {
    const employerId = req.user._id;
    const { title, description, industry } = req.body;

    if (!title || !description || !industry) {
      return res.status(400).json({ message: 'title, description, and industry are required' });
    }

    const surveys = await Survey.find({ employer: employerId }).lean();

    if (!surveys.length) {
      const simplePrompt = `
      Here's a job description for the role of "${title}" in the "${industry}" industry:

      ---
      ${description}
      ---

      Please improve and enhance this description to be clear, exciting, and appealing.`;
      const enhancedDesc = await enhanceDescription(simplePrompt);
      return res.status(200).json({ optimizedDescription: enhancedDesc });
    }

    const questions = surveys[0]?.questions || [];
    const topicKeywords = ['growth', 'mentorship', 'work-life balance', 'culture', 'salary'];
    const topicIndexes = {};
    for (const topic of topicKeywords) {
      const index = questions.findIndex(q => q.label.toLowerCase().includes(topic));
      if (index !== -1) topicIndexes[topic] = index;
    }

    const topicSentiments = {};
    for (const [topic, idx] of Object.entries(topicIndexes)) {
      const ratings = surveys.map(s => {
        if (!s.analytics || !s.analytics.averageRatings) return null;
        const ratingObj = s.analytics.averageRatings.find(r => r.questionIndex === idx);
        return ratingObj?.avg || null;
      }).filter(r => r !== null);

      const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : null;

      const textAnswers = surveys.flatMap(s => {
        if (!s.analytics || !s.analytics.textAnswers) return [];
        const answersObj = s.analytics.textAnswers.find(t => t.questionIndex === idx);
        return answersObj?.answers || [];
      });

      const negativeWords = ['poor', 'low', 'bad', 'none', 'lack', 'insufficient'];
      const negativeCount = textAnswers.reduce((count, answer) => {
        const lower = answer.toLowerCase();
        return count + (negativeWords.some(w => lower.includes(w)) ? 1 : 0);
      }, 0);

      if (avgRating !== null && avgRating < 3) {
        topicSentiments[topic] = 'negative';
      } else if (negativeCount > (textAnswers.length / 2)) {
        topicSentiments[topic] = 'negative';
      } else {
        topicSentiments[topic] = 'positive or neutral';
      }
    }

    const tempJob = { title, description, industry };
    const optimizedDescription = await improveJobDescription(tempJob, topicSentiments);

    res.status(200).json({ optimizedDescription });
  } catch (error) {
    console.error('Error previewing optimized job description:', error);
    res.status(500).json({ message: 'Failed to preview optimized job description', error: error.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      company,
      location,
      salary,
      employmentType,
      experienceLevel,
      skillsRequired,
      applicationDeadline,
      isRemote,
      industry,
      jobBenefits = [],
      numberOfOpenings,
      status,
      oneClickApply = false,
    } = req.body;

    const job = await Job.create({
      title,
      description,
      company,
      location,
      salary,
      employmentType,
      experienceLevel,
      skillsRequired,
      applicationDeadline,
      isRemote,
      industry,
      jobBenefits,
      numberOfOpenings,
      status,
      oneClickApply,
      createdBy: req.user._id,
    });

    await optimizeJobPost(job);

    res.status(201).json(job);
  } catch (error) {
    console.error('error creating job', error);
    res.status(500).json({ message: 'Failed to create job', error: error.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch jobs', error: error.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const responseJob = job.toObject();
    if (job.optimizedDescription) {
      responseJob.originalDescription = job.description;
      responseJob.description = job.optimizedDescription;
    }

    res.status(200).json(responseJob);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch job', error: error.message });
  }
};

exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your jobs', error: error.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    Object.assign(job, req.body);

    await job.save();

    await optimizeJobPost(job);

    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update job', error: error.message });
  }
};

exports.oneClickApply = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (!job.oneClickApply) {
      return res.status(400).json({ message: 'One-click apply not enabled for this job.' });
    }

    res.status(200).json({ message: 'Application submitted via One-Click Apply!' });
  } catch (err) {
    console.error('One-Click Apply error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await job.deleteOne();
    res.status(200).json({ message: 'Job removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete job', error: error.message });
  }
};

exports.optimizeJobManually = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await optimizeJobPost(job);

    res.status(200).json({
      message: 'Job re-optimized successfully',
      optimizedDescription: job.optimizedDescription,
    });
  } catch (error) {
    console.error('Error optimizing job:', error);
    res.status(500).json({ message: 'Failed to optimize job', error: error.message });
  }
};

const Job = require('../models/job');
const Survey = require('../models/Survey');
const { enhanceDescription } = require('../utils/GeminiClient');
const mongoose = require('mongoose');
const Company = require('../models/Company')
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
  try {
    // Defensive: ensure jobBenefits is an array
    if (!Array.isArray(job.jobBenefits)) job.jobBenefits = [];

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
      // Extract average ratings for this topic across surveys
      const ratings = surveys.map(s => {
        if (!s.analytics || !Array.isArray(s.analytics.averageRatings)) return null;
        const ratingObj = s.analytics.averageRatings.find(r => r.questionIndex === idx);
        return ratingObj?.avg ?? null;
      }).filter(r => r !== null);

      const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

      // Extract text answers for this topic across surveys
      const textAnswers = surveys.flatMap(s => {
        if (!s.analytics || !Array.isArray(s.analytics.textAnswers)) return [];
        const answersObj = s.analytics.textAnswers.find(t => t.questionIndex === idx);
        return Array.isArray(answersObj?.answers) ? answersObj.answers : [];
      });

      const negativeWords = ['poor', 'low', 'bad', 'none', 'lack', 'insufficient'];
      const negativeCount = textAnswers.reduce((count, answer) => {
        const lower = answer.toLowerCase();
        return count + (negativeWords.some(w => lower.includes(w)) ? 1 : 0);
      }, 0);

      if (avgRating !== null && avgRating < 3) {
        topicSentiments[topic] = 'negative';
        lowBenefitFlag = true;
      } else if (textAnswers.length > 0 && negativeCount > (textAnswers.length / 2)) {
        topicSentiments[topic] = 'negative';
        lowBenefitFlag = true;
      } else {
        topicSentiments[topic] = 'positive or neutral';
      }
    }

    // Add benefits if needed
    if (lowBenefitFlag) {
      if (!job.jobBenefits.includes('mentorship program')) {
        job.jobBenefits.push('mentorship program');
      }
      if (!job.jobBenefits.includes('work-life balance initiatives')) {
        job.jobBenefits.push('work-life balance initiatives');
      }
    }

    // Update optimized description
    job.optimizedDescription = await improveJobDescription(job, topicSentiments);

    await job.save();
    return job;
  } catch (err) {
    console.error('Error in optimizeJobPost:', err);
    // Return job even if optimization fails to avoid blocking flow
    return job;
  }
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
        if (!s.analytics || !Array.isArray(s.analytics.averageRatings)) return null;
        const ratingObj = s.analytics.averageRatings.find(r => r.questionIndex === idx);
        return ratingObj?.avg ?? null;
      }).filter(r => r !== null);

      const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

      const textAnswers = surveys.flatMap(s => {
        if (!s.analytics || !Array.isArray(s.analytics.textAnswers)) return [];
        const answersObj = s.analytics.textAnswers.find(t => t.questionIndex === idx);
        return Array.isArray(answersObj?.answers) ? answersObj.answers : [];
      });

      const negativeWords = ['poor', 'low', 'bad', 'none', 'lack', 'insufficient'];
      const negativeCount = textAnswers.reduce((count, answer) => {
        const lower = answer.toLowerCase();
        return count + (negativeWords.some(w => lower.includes(w)) ? 1 : 0);
      }, 0);

      if (avgRating !== null && avgRating < 3) {
        topicSentiments[topic] = 'negative';
      } else if (textAnswers.length > 0 && negativeCount > (textAnswers.length / 2)) {
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
    console.log('Request user:', req.user);
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated or user ID missing' });
    }

    const {
      title,
      description,
      company: companyInput,
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

    console.log('Request body:', req.body);

    // Defensive: ensure jobBenefits is an array
    const benefitsArray = Array.isArray(jobBenefits) ? jobBenefits : [];

    let companyId = companyInput;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      console.log(`Company ID is not a valid ObjectId: ${companyId}`);
      const companyDoc = await Company.findOne({ name: new RegExp(`^${companyId}$`, 'i') });
      if (!companyDoc) {
        console.log('Company not found in DB for name:', companyId);
        return res.status(400).json({ message: 'Company not found' });
      }
      companyId = companyDoc._id;
      console.log('Resolved companyId from company name:', companyId);
    }

    const job = await Job.create({
      title,
      description,
      company: companyId,
      location,
      salary,
      employmentType,
      experienceLevel,
      skillsRequired,
      applicationDeadline,
      isRemote,
      industry,
      jobBenefits: benefitsArray,
      numberOfOpenings,
      status,
      oneClickApply,
      createdBy: req.user._id,
    });

    if (!job) {
      console.error('Job creation returned null or undefined');
      return res.status(500).json({ message: 'Failed to create job' });
    }

    console.log('Job created successfully:', job);

    const jobPopulated = await Job.findById(job._id).populate('company', 'name');

    console.log('Job after population:', jobPopulated);

    await optimizeJobPost(jobPopulated);

    res.status(201).json(jobPopulated);
  } catch (error) {
    console.error('error creating job', error);
    res.status(500).json({ message: 'Failed to create job', error: error.message });
  }
};

exports.getJobs = async (req, res) => {
 try {
    const jobs = await Job.find()
      .populate('company', 'name')  // populate company with only its name
      .sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Failed to fetch jobs', error: error.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  return res.status(400).json({ message: 'Invalid job id' });
}

const job = await Job.findById(req.params.id).populate('company', 'name');

    if (!job) return res.status(404).json({ message: 'Job not found' });

    const responseJob = job.toObject();

    if (job.optimizedDescription) {
      responseJob.originalDescription = job.description;
      responseJob.description = job.optimizedDescription;
    }

    res.status(200).json(responseJob);
  } catch (error) {
    console.error('Error fetching job by id:', error);
    res.status(500).json({ message: 'Failed to fetch job', error: error.message });
  }
};

exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching user jobs:', error);
    res.status(500).json({ message: 'Failed to fetch your jobs', error: error.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid job id' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    Object.assign(job, req.body);

   await job.save();

await optimizeJobPost(job);

const updatedJob = await Job.findById(job._id).populate('company', 'name');

res.status(200).json(updatedJob);
  } catch (error) {
    console.error('Failed to update job:', error);
    res.status(500).json({ message: 'Failed to update job', error: error.message });
  }
};

exports.oneClickApply = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid job id' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (!job.oneClickApply) {
      return res.status(400).json({ message: 'One-click apply not enabled for this job.' });
    }

    // Here you can add logic to actually create an application record, notify, etc.
    res.status(200).json({ message: 'Application submitted via One-Click Apply!' });
  } catch (err) {
    console.error('One-Click Apply error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid job id' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await job.deleteOne();
    res.status(200).json({ message: 'Job removed' });
  } catch (error) {
    console.error('Failed to delete job:', error);
    res.status(500).json({ message: 'Failed to delete job', error: error.message });
  }
};

exports.optimizeJobManually = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid job id' });
    }

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

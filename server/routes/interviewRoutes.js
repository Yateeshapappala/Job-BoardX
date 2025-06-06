const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // all routes require auth and have req.user

// Add interviewer
router.post('/interviewers', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const companyId = req.user.companyId;
    if (!companyId) return res.status(400).json({ message: 'No company linked to user' });

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const exists = company.interviewers.find(i => i.email.toLowerCase() === email.toLowerCase());
    if (exists) return res.status(400).json({ message: 'Interviewer with this email already exists' });

    company.interviewers.push({ name, email: email.toLowerCase(), role });
    await company.save();

    res.status(201).json(company.interviewers);
  } catch (err) {
    console.error('Add interviewer error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all interviewers for company
router.get('/interviewers', async (req, res) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) return res.status(400).json({ message: 'No company linked to user' });

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    res.json(company.interviewers);
  } catch (err) {
    console.error('Get interviewers error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Remove interviewer by email
router.delete('/interviewers/:email', async (req, res) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) return res.status(400).json({ message: 'No company linked to user' });

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const emailParam = req.params.email.toLowerCase();
    company.interviewers = company.interviewers.filter(i => i.email.toLowerCase() !== emailParam);
    await company.save();

    res.json(company.interviewers);
  } catch (err) {
    console.error('Delete interviewer error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

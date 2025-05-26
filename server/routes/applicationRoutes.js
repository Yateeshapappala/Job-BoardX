const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { 
  applyJob, 
  getMyApplications, 
  getApplicantsForJob,
  updateApplicationStatus,
  deleteApplication
} = require('../controllers/applicationController');

const router = express.Router();

router.get('/me', protect, getMyApplications);         // See my applications
router.get('/job/:id', protect, getApplicantsForJob);  // Employers see applicants for a job
router.post('/', protect, applyJob);
router.put('/:id/status', protect, updateApplicationStatus);
router.delete('/:id', protect, deleteApplication);
module.exports = router;

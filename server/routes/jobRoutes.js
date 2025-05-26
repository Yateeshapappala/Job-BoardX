const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { 
  createJob, 
  getJobs, 
  getMyJobs, 
  getJobById, 
  updateJob, 
  deleteJob 
} = require('../controllers/jobController');

const router = express.Router();

router.post('/', protect, createJob);            // Create job (Employer only)
router.get('/my-jobs', protect, getMyJobs);      // Get own jobs
router.get('/', getJobs);                        // Get all jobs (Public)
router.get('/:id', getJobById);                  // Get single job (Public)
router.put('/:id', protect, updateJob);          // Update job (Employer only)
router.delete('/:id', protect, deleteJob);       // Delete job (Employer only)

module.exports = router;

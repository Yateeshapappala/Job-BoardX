const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { 
  applyJob, 
  getMyApplications, 
  getApplicantsForJob,
  updateApplicationStatus,
  deleteApplication,
  sendInterviewInvitation,
  submitAvailability,
  setInterviewSlotsForJob,
  getApplicationById, // ← ✅ Add this controller
  scheduleInterviews,
  getInterviewSlots,
  calculateHiringTimeline
} = require('../controllers/applicationController');

const router = express.Router();

router.get('/me', protect, getMyApplications);
router.get('/job/:id', protect, getApplicantsForJob);
router.get('/:id', protect, getApplicationById); // ✅ ADD THIS LINE
router.post('/', protect, applyJob);
router.put('/:id/status', protect, updateApplicationStatus);
router.delete('/:id', protect, deleteApplication);
router.put('/:id/send-invitation', protect, sendInterviewInvitation);
router.put('/:id/submit-availability', protect, submitAvailability);
router.put('/:id/set-slots', protect, setInterviewSlotsForJob);
router.post('/:jobId/schedule-interviews', protect, scheduleInterviews);
router.get('/:id/get-slots',protect, getInterviewSlots);
router.post('/jobs/:jobId/minimum-days', protect,calculateHiringTimeline);
module.exports = router;

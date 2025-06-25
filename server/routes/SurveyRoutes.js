const express = require('express');
const router = express.Router();
const {
  createSurvey,
  submitSurveyResponse,
  getSurveyResponses,
  getEmployerSurveys,
  getSurveyById,
  deleteSurvey,
  checkIfSubmitted
} = require('../controllers/SurveyController');

const { protect, restrictTo } = require('../middlewares/authMiddleware');

const employerOnly = restrictTo('Employer');

// Survey creation & response
router.post('/', protect, employerOnly, createSurvey);
router.post('/:id/respond', submitSurveyResponse); // public (optional)

// Employer dashboarda
router.get('/employer/me', protect, employerOnly, getEmployerSurveys);
router.get('/:id/responses', protect, employerOnly, getSurveyResponses); 
router.get('/:id/has-submitted', checkIfSubmitted);
router.get('/:id', getSurveyById);
router.delete('/:id', protect, employerOnly, deleteSurvey);
module.exports = router;




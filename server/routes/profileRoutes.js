const express = require('express');
const router = express.Router();
const { getMyProfile, updateProfile } = require('../controllers/ProfileController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/me', protect, getMyProfile);
router.put('/', protect, upload.single('avatar'), updateProfile);

module.exports = router;

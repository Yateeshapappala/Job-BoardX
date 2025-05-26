const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/', upload.single('resume'), (req, res) => {
    console.log('upload endpoint ');
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.status(200).json({ resumeUrl: fileUrl });
});

module.exports = router;

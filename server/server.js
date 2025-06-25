const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

app.use(express.json());


const allowedOrigins = [
  'http://localhost:3000',
  'https://jobboarddx.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));


app.get('/', (req, res) => {
  res.send('JobBoardX API is running...');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error(err));

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const profileRoutes = require('./routes/profileRoutes');
app.use('/api/profile', profileRoutes);

const applicationRoutes = require('./routes/applicationRoutes');
app.use('/api/applications', applicationRoutes);

const jobRoutes = require('./routes/jobRoutes');
app.use('/api/jobs', jobRoutes);

const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const surveyRoutes = require('./routes/SurveyRoutes');
app.use('/api/surveys', surveyRoutes);

const interviewersRouter = require('./routes/interviewRoutes');
app.use('/api', interviewersRouter);

const PORT = process.env.PORT || 5000;
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from '../services/axiosInstance';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';

interface Question {
  _id: string;
  type: 'text' | 'multiple_choice' | 'checkbox';
  label: string;
  options?: string[];
}

interface Survey {
  id: string;
  title: string;
  questions: Question[];
}

const TakeSurveyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get('email') || '';

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const res = await axios.get(`/api/surveys/${id}?email=${encodeURIComponent(email)}`);

        setSurvey(res.data);
        const initialAnswers: { [key: string]: any } = {};
        res.data.questions.forEach((q: Question) => {
          if (q.type === 'checkbox') initialAnswers[q._id] = [];
          else initialAnswers[q._id] = '';
        });
        setAnswers(initialAnswers);
      } catch (err) {
        setError('Survey not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    fetchSurvey();
  }, [id]);

  const handleChange = (question: Question, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [question._id]: value,
    }));
  };

  const handleCheckboxChange = (question: Question, option: string) => {
    const current = answers[question._id] || [];
    if (current.includes(option)) {
      handleChange(
        question,
        current.filter((o: string) => o !== option)
      );
    } else {
      handleChange(question, [...current, option]);
    }
  };

  const handleSubmit = async () => {
    setError('');

    if (!survey) return;

    if (!email) {
      setError('Email is required to submit the survey.');
      return;
    }

    for (const q of survey.questions) {
      if ((q.type === 'text' || q.type === 'multiple_choice') && !answers[q._id]) {
        setError('Please answer all questions.');
        return;
      }
      if (q.type === 'checkbox' && answers[q._id].length === 0) {
        setError('Please select at least one option for all checkbox questions.');
        return;
      }
    }

    // Transform answers object into array format expected by backend, including questionIndex
    const formattedAnswers = survey.questions.map((q, index) => ({
      questionId: q._id,
      questionIndex: index,
      answer: answers[q._id],
    }));

    try {
      console.log('Submitting payload:', {
        email,
        answers: formattedAnswers,
      });

      await axios.post(`/api/surveys/${id}/respond`, {
        email,
        answers: formattedAnswers,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError('Submission failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (submitted) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h5" color="success.main" gutterBottom>
          ✅ Thank you! Your response has been recorded.
        </Typography>
      </Box>
    );
  }

  return (
    <Box maxWidth="md" mx="auto" p={4}>
      {error && (
        <Box mb={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      <Typography variant="h4" gutterBottom>
        {survey?.title}
      </Typography>

      <form onSubmit={e => e.preventDefault()}>
        {survey?.questions.map((question) => (
          <Box key={question._id} mb={4}>
            <Typography variant="h6" gutterBottom>
              {question.label}
            </Typography>

            {question.type === 'text' && (
              <TextField
                fullWidth
                value={answers[question._id]}
                onChange={e => handleChange(question, e.target.value)}
                placeholder="Your answer..."
                required
              />
            )}

            {question.type === 'multiple_choice' && (
              <FormControl fullWidth required>
                <InputLabel id={`select-label-${question._id}`}>
                  Select an option
                </InputLabel>
                <Select
                  labelId={`select-label-${question._id}`}
                  value={answers[question._id]}
                  label="Select an option"
                  onChange={e => handleChange(question, e.target.value)}
                >
                  {question.options?.map((opt, i) => (
                    <MenuItem key={i} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {question.type === 'checkbox' && (
              <FormGroup>
                {question.options?.map((opt, i) => (
                  <FormControlLabel
                    key={i}
                    control={
                      <Checkbox
                        checked={answers[question._id]?.includes(opt) || false}
                        onChange={() => handleCheckboxChange(question, opt)}
                      />
                    }
                    label={opt}
                  />
                ))}
              </FormGroup>
            )}
          </Box>
        ))}

        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </form>
    </Box>
  );
};

export default TakeSurveyPage;

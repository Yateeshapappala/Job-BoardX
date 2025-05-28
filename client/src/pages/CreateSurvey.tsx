
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../services/axiosInstance';
import DeleteIcon from '@mui/icons-material/Close';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type QuestionType = 'text' | 'multiple_choice' | 'checkbox' | 'rating' ;

interface Question {
  type: QuestionType;
  label: string;
  options?: string[]; // For multiple choice / checkbox / rating / date
}

const CreateSurvey: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { type: 'text', label: '' },
  ]);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Enter', ',', ' '].includes(e.key)) {
      e.preventDefault();
      addEmail();
    }
  };

  const addEmail = () => {
    const email = emailInput.trim();
    if (email && emailRegex.test(email) && !recipients.includes(email)) {
      setRecipients([...recipients, email]);
      setEmailInput('');
      setErrors((prev) => ({ ...prev, recipients: '' }));
    } else if (email && !emailRegex.test(email)) {
      setErrors((prev) => ({ ...prev, recipients: 'Invalid email address' }));
    }
  };

  const removeEmail = (email: string) => {
    setRecipients(recipients.filter((e) => e !== email));
  };

  const handleQuestionLabelChange = (index: number, value: string) => {
    const updated = [...questions];
    updated[index].label = value;
    setQuestions(updated);
  };

  const handleQuestionTypeChange = (index: number, type: QuestionType) => {
    const updated = [...questions];
    updated[index].type = type;
    if (type === 'multiple_choice' || type === 'checkbox') {
      updated[index].options = [''];
    } else if (type === 'rating') {
      // Default max rating 5 stored as string in options[0]
      updated[index].options = ['5'];
    } else {
      delete updated[index].options;
    }
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    if (!updated[qIndex].options) return;
    updated[qIndex].options![oIndex] = value;
    setQuestions(updated);
  };

  const addOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options?.push('');
    setQuestions(updated);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options?.filter((_, i) => i !== oIndex);
    setQuestions(updated);
  };

  const addQuestion = () =>
    setQuestions([...questions, { type: 'text', label: '' }]);

  const removeQuestion = (index: number) =>
    setQuestions(questions.filter((_, i) => i !== index));

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = 'Survey title is required';
    if (questions.some((q) => !q.label.trim()))
      newErrors.questions = 'All questions must be labeled';
    if (recipients.length === 0)
      newErrors.recipients = 'At least one recipient is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      await axios.post(
        '/api/surveys',
        { title, questions, recipients },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      alert('Survey created!');
      navigate('/surveys/my');
    } catch (err) {
      console.error(err);
      alert('Failed to create survey');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          backgroundColor: 'white',
          p: 4,
          borderRadius: 3,
          boxShadow: 4,
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          📋 Create a New Survey
        </Typography>

        {/* Title */}
        <TextField
          label="Survey Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
          error={!!errors.title}
          helperText={errors.title}
          margin="normal"
          placeholder="e.g., Employee Feedback - May 2025"
        />

        {/* Questions */}
        <Typography variant="h6" sx={{ mt: 3 }}>
          Questions
        </Typography>
        {questions.map((q, index) => (
          <Box
            key={index}
            sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: 2 }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems="center"
            >
              <TextField
                fullWidth
                label={`Question ${index + 1}`}
                value={q.label}
                onChange={(e) => handleQuestionLabelChange(index, e.target.value)}
              />
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={q.type}
                  label="Type"
                  onChange={(e) =>
                    handleQuestionTypeChange(index, e.target.value as QuestionType)
                  }
                >
                  <MenuItem value="text">Text</MenuItem>
                  <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                  <MenuItem value="checkbox">Checkbox</MenuItem>
                  <MenuItem value="rating">Rating (1–5)</MenuItem>
                </Select>
              </FormControl>
              {questions.length > 1 && (
                <IconButton onClick={() => removeQuestion(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              )}
            </Stack>

            {/* Options (if applicable) */}
            {(q.type === 'multiple_choice' || q.type === 'checkbox') && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Options
                </Typography>
                {q.options?.map((opt, oIndex) => (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    key={oIndex}
                    sx={{ mb: 1 }}
                  >
                    <TextField
                      size="small"
                      value={opt}
                      onChange={(e) =>
                        handleOptionChange(index, oIndex, e.target.value)
                      }
                      placeholder={`Option ${oIndex + 1}`}
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeOption(index, oIndex)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
                <Button onClick={() => addOption(index)} size="small">
                  + Add Option
                </Button>
              </Box>
            )}

            {/* UI for rating */}
            {q.type === 'rating' && (
  <TextField
    label="Max Rating"
    type="number"
    fullWidth
    sx={{ mt: 2 }}
    inputProps={{ min: 1, max: 10 }}
    value={q.options?.[0] || '5'}
    onChange={(e) => {
      const updated = [...questions];
      updated[index].options = [e.target.value];
      setQuestions(updated);
    }}
    helperText="Enter a number between 1 and 10"
  />
)}

          </Box>
        ))}
        {errors.questions && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {errors.questions}
          </Typography>
        )}
        <Button onClick={addQuestion} sx={{ mt: 2 }} variant="text">
          + Add another question
        </Button>

        {/* Recipients */}
        <Typography variant="h6" sx={{ mt: 4 }}>
          Recipient Emails
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1,
            mt: 1,
            border: '1px solid #ccc',
            borderRadius: 2,
            p: 1,
            minHeight: 56,
          }}
        >
          {recipients.map((email) => (
            <Chip
              key={email}
              label={email}
              onDelete={() => removeEmail(email)}
              color="primary"
            />
          ))}
          <input
            ref={inputRef}
            style={{ flexGrow: 1, border: 'none', outline: 'none', minWidth: 120 }}
            type="email"
            placeholder="Type email and press Enter"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={handleEmailKeyDown}
          />
        </Box>
        {errors.recipients && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {errors.recipients}
          </Typography>
        )}

        {/* Submit */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 4 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Survey'}
        </Button>
      </Box>
    </Container>
  );
};

export default CreateSurvey;

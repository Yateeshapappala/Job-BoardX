import React, { useState } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import {
  TextField, Button, Checkbox, FormControlLabel, MenuItem,
  Snackbar, Alert, CircularProgress, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import * as Yup from 'yup';
import axios from '../services/axiosInstance';
import { useNavigate } from 'react-router-dom';
import InfoIcon from '@mui/icons-material/Info';

const PostJobPage = () => {
  const navigate = useNavigate();

  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMessage, setPreviewMessage] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [enhanceLoading, setEnhanceLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const initialValues = {
    title: '',
    company: '',
    location: '',
    salary: '',
    description: '',
    employmentType: '',
    experienceLevel: '',
    skillsRequired: '',
    applicationDeadline: '',
    isRemote: false,
    industry: '',
    jobBenefits: '',
    numberOfOpenings: 1,
    status: 'Open',
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Job title is required'),
    company: Yup.string().required('Company is required'),
    location: Yup.string().when('isRemote', (isRemote, schema) =>
      isRemote ? schema : schema.required('Location is required')
    ),
    salary: Yup.string(),
    description: Yup.string().required('Description is required'),
    employmentType: Yup.string().oneOf(['Full-time', 'Part-time', 'Contract', 'Internship']),
    experienceLevel: Yup.string().oneOf(['Entry', 'Mid', 'Senior']),
    skillsRequired: Yup.string(),
    applicationDeadline: Yup.date()
      .nullable()
      .transform((value, originalValue) =>
        originalValue === '' ? null : new Date(originalValue)
      ),
    industry: Yup.string(),
    jobBenefits: Yup.string(),
    numberOfOpenings: Yup.number().min(1),
    status: Yup.string().oneOf(['Open', 'Closed']),
  });

  
const handlePreview = async (values: typeof initialValues) => {
  const { title, description, industry } = values;

  if (!title.trim() || !description.trim() || !industry.trim()) {
    setPreviewMessage('Title, description, and industry are required for preview.');
    setPreviewOpen(true);
    return;
  }

  setPreviewLoading(true);
  try {
    const token = localStorage.getItem('token');
    const res = await axios.post(
      '/api/jobs/openai/preview-job-description',
      { title, description, industry },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setPreviewMessage(res.data.optimizedDescription || 'No improvement found.');
    setPreviewOpen(true);
  } catch (err: any) {
    setPreviewMessage(
      err.response?.data?.message || 'Failed to preview description.'
    );
    setPreviewOpen(true);
  } finally {
    setPreviewLoading(false);
  }
};

  const handleEnhanceDescription = async (
  values: typeof initialValues,
  setFieldValue: (field: string, value: any) => void
) => {
  const { title, description, industry } = values;

  if (!title.trim() || !description.trim() || !industry.trim()) {
    setPreviewMessage('Title, description, and industry are required for enhancement.');
    setPreviewOpen(true);
    return;
  }

  setEnhanceLoading(true);
  try {
    const token = localStorage.getItem('token');
    const res = await axios.post(
      '/api/jobs/openai/preview-job-description',
      { title, description, industry },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const improved = res.data.optimizedDescription || description;
    setFieldValue('description', improved);
    setPreviewMessage('Job description enhanced successfully!');
    setPreviewOpen(true);
  } catch (err: any) {
    setPreviewMessage(
      err.response?.data?.message || 'Failed to enhance the job description.'
    );
    setPreviewOpen(true);
  } finally {
    setEnhanceLoading(false);
  }
};

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      const token = localStorage.getItem('token');

      const payload = {
        title: values.title,
        description: values.description,
        company: values.company,
        location: values.isRemote ? 'Remote' : values.location,
        salary: values.salary,
        employmentType: values.employmentType,
        experienceLevel: values.experienceLevel,
        skillsRequired: values.skillsRequired
          ? values.skillsRequired.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        applicationDeadline: values.applicationDeadline
          ? new Date(values.applicationDeadline)
          : null,
        isRemote: values.isRemote,
        industry: values.industry,
        jobBenefits: values.jobBenefits
          ? values.jobBenefits.split(',').map((b) => b.trim()).filter(Boolean)
          : [],
        numberOfOpenings: Number(values.numberOfOpenings),
        status: values.status,
      };

      const response = await axios.post('/api/jobs', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.optimizedDescription) {
        setPreviewMessage(response.data.optimizedDescription);
        setDialogOpen(true);
      }

      setSuccessOpen(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Job posting failed!';
      setErrorMessage(message);
      setErrorOpen(true);
    }
  };
  return (
    <div style={{ maxWidth: 600, margin: 'auto', marginTop: '2rem' }}>
      <h2>
        Post a New Job{' '}
        <Tooltip title="Job description will be improved based on employee feedback analysis">
          <InfoIcon fontSize="small" style={{ verticalAlign: 'middle' }} />
        </Tooltip>
      </h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, setFieldValue }) => (
          <Form>
            <TextField
              fullWidth
              label="Job Title"
              name="title"
              value={values.title}
              onChange={handleChange}
              margin="normal"
              required
              aria-label="Job Title"
            />
            <ErrorMessage name="title">
              {(msg) => <div style={{ color: 'red' }}>{msg}</div>}
            </ErrorMessage>

            <TextField
              fullWidth
              label="Company"
              name="company"
              value={values.company}
              onChange={handleChange}
              margin="normal"
              required
              aria-label="Company"
            />
            <ErrorMessage name="company">
              {(msg) => <div style={{ color: 'red' }}>{msg}</div>}
            </ErrorMessage>

            <FormControlLabel
              control={
                <Checkbox
                  name="isRemote"
                  checked={values.isRemote}
                  onChange={(e) => setFieldValue('isRemote', e.target.checked)}
                  aria-label="Remote Job"
                />
              }
              label="Remote Job"
            />

            <TextField
              fullWidth
              label="Location"
              name="location"
              value={values.location}
              onChange={handleChange}
              margin="normal"
              disabled={values.isRemote}
              required={!values.isRemote}
              aria-label="Location"
            />
            <ErrorMessage name="location">
              {(msg) => <div style={{ color: 'red' }}>{msg}</div>}
            </ErrorMessage>

            <TextField
              fullWidth
              label="Salary"
              name="salary"
              value={values.salary}
              onChange={handleChange}
              margin="normal"
              aria-label="Salary"
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Job Description"
              name="description"
              value={values.description}
              onChange={handleChange}
              margin="normal"
              required
              aria-label="Job Description"
            />
            <ErrorMessage name="description">
              {(msg) => <div style={{ color: 'red' }}>{msg}</div>}
            </ErrorMessage>

            <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
              <Button
                variant="outlined"
                onClick={() => handleEnhanceDescription(values, setFieldValue)}
                disabled={enhanceLoading || !values.description.trim()}
                startIcon={enhanceLoading ? <CircularProgress size={20} /> : null}
                aria-label="Enhance Description"
              >
                {enhanceLoading ? 'Enhancing...' : 'Enhance Description'}
              </Button>

              <Button
                variant="outlined"
                onClick={() => handlePreview(values)}
                disabled={previewLoading}
                startIcon={previewLoading ? <CircularProgress size={20} /> : null}
                aria-label="Preview Optimized Description"
              >
                {previewLoading ? 'Loading...' : 'Preview Optimized Description'}
              </Button>
            </div>

            <TextField
              select
              fullWidth
              label="Employment Type"
              name="employmentType"
              value={values.employmentType}
              onChange={handleChange}
              margin="normal"
              aria-label="Employment Type"
            >
              <MenuItem value="Full-time">Full-time</MenuItem>
              <MenuItem value="Part-time">Part-time</MenuItem>
              <MenuItem value="Contract">Contract</MenuItem>
              <MenuItem value="Internship">Internship</MenuItem>
            </TextField>

            <TextField
              select
              fullWidth
              label="Experience Level"
              name="experienceLevel"
              value={values.experienceLevel}
              onChange={handleChange}
              margin="normal"
              aria-label="Experience Level"
            >
              <MenuItem value="Entry">Entry</MenuItem>
              <MenuItem value="Mid">Mid</MenuItem>
              <MenuItem value="Senior">Senior</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Skills Required (comma separated)"
              name="skillsRequired"
              value={values.skillsRequired}
              onChange={handleChange}
              margin="normal"
              aria-label="Skills Required"
            />

            <TextField
              fullWidth
              type="date"
              label="Application Deadline"
              name="applicationDeadline"
              InputLabelProps={{ shrink: true }}
              value={values.applicationDeadline}
              onChange={handleChange}
              margin="normal"
              aria-label="Application Deadline"
            />

            <TextField
              fullWidth
              label="Industry"
              name="industry"
              value={values.industry}
              onChange={handleChange}
              margin="normal"
              aria-label="Industry"
            />

            <TextField
              fullWidth
              label="Job Benefits (comma separated)"
              name="jobBenefits"
              value={values.jobBenefits}
              onChange={handleChange}
              margin="normal"
              aria-label="Job Benefits"
            />

            <TextField
              fullWidth
              type="number"
              label="Number of Openings"
              name="numberOfOpenings"
              value={values.numberOfOpenings}
              onChange={handleChange}
              margin="normal"
              inputProps={{ min: 1 }}
              aria-label="Number of Openings"
            />

            <TextField
              select
              fullWidth
              label="Status"
              name="status"
              value={values.status}
              onChange={handleChange}
              margin="normal"
              aria-label="Status"
            >
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </TextField>

            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              Post Job
            </Button>
          </Form>
        )}
      </Formik>

      {/* Success Snackbar */}
      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessOpen(false)} severity="success" sx={{ width: '100%' }}>
          Job posted successfully!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={errorOpen}
        autoHideDuration={4000}
        onClose={() => setErrorOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setErrorOpen(false)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Preview Snackbar */}
      <Snackbar
        open={previewOpen}
        autoHideDuration={6000}
        onClose={() => setPreviewOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setPreviewOpen(false)} severity="info" sx={{ width: '100%', whiteSpace: 'pre-line' }}>
          {previewMessage}
        </Alert>
      </Snackbar>

      {/* Optimized Description Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Optimized Job Description</DialogTitle>
        <DialogContent dividers>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{previewMessage}</pre>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PostJobPage;

import React, { useState } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import {
  TextField, Button, Checkbox, FormControlLabel, MenuItem,
  Snackbar, Alert
} from '@mui/material';
import * as Yup from 'yup';
import axios from '../services/axiosInstance';
import { useNavigate } from 'react-router-dom';

const PostJobPage = () => {
  const navigate = useNavigate();

  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
    status: 'Open'
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Job title is required'),
    location: Yup.string().when('isRemote', ([isRemote], schema) =>
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
    status: Yup.string().oneOf(['Open', 'Closed'])
  });

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
        status: values.status
      };

      await axios.post('/api/jobs', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessOpen(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Job posting failed!';
      setErrorMessage(message);
      setErrorOpen(true);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', marginTop: '2rem' }}>
      <h2>Post a New Job</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, setFieldValue }) => (
          <Form>
            <TextField fullWidth label="Job Title" name="title" value={values.title} onChange={handleChange} margin="normal" required />
            <ErrorMessage name="title" component="div" />

            <TextField fullWidth label="Company" name="company" value={values.company} onChange={handleChange} margin="normal" required />
            <ErrorMessage name="company" component="div" />

            <FormControlLabel
              control={
                <Checkbox
                  name="isRemote"
                  checked={values.isRemote}
                  onChange={(e) => setFieldValue('isRemote', e.target.checked)}
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
            />
            <ErrorMessage name="location" component="div" />

            <TextField fullWidth label="Salary" name="salary" value={values.salary} onChange={handleChange} margin="normal" />

            <TextField fullWidth multiline rows={4} label="Job Description" name="description" value={values.description} onChange={handleChange} margin="normal" required />
            <ErrorMessage name="description" component="div" />

            <TextField select fullWidth label="Employment Type" name="employmentType" value={values.employmentType} onChange={handleChange} margin="normal">
              <MenuItem value="Full-time">Full-time</MenuItem>
              <MenuItem value="Part-time">Part-time</MenuItem>
              <MenuItem value="Contract">Contract</MenuItem>
              <MenuItem value="Internship">Internship</MenuItem>
            </TextField>

            <TextField select fullWidth label="Experience Level" name="experienceLevel" value={values.experienceLevel} onChange={handleChange} margin="normal">
              <MenuItem value="Entry">Entry</MenuItem>
              <MenuItem value="Mid">Mid</MenuItem>
              <MenuItem value="Senior">Senior</MenuItem>
            </TextField>

            <TextField fullWidth label="Skills Required (comma separated)" name="skillsRequired" value={values.skillsRequired} onChange={handleChange} margin="normal" />

            <TextField fullWidth type="date" label="Application Deadline" name="applicationDeadline" InputLabelProps={{ shrink: true }} value={values.applicationDeadline} onChange={handleChange} margin="normal" />

            <TextField fullWidth label="Industry" name="industry" value={values.industry} onChange={handleChange} margin="normal" />

            <TextField fullWidth label="Job Benefits (comma separated)" name="jobBenefits" value={values.jobBenefits} onChange={handleChange} margin="normal" />

            <TextField fullWidth type="number" label="Number of Openings" name="numberOfOpenings" value={values.numberOfOpenings} onChange={handleChange} margin="normal" />

            <TextField select fullWidth label="Status" name="status" value={values.status} onChange={handleChange} margin="normal">
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </TextField>

            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              Post Job
            </Button>
          </Form>
        )}
      </Formik>

      {/*Success Snackbar */}
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
    </div>
  );
};

export default PostJobPage;

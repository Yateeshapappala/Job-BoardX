import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, FieldArray, ErrorMessage } from 'formik';
import { TextField, Button, MenuItem, Checkbox, FormControlLabel } from '@mui/material';
import * as Yup from 'yup';
import axios from '../services/axiosInstance';

const EditJobPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<any | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/jobs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJob(response.data);
      } catch (error) {
        console.error('Error fetching job:', error);
      }
    };

    if (id) fetchJob();
  }, [id]);

  const validationSchema = Yup.object({
    title: Yup.string().required('Job title is required'),
    company: Yup.string().required('Company is required'),
    location: Yup.string().required('Location is required'),
    salary: Yup.string(),
    description: Yup.string().required('Description is required'),
    employmentType: Yup.string().oneOf(['Full-time', 'Part-time', 'Contract', 'Internship']),
    experienceLevel: Yup.string().oneOf(['Entry', 'Mid', 'Senior']),
    skillsRequired: Yup.array().of(Yup.string()),
    applicationDeadline: Yup.date().nullable(),
    isRemote: Yup.boolean(),
    industry: Yup.string(),
    jobBenefits: Yup.array().of(Yup.string()),
    numberOfOpenings: Yup.number().min(1),
    status: Yup.string().oneOf(['Open', 'Closed'])
  });

  const handleSubmit = async (values: any) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/jobs/${id}`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Job updated successfully!');
      navigate('/');
    } catch (error: any) {
      console.error('Error updating job:', error);
      alert(error.response?.data?.message || 'Job update failed!');
    }
  };

  return job ? (
    <div style={{ maxWidth: 600, margin: 'auto', marginTop: '2rem' }}>
      <h2>Edit Job</h2>
      <Formik
        initialValues={{
          title: job.title || '',
          company: job.company || '',
          location: job.location || '',
          salary: job.salary || '',
          description: job.description || '',
          employmentType: job.employmentType || '',
          experienceLevel: job.experienceLevel || '',
          skillsRequired: job.skillsRequired || [''],
          applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('T')[0] : '',
          isRemote: job.isRemote || false,
          industry: job.industry || '',
          jobBenefits: job.jobBenefits || [''],
          numberOfOpenings: job.numberOfOpenings || 1,
          status: job.status || 'Open',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, setFieldValue }) => (
          <Form>
            <TextField fullWidth label="Job Title" name="title" value={values.title} onChange={handleChange} margin="normal" />
            <ErrorMessage name="title" component="div" />

            <TextField fullWidth label="Company" name="company" value={values.company} onChange={handleChange} margin="normal" />
            <ErrorMessage name="company" component="div" />

            <TextField fullWidth label="Location" name="location" value={values.location} onChange={handleChange} margin="normal" />
            <ErrorMessage name="location" component="div" />

            <TextField fullWidth label="Salary" name="salary" value={values.salary} onChange={handleChange} margin="normal" />
            <ErrorMessage name="salary" component="div" />

            <TextField fullWidth multiline rows={4} label="Job Description" name="description" value={values.description} onChange={handleChange} margin="normal" />
            <ErrorMessage name="description" component="div" />

            <TextField select fullWidth label="Employment Type" name="employmentType" value={values.employmentType} onChange={handleChange} margin="normal">
              {['Full-time', 'Part-time', 'Contract', 'Internship'].map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
            </TextField>

            <TextField select fullWidth label="Experience Level" name="experienceLevel" value={values.experienceLevel} onChange={handleChange} margin="normal">
              {['Entry', 'Mid', 'Senior'].map(level => <MenuItem key={level} value={level}>{level}</MenuItem>)}
            </TextField>

            <FieldArray name="skillsRequired">
              {({ push, remove }) => (
                <div>
                  <label>Skills Required</label>
                  {values.skillsRequired.map((skill: string, index: number) => (
                    <div key={index} style={{ marginBottom: 8 }}>
                      <TextField
                        fullWidth
                        name={`skillsRequired[${index}]`}
                        value={skill}
                        onChange={handleChange}
                        margin="dense"
                      />
                      <Button onClick={() => remove(index)}>Remove</Button>
                    </div>
                  ))}
                  <Button onClick={() => push('')}>Add Skill</Button>
                </div>
              )}
            </FieldArray>

            <TextField
              fullWidth
              type="date"
              label="Application Deadline"
              name="applicationDeadline"
              value={values.applicationDeadline}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />

            <FormControlLabel
              control={<Checkbox name="isRemote" checked={values.isRemote} onChange={handleChange} />}
              label="Remote Job"
            />

            <TextField fullWidth label="Industry" name="industry" value={values.industry} onChange={handleChange} margin="normal" />

            <FieldArray name="jobBenefits">
              {({ push, remove }) => (
                <div>
                  <label>Job Benefits</label>
                  {values.jobBenefits.map((benefit: string, index: number) => (
                    <div key={index} style={{ marginBottom: 8 }}>
                      <TextField
                        fullWidth
                        name={`jobBenefits[${index}]`}
                        value={benefit}
                        onChange={handleChange}
                        margin="dense"
                      />
                      <Button onClick={() => remove(index)}>Remove</Button>
                    </div>
                  ))}
                  <Button onClick={() => push('')}>Add Benefit</Button>
                </div>
              )}
            </FieldArray>

            <TextField
              fullWidth
              type="number"
              label="Number of Openings"
              name="numberOfOpenings"
              value={values.numberOfOpenings}
              onChange={handleChange}
              margin="normal"
            />

            <TextField select fullWidth label="Status" name="status" value={values.status} onChange={handleChange} margin="normal">
              {['Open', 'Closed'].map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
            </TextField>

            <Button type="submit" variant="contained" color="primary" fullWidth>
              Update Job
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  ) : (
    <p>Loading job details...</p>
  );
};

export default EditJobPage;


import React, { useEffect, useState } from 'react';
import {Box, Typography, Paper, CircularProgress, Divider,Button,Snackbar} from '@mui/material';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import axios from "../services/axiosInstance"
import { useNavigate } from 'react-router-dom';
import { Profile} from '../services/Profile';
import SkillsFieldArray from '../components/EditSkills';
import ProfileFormFields from '../components/EditProfileform';
import ExperienceEducationFieldArray from '../components/EditEduExp';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [initialValues, setInitialValues] = useState<Profile>({
    headline: '',
    bio: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    skills: [],
    experience: [{
      title: '', company: '', location: '', from: '', to: '', current: false, description: ''
    }],
    education: [{
      school: '', degree: '', fieldOfStudy: '', from: '', to: '', current: false, description: ''
    }]
  });

  const validationSchema = Yup.object({
    headline: Yup.string().max(100),
    bio: Yup.string().max(1000),
    phone: Yup.string(),
    location: Yup.string(),
    website: Yup.string().url().nullable(),
    linkedin: Yup.string().url().nullable(),
    github: Yup.string().url().nullable(),
    skills: Yup.array().of(Yup.string()),
    experience: Yup.array().of(
      Yup.object({
        title: Yup.string().required('Title is required'),
        company: Yup.string().required('Company is required'),
        location: Yup.string(),
        from: Yup.date().required('From date is required'),
        to: Yup.date().nullable(),
        current: Yup.boolean(),
        description: Yup.string(),
      })
    ),
    education: Yup.array().of(
      Yup.object({
        school: Yup.string().required('School is required'),
        degree: Yup.string().required('Degree is required'),
        fieldOfStudy: Yup.string(),
        from: Yup.date().required('From date is required'),
        to: Yup.date().nullable(),
        current: Yup.boolean(),
        description: Yup.string(),
      })
    ),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/profile/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
  
        const formatDate = (dateStr: string) =>
          dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';
  
        setInitialValues({
          headline: data.headline || '',
          bio: data.bio || '',
          phone: data.phone || '',
          location: data.location || '',
          website: data.website || '',
          linkedin: data.linkedin || '',
          github: data.github || '',
          skills: Array.isArray(data.skills) ? data.skills : [],
          experience: data.experience?.map((exp: any) => ({
            ...exp,
            from: formatDate(exp.from),
            to: formatDate(exp.to),
          })) || [{
            title: '', company: '', location: '', from: '', to: '', current: false, description: ''
          }],
          education: data.education?.map((edu: any) => ({
            ...edu,
            from: formatDate(edu.from),
            to: formatDate(edu.to),
          })) || [{
            school: '', degree: '', fieldOfStudy: '', from: '', to: '', current: false, description: ''
          }]
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);
  
  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth="md" mx="auto" mt={5} px={2}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" mb={3}>Edit Profile</Typography>
        <Divider sx={{ mb: 3 }} />

        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const token = localStorage.getItem('token');
              await axios.put('/api/profile', values, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                }
              });
              setSnackbarMessage('Profile updated successfully!');
              setOpenSnackbar(true);
              navigate('/profile/me');
            } catch (err: any) {
              console.error('Profile update failed:', err.response?.data || err.message);
              setSnackbarMessage('Failed to update profile!');
              setOpenSnackbar(true);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, handleChange, errors, touched, isSubmitting, setFieldValue }) => (
            
             <Form noValidate>
      <ProfileFormFields
        values={values}
        handleChange={handleChange}
        errors={errors}
        touched={touched}
      />

      <FieldArray name="skills">
        {(arrayHelpers) => (
          <SkillsFieldArray
            skills={values.skills}
            newSkill={newSkill}
            setNewSkill={setNewSkill}
            arrayHelpers={arrayHelpers}
          />
        )}
      </FieldArray>

      <FieldArray name="experience">
        {(experienceHelpers) => (
          <FieldArray name="education">
            {(educationHelpers) => (
              <ExperienceEducationFieldArray
                values={{ experience: values.experience, education: values.education }}
                errors={errors}
                touched={touched}
                handleChange={handleChange}
                setFieldValue={setFieldValue}
                experienceHelpers={experienceHelpers}
                educationHelpers={educationHelpers}
              />
            )}
          </FieldArray>
        )}
      </FieldArray>  

              <Box mt={4}>
                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                  Save Profile
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose} message={snackbarMessage} />
      </Paper>
    </Box>
  );
};

export default EditProfilePage;

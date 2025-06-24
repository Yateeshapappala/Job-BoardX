import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from '../services/axiosInstance';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Paper,
  useMediaQuery,
  useTheme,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const RegisterPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleTogglePassword = () => setShowPassword(prev => !prev);

  const initialValues = {
    name: '',
    email: '',
    password: '',
    role: '',
    companyName: '',
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
      .min(8, 'At least 8 characters')
      .matches(/[a-z]/, 'Include a lowercase letter')
      .matches(/[A-Z]/, 'Include an uppercase letter')
      .matches(/\d/, 'Include a number')
      .matches(/[!@#$%^&*]/, 'Include a special character')
      .required('Password is required'),
    role: Yup.string().oneOf(['JobSeeker', 'Employer'], 'Select a valid role').required('Role is required'),
    companyName: Yup.string().when('role', {
      is: 'Employer',
      then: schema => schema.required('Company name is required'),
      otherwise: schema => schema.notRequired(),
    }),
  });

  const onSubmit = async (values: typeof initialValues, { resetForm }: any) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', values);
      localStorage.setItem('token', res.data.token);
      setSuccessMessage('Registration successful!');
      resetForm();
      setTimeout(() => navigate('/profile'), 1500); // Delay for snackbar visibility
    } catch (error: any) {
      alert(error.response?.data?.message || 'Registration failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} minHeight={isMobile ? '100%' : '100vh'}>
        <Box
          flex={1}
          bgcolor="#1e3a8a"
          color="#fff"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          p={isMobile ? 3 : 6}
        >
          <Typography variant={isMobile ? 'h4' : 'h3'} fontWeight={600} gutterBottom>
            Welcome to JobBoardX
          </Typography>
          <Typography variant="h6" maxWidth="80%" textAlign="center" lineHeight={1.6}>
            Connect with top companies, find your dream job, or hire the best talent in the market.
          </Typography>
        </Box>

        <Box
          flex={1}
          display="flex"
          justifyContent="center"
          alignItems="center"
          bgcolor="#f1f5f9"
          p={3}
        >
          <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 450, borderRadius: 3 }}>
            <Typography variant="h4" align="center" gutterBottom fontWeight={600}>
              Create Account
            </Typography>

            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
              {({ values, handleChange, touched, errors }) => (
                <Form>
                  <Box mb={2}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                    />
                  </Box>

                  <Box mb={2}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                    />
                  </Box>

                  <Box mb={2}>
                    <TextField
  fullWidth
  label="Password"
  name="password"
  type={showPassword ? 'text' : 'password'}
  value={values.password}
  onChange={handleChange}
  error={touched.password && Boolean(errors.password)}
  helperText={touched.password && errors.password}
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          onClick={handleTogglePassword}
          edge="end"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
  }}
/>

                  </Box>

                  <Box mb={2}>
                    <TextField
                      fullWidth
                      select
                      label="Register As"
                      name="role"
                      value={values.role}
                      onChange={handleChange}
                      error={touched.role && Boolean(errors.role)}
                      helperText={touched.role && errors.role}
                    >
                      <MenuItem value="" disabled>
                        Select role...
                      </MenuItem>
                      <MenuItem value="JobSeeker">Job Seeker</MenuItem>
                      <MenuItem value="Employer">Employer</MenuItem>
                    </TextField>
                  </Box>

                  {values.role === 'Employer' && (
                    <Box mb={3}>
                      <TextField
                        fullWidth
                        label="Company Name"
                        name="companyName"
                        value={values.companyName}
                        onChange={handleChange}
                        error={touched.companyName && Boolean(errors.companyName)}
                        helperText={touched.companyName && errors.companyName}
                      />
                    </Box>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ bgcolor: '#2563eb' }}
                    disabled={loading}
                  >
                    {loading ? 'Signing Up...' : 'Sign Up'}
                  </Button>

                  <Typography align="center" mt={2}>
                    Already have an account?{' '}
                    <Box
                      component="span"
                      color="#2563eb"
                      fontWeight={600}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate('/login')}
                    >
                      Login
                    </Box>
                  </Typography>
                </Form>
              )}
            </Formik>
          </Paper>
        </Box>
      </Box>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RegisterPage;

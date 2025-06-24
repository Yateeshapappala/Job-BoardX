import React from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import { TextField, Button, Typography, Box, Paper, useMediaQuery, useTheme, IconButton } from '@mui/material';
import * as Yup from 'yup';
import axios from '../services/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


const LoginPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
const [snackbarMessage, setSnackbarMessage] = React.useState('');

  const initialValues = {
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });
  const [showPassword, setShowPassword] = React.useState(false);
const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (values: typeof initialValues, {resetForm}: {resetForm :() => void}) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/auth/login', values);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.dispatchEvent(new Event('authChange'));
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed!';
  setSnackbarMessage(message);
  setSnackbarOpen(true);
  resetForm();
}
    finally{
       setIsSubmitting(false);
    }
  };

  return (
    <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} minHeight="100vh">
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
          Welcome Back!
        </Typography>
        <Typography variant="h6" maxWidth="80%" textAlign="center" lineHeight={1.6}>
                             Login to access your dashboard and continue your journey.
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
        <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 420, borderRadius: 3 }}>
          <Typography variant="h4" align="center" gutterBottom fontWeight={600}>
            Sign In
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
            Login to your account
          </Typography>

          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ values, handleChange,resetForm }) => (
              <Form>
                <Box mb={2}>
                  <TextField
                  autoFocus
                    fullWidth
                    label="Email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                  />
                  <ErrorMessage name="email">
                    {(msg) => (
                      <Typography variant="body2" color="error" fontSize="0.8rem">
                        {msg}
                      </Typography>
                    )}
                  </ErrorMessage>
                </Box>

                <Box mb={2}>
                  <TextField
                    fullWidth
                    type={showPassword ? 'text': 'password'}
                    label="Password"
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    InputProps={{
    endAdornment: (
      <InputAdornment position='end'>
      <IconButton onClick={() => setShowPassword(!showPassword)}>
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </IconButton>
      </InputAdornment>
    ),
  }}
                  />
                  
                  <ErrorMessage name="password">
                    {(msg) => (
                      <Typography variant="body2" color="error" fontSize="0.8rem">
                        {msg}
                      </Typography>
                    )}
                  </ErrorMessage>
                </Box>

                <Button type="submit" fullWidth variant="contained" disabled = {isSubmitting} sx={{ mt: 2, bgcolor: '#2563eb' }}>
                 {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>

                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                  Don’t have an account?{' '}
                  <Link to="/register" style={{ color: '#2563eb', fontWeight: 600 }}>
                    Register
                  </Link>
                </Typography>
              </Form>
            )}
          </Formik>
          <Snackbar
  open={snackbarOpen}
  autoHideDuration={6000}
  onClose={() => setSnackbarOpen(false)}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
    {snackbarMessage}
  </Alert>
</Snackbar>

        </Paper>
      </Box>
    </Box>
  );
};

export default LoginPage;

import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
} from '@mui/material';
import axios from 'axios';

const AvailabilityForm = ({ role }: { role: 'candidate' | 'interviewer' }) => {
  const formik = useFormik({
    initialValues: {
      date: '',
      slots: '',
    },
    validationSchema: Yup.object({
      date: Yup.string().required('Date is required'),
      slots: Yup.string().required('Time slots (comma-separated)'),
    }),
    onSubmit: async (values) => {
      const endpoint =
        role === 'candidate'
          ? '/api/scheduler/candidate/availability'
          : '/api/scheduler/interviewer/availability';

      const payload = {
        date: values.date,
        timeSlots: values.slots.split(',').map((s) => s.trim()),
      };

      try {
        await axios.post(endpoint, payload);
        alert('Availability submitted');
      } catch (err) {
        console.error(err);
        alert('Error submitting availability');
      }
    },
  });

  return (
    <Paper sx={{ p: 3, maxWidth: 500, mx: 'auto', mt: 5 }}>
      <Typography variant="h5" mb={2}>
        Set {role === 'candidate' ? 'Candidate' : 'Interviewer'} Availability
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          label="Date (YYYY-MM-DD)"
          fullWidth
          name="date"
          margin="normal"
          value={formik.values.date}
          onChange={formik.handleChange}
        />
        <TextField
          label="Time Slots (e.g. 10:00-10:30, 11:00-11:30)"
          fullWidth
          name="slots"
          margin="normal"
          value={formik.values.slots}
          onChange={formik.handleChange}
        />
        <Button variant="contained" type="submit" fullWidth sx={{ mt: 2 }}>
          Submit
        </Button>
      </form>
    </Paper>
  );
};

export default AvailabilityForm;

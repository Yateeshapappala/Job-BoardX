import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from '../services/axiosInstance';
import { useParams } from 'react-router-dom';

const MinimumDaysEstimator: React.FC = () => {
  const { jobId } = useParams();
  const [numInterviewers, setNumInterviewers] = useState<number>(3);
  const [interviewDuration, setInterviewDuration] = useState<number>(45);
  const [minimumDays, setMinimumDays] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const handleSubmit = async () => {
    if (!jobId) {
      setSnackbar({ message: 'Job ID missing in URL', severity: 'error' });
      return;
    }

    if (numInterviewers <= 0 || interviewDuration <= 0) {
      setSnackbar({ message: 'Please enter valid input values.', severity: 'error' });
      return;
    }

    setLoading(true);
    setMinimumDays(null);

    try {
      const res = await axios.post(`/api/jobs/${jobId}/minimum-days`, {
        numInterviewers,
        interviewDuration,
      });
      setMinimumDays(res.data.minimumDays);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to calculate minimum days';
      setSnackbar({ message: msg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: 40 }}>
      <Typography variant="h5" gutterBottom>
        Minimum Days Required to Finish Interviews
      </Typography>

      <TextField
        label="Number of Interviewers"
        type="number"
        value={numInterviewers}
        onChange={(e) => setNumInterviewers(parseInt(e.target.value))}
        fullWidth
        margin="normal"
      />

      <TextField
        label="Interview Duration (minutes)"
        type="number"
        value={interviewDuration}
        onChange={(e) => setInterviewDuration(parseInt(e.target.value))}
        fullWidth
        margin="normal"
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={loading}
        fullWidth
        style={{ marginTop: 20 }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Calculate Minimum Days'}
      </Button>

      {minimumDays !== null && (
        <Typography variant="h6" style={{ marginTop: 30 }}>
          ✅ Minimum Days Needed: <strong>{minimumDays}</strong>
        </Typography>
      )}

      {snackbar && (
  <Snackbar
    open={true}
    autoHideDuration={4000}
    onClose={() => setSnackbar(null)}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
  >
    <Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} variant="filled">
      {snackbar.message}
    </Alert>
  </Snackbar>
)}

    </Container>
  );
};

export default MinimumDaysEstimator;

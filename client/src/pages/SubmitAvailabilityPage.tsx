import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../services/axiosInstance';
import {
  Box,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  CircularProgress
} from '@mui/material';

const SubmitAvailabilityPage = () => {
  const { id } = useParams(); // id is application ID
  const navigate = useNavigate();
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  // Fetch available interview slots from the job
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const token = localStorage.getItem('token');
        const appRes = await axios.get(`/api/applications/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const jobId = appRes.data.jobId;
        const jobRes = await axios.get(`/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAvailableSlots(jobRes.data.interviewSlots || []);
      } catch (err) {
        console.error('Failed to fetch interview slots:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSlots();
  }, [id]);

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot)
        ? prev.filter((s) => s !== slot)
        : [...prev, slot]
    );
  };

  const handleSubmit = async () => {
    if (selectedSlots.length === 0) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/applications/${id}/submit-availability`,
        { slots: selectedSlots },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setTimeout(() => navigate('/my-applications'), 2000);
    } catch (err) {
      console.error('Error submitting availability:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box mt={5} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Submit Interview Availability
      </Typography>

      {availableSlots.length === 0 ? (
        <Typography>No interview slots available from the employer.</Typography>
      ) : (
        <>
          <Typography variant="body1" gutterBottom>
            Select the slots that work best for you:
          </Typography>

          {availableSlots.map((slot, idx) => (
            <FormControlLabel
              key={idx}
              control={
                <Checkbox
                  checked={selectedSlots.includes(slot)}
                  onChange={() => toggleSlot(slot)}
                />
              }
              label={new Date(slot).toLocaleString()}
            />
          ))}

          <Box mt={3}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting || selectedSlots.length === 0}
            >
              {submitting ? 'Submitting...' : 'Submit Availability'}
            </Button>
          </Box>

          {success && (
            <Typography color="success.main" mt={2}>
              Availability submitted successfully!
            </Typography>
          )}
        </>
      )}
    </Box>
  );
};

export default SubmitAvailabilityPage;

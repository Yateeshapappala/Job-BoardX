import React, { useEffect, useState } from 'react';
import {Typography,Box,Snackbar,Alert,CircularProgress,Button} from '@mui/material';
import axios from '../services/axiosInstance';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import JobsTable from '../components/MyJobsTable';

dayjs.extend(relativeTime);

const MyJobsPage = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });


  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/jobs/my-jobs', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs', error);
        setSnackbar({ open: true, message: 'Failed to fetch jobs', severity: 'error' });
      }
      setLoading(false);
    };

    fetchJobs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await axios.delete(`/api/jobs/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setJobs((prevJobs) => prevJobs.filter((job) => job._id !== id));
      setSnackbar({ open: true, message: 'Job deleted successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error deleting job', error);
      setSnackbar({ open: true, message: 'Failed to delete the job', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
        mb={3}
      >
        <Typography variant="h4" fontWeight={600} sx={{ color: '#2D2F48' }}>
          My Posted Jobs
        </Typography>

        <Button
          component={Link}
          to="/post-job"
          variant="contained"
          sx={{
            backgroundColor: '#7A5FFF',
            borderRadius: 2,
            fontWeight: 500,
            px: 3,
            py: 1,
            boxShadow: '0 3px 10px rgba(122, 95, 255, 0.3)',
            '&:hover': {
              backgroundColor: '#6750f0',
              boxShadow: '0 4px 12px rgba(122, 95, 255, 0.4)',
            },
          }}
        >
          + Post New Job
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <CircularProgress color="secondary" />
        </Box>
      ) : jobs.length > 0 ? (
        <JobsTable jobs={jobs} onDelete={handleDelete} />
      ) : (
        <Typography variant="body1" color="text.secondary">
          You haven’t posted any jobs yet.
        </Typography>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyJobsPage;

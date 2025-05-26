import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper} from '@mui/material';
import ApplyModal from '../components/ApplyModal';
import { useJobDetails } from '../hooks/useJobDetails';
import axios from '../services/axiosInstance';
import JobInfoSection from '../components/JobInfoSection';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [openApplyModal, setOpenApplyModal] = useState(false);

  const {
    job,
    isApplied,
    loading,
    setIsApplied,
    setLoading,
  } = useJobDetails(id);

  const handleApply = async ({
    
    resumeLink,
    coverLetter,
    jobId,
  }: {
    
    resumeLink: string;
    coverLetter: string;
    jobId: string;
  }): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return false;
      }

      setLoading(true);
      const response = await axios.post(
        '/api/applications',
        { resumeLink, coverLetter, jobId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        setIsApplied(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error applying:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  if (!job) {
    return (
      <Box minHeight="80vh" display="flex" justifyContent="center" alignItems="center">
        <Typography variant="h6" color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, p: 2 }}>

      {/* JobInfoSection */}
      <Paper elevation={4} sx={{ maxWidth: 900, mx: 'auto', mt: 4, p: 2, borderRadius: 3 }}>
        <JobInfoSection
        job={job}
        isApplied={isApplied}
        loading={loading}
        onApplyClick={() => {
          const token = localStorage.getItem('token');
          if (!token) {
            navigate('/login');
          } else {
            setOpenApplyModal(true);
          }
        }}
        />
        </Paper>
        {/* Apply Modal */}
      <ApplyModal
  open={openApplyModal}
  handleClose={() => setOpenApplyModal(false)}
  onSubmit={handleApply}
  jobId={job._id}
/>

    </Box>
  );
};

export default JobDetailsPage;

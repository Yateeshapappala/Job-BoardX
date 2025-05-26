import React, { useEffect, useState } from 'react';
import axios from '../services/axiosInstance';
import {Box,Button,Card,CardActions,CardContent,Chip,Typography,Avatar,Stack} from '@mui/material';
import { Link } from 'react-router-dom';

const SavedJobsPage = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('/api/jobs');
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    const stored = localStorage.getItem('savedJobs');
    if (stored) {
      setSavedJobs(JSON.parse(stored));
    }

    fetchJobs();
  }, []);

  const savedJobList = jobs.filter((job) => savedJobs.includes(job._id));

  return (
    <Box sx={{ px: 4, py: 6, minHeight: '100vh', bgcolor: '#F8F4FF' }}>
      <Typography variant="h5" fontWeight={600} mb={4}>
        Saved Jobs
      </Typography>

      {savedJobList.length === 0 ? (
        <Typography color="text.secondary">You haven’t saved any jobs yet.</Typography>
      ) : (
        <Box display="flex" flexWrap="wrap" gap={3}>
          {savedJobList.map((job) => (
            <Card
              key={job._id}
              sx={{
                width: 300,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.5)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <Avatar sx={{ bgcolor: '#7A5FFF', fontSize: 14 }}>
                    {job.company?.charAt(0)}
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    {job.company} · {job.location}
                  </Typography>
                </Stack>

                <Typography variant="h6" fontWeight={600}>
                  {job.title}
                </Typography>

                <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
                  <Chip
                    label={`${job.numberOfOpenings || 1} Positions`}
                    size="small"
                    sx={{
                      backgroundColor: '#BBF7D0',
                      color: '#166534',
                      fontWeight: 500,
                      borderRadius: 1.5,
                    }}
                  />
                  <Chip
                    label={job.employmentType || 'Full-time'}
                    size="small"
                    sx={{
                      backgroundColor: '#FDE68A',
                      color: '#92400E',
                      fontWeight: 500,
                      borderRadius: 1.5,
                    }}
                  />
                  <Chip
                    label={job.isRemote ? 'Remote' : 'WFO'}
                    size="small"
                    sx={{
                      backgroundColor: '#DBEAFE',
                      color: '#1E40AF',
                      fontWeight: 500,
                      borderRadius: 1.5,
                    }}
                  />
                </Box>

                <Typography variant="body2" mt={2} color="text.secondary" sx={{ minHeight: 60 }}>
                  {job.description?.slice(0, 80)}...
                </Typography>
              </CardContent>

              <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                <Button
                  component={Link}
                  to={`/jobs/${job._id}`}
                  size="small"
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(90deg, #7A5FFF, #6242FF)',
                    textTransform: 'none',
                    borderRadius: 2,
                    color: '#fff',
                    boxShadow: '0 2px 6px rgba(122, 95, 255, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #6242FF, #7A5FFF)',
                    },
                  }}
                >
                  View & Apply
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SavedJobsPage;

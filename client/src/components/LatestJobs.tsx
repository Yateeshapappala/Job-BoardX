import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Typography, Card, CardContent, CardActions, Button,
  Box, Chip, Avatar, Stack
} from '@mui/material';
import { Link } from 'react-router-dom';

const LatestJobs = () => {
  const [latestJobs, setLatestJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/jobs?limit=4');
        setLatestJobs(res.data);
      } catch (err) {
        console.error('Failed to fetch latest jobs', err);
      }
    };
    fetchLatest();
  }, []);

  return (
    <Box mt={10}>
      <Typography variant="h4" fontWeight="bold" textAlign="center" sx={{ color: '#1E293B', mb: 3 }}>
        🔥 Latest Job Listings
      </Typography>

      <Box display="flex" flexWrap="wrap" justifyContent="center" gap={4}>
        {latestJobs.map((job) => (
          <Card
            key={job._id}
            sx={{
              width: 300,
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              transition: '0.3s',
              '&:hover': {
                boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
                transform: 'translateY(-4px)',
              },
              p: 2,
              backgroundColor: '#fff',
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                <Avatar sx={{ bgcolor: '#7A5FFF' }}>{job.company?.charAt(0)}</Avatar>
                <Typography variant="subtitle2" color="text.secondary">
                  {job.company}
                </Typography>
              </Stack>

              <Typography variant="h6" fontWeight="bold" sx={{ color: '#2D2F48', mb: 1 }}>
                {job.title}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                📍 {job.location}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" mt={2}>
                <Chip label={job.employmentType || 'Full-time'} size="small" sx={{ backgroundColor: '#FDE68A', color: '#92400E' }} />
                <Chip label={job.isRemote ? 'Remote' : 'WFO'} size="small" sx={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }} />
                <Chip label={job.experienceLevel || 'Any level'} size="small" sx={{ backgroundColor: '#E0E7FF', color: '#3730A3' }} />
              </Stack>
            </CardContent>

            <CardActions sx={{ justifyContent: 'space-between' }}>
              <Button component={Link} to={`/jobs/${job._id}`} size="small" variant="contained" sx={{ backgroundColor: '#7A5FFF', textTransform: 'none', fontWeight: 500, borderRadius: 2 }}>
                Apply Now
              </Button>
              <Button component={Link} to={`/jobs/${job._id}`} size="small" variant="outlined" sx={{ textTransform: 'none', fontWeight: 500, borderRadius: 2, borderColor: '#7A5FFF', color: '#7A5FFF' }}>
                View Details
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default LatestJobs;
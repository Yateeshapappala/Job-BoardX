import React from 'react';
import { Card, IconButton, Stack, Avatar, Typography, Chip, Box, Button } from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { Link } from 'react-router-dom';

interface JobCardProps {
  job: {
    _id: string;
    company: string;
    location: string;
    title: string;
    numberOfOpenings?: number;
    employmentType?: string;
    isRemote?: boolean;
    experienceLevel?: string;
    description?: string;
  };
  saved: boolean;
  onToggleSave: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, saved, onToggleSave }) => {
  return (
    <Card
      sx={{
        width: 280,
        p: 2,
        borderRadius: 5,
        background: 'linear-gradient(to bottom right, #fdfbff, #f3f3f9)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
        border: '1px solid #f1f5f9',
        position: 'relative',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      {/* Bookmark Icon */}
      <IconButton
        onClick={() => onToggleSave(job._id)}
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          color: saved ? '#7A5FFF' : '#cbd5e1',
          transition: 'color 0.3s',
          '&:hover': { color: '#7A5FFF' },
        }}
      >
        {saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
      </IconButton>

      {/* Company Info */}
      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
        <Avatar sx={{ bgcolor: '#7A5FFF', fontSize: 14 }}>
          {job.company?.charAt(0)}
        </Avatar>
        <Typography variant="body2" color="text.secondary">
          {job.company} · {job.location}
        </Typography>
      </Stack>

      {/* Job Title */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
        {job.title}
      </Typography>

      {/* Tags */}
      <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
        <Chip
          label={`${job.numberOfOpenings || 1} Positions`}
          size="small"
          sx={{
            backgroundColor: '#DCFCE7',
            color: '#15803D',
            fontWeight: 500,
            fontSize: 12,
            height: 24,
            borderRadius: 2,
          }}
        />
        <Chip
          label={job.employmentType || 'Full-time'}
          size="small"
          sx={{
            backgroundColor: '#FEF9C3',
            color: '#CA8A04',
            fontWeight: 500,
            fontSize: 12,
            height: 24,
            borderRadius: 2,
          }}
        />
        <Chip
          label={job.isRemote ? 'Remote' : 'WFO'}
          size="small"
          sx={{
            backgroundColor: '#DBEAFE',
            color: '#2563EB',
            fontWeight: 500,
            fontSize: 12,
            height: 24,
            borderRadius: 2,
          }}
        />
        <Chip
          label={job.experienceLevel || 'Any level'}
          size="small"
          sx={{
            backgroundColor: '#E0E7FF',
            color: '#4338CA',
            fontWeight: 500,
            fontSize: 12,
            height: 24,
            borderRadius: 2,
          }}
        />
      </Box>

      {/* Description */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 48 }}>
        {job.description?.slice(0, 80)}...
      </Typography>

      {/* Action Buttons */}
      <Box display="flex" justifyContent="space-between">
        <Button
          component={Link}
          to={`/jobs/${job._id}`}
          size="small"
          variant="contained"
          sx={{
            background: 'linear-gradient(to right, #7A5FFF, #6242FF)',
            textTransform: 'none',
            borderRadius: 2,
            fontWeight: 500,
            fontSize: 13,
            px: 2,
            py: 0.5,
            '&:hover': {
              background: 'linear-gradient(to right, #6242FF, #7A5FFF)',
            },
          }}
        >
          Apply Now
        </Button>

        <Button
          component={Link}
          to={`/jobs/${job._id}`}
          size="small"
          variant="outlined"
          sx={{
            borderColor: '#7A5FFF',
            color: '#7A5FFF',
            textTransform: 'none',
            borderRadius: 2,
            fontWeight: 500,
            fontSize: 13,
            px: 2,
            py: 0.5,
            '&:hover': {
              backgroundColor: '#ede9fe',
              borderColor: '#7A5FFF',
            },
          }}
        >
          View Details
        </Button>
      </Box>
    </Card>
  );
};

export default JobCard;

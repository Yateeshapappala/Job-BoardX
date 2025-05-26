// JobDetails.tsx
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
  Alert,
} from '@mui/material';

interface JobDetailsProps {
  job: any; // Ideally, replace `any` with your Job type/interface
  isApplied: boolean;
  loading: boolean;
  onApplyClick: () => void;
}

const JobInfoSection: React.FC<JobDetailsProps> = ({
  job,
  isApplied,
  loading,
  onApplyClick,
}) => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={700}>
        {job.title}
      </Typography>

      {job.status === 'Closed' && (
        <Alert severity="warning" variant="filled" sx={{ borderRadius: 2, mt: 2 }}>
          This job is closed and is no longer accepting applications.
        </Alert>
      )}

      <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center" mt={2}>
        <Chip label={job.company} color="primary" />
        {job.isRemote ? (
          <Chip label="Remote" color="success" />
        ) : (
          <Chip label={job.location} color="secondary" />
        )}
        <Chip label={job.employmentType} variant="outlined" />
        <Chip label={`${job.experienceLevel} Level`} variant="outlined" />
        <Chip label={job.status} color={job.status === 'Open' ? 'success' : 'default'} />
      </Stack>

      <Typography variant="h6" mt={3}>
        Job Description
      </Typography>
      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
        {job.description}
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Stack spacing={1}>
        <Box>
          <Typography fontWeight={600}>Industry:</Typography>
          <Typography>{job.industry || 'N/A'}</Typography>
        </Box>
        <Box>
          <Typography fontWeight={600}>Salary:</Typography>
          <Typography>{job.salary || 'Not Disclosed'}</Typography>
        </Box>
        <Box>
          <Typography fontWeight={600}>Number of Openings:</Typography>
          <Typography>{job.numberOfOpenings}</Typography>
        </Box>
        <Box>
          <Typography fontWeight={600}>Application Deadline:</Typography>
          <Typography>
            {job.applicationDeadline
              ? new Date(job.applicationDeadline).toLocaleDateString()
              : 'Not specified'}
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 3 }} />

      {job.skillsRequired?.length > 0 && (
        <>
          <Typography fontWeight={600}>Required Skills:</Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
            {job.skillsRequired.map((skill: string, index: number) => (
              <Chip key={index} label={skill} variant="outlined" />
            ))}
          </Stack>
        </>
      )}

      {job.jobBenefits?.length > 0 && (
        <>
          <Typography fontWeight={600} mt={3}>
            Job Benefits:
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
            {job.jobBenefits.map((benefit: string, index: number) => (
              <Chip key={index} label={benefit} color="info" variant="outlined" />
            ))}
          </Stack>
        </>
      )}

      <Box mt={4}>
        {job.status === 'Closed' ? (
          <Button variant="outlined" color="error" fullWidth disabled>
            Applications Closed
          </Button>
        ) : isApplied ? (
          <Button variant="outlined" color="success" fullWidth disabled>
            Already Applied
          </Button>
        ) : (
          <Button
            variant="contained"
            fullWidth
            disabled={loading}
            onClick={onApplyClick}
          >
            {loading ? 'Applying...' : 'Apply Now'}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default JobInfoSection;

import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Chip,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const statusColor = (status: string) => {
  switch (status) {
    case 'Reviewed':
      return 'info';
    case 'Accepted':
      return 'success';
    case 'Rejected':
      return 'error';
    default:
      return 'default';
  }
};

interface ApplicationItemProps {
  app: any;
  onDelete: (id: string) => void;
}

const ApplicationItem: React.FC<ApplicationItemProps> = ({ app, onDelete }) => {
  return (
    <Accordion
      sx={{
        mb: 2,
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        '&::before': { display: 'none' },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box flex={1}>
          <Typography fontWeight={600}>
            {app.job?.title || 'Job no longer available'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {app.job?.company || 'This job has been removed or closed'}
          </Typography>
        </Box>
        <Chip
          label={app.status}
          color={statusColor(app.status)}
          size="small"
          sx={{ ml: 2 }}
        />
      </AccordionSummary>

      <AccordionDetails>
        <Typography variant="body2" gutterBottom>
          Applied on: {new Date(app.createdAt).toLocaleDateString()}
        </Typography>

        <Typography variant="body2" gutterBottom>
          Cover Letter:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {app.coverLetter || 'No cover letter provided.'}
        </Typography>

        {app.job ? (
          <>
            {app.resumeLink && (
              <Button
                variant="contained"
                href={app.resumeLink}
                target="_blank"
                sx={{ mt: 2 }}
              >
                View Resume
              </Button>
            )}
            <Button
              variant="outlined"
              color="primary"
              href={`/jobs?search=${encodeURIComponent(app.job.title || '')}`}
              sx={{ mt: 2, ml: 2 }}
            >
              Find Similar Jobs
            </Button>
          </>
        ) : (
          <Box mt={2}>
            <Typography variant="body2" color="error">
              The job associated with this application is no longer available.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              sx={{ mt: 2 }}
              onClick={() => onDelete(app._id)}
            >
              Remove from My Applications
            </Button>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default ApplicationItem;

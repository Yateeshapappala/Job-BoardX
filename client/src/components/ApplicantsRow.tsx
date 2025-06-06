import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { format } from 'date-fns';

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

const interviewStatusColor = (status: string) => {
  switch (status) {
    case 'Scheduled':
      return 'success';
    case 'NotScheduled':
      return 'warning';
    default:
      return 'default';
  }
};

const getInitials = (name: string) =>
  name?.split(' ').map((word) => word[0]).join('').toUpperCase() || 'U';

interface Interviewer {
  _id: string;
  name: string;
  email?: string;
}

interface ApplicantRowProps {
  app: any;
  status: string;
  onStatusChange: (appId: string, newStatus: string) => Promise<void>;
  onSelectChange: (appId: string, newStatus: string) => void;
  expanded: boolean;
  toggleExpand: (appId: string) => void;
  onSendInvitation?: (appId: string) => Promise<void>;
  interviewers: Interviewer[]; // all interviewers (not used here but can be)
  // Remove assignedInterviewers prop; now use scheduledInterview.interviewers from app
}

const statusOptions = ['Applied', 'Reviewed', 'Accepted', 'Rejected'];

const ApplicantRow: React.FC<ApplicantRowProps> = ({
  app,
  status,
  onStatusChange,
  onSelectChange,
  expanded,
  toggleExpand,
  onSendInvitation,
  interviewers,
}) => {
  // Local loading states for update and send invitation buttons
  const [updating, setUpdating] = useState(false);
  const [sending, setSending] = useState(false);

  const handleUpdateClick = async () => {
    try {
      setUpdating(true);
      await onStatusChange(app._id, status);
    } finally {
      setUpdating(false);
    }
  };

  const handleSendInvitationClick = async () => {
    if (!onSendInvitation) return;
    try {
      setSending(true);
      await onSendInvitation(app._id);
    } finally {
      setSending(false);
    }
  };

  // Format scheduled interview slot if available
  const formattedSlot = app.scheduledInterview?.slot
    ? (() => {
        try {
          return format(new Date(app.scheduledInterview.slot), 'PPpp');
        } catch {
          return app.scheduledInterview.slot;
        }
      })()
    : 'Not Assigned';

  // Assigned interviewers from scheduledInterview object
  const assignedInterviewers: Interviewer[] =
    app.scheduledInterview?.interviewers || [];

  return (
    <>
      <TableRow key={app._id}>
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: '#7A5FFF' }}>
              {getInitials(app.applicant?.name)}
            </Avatar>
            <Typography>{app.applicant?.name || 'Unnamed'}</Typography>
          </Stack>
        </TableCell>

        <TableCell>{app.applicant?.email || 'N/A'}</TableCell>

        <TableCell>
          <Stack direction="column" spacing={1}>
            <Chip
              label={status}
              color={statusColor(status)}
              size="small"
              sx={{ fontWeight: 500 }}
            />
            {app.interviewStatus && (
              <Chip
                label={app.interviewStatus}
                color={interviewStatusColor(app.interviewStatus)}
                size="small"
                variant="outlined"
              />
            )}
          </Stack>
        </TableCell>

        <TableCell>
          <FormControl size="small" fullWidth>
            <Select
              value={status}
              onChange={(e) => onSelectChange(app._id, e.target.value)}
              disabled={updating}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            fullWidth
            size="small"
            sx={{ mt: 1 }}
            disabled={status === app.status || updating}
            onClick={handleUpdateClick}
          >
            {updating ? 'Updating...' : 'Update'}
          </Button>

          {status === 'Accepted' && onSendInvitation && (
            <Button
              variant="contained"
              fullWidth
              size="small"
              sx={{
                mt: 1,
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#1565c0' },
              }}
              onClick={handleSendInvitationClick}
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send Invitation'}
            </Button>
          )}
        </TableCell>

        <TableCell>
          <Button
            variant="contained"
            href={app.resumeLink || undefined}
            target="_blank"
            rel="noopener noreferrer"
            disabled={!app.resumeLink}
            sx={{
              backgroundColor: '#7A5FFF',
              '&:hover': { backgroundColor: '#684ef0' },
              textTransform: 'none',
            }}
          >
            {app.resumeLink ? 'View' : 'No Resume'}
          </Button>
        </TableCell>

        {/* Interviewers Column */}
        <TableCell>
          {app.interviewStatus === 'Scheduled' ? (
            <Stack spacing={1}>
              {assignedInterviewers.length > 0 ? (
                assignedInterviewers.map((interviewer) => (
                  <Chip
                    key={interviewer._id}
                    label={interviewer.name}
                    size="small"
                    sx={{ bgcolor: '#e0f7fa' }}
                  />
                ))
              ) : (
                <Typography variant="caption" color="text.secondary">
                  No interviewers
                </Typography>
              )}
            </Stack>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Not assigned
            </Typography>
          )}
        </TableCell>

        <TableCell>
          <IconButton onClick={() => toggleExpand(app._id)}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={8} sx={{ py: 0 }}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, backgroundColor: '#f9fafb' }}>
              <Typography variant="subtitle2" gutterBottom>
                Cover Letter:
              </Typography>
              <Typography variant="body2" whiteSpace="pre-wrap" mb={2}>
                {app.coverLetter || 'No cover letter provided.'}
              </Typography>

              {app.interviewStatus === 'Scheduled' && (
                <>
                  <Typography variant="subtitle2">Scheduled Interview:</Typography>
                  <Typography variant="body2">
                    <strong>Slot:</strong> {formattedSlot}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Team:</strong>{' '}
                    {assignedInterviewers.length > 0
                      ? assignedInterviewers.map((i) => i.name).join(', ')
                      : 'Unassigned'}
                  </Typography>
                </>
              )}

              {app.interviewStatus === 'NotScheduled' && (
                <Typography variant="body2" color="warning.main">
                  This candidate could not be scheduled for any available slot.
                </Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default ApplicantRow;

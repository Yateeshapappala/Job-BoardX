import React from 'react';
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

const getInitials = (name: string) =>
  name?.split(' ').map((word) => word[0]).join('').toUpperCase();

interface ApplicantRowProps {
  app: any;
  status: string;
  onStatusChange: (appId: string, newStatus: string) => void;
  onSelectChange: (appId: string, newStatus: string) => void;
  expanded: boolean;
  toggleExpand: (appId: string) => void;
}

const statusOptions = ['Applied', 'Reviewed', 'Accepted', 'Rejected'];

const ApplicantRow: React.FC<ApplicantRowProps> = ({
  app,
  status,
  onStatusChange,
  onSelectChange,
  expanded,
  toggleExpand,
}) => {
  return (
    <>
      <TableRow key={app._id}>
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: '#7A5FFF' }}>
              {getInitials(app.applicant?.name || 'U')}
            </Avatar>
            <Typography>{app.applicant?.name || 'Unnamed'}</Typography>
          </Stack>
        </TableCell>
        <TableCell>{app.applicant?.email || 'N/A'}</TableCell>
        <TableCell>
          <Chip
            label={status}
            color={statusColor(status)}
            size="small"
            sx={{ fontWeight: 500 }}
          />
        </TableCell>
        <TableCell>
          <FormControl size="small" fullWidth>
            <Select
              value={status}
              onChange={(e) => onSelectChange(app._id, e.target.value)}
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
            disabled={status === app.status}
            onClick={() => onStatusChange(app._id, status)}
          >
            Update
          </Button>
        </TableCell>
        <TableCell>
          <Button
            variant="contained"
            href={app.resumeLink}
            target="_blank"
            sx={{
              backgroundColor: '#7A5FFF',
              '&:hover': { backgroundColor: '#684ef0' },
              textTransform: 'none',
            }}
          >
            View
          </Button>
        </TableCell>
        <TableCell>
          <IconButton onClick={() => toggleExpand(app._id)}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={6} sx={{ py: 0 }}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, backgroundColor: '#f9fafb' }}>
              <Typography variant="body2" whiteSpace="pre-wrap">
                {app.coverLetter || 'No cover letter provided.'}
              </Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default ApplicantRow;

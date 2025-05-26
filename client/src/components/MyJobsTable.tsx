import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, IconButton, Tooltip, Typography, Box
} from '@mui/material';
import { Link } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface Job {
  _id: string;
  title: string;
  numberOfOpenings?: number;
  employmentType: string;
  experienceLevel: string;
  status: 'Open' | 'Closed';
  createdAt: string;
}

interface JobsTableProps {
  jobs: Job[];
  onDelete: (id: string) => void;
}

const JobsTable: React.FC<JobsTableProps> = ({ jobs, onDelete }) => {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f9f9fb' }}>
            <TableCell><strong>Title</strong></TableCell>
            <TableCell><strong>Openings</strong></TableCell>
            <TableCell><strong>Type</strong></TableCell>
            <TableCell><strong>Experience</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell><strong>Posted</strong></TableCell>
            <TableCell align="right"><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {jobs.map((job) => (
            <TableRow
              key={job._id}
              hover
              sx={{ transition: '0.2s', '&:hover': { backgroundColor: '#f5f5f7' } }}
            >
              <TableCell>
                <Typography fontWeight={600} color="#2D2F48">
                  {job.title}
                </Typography>
              </TableCell>
              <TableCell>{job.numberOfOpenings || 1}</TableCell>
              <TableCell>
                <Chip
                  label={job.employmentType}
                  size="small"
                  sx={{ backgroundColor: '#7A5FFF', color: 'white' }}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={job.experienceLevel}
                  size="small"
                  sx={{ backgroundColor: '#e1f5fe', color: '#0277bd' }}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={job.status === 'Closed' ? 'Closed' : 'Open'}
                  size="small"
                  color={job.status === 'Closed' ? 'error' : 'success'}
                />
              </TableCell>
              <TableCell>
                <Typography variant="caption" color="text.secondary">
                  {dayjs(job.createdAt).fromNow()}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Box display="flex" justifyContent="flex-end" gap={1}>
                  <Tooltip title="Applicants">
                    <IconButton
                      component={Link}
                      to={`/applications/job/${job._id}`}
                      color="primary"
                    >
                      <GroupIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      component={Link}
                      to={`/employer/jobs/${job._id}/edit`}
                      color="secondary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => onDelete(job._id)} color="error">
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default JobsTable;

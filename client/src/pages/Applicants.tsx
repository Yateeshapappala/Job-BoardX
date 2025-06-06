import React, { useEffect, useState } from 'react';
import axios from '../services/axiosInstance';
import {
  Button,
  Container,
  Snackbar,
  Alert,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ApplicantRow from '../components/ApplicantsRow';
import PaginationControl from '../components/PaginationControl';
import TimeCalculator from '../components/TimeCalculator';
import { ExpandMore } from '@mui/icons-material';

const Applicants = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [applicants, setApplicants] = useState<any[]>([]);
  const [statusMap, setStatusMap] = useState<{ [id: string]: string }>({});
  const [expanded, setExpanded] = useState<{ [id: string]: boolean }>({});
  const [page, setPage] = useState(1);

  // Start with empty array for slots (no empty strings)
  const [interviewSlots, setInterviewSlots] = useState<string[]>([]);
  const [interviewDuration, setInterviewDuration] = useState(45);
  const [numInterviewers, setNumInterviewers] = useState(3);
  const [interviewers, setInterviewers] = useState<any[]>([]);

  useEffect(() => {
    const fetchInterviewers = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('/api/interviewers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInterviewers(data);
      } catch (err) {
        console.error('Failed to fetch interviewers', err);
      }
    };
    fetchInterviewers();
  }, []);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const ITEMS_PER_PAGE = 10;
  const paginatedApplicants = applicants.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem('token');

    // Fetch all applicants for the job
    const fetchApplicants = async () => {
      try {
        const { data } = await axios.get(`/api/applications/job/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplicants(data);

        // Build status map to track status per applicant
        setStatusMap(
          data.reduce((acc: any, app: any) => {
            acc[app._id] = app.status;
            return acc;
          }, {})
        );
      } catch (err) {
        console.error('Error fetching applicants:', err);
        setSnackbar({
          open: true,
          message: 'Failed to load applicants.',
          severity: 'error',
        });
      }
    };

    // Fetch interview slots for this job
    const fetchInterviewSlots = async () => {
      try {
        const { data } = await axios.get(`/api/applications/${id}/get-slots`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data?.slots?.length) {
  // Currently you do: iso.slice(0, 16) — this keeps it as UTC naive string, which causes time shift issues.
  // Instead, convert ISO string to local datetime-local format like 'YYYY-MM-DDTHH:mm'

  const localFormatSlots = data.slots.map((iso: string) => {
    const dt = new Date(iso);
    // Use dt.toISOString() is UTC, so convert to local components:
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(dt.getDate()).padStart(2, '0');
    const hours = String(dt.getHours()).padStart(2, '0');
    const minutes = String(dt.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });
  setInterviewSlots(localFormatSlots);
} else {
  setInterviewSlots([]);
}

      } catch (err) {
        console.error('Error fetching interview slots:', err);
        setSnackbar({
          open: true,
          message: 'Failed to load interview slots.',
          severity: 'error',
        });
      }
    };

    fetchApplicants();
    fetchInterviewSlots();
  }, [id]);

  // Status change handler with backend update
  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/applications/${applicationId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state for immediate UI feedback
      setApplicants((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      setStatusMap((prev) => ({ ...prev, [applicationId]: newStatus }));

      setSnackbar({ open: true, message: 'Status updated.', severity: 'success' });
    } catch (err) {
      console.error('Status update failed:', err);
      setSnackbar({ open: true, message: 'Failed to update status.', severity: 'error' });
    }
  };

  // Send invitation only if slots are set, backend will validate again
  const handleSendInvitation = async (applicationId: string) => {
    if (
      !interviewSlots.length ||
      interviewSlots.every((slot) => !slot || slot.trim() === '')
    ) {
      setSnackbar({
        open: true,
        message: 'Please define at least one valid interview slot before sending invitations.',
        severity: 'error',
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/applications/${applicationId}/send-invitation`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update applicant status locally
      setApplicants((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: 'Invited' } : app
        )
      );
      setStatusMap((prev) => ({ ...prev, [applicationId]: 'Invited' }));

      setSnackbar({ open: true, message: 'Invitation sent.', severity: 'success' });
    } catch (err) {
      console.error('Failed to send invitation:', err);
      setSnackbar({ open: true, message: 'Failed to send invitation.', severity: 'error' });
    }
  };

  // Interview slot input handlers
  const handleSlotChange = (index: number, value: string) => {
    const updatedSlots = [...interviewSlots];
    updatedSlots[index] = value;
    setInterviewSlots(updatedSlots);
  };

  const handleAddSlot = () => {
    setInterviewSlots((prev) => [...prev, '']);
  };

  // Submit interview slots to backend (converted to ISO strings)
  const handleSubmitSlots = async () => {
    // Filter out empty slots and convert to full ISO strings
    const validSlots = interviewSlots
      .filter((slot) => slot.trim() !== '')
      .map((slot) => new Date(slot).toISOString());

    if (validSlots.length === 0) {
      setSnackbar({
        open: true,
        message: 'Add at least one valid interview slot before saving.',
        severity: 'error',
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/applications/${id}/set-slots`,
        { slots: validSlots },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSnackbar({ open: true, message: 'Interview slots saved.', severity: 'success' });
      // Update local slots to keep UI in sync (convert back to local format)
      const toLocalDateTime = (iso: string) => {
  const dt = new Date(iso);
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  const hours = String(dt.getHours()).padStart(2, '0');
  const minutes = String(dt.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};


setInterviewSlots(validSlots.map(toLocalDateTime));

    } catch (err) {
      console.error('Failed to save interview slots:', err);
      setSnackbar({ open: true, message: 'Failed to save slots.', severity: 'error' });
    }
  };

  // Auto schedule interviews based on slots, duration, and teams
  const handleAutoSchedule = async () => {
  if (interviewDuration <= 0) {
    setSnackbar({ open: true, message: 'Interview duration must be > 0', severity: 'error' });
    return;
  }
  if (numInterviewers <= 0) {
    setSnackbar({ open: true, message: 'Number of interviewers must be > 0', severity: 'error' });
    return;
  }

  // Filter valid slots
  const validSlots = interviewSlots
    .filter((slot) => slot && slot.trim() !== '')
    .map((s) => {
      const dt = new Date(s);
      if (isNaN(dt.getTime())) {
        return null; // invalid date
      }
      return dt.toISOString();
    })
    .filter((s) => s !== null);

  if (validSlots.length === 0) {
    setSnackbar({ open: true, message: 'Please add at least one valid interview slot.', severity: 'error' });
    return;
  }
console.log('Sending schedule data:', {
  interviewDuration,
  numInterviewers
});

  try {
    const token = localStorage.getItem('token');
    await axios.post(
      `/api/applications/${id}/schedule-interviews`,
      {
        interviewDuration,
        numInterviewers,
        slots: validSlots,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setSnackbar({
      open: true,
      message: 'Interviews auto-scheduled successfully.',
      severity: 'success',
    });

    const { data } = await axios.get(`/api/applications/job/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setApplicants(data);

    setStatusMap(
      data.reduce((acc: any, app: any) => {
        acc[app._id] = app.status;
        return acc;
      }, {})
    );
  } catch (err:any) {
  console.error('Auto-schedule failed:', err);

  const errorMessage =
    err?.response?.data?.message || 'Failed to auto-schedule interviews.';

  setSnackbar({
    open: true,
    message: errorMessage,
    severity: 'error',
  });
}

};

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
const calculateSchedulingStats = () => {
  const totalApplicants = applicants.length;
  const totalInterviewTime = totalApplicants * interviewDuration; // in minutes
  const slotsPerDayPerInterviewer = interviewSlots.length;
  const totalInterviewers = numInterviewers;
  const totalSlotsPerDay = slotsPerDayPerInterviewer * totalInterviewers;
  const totalInterviewerTimePerDay = totalSlotsPerDay * interviewDuration; // in minutes

  const minimumDays = totalInterviewerTimePerDay > 0
    ? Math.ceil(totalInterviewTime / totalInterviewerTimePerDay)
    : '-';

  return {
    totalApplicants,
    totalSlots: interviewSlots.length,
    interviewDuration,
    totalInterviewTime,
    slotsPerDayPerInterviewer,
    totalSlotsPerDay,
    totalInterviewerTimePerDay,
    minimumDays,
  };
};

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        ← Back
      </Button>

      <Typography variant="h4" fontWeight="bold" mb={3}>
        Job Applicants
      </Typography>

    <Accordion>
    <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="h6" mb={2}>
          Set Interview Slots (ISO Format)
        </Typography>
</AccordionSummary>
<AccordionDetails>
        {interviewSlots.length > 0 && interviewSlots.some((s) => s.trim() !== '') ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            These slots will be shown to accepted candidates. Ensure they're correct before inviting.
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No interview slots defined. Candidates cannot be invited until slots are set.
          </Alert>
        )}

        {interviewSlots.map((slot, index) => (
          <TextField
            key={index}
            type="datetime-local"
            label={`Slot ${index + 1}`}
            value={slot}
            onChange={(e) => handleSlotChange(index, e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        ))}
        <Button onClick={handleAddSlot} sx={{ mt: 1 }}>
          + Add Slot
        </Button>
        <Button variant="contained" onClick={handleSubmitSlots} sx={{ mt: 2, ml: 2 }}>
          Save Slots
        </Button>
      </AccordionDetails>
    </Accordion>

       <Accordion>
    <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="h6" gutterBottom>
          Auto-Schedule Interviews
        </Typography>
        </AccordionSummary>
<AccordionDetails>
        <TextField
          label="Interview Duration (minutes)"
          type="number"
          value={interviewDuration}
          onChange={(e) => setInterviewDuration(parseInt(e.target.value) || 45)}
          sx={{ mr: 2, mb: 2 }}
          inputProps={{ min: 1 }}
        />

        <TextField
          label="Number of Interviewers"
          type="number"
          value={numInterviewers}
          onChange={(e) => setNumInterviewers(parseInt(e.target.value) || 1)}
          sx={{ mb: 2 }}
          inputProps={{ min: 1 }}
        />

        <Button variant="contained" onClick={handleAutoSchedule}>
          Auto-Schedule Interviews
        </Button>
      </AccordionDetails>
      </Accordion>

<Accordion>
  <AccordionSummary expandIcon={<ExpandMore />}>
  <Typography variant="h6" gutterBottom>
    Interview Scheduling Summary
  </Typography>
</AccordionSummary>
  <AccordionDetails>
  {(() => {
    const stats = calculateSchedulingStats();

    return (
      <>
        <Typography>Total Applicants: {stats.totalApplicants}</Typography>
        <Typography>Interview Duration: {stats.interviewDuration} min</Typography>
        <Typography>Slots Defined: {stats.totalSlots}</Typography>
        <Typography>Interviewers Available: {numInterviewers}</Typography>
        <Typography>Slots per Interviewer/Day: {stats.slotsPerDayPerInterviewer}</Typography>
        <Typography>Total Slots per Day: {stats.totalSlotsPerDay}</Typography>
        <Typography>Total Interview Time Needed: {stats.totalInterviewTime} min ({(stats.totalInterviewTime / 60).toFixed(2)} hrs)</Typography>
        <Typography>Total Interviewer Time/Day: {stats.totalInterviewerTimePerDay} min ({(stats.totalInterviewerTimePerDay / 60).toFixed(2)} hrs)</Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          Estimated Minimum Days Needed: <strong>{stats.minimumDays}</strong>
        </Alert>
      </>
    );
  })()}
</AccordionDetails>
</Accordion>
      {/* Applicant Table */}
      {applicants.length > 0 ? (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                <TableCell>Applicant</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell>Resume</TableCell>
                <TableCell>Cover Letter</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedApplicants.map((app) => (
                <ApplicantRow
                  key={app._id}
                  app={app}
                  status={statusMap[app._id]}
                  onSelectChange={(id, newStatus) =>
                    setStatusMap((prev) => ({ ...prev, [id]: newStatus }))
                  }
                  onStatusChange={handleStatusChange}
                  expanded={!!expanded[app._id]}
                  toggleExpand={(id) =>
                    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
                  }
                  onSendInvitation={handleSendInvitation}
                  interviewers={interviewers} // Passing interviewers from state
                 // Assigned interviewers from backend
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography align="center" color="text.secondary" mt={5}>
          No applicants have applied yet.
        </Typography>
      )}

      <PaginationControl
        currentPage={page}
        totalItems={applicants.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setPage}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Applicants;

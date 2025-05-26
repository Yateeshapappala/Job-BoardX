import React, { useEffect, useState } from 'react';
import axios from "../services/axiosInstance";
import {Button,Container,Snackbar,Alert,Typography,Table,TableBody,TableCell,TableContainer,TableHead,
  TableRow,Paper} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ApplicantRow from '../components/ApplicantsRow';
import PaginationControl from '../components/PaginationControl';


const Applicants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [statusMap, setStatusMap] = useState<{ [id: string]: string }>({});
  const [expanded, setExpanded] = useState<{ [id: string]: boolean }>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const paginatedApplicants = applicants.slice(
  (page - 1) * ITEMS_PER_PAGE,
  page * ITEMS_PER_PAGE
);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `/api/applications/job/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setApplicants(response.data);
        setStatusMap(
          response.data.reduce((acc: any, app: any) => {
            acc[app._id] = app.status;
            return acc;
          }, {})
        );
      } catch (err) {
        console.error('Error fetching applicants:', err);
      }
    };

    if (id) fetchApplicants();
  }, [id]);

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/applications/${applicationId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setApplicants((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      setSnackbar({ open: true, message: 'Status updated', severity: 'success' });
    } catch (err) {
      console.error('Status update failed:', err);
      setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        ← Back
      </Button>

      <Typography variant="h4" fontWeight="bold" color="#2D2F48" mb={3}>
        Job Applicants
      </Typography>

      {applicants.length ? (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                <TableCell>Applicant</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Update</TableCell>
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
                  />
                  ))}
                  </TableBody>
                  </Table>
                  </TableContainer>
                  
      ) : (
        <Typography mt={5} align="center" color="text.secondary">
          No applicants have applied yet.
        </Typography>
      )}
<PaginationControl
  currentPage={page}
  totalItems={applicants.length}
  itemsPerPage={ITEMS_PER_PAGE}
  onPageChange={setPage}
/>

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

import React, { useEffect, useState } from 'react';
import axios from '../services/axiosInstance';
import { Link, useNavigate } from 'react-router-dom';
import {
  Typography, Card, CardContent, CardActions, Divider, Button, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle, Stack,
  IconButton, Tooltip, Snackbar, Alert, Box, Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import PollIcon from '@mui/icons-material/Poll';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import BarChartIcon from '@mui/icons-material/BarChart';
import { motion } from 'framer-motion';
import SearchBar from '../components/SearchBar';

interface Survey {
  _id: string;
  title: string;
  createdAt: string;
  responsesCount?: number;
}

const MySurveys: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const res = await axios.get('/api/surveys/employer/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const sorted = res.data.sort(
          (a: Survey, b: Survey) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setSurveys(sorted);
      } catch (error) {
        console.error('Failed to fetch surveys:', error);
      }
    };
    fetchSurveys();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/surveys/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSurveys((prev) => prev.filter((s) => s._id !== id));
      setSnackbar({
        open: true,
        message: 'Survey deleted successfully.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Delete failed:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete survey. Please try again.',
        severity: 'error',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const totalSurveys = surveys.length;
  const totalResponses = surveys.reduce((sum, survey) => sum + (survey.responsesCount ?? 0), 0);
  const avgResponses = totalSurveys === 0 ? 0 : Math.round(totalResponses / totalSurveys);

  const filteredSurveys = surveys.filter((survey) =>
    survey.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ px: { xs: 2, sm: 6 }, py: 6, maxWidth: '1000px', mx: 'auto' }}>
      
      {/* Header + Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          My Surveys
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/surveys/create')}
          sx={{
            background: 'linear-gradient(90deg, #7A5FFF, #5A34F2)',
            color: '#fff',
            borderRadius: '2rem',
            px: 3,
            py: 1.2,
            boxShadow: '0 4px 14px rgba(122, 95, 255, 0.3)',
          }}
        >
          New Survey
        </Button>
      </Box>

      {/* Summary Panel */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 4,
        }}
      >
        {[
          { label: 'Total Surveys', value: totalSurveys, icon: <PollIcon fontSize="large" /> },
          { label: 'Total Responses', value: totalResponses, icon: <QuestionAnswerIcon fontSize="large" /> },
          { label: 'Avg Responses', value: avgResponses, icon: <BarChartIcon fontSize="large" /> },
        ].map(({ label, value, icon }) => (
          <Paper
            key={label}
            elevation={4}
            sx={{
              flex: 1,
              borderRadius: 3,
              p: 2,
              display: 'flex',
              alignItems: 'center',
              backdropFilter: 'blur(6px)',
              background: 'linear-gradient(145deg, #f1f5f9, #ffffff)',
              boxShadow: '0 8px 24px rgba(122, 95, 255, 0.1)',
            }}
          >
            <Box mr={2} color="#7A5FFF">
              {icon}
            </Box>
            <Box>
              <Typography fontSize="1.5rem" fontWeight={700}>
                {value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {label}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Search */}
      {surveys.length > 0 && (
        <Box mb={3}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search surveys..."
          />
        </Box>
      )}

      {/* Survey Cards or Empty State */}
      {surveys.length === 0 ? (
        <Stack alignItems="center" spacing={3} mt={6}>
          <Typography fontSize="5rem">📭</Typography>
          <Typography variant="h6" color="text.secondary" align="center">
            You haven't created any surveys yet.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/surveys/create')}
            sx={{
              background: 'linear-gradient(90deg, #7A5FFF, #5A34F2)',
              color: '#fff',
            }}
          >
            Create Your First Survey
          </Button>
        </Stack>
      ) : filteredSurveys.length === 0 ? (
        <Typography textAlign="center" color="text.secondary" mt={4}>
          No surveys match your search.
        </Typography>
      ) : (
        <Stack spacing={3}>
          {filteredSurveys.map((survey) => (
            <motion.div whileHover={{ scale: 1.01 }} key={survey._id}>
              <Card
                elevation={2}
                sx={{
                  borderRadius: 3,
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.3s ease',
                }}
              >
                <Box>
                  <Typography fontWeight={600} variant="h6" gutterBottom>
                    {survey.title}
                  </Typography>
                  {survey.responsesCount !== undefined && (
                    <Typography variant="body2" color="text.secondary">
                      {survey.responsesCount} response{survey.responsesCount !== 1 ? 's' : ''}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" fontStyle="italic">
                    Created on {new Date(survey.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Tooltip title="View Responses">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      component={Link}
                      to={`/surveys/${survey._id}/responses`}
                    >
                      Responses
                    </Button>
                  </Tooltip>
                  <Tooltip title="Delete Survey">
                    <IconButton color="error" onClick={() => setDeleteId(survey._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Card>
            </motion.div>
          ))}
        </Stack>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Survey</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this survey? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteId && handleDelete(deleteId)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MySurveys;

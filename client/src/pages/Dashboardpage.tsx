
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import SurveyOverview from '../components/SurveyOverview';
import SurveyAnalyticsChart from '../components/SurveyAnalyticsChart';
import {
  CircularProgress,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import axios from '../services/axiosInstance';
import { Survey } from '../services/survey';

const EmployerDashboard: React.FC = () => {
  const [surveys, setSurveys] = React.useState<Survey[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedSurveyIndex, setSelectedSurveyIndex] = React.useState(0);
  const [responses, setResponses] = React.useState<any[]>([]); // responses for selected survey
  const [responsesLoading, setResponsesLoading] = React.useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const [surveyDetails, setSurveyDetails] = React.useState<Survey | null>(null);

  React.useEffect(() => {
    axios
      .get('/api/surveys/employer/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then(({ data }) => {
        console.log("Fetched Surveys:", data);
  setSurveys(data);
})

      .catch(console.error)
      .finally(() => setLoading(false));

  }, []);
  React.useEffect(() => {
    if (!surveys.length) {
      setResponses([]);
      setSurveyDetails(null);
      return;
    }
    const selectedSurvey = surveys[selectedSurveyIndex];
    //console.log("Selected Survey:", selectedSurvey);

    if (!selectedSurvey?._id) return;

    setResponsesLoading(true);
    axios
      .get(`/api/surveys/${selectedSurvey._id}/responses`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then(({ data }) => {
        console.log("Survey Responses:", data);
        setSurveyDetails(data.survey);
        setResponses(data.responses); // store all responses
      })
      .catch(console.error)
      .finally(() => setResponsesLoading(false));
  }, [selectedSurveyIndex, surveys]);

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
          <CircularProgress size={60} thickness={5} />
        </Box>
      </DashboardLayout>
    );
  }

  if (surveys.length === 0) {
    return (
      <DashboardLayout>
        <Box
          p={4}
          textAlign="center"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          height="70vh"
          color={theme.palette.text.secondary}
        >
          <Box
            sx={{
              width: 150,
              height: 150,
              mx: 'auto',
              mb: 3,
              borderRadius: '50%',
              bgcolor: '#f3f4f6',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: 'inset 0 0 12px rgba(0,0,0,0.05)',
            }}
          >
            <InsertChartOutlinedIcon sx={{ fontSize: 80, color: '#9E9E9E' }} />
          </Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            No surveys yet
          </Typography>
          <Typography variant="body1" mb={4} maxWidth={400} mx="auto">
            You don’t have any surveys created yet. Start gathering insights by creating a survey now.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => navigate('/surveys/create')}
            sx={{ px: 5, alignSelf: 'center', background: '#7A5FFF' }}
          >
            Create Survey
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  const selectedSurvey = surveys[selectedSurveyIndex];

  return (
    <DashboardLayout>
      <Box p={{ xs: 3, md: 5 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Employer Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Monitor your surveys, analyze results, and manage job postings all in one place.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => navigate('/surveys/create')}
            sx={{
              whiteSpace: 'nowrap',
              borderColor: '#7A5FFF',
              color: '#7A5FFF',
              '&:hover': {
                background: '#7A5FFF',
                color: '#fff',
              },
            }}
          >
            New Survey
          </Button>
        </Stack>

        {/* Main Layout */}
        <Stack
          direction={isMdUp ? 'row' : 'column'}
          spacing={4}
          alignItems="stretch"
          sx={{ minHeight: '70vh' }}
        >
          {/* Survey Overview Panel */}
          <Card
            sx={{
              flex: isMdUp ? '1 1 40%' : 'unset',
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardContent
              sx={{
                p: 3,
                flex: 1,
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#ccc',
                  borderRadius: '3px',
                },
              }}
            >
              <Typography variant="h5" fontWeight={600} mb={2}>
                Your Surveys
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <SurveyOverview
                surveys={surveys}
                onSelectSurvey={(index) => setSelectedSurveyIndex(index)}
                selectedSurveyIndex={selectedSurveyIndex}
              />
            </CardContent>
          </Card>

          {/* Survey Analytics Panel */}
          <Card
            sx={{
              flex: isMdUp ? '1 1 60%' : 'unset',
              borderRadius: 4,
              background: 'linear-gradient(to top right, #eef2ff, #f0f5ff)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CardContent sx={{ p: 3, flex: 1 }}>
              <Typography variant="h5" fontWeight={600} mb={2}>
                Analytics for: {surveyDetails?.title || 'Untitled Survey'}
              </Typography>
              <SurveyAnalyticsChart survey={surveyDetails || surveys[selectedSurveyIndex]} />
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </DashboardLayout>
  );
};

export default EmployerDashboard;
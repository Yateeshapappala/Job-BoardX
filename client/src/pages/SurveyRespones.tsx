import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../services/axiosInstance';
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Papa from 'papaparse';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchBar from '../components/SearchBar';

interface Answer {
  questionIndex: number;
  questionLabel: string;
  questionType: string;
  answer: string | string[];
  options?: string[];
}

interface Response {
  _id: string;
  email: string;
  answers: Answer[];
  submittedAt: string;
}

const SurveyResponses: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const res = await axios.get(`/api/surveys/${surveyId}/responses`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setResponses(res.data.responses);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch responses');
      } finally {
        setLoading(false);
      }
    };
    fetchResponses();
  }, [surveyId]);

  const handleExportCSV = () => {
    const flatData = responses.map((res, index) => {
      const base = {
        ResponseNo: index + 1,
        Email: res.email || 'Anonymous',
        SubmittedAt: new Date(res.submittedAt).toLocaleString(),
      };
      res.answers.forEach((ans) => {
        const key = `${ans.questionLabel}`;
        const value = Array.isArray(ans.answer) ? ans.answer.join(', ') : ans.answer;
        (base as any)[key] = value;
      });
      return base;
    });

    const csv = Papa.unparse(flatData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `survey_responses_${surveyId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter based on search query
  const filteredResponses = responses.filter((res) => {
    const query = searchQuery.toLowerCase();
    const emailMatch = res.email?.toLowerCase().includes(query);
    const answerMatch = res.answers.some((ans) => {
      const answerText = Array.isArray(ans.answer) ? ans.answer.join(', ') : ans.answer;
      return String(answerText).toLowerCase().includes(query);
    });
    return emailMatch || answerMatch;
  });

  const totalResponses = responses.length;
  const uniqueEmails = new Set(responses.map(r => r.email)).size;

  const getCommonAnswers = () => {
    const summary: Record<string, Record<string, number>> = {};
    responses.forEach(res => {
      res.answers.forEach(ans => {
        if (Array.isArray(ans.answer) && ans.options) {
          if (!summary[ans.questionLabel]) summary[ans.questionLabel] = {};
          ans.answer.forEach((val) => {
            summary[ans.questionLabel][val] = (summary[ans.questionLabel][val] || 0) + 1;
          });
        } else if (typeof ans.answer === 'string' && ans.options?.includes(ans.answer)) {
          if (!summary[ans.questionLabel]) summary[ans.questionLabel] = {};
          summary[ans.questionLabel][ans.answer] = (summary[ans.questionLabel][ans.answer] || 0) + 1;
        }
      });
    });
    return summary;
  };

  const commonAnswers = getCommonAnswers();

  if (loading) {
    return (
      <Container sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Survey Responses
      </Typography>

      {/* Summary Section */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 5,
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: 3,
        }}
      >
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Summary
        </Typography>

        <Stack direction="row" spacing={4} mb={3} flexWrap="wrap">
          <Typography variant="body1" fontWeight={500}>
            Total Responses: <strong>{totalResponses}</strong>
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            Unique Participants: <strong>{uniqueEmails}</strong>
          </Typography>
        </Stack>

        {Object.entries(commonAnswers).map(([question, answers]) => (
          <Box key={question} sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {question}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {Object.entries(answers).map(([option, count]) => (
                <Chip
                  key={option}
                  label={`${option} (${count})`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>
        ))}
      </Paper>

      {/* Search & Export Controls */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={4} alignItems="center">
        <Box flex={1} sx={{ minWidth: 250 }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by email or answer"
          />
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportCSV}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Export to CSV
        </Button>
      </Stack>

      {/* Response List */}
      {filteredResponses.length === 0 ? (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
          No responses found.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {filteredResponses.map((response, index) => (
            <Accordion
              key={response._id}
              TransitionProps={{ unmountOnExit: true }}
              sx={{
                boxShadow: 1,
                borderRadius: 2,
                '&:before': { display: 'none' },
                '&:hover': { boxShadow: 6 },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3, py: 1.5 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ flexGrow: 1, fontWeight: 600, color: response.email ? 'text.primary' : 'text.secondary' }}
                >
                  Response #{index + 1} —{' '}
                  <Box
                    component="span"
                    sx={{
                      fontStyle: !response.email ? 'italic' : 'normal',
                      color: !response.email ? 'text.disabled' : 'inherit',
                    }}
                  >
                    {response.email || 'Anonymous'}
                  </Box>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(response.submittedAt).toLocaleString()}
                </Typography>
              </AccordionSummary>

              <AccordionDetails sx={{ px: 3, py: 2 }}>
                <List dense disablePadding>
                  {response.answers.map((ans, i) => (
                    <ListItem
                      key={i}
                      sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1, borderBottom: i !== response.answers.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}
                    >
                      <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
                        {ans.questionLabel}
                      </Typography>
                      {Array.isArray(ans.answer) ? (
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {ans.answer.map((item, idx) => (
                            <Chip
                              key={idx}
                              label={item}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.primary">
                          {ans.answer || 'N/A'}
                        </Typography>
                      )}
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default SurveyResponses;

import React, { useState } from 'react';
import {
  Box,
  Chip,
  List,
  Paper,
  Stack,
  Typography,
  useTheme,
  Tabs,
  Tab,
} from '@mui/material';
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from '@mui/icons-material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  Plugin,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import { Survey, Question } from '../services/survey';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const getSentimentIcon = (sentiment: string) => {
  switch (sentiment) {
    case 'positive':
      return <SentimentSatisfiedIcon color="success" sx={{ fontSize: 28 }} />;
    case 'negative':
      return <SentimentDissatisfiedIcon color="error" sx={{ fontSize: 28 }} />;
    default:
      return <SentimentNeutralIcon color="disabled" sx={{ fontSize: 28 }} />;
  }
};

const dataLabelPlugin: Plugin<'bar'> = {
  id: 'dataLabelPlugin',
  afterDatasetsDraw(chart) {
    const ctx = chart.ctx;
    chart.data.datasets.forEach((dataset, i) => {
      const meta = chart.getDatasetMeta(i);
      meta.data.forEach((bar, index) => {
        const val = dataset.data[index];
        if (typeof val === 'number') {
          ctx.save();
          ctx.fillStyle = '#222';
          ctx.font = 'bold 13px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(val.toFixed(1), bar.x, bar.y - 8);
          ctx.restore();
        }
      });
    });
  },
};

type Props = { survey: Survey };

const SurveyAnalyticsChart: React.FC<Props> = ({ survey }) => {
  const theme = useTheme();
  const { analytics, questions, sentiment } = survey;
  const [tabIndex, setTabIndex] = useState(0);
  const [step, setStep] = useState(0);

  if (!analytics || !questions?.length || !questions[step]) return null;

  const handleNext = () => setStep((prev) => Math.min(prev + 1, questions.length - 1));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 0));

  const findTextAnswers = (questionIndex: number) => {
    return analytics.textAnswers?.find((ta) => ta.questionIndex === questionIndex)?.answers || [];
  };

  const findAverageRating = (questionIndex: number) => {
    return analytics.averageRatings?.find((r) => r.questionIndex === questionIndex)?.avg ?? 0;
  };

  const findOptionCounts = (questionIndex: number) => {
    const match = analytics.optionCounts?.find((oc) => Number(oc.questionIndex) === Number(questionIndex));
    return match?.counts || {};
  };

  // Star rendering helper for rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= Math.round(rating) ? (
          <StarIcon key={i} color="warning" fontSize="small" />
        ) : (
          <StarBorderIcon key={i} color="disabled" fontSize="small" />
        )
      );
    }
    return <Box display="flex" alignItems="center" mb={1}>{stars}</Box>;
  };

  const renderChart = (q: Question, index: number) => {
    const key = `${q.id}-${index}`;

    if (q.type === 'rating') {
      const avg = findAverageRating(index);
      const data: ChartData<'bar', number[], string> = {
        labels: [q.label],
        datasets: [
          {
            label: 'Average Rating',
            data: [avg],
            backgroundColor:
              avg >= 4 ? theme.palette.success.main : avg >= 2 ? theme.palette.warning.main : theme.palette.error.main,
            borderRadius: 6,
            barThickness: 40,
          },
        ],
      };

      const options: ChartOptions<'bar'> = {
        indexAxis: 'y',
        responsive: true,
        animation: {
          duration: 800,
          easing: 'easeOutQuart',
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Rating: ${ctx.parsed.x.toFixed(2)} / 5 ⭐️`,
            },
          },
          title: {
            display: true,
            text: q.label,
            font: { size: 16, weight: 600 },
            color: theme.palette.text.primary,
          },
        },
        scales: {
          x: { min: 0, max: 5, ticks: { stepSize: 1 } },
          y: { display: false },
        },
      };

      return (
        <Box key={key} my={3}>
          {renderStars(avg)}
          <Bar data={data} options={options} plugins={[dataLabelPlugin]} />
        </Box>
      );
    }

    if (q.type === 'multiple_choice' || q.type === 'checkbox') {
      const countsObj = findOptionCounts(index);
      const optionsArr = q.options || [];
      const counts = optionsArr.map((opt) => {
        const matchKey = Object.keys(countsObj).find(
          (k) => k.trim().toLowerCase() === opt.trim().toLowerCase()
        );
        return matchKey ? countsObj[matchKey] : 0;
      });

      const data: ChartData<'bar', number[], string> = {
        labels: optionsArr,
        datasets: [
          {
            label: q.type === 'checkbox' ? 'Selections' : 'Responses',
            data: counts,
            backgroundColor: theme.palette.primary.main,
            borderRadius: 6,
            barThickness: 32,
          },
        ],
      };

      const optionsChart: ChartOptions<'bar'> = {
        indexAxis: 'x',
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const count = ctx.parsed.y ?? 0;
                const typeLabel = q.type === 'checkbox' ? 'selections' : 'responses';
                return `${count} ${typeLabel}`;
              },
            },
          },
          title: {
            display: true,
            text: `${q.label} (${q.type === 'checkbox' ? 'Multiple selections allowed' : 'Single choice'})`,
            font: { size: 16, weight: 600 },
            color: theme.palette.text.primary,
          },
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: theme.palette.divider } },
          x: { grid: { display: false } },
        },
      };

      return (
        <Box key={key} my={4}>
          <Bar data={data} options={optionsChart} plugins={[dataLabelPlugin]} />
        </Box>
      );
    }

    if (q.type === 'text') {
      const answers = findTextAnswers(index);
      return (
        <Box key={key} my={4}>
          <Typography variant="h6" gutterBottom>
            {q.label}
          </Typography>
          {answers.length === 0 ? (
            <Typography color="text.secondary" fontStyle="italic">
              No text responses yet.
            </Typography>
          ) : (
            <List dense sx={{ maxHeight: 240, overflowY: 'auto', mt: 2 }}>
              {answers.map((ans, i) => (
                <Paper key={`answer-${i}-${q.id}`} variant="outlined" sx={{ p: 1.5, mb: 1 }}>
                  <Typography fontSize={14}>{ans}</Typography>
                </Paper>
              ))}
            </List>
          )}
        </Box>
      );
    }

    return null;
  };

  const ratingAvgs = analytics.averageRatings?.map((r) => r.avg).filter((a): a is number => a != null) || [];
  const avgSatisfaction = ratingAvgs.length ? (ratingAvgs.reduce((a, b) => a + b, 0) / ratingAvgs.length).toFixed(1) : 'N/A';

  return (
    <Paper sx={{ p: 4, borderRadius: 4, mt: 4 }} elevation={6}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        mb={3}
        sx={{
          bgcolor:
            sentiment === 'positive'
              ? theme.palette.success.light
              : sentiment === 'negative'
              ? theme.palette.error.light
              : theme.palette.grey[300],
          borderRadius: 3,
          px: 3,
          py: 1.5,
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        }}
      >
        {getSentimentIcon(sentiment)}
        <Typography
          variant="h6"
          fontWeight={700}
          aria-live="polite"
          color={
            sentiment === 'positive' ? 'success.dark' : sentiment === 'negative' ? 'error.dark' : 'text.secondary'
          }
        >
          Average Satisfaction: <strong>{avgSatisfaction}/5</strong>
        </Typography>
      </Stack>

      <Tabs
        value={tabIndex}
        onChange={(_, newVal) => setTabIndex(newVal)}
        aria-label="Question Type Tabs"
        sx={{ mb: 3 }}
      >
        <Tab label="Summary" />
        <Tab label="Details" />
      </Tabs>

      {tabIndex === 0 ? (
        <Box>
          <Typography variant="body1" color="text.secondary" mb={1}>
            Use the arrows to navigate between questions
          </Typography>
          <Stack direction="row" justifyContent="center" spacing={3} mb={3}>
            <Chip
              label="Previous"
              onClick={handleBack}
              variant="outlined"
              disabled={step === 0}
              icon={<KeyboardArrowLeft />}
              sx={{ cursor: step === 0 ? 'default' : 'pointer' }}
            />
            <Chip
              label="Next"
              onClick={handleNext}
              variant="outlined"
              disabled={step === questions.length - 1}
              icon={<KeyboardArrowRight />}
              sx={{ cursor: step === questions.length - 1 ? 'default' : 'pointer' }}
            />
          </Stack>
          {renderChart(questions[step], step)}
        </Box>
      ) : (
        <Box>
          {/* You can add any detail view content here */}
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            Details view coming soon...
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default SurveyAnalyticsChart;

// src/components/SurveyAnalytics.tsx
import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { Bar } from 'react-chartjs-2';
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
} from 'chart.js';
import { Survey } from '../services/survey';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Props = {
  surveys: Survey[];
};

const SurveyAnalytics: React.FC<Props> = ({ surveys }) => {
  if (!surveys || surveys.length === 0) return null;

  const survey = surveys[0];
  const averageRatings = survey.analytics?.averageRatings ?? [];
  const questions = survey.questions ?? [];
  const sentiment = survey.sentiment ?? 'neutral';

  const labels = questions.map(q => q.label);
  const averages = averageRatings.map(ar => ar.avg ?? 0);

  const chartData: ChartData<'bar', number[], string> = {
    labels,
    datasets: [
      {
        label: 'Average Rating',
        data: averages,
        backgroundColor: 'rgba(63,81,181,0.7)',
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: `Survey Analytics - Sentiment: ${sentiment.toUpperCase()}`,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1 },
        title: { display: true, text: 'Average Rating (0–5)' },
      },
    },
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Survey Analytics
        </Typography>
        <Box sx={{ maxWidth: 700 }}>
          <Bar data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default SurveyAnalytics;


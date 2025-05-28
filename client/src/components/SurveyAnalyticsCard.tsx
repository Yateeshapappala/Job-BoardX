// src/components/SurveyAnalyticsCard.tsx
import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { Survey } from '../services/survey';

type Props = {
  survey: Survey;
};

// Narrow down allowed sentiment values
type Sentiment = 'positive' | 'neutral' | 'negative';

const SentimentColor: Record<Sentiment, 'success' | 'default' | 'error'> = {
  positive: 'success',
  neutral: 'default',
  negative: 'error',
};

const SurveyAnalyticsCard: React.FC<Props> = ({ survey }) => {
  // Type assertion ensures only expected sentiments are passed
  const sentiment = survey.sentiment as Sentiment;

  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight="bold">
            {survey.title}
          </Typography>
          <Chip
            label={survey.sentiment}
            color={SentimentColor[sentiment]}
            size="small"
            sx={{ textTransform: 'capitalize' }}
          />
        </Box>
        <Typography variant="body2" mt={1}>
          Responses: {survey.responsesCount ?? 0}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default SurveyAnalyticsCard;


import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, description, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      width: 280,
      p: 3,
      borderRadius: 4,
      textAlign: 'center',
      cursor: 'pointer',
      background: 'rgba(255, 255, 255, 0.6)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      backdropFilter: 'blur(10px)',
      '&:hover': {
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        transform: 'translateY(-5px)',
        transition: 'all 0.3s ease',
      },
    }}
  >
    <CardContent>
      <Box mb={1}>{icon}</Box>
      <Typography variant="h6" fontWeight="bold" mb={1}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

export default ActionCard;

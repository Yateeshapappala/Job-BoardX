import React from 'react';
import { Box, Button, Typography } from '@mui/material';

interface HeroSectionProps {
  userName: string | null;
  greeting: string;
  date: string;
  onCTA: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ userName, greeting, date, onCTA }) => {
  return (
    <Box
      sx={{
        backdropFilter: 'blur(10px)',
        background: 'linear-gradient(135deg, rgba(122,95,255,0.9) 0%, rgba(168,144,255,0.8) 100%)',
        color: 'white',
        borderRadius: 6,
        my: 6,
        mx: 'auto',
        p: 6,
        maxWidth: 800,
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}
    >
      <Typography variant="h3" fontWeight="bold" mb={2}>
        {userName ? `${greeting}, ${userName}` : 'Discover Your Dream Job'}
      </Typography>
      <Typography variant="subtitle1" mb={3}>
        {userName ? date : 'Join thousands of job seekers and employers'}
      </Typography>
      <Button
        variant="contained"
        onClick={onCTA}
        sx={{
          background: 'white',
          color: '#7A5FFF',
          px: 4,
          py: 1.5,
          borderRadius: 3,
          fontWeight: 'bold',
          boxShadow: 3,
          '&:hover': {
            background: '#f1f5ff',
          },
        }}
      >
        {userName ? 'Explore Opportunities' : 'Get Started'}
      </Button>
    </Box>
  );
};

export default HeroSection;

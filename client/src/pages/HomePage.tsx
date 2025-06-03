import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import HeroSection from '../components/HeroSection';
import ActionCard from '../components/ActionCard';
import LatestJobs from '../components/LatestJobs';
import { useAuth } from '../hooks/useAuth';

const HomePage = () => {
  const navigate = useNavigate();
  const user = useAuth();

  // Memoized greeting based on current hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Memoized list of quotes
  const quotes = useMemo(() => [
    "Success is not final; failure is not fatal. It is the courage to continue that counts.",
    "The future depends on what you do today.",
    "Don't watch the clock; do what it does. Keep going.",
    "Opportunities don't happen. You create them.",
  ], []);

  // Pick a random quote once per render
  const randomQuote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], [quotes]);

  // Memoized formatted date string
  const today = useMemo(() =>
    new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }), []
  );

  // Optional: Show loading while user info is fetched
  if (user === null) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  // Define actions based on role
  const actions = user.role === 'Employer' ? [
    {
      icon: <WorkIcon sx={{ fontSize: 40, color: '#7A5FFF' }} />,
      title: 'Post a Job',
      description: 'Reach top talent fast.',
      path: '/post-job',
    },
    {
      icon: <AssignmentIndIcon sx={{ fontSize: 40, color: '#7A5FFF' }} />,
      title: 'My Job Listings',
      description: 'Manage and edit your job posts.',
      path: '/my-jobs',
    },
  ] : [
    {
      icon: <WorkIcon sx={{ fontSize: 40, color: '#7A5FFF' }} />,
      title: 'Browse Jobs',
      description: 'Find jobs that match your skills.',
      path: '/jobs',
    },
    {
      icon: <AssignmentIndIcon sx={{ fontSize: 40, color: '#7A5FFF' }} />,
      title: 'My Applications',
      description: 'Track your job applications.',
      path: '/my-applications',
    },
  ];

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #dfe9f3 0%, #ffffff 100%)', minHeight: '100vh' }}>
      <HeroSection
        userName={user.name}
        greeting={greeting}
        companyName={user.companyName}
        date={today}
        onCTA={() => navigate('/jobs')}
      />

      {user.name && (
        <Container sx={{ my: 6 }}>
          <Box display="flex" justifyContent="center" flexWrap="wrap" gap={4}>
            {actions.map(({ icon, title, description, path }) => (
              <ActionCard
                key={title}
                icon={icon}
                title={title}
                description={description}
                onClick={() => navigate(path)}
              />
            ))}
          </Box>
        </Container>
      )}

      <Box sx={{ textAlign: 'center', mt: 4, px: 2 }}>
        <Typography variant="h6" fontStyle="italic" color="text.secondary">
          “{randomQuote}”
        </Typography>
      </Box>

      <Box sx={{ mt: 6, px: 2 }}>
        <LatestJobs />
      </Box>
    </Box>
  );
};

export default HomePage;

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {Box,Container,Typography} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { decodeToken } from '../utils/decodeToken';
import LatestJobs from '../components/LatestJobs';
import HeroSection from '../components/HeroSection';
import ActionCard from '../components/ActionCard';

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quotes = [
    "Success is not final; failure is not fatal. It is the courage to continue that counts.",
    "The future depends on what you do today.",
    "Don't watch the clock; do what it does. Keep going.",
    "Opportunities don't happen. You create them.",
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = decodeToken(token);
          if (decoded?.role && decoded?.name) {
            setRole(decoded.role);
            setUserName(decoded.name);
          } else {
            setRole(null);
            setUserName(null);
          }
        } catch (error) {
          setRole(null);
          setUserName(null);
        }
      } else {
        setRole(null);
        setUserName(null);
      }
    };
  
    checkAuth();
    window.addEventListener('authChange', checkAuth);
    return () => window.removeEventListener('authChange', checkAuth);
  }, [location]);
  

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #dfe9f3 0%, #ffffff 100%)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <HeroSection
      userName={userName}
      greeting={getGreeting()}
      date={today}
      onCTA={() => navigate('/jobs')}
      />
      {/* Action Cards */}
      {userName && (
        <Container sx={{ my: 6 }}>
          <Box display="flex" justifyContent="center" flexWrap="wrap" gap={4}>
            {role === 'Employer' ? (
              <>
                <ActionCard
                  icon={<WorkIcon sx={{ fontSize: 40, color: '#7A5FFF' }} />}
                  title="Post a Job"
                  description="Reach top talent fast."
                  onClick={() => navigate('/post-job')}
                />
                <ActionCard
                  icon={<AssignmentIndIcon sx={{ fontSize: 40, color: '#7A5FFF' }} />}
                  title="My Job Listings"
                  description="Manage and edit your job posts."
                  onClick={() => navigate('/my-jobs')}
                />
              </>
            ) : (
              <>
                <ActionCard
                  icon={<WorkIcon sx={{ fontSize: 40, color: '#7A5FFF' }} />}
                  title="Browse Jobs"
                  description="Find jobs that match your skills."
                  onClick={() => navigate('/jobs')}
                />
                <ActionCard
                  icon={<AssignmentIndIcon sx={{ fontSize: 40, color: '#7A5FFF' }} />}
                  title="My Applications"
                  description="Track your job applications."
                  onClick={() => navigate('/my-applications')}
                />
              </>
            )}
          </Box>
        </Container>
      )}

      {/* Quote */}
      <Box sx={{ textAlign: 'center', mt: 4, px: 2 }}>
        <Typography variant="h6" fontStyle="italic" color="text.secondary">
          “{randomQuote}”
        </Typography>
      </Box>

      {/* Latest Jobs */}
        <Box sx={{ mt: 6, px: 2 }}>
          <LatestJobs />
        </Box>
      
    </Box>
  );
};


export default HomePage;

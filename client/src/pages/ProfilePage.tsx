import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Chip, Divider, Stack, Avatar, Link, Card, CardContent, Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../services/axiosInstance';
import ProfileHeader from '../components/ProfileHeader';
import ProfileDetails from '../components/ProfileDetails';
import ProfileExperienceEducation from '../components/ProfileExperienceEducation';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/profile/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography variant="h6">No profile data found.</Typography>
      </Box>
    );
  }

  return (
    <Box maxWidth="md" mx="auto" mt={5} px={2}>
      <Paper elevation={3} sx={{
        p: 4,
        borderRadius: 4,
        backdropFilter: 'blur(10px)',
        background: 'rgba(255, 255, 255, 0.9)'
      }}>
        <ProfileHeader 
  user={profile.user} 
  avatar={profile.avatar} 
  headline={profile.headline} 
/>
<Divider sx={{ my: 3 }} />
<ProfileDetails
  bio={profile.bio}
  location={profile.location}
  phone={profile.phone}
  website={profile.website}
  skills={profile.skills}
  linkedin={profile.linkedin}
  github={profile.github}
/>
<ProfileExperienceEducation
  experience={profile.experience}
  education={profile.education}
/>

        {/* Edit Profile Button */}
        <Box mt={4}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/profile')}
            sx={{ backgroundColor: '#7A5FFF', borderRadius: 2, px: 4 }}
          >
            Edit Profile
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfilePage;

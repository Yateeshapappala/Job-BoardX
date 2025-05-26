import React from 'react';
import { Stack, Avatar, Box, Typography } from '@mui/material';

const ProfileHeader = ({ user, avatar, headline }: any) => {
  return (
    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
      <Avatar
        src={avatar || '/default-avatar.jpg'}
        sx={{ width: 72, height: 72, bgcolor: '#7A5FFF' }}
      >
        {user?.name?.charAt(0) || 'U'}
      </Avatar>
      <Box>
        <Typography variant="h4" fontWeight={600}>
          {user?.name || 'No Name'}
        </Typography>
        <Typography color="text.secondary">{headline || 'No headline provided.'}</Typography>
      </Box>
    </Stack>
  );
};

export default ProfileHeader;

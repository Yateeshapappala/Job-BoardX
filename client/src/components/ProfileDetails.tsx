import React from 'react';
import { Box, Typography, Link, Stack, Chip } from '@mui/material';

const ProfileDetails = ({ bio, location, phone, website, skills, linkedin, github }: any) => {
  return (
    <>
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>Bio</Typography>
        <Typography>{bio || 'No bio provided.'}</Typography>
      </Box>

      <Box mb={3}>
        <Typography variant="h6" gutterBottom>Contact</Typography>
        <Typography><strong>Location:</strong> {location || 'N/A'}</Typography>
        <Typography><strong>Phone:</strong> {phone || 'N/A'}</Typography>
        {website && (
          <Typography>
            <strong>Website:</strong>{' '}
            <Link href={website} target="_blank" rel="noopener">Visit</Link>
          </Typography>
        )}
      </Box>

      <Box mb={3}>
        <Typography variant="h6" gutterBottom>Skills</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {skills?.length > 0 ? (
            skills.map((skill: string, idx: number) => (
              <Chip key={idx} label={skill} color="primary" variant="outlined" />
            ))
          ) : (
            <Typography>No skills listed.</Typography>
          )}
        </Stack>
      </Box>

      <Box mb={2}>
        <Typography variant="h6" gutterBottom>Social Profiles</Typography>
        <Stack spacing={1}>
          {linkedin && (
            <Link href={linkedin} target="_blank" rel="noopener">LinkedIn</Link>
          )}
          {github && (
            <Link href={github} target="_blank" rel="noopener">GitHub</Link>
          )}
        </Stack>
      </Box>
    </>
  );
};

export default ProfileDetails;

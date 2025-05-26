import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const ProfileExperienceEducation = ({ experience, education }: any) => {
  return (
    <>
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>Experience</Typography>
        {experience?.map((exp: any, index: number) => (
          <Card key={index} variant="outlined" sx={{ mb: 2, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600}>
                {exp.title} @ {exp.company}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(exp.from).toLocaleDateString()} - {exp.current ? 'Present' : new Date(exp.to).toLocaleDateString()}
              </Typography>
              {exp.description && <Typography mt={1}>{exp.description}</Typography>}
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box mb={3}>
        <Typography variant="h6" gutterBottom>Education</Typography>
        {education?.map((edu: any, index: number) => (
          <Card key={index} variant="outlined" sx={{ mb: 2, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600}>
                {edu.degree} in {edu.fieldOfStudy}
              </Typography>
              <Typography>{edu.school}</Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(edu.from).toLocaleDateString()} - {edu.current ? 'Present' : new Date(edu.to).toLocaleDateString()}
              </Typography>
              {edu.description && <Typography mt={1}>{edu.description}</Typography>}
            </CardContent>
          </Card>
        ))}
      </Box>
    </>
  );
};

export default ProfileExperienceEducation;

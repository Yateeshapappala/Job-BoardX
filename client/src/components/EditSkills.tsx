import React from 'react';
import { Stack, Typography, Chip, TextField, IconButton, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface Props {
  skills: string[];
  newSkill: string;
  setNewSkill: (value: string) => void;
  arrayHelpers: any;
}

const SkillsFieldArray: React.FC<Props> = ({ skills, newSkill, setNewSkill, arrayHelpers }) => {
  return (
    <Stack spacing={1} mt={2}>
      <Typography variant="h6">Skills</Typography>
      <Stack direction="row" flexWrap="wrap" spacing={1}>
        {skills.map((skill, index) => (
          <Chip
            key={index}
            label={skill}
            onDelete={() => arrayHelpers.remove(index)}
            color="primary"
          />
        ))}
      </Stack>
      <TextField
        fullWidth
        placeholder="Add a skill"
        value={newSkill}
        onChange={(e) => setNewSkill(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && newSkill.trim()) {
            e.preventDefault();
            arrayHelpers.push(newSkill.trim());
            setNewSkill('');
          }
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => {
                if (newSkill.trim()) {
                  arrayHelpers.push(newSkill.trim());
                  setNewSkill('');
                }
              }}>
                <AddIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Stack>
  );
};

export default SkillsFieldArray;

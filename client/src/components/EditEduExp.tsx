import React from 'react';
import { Box, Stack, Typography, TextField, Button, Checkbox, FormControlLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getIn } from 'formik';

interface Experience {
  title: string;
  company: string;
  location: string;
  from: string;
  to?: string;
  current: boolean;
  description: string;
}

interface Education {
  school: string;
  degree: string;
  fieldOfStudy: string;
  from: string;
  to?: string;
  current: boolean;
  description: string;
}

interface Props {
  values: {
    experience: Experience[];
    education: Education[];
  };
  errors: any;
  touched: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  experienceHelpers: any;
  educationHelpers: any;
}

const ExperienceEducationFieldArray: React.FC<Props> = ({
  values,
  errors,
  touched,
  handleChange,
  setFieldValue,
  experienceHelpers,
  educationHelpers,
}) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      {/* Experience Section */}
      <Stack spacing={2} mt={3}>
        <Typography variant="h6">Experience</Typography>
        {values.experience.map((exp, index) => (
          <Box key={index} sx={{ border: '1px solid #ddd', p: 2, borderRadius: 2 }}>
            <Stack spacing={2}>
              {['title', 'company', 'location', 'description'].map((field) => (
                <TextField
                  key={field}
                  fullWidth
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  name={`experience[${index}].${field}`}
                  value={exp[field as keyof Experience]}
                  onChange={handleChange}
                  error={Boolean(getIn(touched, `experience[${index}].${field}`) && getIn(errors, `experience[${index}].${field}`))}
                  helperText={getIn(touched, `experience[${index}].${field}`) && getIn(errors, `experience[${index}].${field}`)}
                />
              ))}
              <Stack direction="row" spacing={2}>
                <TextField
                  label="From"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  name={`experience[${index}].from`}
                  value={exp.from}
                  onChange={handleChange}
                  inputProps={{ max: today }}
                />
                <TextField
                  label="To"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  name={`experience[${index}].to`}
                  value={exp.to}
                  onChange={handleChange}
                  disabled={exp.current}
                  inputProps={{ max: today }}
                />
              </Stack>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exp.current}
                    onChange={(e) => setFieldValue(`experience[${index}].current`, e.target.checked)}
                  />
                }
                label="Current"
              />
              <Button variant="text" color="error" onClick={() => experienceHelpers.remove(index)} startIcon={<DeleteIcon />}>
                Remove
              </Button>
            </Stack>
          </Box>
        ))}
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() =>
          experienceHelpers.push({ title: '', company: '', location: '', from: '', to: '', current: false, description: '' })
        }>
          Add Experience
        </Button>
      </Stack>

      {/* Education Section */}
      <Stack spacing={2} mt={3}>
        <Typography variant="h6">Education</Typography>
        {values.education.map((edu, index) => (
          <Box key={index} sx={{ border: '1px solid #ddd', p: 2, borderRadius: 2 }}>
            <Stack spacing={2}>
              {['school', 'degree', 'fieldOfStudy', 'description'].map((field) => (
                <TextField
                  key={field}
                  fullWidth
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  name={`education[${index}].${field}`}
                  value={edu[field as keyof Education]}
                  onChange={handleChange}
                  error={Boolean(getIn(touched, `education[${index}].${field}`) && getIn(errors, `education[${index}].${field}`))}
                  helperText={getIn(touched, `education[${index}].${field}`) && getIn(errors, `education[${index}].${field}`)}
                />
              ))}
              <Stack direction="row" spacing={2}>
                <TextField
                  label="From"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  name={`education[${index}].from`}
                  value={edu.from}
                  onChange={handleChange}
                  inputProps={{ max: today }}
                />
                <TextField
                  label="To"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  name={`education[${index}].to`}
                  value={edu.to}
                  onChange={handleChange}
                  disabled={edu.current}
                  inputProps={{ max: today }}
                />
              </Stack>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={edu.current}
                    onChange={(e) => setFieldValue(`education[${index}].current`, e.target.checked)}
                  />
                }
                label="Current"
              />
              <Button variant="text" color="error" onClick={() => educationHelpers.remove(index)} startIcon={<DeleteIcon />}>
                Remove
              </Button>
            </Stack>
          </Box>
        ))}
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() =>
          educationHelpers.push({ school: '', degree: '', fieldOfStudy: '', from: '', to: '', current: false, description: '' })
        }>
          Add Education
        </Button>
      </Stack>
    </>
  );
};

export default ExperienceEducationFieldArray;

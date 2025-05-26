import React from 'react';
import { TextField } from '@mui/material';
import { getIn } from 'formik';

interface Props {
  values: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
  errors: any;
  touched: any;
}

const ProfileFormFields: React.FC<Props> = ({ values, handleChange, errors, touched }) => {
  const fields = ['headline', 'bio', 'phone', 'location', 'website', 'linkedin', 'github'];

  return (
    <>
      {fields.map((field) => (
        <TextField
          key={field}
          fullWidth
          name={field}
          label={field.charAt(0).toUpperCase() + field.slice(1)}
          value={values[field]}
          onChange={handleChange}
          error={Boolean(getIn(touched, field) && getIn(errors, field))}
          helperText={getIn(touched, field) && getIn(errors, field)}
          variant="outlined"
          margin="normal"
        />
      ))}
    </>
  );
};

export default ProfileFormFields;

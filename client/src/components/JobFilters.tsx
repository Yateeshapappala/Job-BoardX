import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Divider,
  Button,
} from '@mui/material';

export type FilterState = {
  location: string[];
  industry: string[];
  salary: string[];
  employmentType: string[];
  experienceLevel: string[];
  isRemote: boolean | null;
  skills: string[];
};

type Props = {
  onFilterChange: (filters: FilterState) => void;
};

const filterOptions = {
  location: ['Delhi NCR', 'Bengaluru', 'Ahmedabad', 'Mumbai', 'Hyderabad', 'Chennai', 'New Delhi'],
  industry: ['Financial Services', 'Insurance', 'Hardware & Networking', 'Marketing', 'IT', 'Mechanical', 'Automotive', 'Medical'],
  salary: ['$0-$60,000', '$61,000-$99,000', '$100,000 & More'],
  employmentType: ['Full-time', 'Part-time', 'Contract', 'Internship'],
  experienceLevel: ['Entry', 'Mid', 'Senior'],
  skills: ['React', 'Node.js', 'MongoDB', 'Python', 'Java', 'SQL'],
};

const JobFilters: React.FC<Props> = ({ onFilterChange }) => {
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    location: [],
    industry: [],
    salary: [],
    employmentType: [],
    experienceLevel: [],
    isRemote: null,
    skills: [],
  });

  const handleCheckboxToggle = (category: keyof Omit<FilterState, 'isRemote'>, value: string) => {
    setSelectedFilters((prev) => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      const newState = { ...prev, [category]: updated };
      onFilterChange(newState);
      return newState;
    });
  };

  const handleRemoteToggle = (value: boolean) => {
    const newState = {
      ...selectedFilters,
      isRemote: selectedFilters.isRemote === value ? null : value,
    };
    setSelectedFilters(newState);
    onFilterChange(newState);
  };

  const handleClearAll = () => {
    const reset: FilterState = {
      location: [],
      industry: [],
      salary: [],
      employmentType: [],
      experienceLevel: [],
      isRemote: null,
      skills: [],
    };
    setSelectedFilters(reset);
    onFilterChange(reset);
  };

  return (
    <Box
      width={260}
      p={2}
      bgcolor="#F5F3FF"
      borderRadius={3}
      sx={{ boxShadow: 1, height: 'fit-content' }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight="bold">Filter Jobs</Typography>
        <Button size="small" onClick={handleClearAll}>Clear All</Button>
      </Box>

      {/* Dynamic Filters */}
      {Object.entries(filterOptions).map(([category, options]) => (
        <Box key={category} mb={2}>
          <Typography variant="body2" fontWeight="bold" mb={1}>
            {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}
          </Typography>
          {options.map((option) => (
            <FormControlLabel
              key={option}
              control={
                <Checkbox
                  size="small"
                  checked={selectedFilters[category as keyof typeof filterOptions].includes(option)}
                  onChange={() =>
                    handleCheckboxToggle(category as keyof Omit<FilterState, 'isRemote'>, option)
                  }
                />
              }
              label={<Typography variant="body2">{option}</Typography>}
            />
          ))}
          <Divider sx={{ mt: 1 }} />
        </Box>
      ))}

      {/* Remote Filter */}
      <Box mb={2}>
        <Typography variant="body2" fontWeight="bold" mb={1}>
          Work Type
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={selectedFilters.isRemote === true}
              onChange={() => handleRemoteToggle(true)}
            />
          }
          label={<Typography variant="body2">Remote</Typography>}
        />
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={selectedFilters.isRemote === false}
              onChange={() => handleRemoteToggle(false)}
            />
          }
          label={<Typography variant="body2">In-Office</Typography>}
        />
        <Divider sx={{ mt: 1 }} />
      </Box>
    </Box>
  );
};

export default JobFilters;

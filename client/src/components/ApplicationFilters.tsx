import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';

interface ApplicationFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  sortOption: string;
  setSortOption: (value: string) => void;
}

const ApplicationFilters: React.FC<ApplicationFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sortOption,
  setSortOption,
}) => {
  return (
    <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
      <TextField
        label="Search by Title"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={statusFilter}
          label="Status"
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="Accepted">Accepted</MenuItem>
          <MenuItem value="Rejected">Rejected</MenuItem>
          <MenuItem value="Reviewed">Reviewed</MenuItem>
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Sort By</InputLabel>
        <Select
          value={sortOption}
          label="Sort By"
          onChange={(e) => setSortOption(e.target.value)}
        >
          <MenuItem value="Newest">Newest</MenuItem>
          <MenuItem value="Oldest">Oldest</MenuItem>
          <MenuItem value="Title">Title</MenuItem>
          <MenuItem value="Company">Company</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default ApplicationFilters;

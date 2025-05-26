import React, { useEffect, useState } from 'react';
import axios from '../services/axiosInstance';
import JobFilters, { FilterState } from '../components/JobFilters';
import {Box,Typography} from '@mui/material';
import JobCard from '../components/JobCard';
import SearchBar from '../components/SearchBar';

const JobListPage = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    location: [],
    industry: [],
    salary: [],
    employmentType: [],
    experienceLevel: [],
    isRemote: null,
    skills: [],
  });

  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('/api/jobs');
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };
    fetchJobs();

    const stored = localStorage.getItem('savedJobs');
    if (stored) setSavedJobs(JSON.parse(stored));
  }, []);

  const handleFilterChange = (filters: FilterState) => {
    setSelectedFilters(filters);
  };

  const toggleSaveJob = (jobId: string) => {
    let updated;
    if (savedJobs.includes(jobId)) {
      updated = savedJobs.filter((id) => id !== jobId);
    } else {
      updated = [...savedJobs, jobId];
    }
    setSavedJobs(updated);
    localStorage.setItem('savedJobs', JSON.stringify(updated));
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation =
      selectedFilters.location.length === 0 ||
      selectedFilters.location.includes(job.location);

    const matchesIndustry =
      selectedFilters.industry.length === 0 ||
      selectedFilters.industry.includes(job.industry);

    const matchesSalary =
      selectedFilters.salary.length === 0 ||
      selectedFilters.salary.some((range) => {
        const salaryNum = parseInt(job.salary?.replace(/[^0-9]/g, '') || '0');
        if (range === '$0-$60,000') return salaryNum <= 60000;
        if (range === '$61,000-$99,000') return salaryNum > 60000 && salaryNum < 100000;
        if (range === '$100,000 & More') return salaryNum >= 100000;
        return false;
      });

    const matchesEmploymentType =
      selectedFilters.employmentType.length === 0 ||
      selectedFilters.employmentType.includes(job.employmentType);

    const matchesExperience =
      selectedFilters.experienceLevel.length === 0 ||
      selectedFilters.experienceLevel.includes(job.experienceLevel);

    const matchesRemote =
      selectedFilters.isRemote === null || job.isRemote === selectedFilters.isRemote;

    const matchesSkills =
      selectedFilters.skills.length === 0 ||
      selectedFilters.skills.every((skill) => job.skillsRequired?.includes(skill));

    return (
      matchesSearch &&
      matchesLocation &&
      matchesIndustry &&
      matchesSalary &&
      matchesEmploymentType &&
      matchesExperience &&
      matchesRemote &&
      matchesSkills
    );
  });

  return (
    <Box sx={{ display: 'flex', bgcolor: '#F8F4FF', minHeight: '100vh', px: 4, py: 6, gap: 4 }}>

      {/* Sidebar Filters */}
      <Box sx={{ width: 260 }}>
        <JobFilters onFilterChange={handleFilterChange} />
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        
        {/* Search Bar */}
        <SearchBar value={searchTerm} onChange={setSearchTerm} />

        <Box mt={4} display="flex" flexWrap="wrap" gap={3} justifyContent="flex-start">
      
          {/* Job Cards */}
          {filteredJobs.map((job) => (
            <JobCard
            key={job._id}
            job={job}
            saved={savedJobs.includes(job._id)}
            onToggleSave={toggleSaveJob}
            />
            ))}
        </Box>

        {filteredJobs.length === 0 && (
          <Typography
            variant="body1"
            color="text.secondary"
            mt={4}
            textAlign="center"
          >
            No jobs found.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default JobListPage;


import React, { useEffect, useState } from 'react';
import axios from '../services/axiosInstance';
import {Box,Button,Container,Typography} from '@mui/material';
import ApplicationFilters from '../components/ApplicationFilters';
import ApplicationItem from '../components/ApplicationItem';
import PaginationControl from '../components/PaginationControl';

const ITEMS_PER_PAGE = 10;

const MyApplications = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [filteredApps, setFilteredApps] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOption, setSortOption] = useState('Newest');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/applications/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplications(res.data);
      } catch (err) {
        console.error('Error fetching applications:', err);
      }
    };
    fetchApplications();
  }, []);

  useEffect(() => {
    let apps = [...applications];

    if (statusFilter !== 'All') {
      apps = apps.filter((app) => app.status === statusFilter);
    }

    if (searchTerm) {
      apps = apps.filter((app) =>
        app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (sortOption) {
      case 'Title':
        apps.sort((a, b) => a.job?.title?.localeCompare(b.job?.title || '') || 0);
        break;
      case 'Company':
        apps.sort((a, b) => a.job?.company?.localeCompare(b.job?.company || '') || 0);
        break;
      case 'Oldest':
        apps.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      default:
        apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setFilteredApps(apps);
    setPage(1);
  }, [applications, searchTerm, statusFilter, sortOption]);

  const handleDeleteApplication = async (appId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/applications/${appId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications((prev) => prev.filter((a) => a._id !== appId));
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  };

  const paginatedApps = filteredApps.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Applications
      </Typography>

      {/* Filters */}
      <ApplicationFilters
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      sortOption={sortOption}
      setSortOption={setSortOption}
      />

      {/* Accordion List or Empty State */}
      <Box mt={4}>
        {filteredApps.length === 0 ? (
          <Box
            textAlign="center"
            p={4}
            borderRadius={3}
            bgcolor="rgba(255,255,255,0.05)"
            sx={{
              backdropFilter: 'blur(6px)',
              border: '1px dashed rgba(255, 255, 255, 0.2)',
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              No applications found
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Try adjusting your filters or search term.
            </Typography>
            <Button variant="contained" href="/jobs" sx={{ mt: 2 }}>
              Explore Jobs
            </Button>
          </Box>
        ) : (
         paginatedApps.map((app) => (
         <ApplicationItem key={app._id} app={app} onDelete={handleDeleteApplication} />
        )) 
        )}
      </Box>

      {/* Pagination */}
      {filteredApps.length > 0 && (
        <Box mt={4} display="flex" justifyContent="center">
          <PaginationControl
          currentPage={page}
          totalItems={filteredApps.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
          />

        </Box>
      )}
    </Container>
  );
};

export default MyApplications;

import React from 'react';
import { Box, Pagination } from '@mui/material';

interface PaginationControlProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  sx?: object;
}

const PaginationControl: React.FC<PaginationControlProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  sx = {},
}) => {
  const pageCount = Math.ceil(totalItems / itemsPerPage);

  if (pageCount <= 1) return null;

  return (
    <Box mt={4} display="flex" justifyContent="center" sx={sx}>
      <Pagination
        count={pageCount}
        page={currentPage}
        onChange={(_, value) => onPageChange(value)}
        color="primary"
        shape="rounded"
      />
    </Box>
  );
};

export default PaginationControl;

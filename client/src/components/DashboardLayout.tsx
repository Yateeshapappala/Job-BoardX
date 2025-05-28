// /components/DashboardLayout.tsx
import React from 'react';
import { Box } from '@mui/material';


type Props = {
  children: React.ReactNode;
};

const DashboardLayout: React.FC<Props> = ({ children }) => {
  return (
    <Box display="flex" height="100vh">
     
      <Box flexGrow={1} p={3} sx={{ overflowY: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;

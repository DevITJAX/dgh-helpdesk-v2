import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Link,
  Alert
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

const H2ConsoleInfo = () => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box display="flex" alignItems="center" mb={1}>
        <InfoIcon sx={{ mr: 1, color: 'info.main' }} />
        <Typography variant="h6">
          H2 Database Console Access
        </Typography>
      </Box>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          You can access the H2 database console directly to view and manage data:
        </Typography>
      </Alert>
      
      <Box sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
        <Typography variant="body2" gutterBottom>
          <strong>URL:</strong> <Link href="http://localhost:8080/h2-console" target="_blank">http://localhost:8080/h2-console</Link>
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>JDBC URL:</strong> jdbc:h2:file:./data/dgh_helpdesk
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Username:</strong> sa
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Password:</strong> password
        </Typography>
      </Box>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        Note: Make sure the backend server is running on port 8080 to access the H2 console.
      </Typography>
    </Paper>
  );
};

export default H2ConsoleInfo; 
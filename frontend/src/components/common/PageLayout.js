import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { LoadingSpinner } from './LoadingStates';

const PageLayout = ({ 
  title, 
  subtitle, 
  children, 
  loading = false, 
  error = null,
  actions = null,
  maxWidth = '100%',
  container = true 
}) => {
  if (loading) {
    return <LoadingSpinner message="Loading page..." />;
  }

  const content = (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {actions}
          </Box>
        )}
      </Box>

      {/* Main Content */}
      <Box sx={{ width: '100%' }}>
        {children}
      </Box>
    </Box>
  );

  if (container) {
    return (
      <Box sx={{ 
        width: '100%', 
        maxWidth: maxWidth,
        mx: 'auto'
      }}>
        {content}
      </Box>
    );
  }

  return content;
};

export default PageLayout; 
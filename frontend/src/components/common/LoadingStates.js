import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Alert,
  Card,
  CardContent,
  Skeleton,
  Grid,
  Button,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { COLORS, SHADOWS, BORDER_RADIUS, TRANSITIONS } from '../../constants/stylingConstants';

// Styled Components
const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  minHeight: '200px',
}));

const ErrorContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  textAlign: 'center',
  minHeight: '200px',
}));

const StyledAlert = styled(Alert)(({ theme, severity = 'info' }) => ({
  borderRadius: BORDER_RADIUS.medium,
  boxShadow: SHADOWS.light,
  marginBottom: theme.spacing(2),
  '& .MuiAlert-icon': {
    fontSize: '1.5rem',
  },
}));

const SkeletonCard = styled(Card)(({ theme }) => ({
  borderRadius: BORDER_RADIUS.large,
  boxShadow: SHADOWS.light,
  marginBottom: theme.spacing(2),
}));

// Loading Components
export const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Loading...', 
  fullScreen = false,
  color = 'primary' 
}) => {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 60,
  };

  const containerStyle = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 9999,
  } : {};

  return (
    <LoadingContainer sx={containerStyle}>
      <CircularProgress 
        size={sizeMap[size]} 
        color={color}
        sx={{ mb: 2 }}
      />
      {message && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          {message}
        </Typography>
      )}
    </LoadingContainer>
  );
};

export const LoadingCard = ({ 
  title = 'Loading...', 
  subtitle = 'Please wait while we fetch the data',
  showSkeleton = true 
}) => (
  <SkeletonCard>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <CircularProgress size={24} sx={{ mr: 2 }} />
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {subtitle}
      </Typography>
      {showSkeleton && (
        <Box>
          <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={20} />
        </Box>
      )}
    </CardContent>
  </SkeletonCard>
);

export const LoadingTable = ({ rows = 5, columns = 4 }) => (
  <Box>
    {Array.from({ length: rows }).map((_, index) => (
      <Box key={index} sx={{ display: 'flex', mb: 1 }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton 
            key={colIndex} 
            variant="text" 
            width={`${100 / columns}%`} 
            height={40}
            sx={{ mr: colIndex < columns - 1 ? 1 : 0 }}
          />
        ))}
      </Box>
    ))}
  </Box>
);

export const LoadingGrid = ({ items = 6, columns = 3 }) => (
  <Grid container spacing={2}>
    {Array.from({ length: items }).map((_, index) => (
      <Grid item xs={12} sm={6} md={12 / columns} key={index}>
        <SkeletonCard>
          <CardContent>
            <Skeleton variant="rectangular" height={120} sx={{ mb: 2, borderRadius: 1 }} />
            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="100%" height={16} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={16} />
          </CardContent>
        </SkeletonCard>
      </Grid>
    ))}
  </Grid>
);

// Error Components
export const ErrorMessage = ({ 
  title = 'Error', 
  message = 'Something went wrong', 
  severity = 'error',
  onRetry,
  showIcon = true 
}) => {
  const iconMap = {
    error: <ErrorIcon sx={{ fontSize: 48, color: COLORS.error.main, mb: 2 }} />,
    warning: <WarningIcon sx={{ fontSize: 48, color: COLORS.warning.main, mb: 2 }} />,
    info: <InfoIcon sx={{ fontSize: 48, color: COLORS.info.main, mb: 2 }} />,
    success: <SuccessIcon sx={{ fontSize: 48, color: COLORS.success.main, mb: 2 }} />,
  };

  return (
    <ErrorContainer>
      {showIcon && iconMap[severity]}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          sx={{ 
            borderRadius: BORDER_RADIUS.medium,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Try Again
        </Button>
      )}
    </ErrorContainer>
  );
};

export const ErrorCard = ({ 
  title = 'Error', 
  message = 'Something went wrong', 
  severity = 'error',
  onRetry,
  actions 
}) => (
  <Card sx={{ 
    borderRadius: BORDER_RADIUS.large,
    boxShadow: SHADOWS.light,
    border: `1px solid ${COLORS.error.light}`,
  }}>
    <CardContent sx={{ p: 3, textAlign: 'center' }}>
      <ErrorIcon sx={{ fontSize: 48, color: COLORS.error.main, mb: 2 }} />
      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {message}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        {onRetry && (
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
            sx={{ 
              borderRadius: BORDER_RADIUS.medium,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Try Again
          </Button>
        )}
        {actions}
      </Box>
    </CardContent>
  </Card>
);

export const ErrorAlert = ({ 
  title = 'Error', 
  message = 'Something went wrong', 
  severity = 'error',
  onClose,
  action 
}) => (
  <StyledAlert 
    severity={severity} 
    onClose={onClose}
    action={action}
    sx={{ 
      '& .MuiAlert-message': {
        width: '100%',
      },
    }}
  >
    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
      {title}
    </Typography>
    <Typography variant="body2">
      {message}
    </Typography>
  </StyledAlert>
);

// Empty State Components
export const EmptyState = ({ 
  title = 'No Data', 
  message = 'There are no items to display',
  icon,
  action 
}) => (
  <ErrorContainer>
    {icon && (
      <Box sx={{ mb: 2, opacity: 0.6 }}>
        {icon}
      </Box>
    )}
    <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
      {message}
    </Typography>
    {action}
  </ErrorContainer>
);

export const EmptyCard = ({ 
  title = 'No Data', 
  message = 'There are no items to display',
  icon,
  action 
}) => (
  <Card sx={{ 
    borderRadius: BORDER_RADIUS.large,
    boxShadow: SHADOWS.light,
    border: `1px solid ${COLORS.grey[200]}`,
  }}>
    <CardContent sx={{ p: 4, textAlign: 'center' }}>
      {icon && (
        <Box sx={{ mb: 2, opacity: 0.6 }}>
          {icon}
        </Box>
      )}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {message}
      </Typography>
      {action}
    </CardContent>
  </Card>
);

// Status Components
export const StatusIndicator = ({ 
  status = 'loading', 
  message,
  size = 'medium' 
}) => {
  const statusConfig = {
    loading: {
      icon: <CircularProgress size={size === 'small' ? 16 : 20} />,
      color: COLORS.info.main,
    },
    success: {
      icon: <SuccessIcon sx={{ fontSize: size === 'small' ? 16 : 20 }} />,
      color: COLORS.success.main,
    },
    error: {
      icon: <ErrorIcon sx={{ fontSize: size === 'small' ? 16 : 20 }} />,
      color: COLORS.error.main,
    },
    warning: {
      icon: <WarningIcon sx={{ fontSize: size === 'small' ? 16 : 20 }} />,
      color: COLORS.warning.main,
    },
  };

  const config = statusConfig[status];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ color: config.color }}>
        {config.icon}
      </Box>
      {message && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: config.color,
            fontWeight: 500,
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

// Page Loading Component
export const PageLoading = ({ message = 'Loading page...' }) => (
  <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center',
    minHeight: '50vh',
    p: 4,
  }}>
    <CircularProgress size={60} sx={{ mb: 3 }} />
    <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
      {message}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Please wait while we prepare your content
    </Typography>
  </Box>
);

// Data Loading Component
export const DataLoading = ({ 
  loading, 
  error, 
  children, 
  loadingComponent = <LoadingSpinner />,
  errorComponent,
  onRetry 
}) => {
  if (loading) {
    return loadingComponent;
  }

  if (error) {
    return errorComponent || (
      <ErrorMessage 
        message={error} 
        onRetry={onRetry}
      />
    );
  }

  return children;
};

export default {
  LoadingSpinner,
  LoadingCard,
  LoadingTable,
  LoadingGrid,
  ErrorMessage,
  ErrorCard,
  ErrorAlert,
  EmptyState,
  EmptyCard,
  StatusIndicator,
  PageLoading,
  DataLoading,
}; 
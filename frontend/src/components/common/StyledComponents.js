import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  Typography,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
  Grid,
  Container,
  CircularProgress,
  Skeleton,
  Fade,
  Grow,
  Slide,
  Zoom,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { COMPONENT_STYLES, COLORS, SHADOWS, TRANSITIONS, BORDER_RADIUS } from '../../constants/stylingConstants';

// Styled Card Component
export const StyledCard = styled(Card)(({ theme, variant = 'default' }) => ({
  ...COMPONENT_STYLES.card,
  ...(variant === 'elevated' && {
    boxShadow: SHADOWS.heavy,
    '&:hover': {
      boxShadow: '0 12px 24px rgba(0,0,0,0.25)',
    },
  }),
  ...(variant === 'outlined' && {
    boxShadow: 'none',
    border: `1px solid ${COLORS.grey[200]}`,
    '&:hover': {
      borderColor: COLORS.primary.main,
      boxShadow: SHADOWS.light,
    },
  }),
}));

// Styled Button Component
export const StyledButton = styled(Button)(({ theme, variant = 'contained', size = 'medium' }) => ({
  ...COMPONENT_STYLES.button,
  ...(variant === 'outlined' && {
    borderWidth: 2,
    '&:hover': {
      borderWidth: 2,
      transform: 'translateY(-1px)',
    },
  }),
  ...(variant === 'text' && {
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: COLORS.grey[100],
      transform: 'none',
    },
  }),
  ...(size === 'small' && {
    padding: '6px 16px',
    fontSize: '0.875rem',
  }),
  ...(size === 'large' && {
    padding: '12px 24px',
    fontSize: '1.125rem',
  }),
}));

// Styled Chip Component
export const StyledChip = styled(Chip)(({ theme, color = 'default' }) => ({
  ...COMPONENT_STYLES.chip,
  fontWeight: 600,
  ...(color === 'success' && {
    backgroundColor: COLORS.success.light,
    color: COLORS.success.contrast || '#ffffff',
  }),
  ...(color === 'warning' && {
    backgroundColor: COLORS.warning.light,
    color: COLORS.warning.contrast || '#ffffff',
  }),
  ...(color === 'error' && {
    backgroundColor: COLORS.error.light,
    color: COLORS.error.contrast || '#ffffff',
  }),
  ...(color === 'info' && {
    backgroundColor: COLORS.info.light,
    color: COLORS.info.contrast || '#ffffff',
  }),
}));

// Styled Paper Component
export const StyledPaper = styled(Paper)(({ theme, elevation = 1 }) => ({
  borderRadius: BORDER_RADIUS.large,
  boxShadow: SHADOWS.light,
  transition: TRANSITIONS.medium,
  '&:hover': {
    boxShadow: SHADOWS.medium,
  },
}));

// Styled Avatar Component
export const StyledAvatar = styled(Avatar)(({ theme, size = 'medium' }) => ({
  ...(size === 'small' && {
    width: 32,
    height: 32,
    fontSize: '0.875rem',
  }),
  ...(size === 'medium' && {
    width: 40,
    height: 40,
    fontSize: '1rem',
  }),
  ...(size === 'large' && {
    width: 56,
    height: 56,
    fontSize: '1.25rem',
  }),
  ...(size === 'xl' && {
    width: 80,
    height: 80,
    fontSize: '1.5rem',
  }),
  boxShadow: SHADOWS.light,
  border: `2px solid ${COLORS.grey[100]}`,
}));

// Styled Table Component
export const StyledTable = styled(Table)(({ theme }) => ({
  ...COMPONENT_STYLES.table,
  '& .MuiTableCell-root': {
    borderBottom: `1px solid ${COLORS.grey[200]}`,
    padding: '12px 16px',
  },
  '& .MuiTableHead-root .MuiTableCell-root': {
    fontWeight: 600,
    color: COLORS.text.primary,
    backgroundColor: COLORS.grey[50],
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: COLORS.grey[50],
    transition: TRANSITIONS.fast,
  },
}));

// Styled TextField Component
export const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: BORDER_RADIUS.medium,
    transition: TRANSITIONS.fast,
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: COLORS.primary.main,
      },
    },
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: COLORS.primary.main,
        borderWidth: 2,
      },
    },
  },
}));

// Styled FormControl Component
export const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: BORDER_RADIUS.medium,
  },
}));

// Styled Dialog Component
export const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: BORDER_RADIUS.large,
    boxShadow: SHADOWS.heavy,
  },
  '& .MuiDialogTitle-root': {
    borderBottom: `1px solid ${COLORS.grey[200]}`,
    padding: '24px 24px 16px 24px',
  },
  '& .MuiDialogContent-root': {
    padding: '24px',
  },
  '& .MuiDialogActions-root': {
    borderTop: `1px solid ${COLORS.grey[200]}`,
    padding: '16px 24px 24px 24px',
  },
}));

// Styled Alert Component
export const StyledAlert = styled(Alert)(({ theme, severity = 'info' }) => ({
  borderRadius: BORDER_RADIUS.medium,
  fontWeight: 500,
  '& .MuiAlert-icon': {
    fontSize: '1.25rem',
  },
}));

// Styled Snackbar Component
export const StyledSnackbar = styled(Snackbar)(({ theme }) => ({
  '& .MuiSnackbarContent-root': {
    borderRadius: BORDER_RADIUS.medium,
    boxShadow: SHADOWS.medium,
  },
}));

// Styled Tabs Component
export const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: COLORS.primary.main,
    height: 3,
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    minHeight: 48,
    '&.Mui-selected': {
      color: COLORS.primary.main,
    },
  },
}));

// Styled Tab Component
export const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.875rem',
  minHeight: 48,
}));

// Styled List Component
export const StyledList = styled(List)(({ theme }) => ({
  '& .MuiListItem-root': {
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: 4,
    transition: TRANSITIONS.fast,
    '&:hover': {
      backgroundColor: COLORS.grey[50],
    },
  },
}));

// Styled ListItem Component
export const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: BORDER_RADIUS.medium,
  transition: TRANSITIONS.fast,
  '&:hover': {
    backgroundColor: COLORS.grey[50],
  },
}));

// Styled IconButton Component
export const StyledIconButton = styled(IconButton)(({ theme, color = 'default' }) => ({
  transition: TRANSITIONS.fast,
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: COLORS.grey[100],
  },
  ...(color === 'primary' && {
    color: COLORS.primary.main,
    '&:hover': {
      backgroundColor: COLORS.primary.light + '20',
    },
  }),
  ...(color === 'error' && {
    color: COLORS.error.main,
    '&:hover': {
      backgroundColor: COLORS.error.light + '20',
    },
  }),
}));

// Styled Badge Component
export const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    borderRadius: BORDER_RADIUS.round,
    fontWeight: 600,
  },
}));

// Styled LinearProgress Component
export const StyledLinearProgress = styled(LinearProgress)(({ theme, variant = 'determinate' }) => ({
  borderRadius: BORDER_RADIUS.small,
  height: 8,
  backgroundColor: COLORS.grey[200],
  '& .MuiLinearProgress-bar': {
    borderRadius: BORDER_RADIUS.small,
  },
}));

// Styled Skeleton Component
export const StyledSkeleton = styled(Skeleton)(({ theme, variant = 'text' }) => ({
  borderRadius: BORDER_RADIUS.medium,
  ...(variant === 'circular' && {
    borderRadius: BORDER_RADIUS.round,
  }),
}));

// Container Components
export const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: 24,
  paddingBottom: 24,
  minHeight: 'calc(100vh - 200px)',
}));

export const CardContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
}));

export const FlexContainer = styled(Box)(({ theme, direction = 'row', align = 'center', justify = 'center' }) => ({
  display: 'flex',
  flexDirection: direction,
  alignItems: align,
  justifyContent: justify,
  gap: 8,
}));

// Typography Components
export const PageTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: COLORS.text.primary,
  marginBottom: 16,
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: COLORS.text.primary,
  marginBottom: 12,
}));

export const CardTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: COLORS.text.primary,
  marginBottom: 8,
}));

export const CaptionText = styled(Typography)(({ theme }) => ({
  color: COLORS.text.secondary,
  fontSize: '0.875rem',
  fontWeight: 500,
}));

// Animation Components
export const FadeInBox = styled(Box)(({ theme }) => ({
  animation: 'fadeIn 0.5s ease-in-out',
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
      transform: 'translateY(20px)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
}));

export const SlideInBox = styled(Box)(({ theme }) => ({
  animation: 'slideIn 0.3s ease-in-out',
  '@keyframes slideIn': {
    '0%': {
      transform: 'translateX(-100%)',
    },
    '100%': {
      transform: 'translateX(0)',
    },
  },
}));

// Export all components
export {
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  Typography,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
  Grid,
  Container,
  CircularProgress,
  Skeleton,
  Fade,
  Grow,
  Slide,
  Zoom,
}; 
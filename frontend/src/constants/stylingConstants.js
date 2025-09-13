// Styling constants for consistent design across the application

export const SPACING = {
  xs: 0.5,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
  xxl: 6,
};

export const BORDER_RADIUS = {
  small: 4,
  medium: 8,
  large: 12,
  xl: 16,
  round: 50,
};

export const SHADOWS = {
  light: '0 2px 4px rgba(0,0,0,0.1)',
  medium: '0 4px 8px rgba(0,0,0,0.15)',
  heavy: '0 8px 16px rgba(0,0,0,0.2)',
  card: '0 2px 8px rgba(0,0,0,0.1)',
  cardHover: '0 4px 16px rgba(0,0,0,0.15)',
};

export const TRANSITIONS = {
  fast: 'all 0.2s ease-in-out',
  medium: 'all 0.3s ease-in-out',
  slow: 'all 0.5s ease-in-out',
};

export const COLORS = {
  // Primary palette
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrast: '#ffffff',
  },
  // Secondary palette
  secondary: {
    main: '#dc004e',
    light: '#ff5983',
    dark: '#9a0036',
    contrast: '#ffffff',
  },
  // Status colors
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
  },
  error: {
    main: '#d32f2f',
    light: '#f44336',
    dark: '#c62828',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
  },
  // Neutral colors
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  // Background colors
  background: {
    default: '#f8f9fa',
    paper: '#ffffff',
    sidebar: '#ffffff',
    header: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
  },
  // Text colors
  text: {
    primary: '#2c3e50',
    secondary: '#6c757d',
    disabled: '#9e9e9e',
  },
};

export const TYPOGRAPHY = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    xxl: '1.5rem',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
};

export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

// Common component styles
export const COMPONENT_STYLES = {
  card: {
    borderRadius: BORDER_RADIUS.large,
    boxShadow: SHADOWS.card,
    transition: TRANSITIONS.medium,
    '&:hover': {
      boxShadow: SHADOWS.cardHover,
    },
  },
  button: {
    borderRadius: BORDER_RADIUS.medium,
    textTransform: 'none',
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    boxShadow: SHADOWS.light,
    transition: TRANSITIONS.fast,
    '&:hover': {
      boxShadow: SHADOWS.medium,
      transform: 'translateY(-1px)',
    },
  },
  input: {
    borderRadius: BORDER_RADIUS.medium,
  },
  chip: {
    borderRadius: BORDER_RADIUS.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
  table: {
    '& .MuiTableHead-root': {
      backgroundColor: COLORS.grey[50],
    },
    '& .MuiTableRow-root:hover': {
      backgroundColor: COLORS.grey[50],
    },
  },
  sidebar: {
    backgroundColor: COLORS.background.sidebar,
    boxShadow: SHADOWS.medium,
    borderRight: `1px solid ${COLORS.grey[200]}`,
  },
  header: {
    background: COLORS.background.header,
    boxShadow: SHADOWS.light,
  },
};

// Animation keyframes
export const ANIMATIONS = {
  fadeIn: {
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
  },
  slideIn: {
    '@keyframes slideIn': {
      '0%': {
        transform: 'translateX(-100%)',
      },
      '100%': {
        transform: 'translateX(0)',
      },
    },
  },
  pulse: {
    '@keyframes pulse': {
      '0%': {
        transform: 'scale(1)',
      },
      '50%': {
        transform: 'scale(1.05)',
      },
      '100%': {
        transform: 'scale(1)',
      },
    },
  },
};

// Responsive utilities
export const RESPONSIVE = {
  mobile: `@media (max-width: ${BREAKPOINTS.sm - 1}px)`,
  tablet: `@media (min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.md - 1}px)`,
  desktop: `@media (min-width: ${BREAKPOINTS.md}px)`,
  largeDesktop: `@media (min-width: ${BREAKPOINTS.lg}px)`,
};

// Z-index layers
export const Z_INDEX = {
  drawer: 1200,
  appBar: 1100,
  modal: 1300,
  tooltip: 1500,
  snackbar: 1400,
};

export default {
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  TRANSITIONS,
  COLORS,
  TYPOGRAPHY,
  BREAKPOINTS,
  COMPONENT_STYLES,
  ANIMATIONS,
  RESPONSIVE,
  Z_INDEX,
}; 
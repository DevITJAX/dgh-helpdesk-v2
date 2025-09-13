import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
  Avatar,
  Chip,
  Paper,
  alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout,
  AccountCircle,
  Email as EmailIcon,
  AdminPanelSettings as AdminIcon,
  Build as TechnicianIcon,
  Person as EmployeeIcon,
  Dashboard as DashboardIcon,
  ConfirmationNumber as TicketsIcon,
  People as UsersIcon,
  Computer as EquipmentIcon,
  Person as ProfileIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSecureAuth } from '../../hooks/useSecureAuth';
import { getNavigationItems } from '../../constants/navigationConfig';
import { getRoleDisplayName } from '../../utils/roleDisplay';
import dghLogo from '../../dgh_logo.png';

const Layout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, secureLogout } = useSecureAuth();

  // Get navigation items based on user role
  const menuItems = getNavigationItems(user?.role);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleLogout = async () => {
    await secureLogout();
    navigate('/login');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <AdminIcon />;
      case 'TECHNICIAN':
        return <TechnicianIcon />;
      case 'EMPLOYEE':
        return <EmployeeIcon />;
      default:
        return <EmployeeIcon />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'TECHNICIAN':
        return 'warning';
      case 'EMPLOYEE':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getMenuIcon = (path) => {
    switch (path) {
      case '/dashboard':
        return <DashboardIcon />;
      case '/tickets':
        return <TicketsIcon />;
      case '/users':
        return <UsersIcon />;
      case '/equipment':
        return <EquipmentIcon />;
      case '/profile':
        return <ProfileIcon />;
      default:
        return <DashboardIcon />;
    }
  };

  const drawer = (
    <Box sx={{ 
      width: 320,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
      borderRight: '1px solid',
      borderColor: 'divider'
    }}>
      {/* Header Section */}
      <Box sx={{ 
        p: 3, 
        textAlign: 'center',
        flexShrink: 0,
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        {/* Logo */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mb: 2
        }}>
          <Avatar
            src={dghLogo}
            alt="DGH Logo"
            sx={{ 
              width: 80, 
              height: 80,
              borderRadius: '12px'
            }}
          />
        </Box>
        
        {/* App Title */}
        <Typography variant="h5" component="div" sx={{ 
          fontWeight: 700,
          color: 'primary.main',
          letterSpacing: '0.5px'
        }}>
          DGH HelpDesk
        </Typography>
      </Box>

      {/* User Profile Section */}
      <Paper 
        elevation={3}
        sx={{ 
          m: 2,
          p: 2.5,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* User Avatar and Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            sx={{ 
              width: 52, 
              height: 52,
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 16px rgba(25, 118, 210, 0.4)'
            }}
          >
            {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              lineHeight: 1.2,
              mb: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user?.fullName || user?.username || 'Unknown User'}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'text.secondary',
              fontSize: '0.75rem',
              display: 'block'
            }}>
              {user?.ldapUsername || user?.username || 'USERNAME'}
            </Typography>
          </Box>
        </Box>

        {/* Email */}
        {user?.email && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.2),
            mb: 2
          }}>
            <EmailIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography variant="caption" sx={{ 
              color: 'text.secondary',
              fontSize: '0.75rem',
              wordBreak: 'break-word',
              flex: 1,
              lineHeight: 1.3
            }}>
              {user.email}
            </Typography>
          </Box>
        )}

        {/* Role Badge */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Chip
            icon={getRoleIcon(user?.role)}
            label={getRoleDisplayName(user?.role)}
            color={getRoleColor(user?.role)}
            size="small"
            variant="filled"
            sx={{ 
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 26,
              '& .MuiChip-icon': {
                fontSize: 16
              },
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          />
        </Box>
      </Paper>

      {/* Navigation Section */}
      <Box sx={{ 
        flexGrow: 1,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        px: 2
      }}>
        <List sx={{ flexGrow: 1, pt: 1 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem
                button
                key={item.text}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  background: isActive 
                    ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
                    : 'transparent',
                  color: isActive ? 'white' : 'text.primary',
                  '&:hover': {
                    background: isActive 
                      ? 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)'
                      : alpha(theme.palette.primary.main, 0.08),
                    transform: 'translateX(4px)',
                    transition: 'all 0.2s ease-in-out'
                  },
                  transition: 'all 0.2s ease-in-out',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {isActive && (
                  <Box sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    background: 'white',
                    borderRadius: '0 2px 2px 0'
                  }} />
                )}
                <ListItemIcon sx={{ 
                  color: 'inherit',
                  minWidth: 44,
                  ml: 1
                }}>
                  {getMenuIcon(item.path)}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.9rem'
                    }
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer Section */}
      <Box sx={{ flexShrink: 0, px: 2, pb: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <ListItem 
          button 
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            background: alpha(theme.palette.error.main, 0.08),
            border: '1px solid',
            borderColor: alpha(theme.palette.error.main, 0.2),
            '&:hover': {
              background: alpha(theme.palette.error.main, 0.12),
              transform: 'translateX(4px)',
              transition: 'all 0.2s ease-in-out'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <ListItemIcon sx={{ 
            color: 'error.main',
            minWidth: 44,
            ml: 1
          }}>
            <Logout />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            sx={{ 
              color: 'error.main',
              '& .MuiListItemText-primary': {
                fontWeight: 500,
                fontSize: '0.9rem'
              }
            }} 
          />
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - 320px)` },
          ml: { md: `320px` },
          zIndex: theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          height: '80px'
        }}
      >
        <Toolbar sx={{ height: '80px', minHeight: '80px' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Logo and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
              {menuItems.find(item => item.path === location.pathname)?.text || 'DGH HelpDesk'}
            </Typography>
          </Box>
          
          {/* User Profile Button */}
          <Tooltip title="Profile">
            <IconButton
              color="inherit"
              onClick={() => handleNavigation('/profile')}
            >
              <AccountCircle />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ 
          width: { md: 320 }, 
          flexShrink: { md: 0 },
          height: '100vh'
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 320,
              height: '100vh',
              overflow: 'hidden'
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 320,
              height: '100vh',
              overflow: 'hidden',
              borderRight: 'none'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 320px)` },
          mt: '80px', // AppBar height
          height: 'calc(100vh - 80px)',
          overflow: 'auto',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Box sx={{ 
          width: '100%',
          maxWidth: '1200px'
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 
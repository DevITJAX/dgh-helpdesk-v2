import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  PersonOff as PersonOffIcon,
  AdminPanelSettings as AdminIcon,
  Build as TechnicianIcon,
  Person as EmployeeIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color = 'primary', subtitle, trend }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" component="div" color={`${color}.main`}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TrendingUpIcon fontSize="small" color="success" />
              <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                {trend}
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const RoleDistributionCard = ({ statistics }) => {
  const roles = [
    { name: 'Administrators', count: statistics?.adminCount || 0, color: 'error', icon: <AdminIcon /> },
    { name: 'Technicians', count: statistics?.technicianCount || 0, color: 'warning', icon: <TechnicianIcon /> },
    { name: 'Employees', count: statistics?.employeeCount || 0, color: 'primary', icon: <EmployeeIcon /> }
  ];

  const total = roles.reduce((sum, role) => sum + role.count, 0);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Role Distribution
        </Typography>
        <List>
          {roles.map((role, index) => {
            const percentage = total > 0 ? (role.count / total) * 100 : 0;
            return (
              <React.Fragment key={role.name}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: `${role.color}.main`, width: 40, height: 40 }}>
                      {role.icon}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2">{role.name}</Typography>
                        <Chip
                          label={role.count}
                          color={role.color}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          color={role.color}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                          {percentage.toFixed(1)}% of total users
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < roles.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
};

const DepartmentDistributionCard = ({ statistics }) => {
  const departments = statistics?.departmentDistribution || {};
  const departmentList = Object.entries(departments)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10); // Show top 10 departments

  const total = Object.values(departments).reduce((sum, count) => sum + count, 0);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Top Departments
        </Typography>
        {departmentList.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
            No department data available
          </Typography>
        ) : (
          <List>
            {departmentList.map(([department, count], index) => {
              const percentage = total > 0 ? (count / total) * 100 : 0;
              return (
                <React.Fragment key={department}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        <BusinessIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" noWrap sx={{ maxWidth: '70%' }}>
                            {department || 'Unspecified'}
                          </Typography>
                          <Chip
                            label={count}
                            color="primary"
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            color="primary"
                            sx={{ height: 4, borderRadius: 2 }}
                          />
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                            {percentage.toFixed(1)}% of total users
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < departmentList.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

const UserStatistics = ({ statistics }) => {
  if (!statistics) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="textSecondary">
          Loading user statistics...
        </Typography>
      </Box>
    );
  }

  const activePercentage = statistics.totalUsers > 0 
    ? ((statistics.activeUsers / statistics.totalUsers) * 100).toFixed(1)
    : 0;

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        User Statistics Overview
      </Typography>

      {/* Main Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={statistics.totalUsers || 0}
            icon={<PeopleIcon />}
            color="primary"
            subtitle="All registered users"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={statistics.activeUsers || 0}
            icon={<PersonAddIcon />}
            color="success"
            subtitle={`${activePercentage}% of total`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Inactive Users"
            value={statistics.inactiveUsers || 0}
            icon={<PersonOffIcon />}
            color="warning"
            subtitle={`${(100 - activePercentage).toFixed(1)}% of total`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Departments"
            value={Object.keys(statistics.departmentDistribution || {}).length}
            icon={<BusinessIcon />}
            color="info"
            subtitle="Active departments"
          />
        </Grid>
      </Grid>

      {/* Role and Department Distribution */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <RoleDistributionCard statistics={statistics} />
        </Grid>
        <Grid item xs={12} md={6}>
          <DepartmentDistributionCard statistics={statistics} />
        </Grid>
      </Grid>

      {/* Additional Statistics */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Facts
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main">
                    {statistics.adminCount || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    System Administrators
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {statistics.technicianCount || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    IT Technicians
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">
                    {statistics.employeeCount || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Regular Employees
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {activePercentage}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active User Rate
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserStatistics;
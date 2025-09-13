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
  Computer as ComputerIcon,
  Router as RouterIcon,
  Print as PrintIcon,
  Storage as StorageIcon,
  PhoneAndroid as PhoneIcon,
  Monitor as MonitorIcon,
  Scanner as ScannerIcon,
  Videocam as ProjectorIcon,
  Security as FirewallIcon,
  PowerSettingsNew as UpsIcon,
  DeviceHub as SwitchIcon,
  Wifi as AccessPointIcon,
  HelpOutline as UnknownIcon,
  CheckCircle as OnlineIcon,
  Cancel as OfflineIcon,
  Build as MaintenanceIcon,
  Archive as RetiredIcon,
  QuestionMark as UnknownStatusIcon,
  Settings as ManagedIcon,
  LocationOn as LocationIcon,
  Business as ManufacturerIcon,
  TrendingUp as TrendingUpIcon,
  QuestionMark
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

const TypeDistributionCard = ({ statistics }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'DESKTOP':
      case 'LAPTOP':
        return <ComputerIcon />;
      case 'SERVER':
        return <StorageIcon />;
      case 'PRINTER':
        return <PrintIcon />;
      case 'ROUTER':
        return <RouterIcon />;
      case 'SWITCH':
        return <SwitchIcon />;
      case 'ACCESS_POINT':
        return <AccessPointIcon />;
      case 'FIREWALL':
        return <FirewallIcon />;
      case 'UPS':
        return <UpsIcon />;
      case 'SCANNER':
        return <ScannerIcon />;
      case 'PROJECTOR':
        return <ProjectorIcon />;
      case 'PHONE':
        return <PhoneIcon />;
      case 'MONITOR':
        return <MonitorIcon />;
      case 'STORAGE':
        return <StorageIcon />;
      default:
        return <UnknownIcon />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'DESKTOP':
      case 'LAPTOP':
        return 'primary';
      case 'SERVER':
        return 'error';
      case 'PRINTER':
        return 'secondary';
      case 'ROUTER':
      case 'SWITCH':
      case 'ACCESS_POINT':
        return 'info';
      case 'FIREWALL':
        return 'warning';
      default:
        return 'default';
    }
  };

  const typeDistribution = statistics?.typeDistribution || {};
  const typeList = Object.entries(typeDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10); // Show top 10 types

  const total = Object.values(typeDistribution).reduce((sum, count) => sum + count, 0);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Equipment Types
        </Typography>
        {typeList.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
            No equipment type data available
          </Typography>
        ) : (
          <List>
            {typeList.map(([type, count], index) => {
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const displayName = type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
              return (
                <React.Fragment key={type}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: `${getTypeColor(type)}.main`, width: 40, height: 40 }}>
                        {getTypeIcon(type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2">{displayName}</Typography>
                          <Chip
                            label={count}
                            color={getTypeColor(type)}
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
                            color={getTypeColor(type)}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                            {percentage.toFixed(1)}% of total equipment
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < typeList.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

const StatusDistributionCard = ({ statistics }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ONLINE':
        return <OnlineIcon />;
      case 'OFFLINE':
        return <OfflineIcon />;
      case 'MAINTENANCE':
        return <MaintenanceIcon />;
      case 'RETIRED':
        return <RetiredIcon />;
      default:
        return <UnknownStatusIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ONLINE':
        return 'success';
      case 'OFFLINE':
        return 'error';
      case 'MAINTENANCE':
        return 'warning';
      case 'RETIRED':
        return 'default';
      default:
        return 'default';
    }
  };

  const statusDistribution = statistics?.statusDistribution || {};
  const statusList = Object.entries(statusDistribution)
    .sort(([,a], [,b]) => b - a);

  const total = Object.values(statusDistribution).reduce((sum, count) => sum + count, 0);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Equipment Status
        </Typography>
        {statusList.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
            No equipment status data available
          </Typography>
        ) : (
          <List>
            {statusList.map(([status, count], index) => {
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const displayName = status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
              return (
                <React.Fragment key={status}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: `${getStatusColor(status)}.main`, width: 40, height: 40 }}>
                        {getStatusIcon(status)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2">{displayName}</Typography>
                          <Chip
                            label={count}
                            color={getStatusColor(status)}
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
                            color={getStatusColor(status)}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                            {percentage.toFixed(1)}% of total equipment
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < statusList.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

const LocationDistributionCard = ({ statistics }) => {
  const locationDistribution = statistics?.locationDistribution || {};
  const locationList = Object.entries(locationDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10); // Show top 10 locations

  const total = Object.values(locationDistribution).reduce((sum, count) => sum + count, 0);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Top Locations
        </Typography>
        {locationList.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
            No location data available
          </Typography>
        ) : (
          <List>
            {locationList.map(([location, count], index) => {
              const percentage = total > 0 ? (count / total) * 100 : 0;
              return (
                <React.Fragment key={location}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        <LocationIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" noWrap sx={{ maxWidth: '70%' }}>
                            {location || 'Unspecified'}
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
                            {percentage.toFixed(1)}% of total equipment
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < locationList.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

const ManufacturerDistributionCard = ({ statistics }) => {
  const manufacturerDistribution = statistics?.manufacturerDistribution || {};
  const manufacturerList = Object.entries(manufacturerDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8); // Show top 8 manufacturers

  const total = Object.values(manufacturerDistribution).reduce((sum, count) => sum + count, 0);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Top Manufacturers
        </Typography>
        {manufacturerList.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
            No manufacturer data available
          </Typography>
        ) : (
          <List>
            {manufacturerList.map(([manufacturer, count], index) => {
              const percentage = total > 0 ? (count / total) * 100 : 0;
              return (
                <React.Fragment key={manufacturer}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'info.main', width: 40, height: 40 }}>
                        <ManufacturerIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" noWrap sx={{ maxWidth: '70%' }}>
                            {manufacturer || 'Unknown'}
                          </Typography>
                          <Chip
                            label={count}
                            color="info"
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
                            color="info"
                            sx={{ height: 4, borderRadius: 2 }}
                          />
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                            {percentage.toFixed(1)}% of total equipment
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < manufacturerList.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

const EquipmentStatistics = ({ statistics }) => {
  if (!statistics) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="textSecondary">
          Loading equipment statistics...
        </Typography>
      </Box>
    );
  }

  const onlinePercentage = statistics.totalEquipment > 0 
    ? ((statistics.onlineCount || 0) / statistics.totalEquipment * 100).toFixed(1)
    : 0;

  const offlinePercentage = statistics.totalEquipment > 0 
    ? ((statistics.offlineCount || 0) / statistics.totalEquipment * 100).toFixed(1)
    : 0;

  const managedPercentage = statistics.totalEquipment > 0 
    ? ((statistics.managedCount || 0) / statistics.totalEquipment * 100).toFixed(1)
    : 0;

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Equipment Overview
      </Typography>

      {/* Main Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Equipment"
            value={statistics.totalEquipment || 0}
            icon={<ComputerIcon />}
            color="primary"
            subtitle="All registered devices"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Online Equipment"
            value={statistics.onlineCount || 0}
            icon={<OnlineIcon />}
            color="success"
            subtitle={`${onlinePercentage}% of total`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Offline Equipment"
            value={statistics.offlineCount || 0}
            icon={<OfflineIcon />}
            color="error"
            subtitle={`${offlinePercentage}% of total`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Managed Equipment"
            value={statistics.managedCount || 0}
            icon={<ManagedIcon />}
            color="info"
            subtitle={`${managedPercentage}% of total`}
          />
        </Grid>
      </Grid>

      {/* Equipment Status Summary */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Equipment Status
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <OnlineIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Online"
                    secondary={`${statistics.onlineCount || 0} devices`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'error.main' }}>
                      <OfflineIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Offline"
                    secondary={`${statistics.offlineCount || 0} devices`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Management Status
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <ManagedIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Managed"
                    secondary={`${statistics.managedCount || 0} devices`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <QuestionMark />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Unmanaged"
                    secondary={`${statistics.unmanagedCount || 0} devices`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EquipmentStatistics;
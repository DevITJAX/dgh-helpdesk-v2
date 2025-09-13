import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  FormControlLabel,
  Switch,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Computer as ComputerIcon,
  Router as RouterIcon,
  Print as PrintIcon,
  Storage as StorageIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const NetworkDiscovery = ({ onDiscoveryComplete }) => {
  const [discoverySettings, setDiscoverySettings] = useState({
    ipRange: '192.168.1.0/24',
    timeout: 5000,
    enableSnmp: true,
    snmpCommunity: 'public',
    enablePing: true,
    enablePortScan: false,
    autoAddToInventory: true
  });
  
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryProgress, setDiscoveryProgress] = useState(0);
  const [discoveryResults, setDiscoveryResults] = useState([]);
  const [discoveryLog, setDiscoveryLog] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSettingChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setDiscoverySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateIpRange = (ipRange) => {
    // Basic validation for IP range (CIDR notation)
    const cidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/;
    return cidrRegex.test(ipRange);
  };

  const startDiscovery = async () => {
    if (!validateIpRange(discoverySettings.ipRange)) {
      setError('Please enter a valid IP range in CIDR notation (e.g., 192.168.1.0/24)');
      return;
    }

    setIsDiscovering(true);
    setDiscoveryProgress(0);
    setDiscoveryResults([]);
    setDiscoveryLog([]);
    setError(null);
    setSuccess(null);

    try {
      // Add initial log entry
      addLogEntry('info', `Starting network discovery for ${discoverySettings.ipRange}`);
      
      // Simulate network discovery process
      await simulateNetworkDiscovery();
      
      setSuccess('Network discovery completed successfully!');
      if (onDiscoveryComplete) {
        onDiscoveryComplete();
      }
    } catch (err) {
      console.error('Discovery error:', err);
      setError('Network discovery failed. Please try again.');
      addLogEntry('error', `Discovery failed: ${err.message}`);
    } finally {
      setIsDiscovering(false);
      setDiscoveryProgress(100);
    }
  };

  const stopDiscovery = () => {
    setIsDiscovering(false);
    addLogEntry('info', 'Network discovery stopped by user');
  };

  const addLogEntry = (type, message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDiscoveryLog(prev => [...prev, {
      id: Date.now(),
      type,
      message,
      timestamp
    }]);
  };

  const simulateNetworkDiscovery = async () => {
    // Simulate discovering devices
    const mockDevices = [
      {
        ipAddress: '192.168.1.1',
        hostname: 'gateway.dgh.local',
        macAddress: '00:11:22:33:44:55',
        equipmentType: 'ROUTER',
        manufacturer: 'Cisco',
        model: 'ISR4321',
        status: 'ONLINE'
      },
      {
        ipAddress: '192.168.1.10',
        hostname: 'switch-core.dgh.local',
        macAddress: '00:11:22:33:44:66',
        equipmentType: 'SWITCH',
        manufacturer: 'Cisco',
        model: 'Catalyst 2960',
        status: 'ONLINE'
      },
      {
        ipAddress: '192.168.1.50',
        hostname: 'printer-admin.dgh.local',
        macAddress: '00:11:22:33:44:77',
        equipmentType: 'PRINTER',
        manufacturer: 'HP',
        model: 'LaserJet Pro 400',
        status: 'ONLINE'
      },
      {
        ipAddress: '192.168.1.100',
        hostname: 'pc-admin-01.dgh.local',
        macAddress: '00:11:22:33:44:88',
        equipmentType: 'DESKTOP',
        manufacturer: 'Dell',
        model: 'OptiPlex 7090',
        status: 'ONLINE'
      },
      {
        ipAddress: '192.168.1.101',
        hostname: 'laptop-user-01.dgh.local',
        macAddress: '00:11:22:33:44:99',
        equipmentType: 'LAPTOP',
        manufacturer: 'HP',
        model: 'EliteBook 840',
        status: 'ONLINE'
      }
    ];

    const totalSteps = mockDevices.length + 2; // +2 for setup and cleanup
    let currentStep = 0;

    // Setup phase
    addLogEntry('info', 'Initializing network discovery...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    currentStep++;
    setDiscoveryProgress((currentStep / totalSteps) * 100);

    // Discovery phase
    for (const device of mockDevices) {
      if (!isDiscovering) break; // Check if discovery was stopped
      
      addLogEntry('info', `Scanning ${device.ipAddress}...`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      addLogEntry('success', `Found device: ${device.hostname} (${device.ipAddress})`);
      setDiscoveryResults(prev => [...prev, device]);
      
      currentStep++;
      setDiscoveryProgress((currentStep / totalSteps) * 100);
    }

    // Cleanup phase
    addLogEntry('info', 'Finalizing discovery results...');
    await new Promise(resolve => setTimeout(resolve, 500));
    currentStep++;
    setDiscoveryProgress((currentStep / totalSteps) * 100);

    addLogEntry('success', `Discovery completed. Found ${mockDevices.length} devices.`);
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'ROUTER':
        return <RouterIcon />;
      case 'SWITCH':
        return <RouterIcon />;
      case 'PRINTER':
        return <PrintIcon />;
      case 'DESKTOP':
      case 'LAPTOP':
        return <ComputerIcon />;
      case 'SERVER':
        return <StorageIcon />;
      default:
        return <ComputerIcon />;
    }
  };

  const getDeviceColor = (type) => {
    switch (type) {
      case 'ROUTER':
      case 'SWITCH':
        return 'info';
      case 'PRINTER':
        return 'secondary';
      case 'DESKTOP':
      case 'LAPTOP':
        return 'primary';
      case 'SERVER':
        return 'error';
      default:
        return 'default';
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'success':
        return <SuccessIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'info':
      default:
        return <InfoIcon color="info" />;
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Network Discovery
      </Typography>

      <Grid container spacing={3}>
        {/* Discovery Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SettingsIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Discovery Settings</Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="IP Range (CIDR)"
                    value={discoverySettings.ipRange}
                    onChange={handleSettingChange('ipRange')}
                    placeholder="192.168.1.0/24"
                    helperText="Enter IP range in CIDR notation"
                    disabled={isDiscovering}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Timeout (ms)"
                    type="number"
                    value={discoverySettings.timeout}
                    onChange={handleSettingChange('timeout')}
                    inputProps={{ min: 1000, max: 30000 }}
                    disabled={isDiscovering}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="SNMP Community"
                    value={discoverySettings.snmpCommunity}
                    onChange={handleSettingChange('snmpCommunity')}
                    disabled={isDiscovering || !discoverySettings.enableSnmp}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={discoverySettings.enableSnmp}
                        onChange={handleSettingChange('enableSnmp')}
                        disabled={isDiscovering}
                      />
                    }
                    label="Enable SNMP Discovery"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={discoverySettings.enablePing}
                        onChange={handleSettingChange('enablePing')}
                        disabled={isDiscovering}
                      />
                    }
                    label="Enable Ping Discovery"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={discoverySettings.enablePortScan}
                        onChange={handleSettingChange('enablePortScan')}
                        disabled={isDiscovering}
                      />
                    }
                    label="Enable Port Scanning"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={discoverySettings.autoAddToInventory}
                        onChange={handleSettingChange('autoAddToInventory')}
                        disabled={isDiscovering}
                      />
                    }
                    label="Auto-add to Inventory"
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                {!isDiscovering ? (
                  <Button
                    variant="contained"
                    startIcon={<StartIcon />}
                    onClick={startDiscovery}
                    fullWidth
                  >
                    Start Discovery
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<StopIcon />}
                    onClick={stopDiscovery}
                    fullWidth
                  >
                    Stop Discovery
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Discovery Progress and Results */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Discovery Progress
              </Typography>
              
              {isDiscovering && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={discoveryProgress} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {discoveryProgress.toFixed(0)}% Complete
                  </Typography>
                </Box>
              )}
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}
              
              <Typography variant="subtitle2" gutterBottom>
                Discovered Devices ({discoveryResults.length})
              </Typography>
              
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {discoveryResults.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No devices discovered yet
                  </Typography>
                ) : (
                  <List dense>
                    {discoveryResults.map((device, index) => (
                      <ListItem key={index} divider>
                        <ListItemIcon>
                          {getDeviceIcon(device.equipmentType)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2">
                                {device.hostname}
                              </Typography>
                              <Chip
                                label={device.equipmentType}
                                size="small"
                                color={getDeviceColor(device.equipmentType)}
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                IP: {device.ipAddress}
                              </Typography>
                              <Typography variant="caption" display="block">
                                {device.manufacturer} {device.model}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Discovery Log */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Discovery Log</Typography>
                <Tooltip title="Clear Log">
                  <IconButton 
                    size="small" 
                    onClick={() => setDiscoveryLog([])}
                    disabled={isDiscovering}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto', p: 1 }}>
                {discoveryLog.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No log entries yet
                  </Typography>
                ) : (
                  <List dense>
                    {discoveryLog.map((entry) => (
                      <ListItem key={entry.id} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {getLogIcon(entry.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {entry.timestamp}
                              </Typography>
                              <Typography variant="body2">
                                {entry.message}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NetworkDiscovery;
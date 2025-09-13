import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Typography,
  IconButton,
  Collapse,
  Grid,
  Divider,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Tune as TuneIcon
} from '@mui/icons-material';

const EnhancedFilters = ({
  filters = {},
  onFiltersChange,
  filterConfigs = [],
  showAdvanced = false,
  onToggleAdvanced,
  loading = false,
  sx = {},
  
  // Search specific props
  searchPlaceholder = "Search...",
  searchField = "search",
  
  // Styling
  variant = "outlined",
  size = "medium",
  
  // Custom renderers
  renderCustomFilter,
  renderFilterChips = true
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [expanded, setExpanded] = useState(showAdvanced);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (field, value) => {
    const newFilters = {
      ...localFilters,
      [field]: value
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {};
    Object.keys(localFilters).forEach(key => {
      if (key !== searchField) {
        clearedFilters[key] = '';
      }
    });
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const handleClearSearch = () => {
    const newFilters = { ...localFilters };
    delete newFilters[searchField];
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.keys(localFilters).filter(key => 
      localFilters[key] && localFilters[key] !== '' && key !== searchField
    ).length;
  };

  const renderFilterChip = (field, value, config) => {
    const label = config?.label || field;
    const color = config?.color || 'default';
    
    return (
      <Chip
        key={field}
        label={`${label}: ${value}`}
        color={color}
        size="small"
        onDelete={() => handleFilterChange(field, '')}
        sx={{ m: 0.5 }}
      />
    );
  };

  const renderSearchField = () => {
    const searchValue = localFilters[searchField] || '';
    
    return (
      <TextField
        fullWidth
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => handleFilterChange(searchField, e.target.value)}
        variant={variant}
        size={size}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: searchValue && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClearSearch}
                edge="end"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ minWidth: 200 }}
      />
    );
  };

  const renderFilterField = (config) => {
    const { field, label, type = 'select', options = [], ...rest } = config;
    const value = localFilters[field] || '';

    switch (type) {
      case 'select':
        return (
          <FormControl fullWidth variant={variant} size={size}>
            <InputLabel>{label}</InputLabel>
            <Select
              value={value}
              label={label}
              onChange={(e) => handleFilterChange(field, e.target.value)}
              disabled={loading}
              {...rest}
            >
              <MenuItem value="">
                <em>All {label}</em>
              </MenuItem>
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      
      case 'text':
        return (
          <TextField
            fullWidth
            label={label}
            value={value}
            onChange={(e) => handleFilterChange(field, e.target.value)}
            variant={variant}
            size={size}
            disabled={loading}
            {...rest}
          />
        );
      
      case 'custom':
        return renderCustomFilter ? renderCustomFilter(config, value, handleFilterChange) : null;
      
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2, ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <FilterIcon color="action" />
          <Typography variant="h6" component="h3">
            Filters
          </Typography>
          {getActiveFiltersCount() > 0 && (
            <Chip
              label={`${getActiveFiltersCount()} active`}
              color="primary"
              size="small"
            />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {getActiveFiltersCount() > 0 && (
            <Button
              size="small"
              onClick={handleClearFilters}
              startIcon={<ClearIcon />}
              disabled={loading}
            >
              Clear All
            </Button>
          )}
          
          {filterConfigs.length > 0 && (
            <Tooltip title={expanded ? "Hide advanced filters" : "Show advanced filters"}>
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                color={expanded ? "primary" : "default"}
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Search Field */}
      <Box sx={{ mb: 2 }}>
        {renderSearchField()}
      </Box>

      {/* Filter Chips */}
      {renderFilterChips && getActiveFiltersCount() > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Active Filters:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(localFilters).map(([field, value]) => {
              if (!value || value === '' || field === searchField) return null;
              
              const config = filterConfigs.find(c => c.field === field);
              return renderFilterChip(field, value, config);
            })}
          </Box>
        </Box>
      )}

      {/* Advanced Filters */}
      {filterConfigs.length > 0 && (
        <Collapse in={expanded}>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            {filterConfigs.map((config) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={config.field}>
                {renderFilterField(config)}
              </Grid>
            ))}
          </Grid>
        </Collapse>
      )}
    </Paper>
  );
};

export default EnhancedFilters; 
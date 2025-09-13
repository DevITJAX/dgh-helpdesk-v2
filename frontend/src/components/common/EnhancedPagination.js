import React from 'react';
import {
  Box,
  TablePagination,
  Typography,
  LinearProgress,
  Chip,
  Tooltip,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import {
  FirstPage as FirstPageIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  LastPage as LastPageIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const EnhancedPagination = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25, 50, 100],
  loading = false,
  showInfo = true,
  showPageSizeSelector = true,
  labelRowsPerPage = "Rows per page:",
  labelDisplayedRows = ({ from, to, count }) => `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`,
  sx = {}
}) => {
  const handleFirstPageButtonClick = () => {
    onPageChange(0);
  };

  const handleBackButtonClick = () => {
    onPageChange(page - 1);
  };

  const handleNextButtonClick = () => {
    onPageChange(page + 1);
  };

  const handleLastPageButtonClick = () => {
    onPageChange(Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  const getItemCount = () => {
    const start = page * rowsPerPage + 1;
    const end = Math.min((page + 1) * rowsPerPage, count);
    return { start, end, total: count };
  };

  const itemCount = getItemCount();
  const totalPages = Math.ceil(count / rowsPerPage);

  return (
    <Box sx={{ 
      position: 'relative',
      backgroundColor: 'background.paper',
      borderTop: 1,
      borderColor: 'divider',
      ...sx 
    }}>
      {/* Loading indicator */}
      {loading && (
        <LinearProgress 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0,
            height: 2
          }} 
        />
      )}

      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: 2,
        py: 1,
        minHeight: 52
      }}>
        {/* Left side - Info and page size selector */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {showInfo && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={<InfoIcon />}
                label={`${itemCount.start}-${itemCount.end} of ${itemCount.total}`}
                size="small"
                variant="outlined"
                color="primary"
              />
              {totalPages > 1 && (
                <Chip
                  label={`Page ${page + 1} of ${totalPages}`}
                  size="small"
                  variant="outlined"
                  color="secondary"
                />
              )}
            </Box>
          )}

          {showPageSizeSelector && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="rows-per-page-label">{labelRowsPerPage}</InputLabel>
              <Select
                labelId="rows-per-page-label"
                value={rowsPerPage}
                label={labelRowsPerPage}
                onChange={(e) => onRowsPerPageChange(e.target.value)}
                disabled={loading}
              >
                {rowsPerPageOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        {/* Right side - Navigation buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="First page">
            <span>
              <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0 || loading}
                aria-label="first page"
                size="small"
              >
                <FirstPageIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Previous page">
            <span>
              <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0 || loading}
                aria-label="previous page"
                size="small"
              >
                <KeyboardArrowLeftIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Typography variant="body2" sx={{ minWidth: 60, textAlign: 'center' }}>
            {page + 1} / {totalPages}
          </Typography>

          <Tooltip title="Next page">
            <span>
              <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= totalPages - 1 || loading}
                aria-label="next page"
                size="small"
              >
                <KeyboardArrowRightIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Last page">
            <span>
              <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= totalPages - 1 || loading}
                aria-label="last page"
                size="small"
              >
                <LastPageIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default EnhancedPagination; 
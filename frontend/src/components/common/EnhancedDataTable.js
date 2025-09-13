import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Skeleton,
  Alert,
  Chip
} from '@mui/material';
import {
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import EnhancedPagination from './EnhancedPagination';

const EnhancedDataTable = ({
  columns = [],
  data = [],
  loading = false,
  error = null,
  emptyMessage = "No data found",
  emptyIcon: EmptyIcon = InfoIcon,
  
  // Pagination props
  pagination = false,
  page = 0,
  rowsPerPage = 10,
  totalCount = 0,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25, 50, 100],
  
  // Styling props
  sx = {},
  tableSx = {},
  containerSx = {},
  
  // Row props
  onRowClick,
  selectedRows = [],
  onRowSelect,
  selectable = false,
  
  // Custom renderers
  renderRow,
  renderEmpty,
  renderLoading,
  renderError
}) => {
  const handleRowClick = (row, index) => {
    if (onRowClick) {
      onRowClick(row, index);
    }
  };

  const handleRowSelect = (row, index) => {
    if (onRowSelect) {
      onRowSelect(row, index);
    }
  };

  const isRowSelected = (row, index) => {
    return selectedRows.some(selectedRow => 
      selectedRow.id === row.id || selectedRow === row
    );
  };

  // Default renderers
  const defaultRenderLoading = () => (
    <TableBody>
      {Array.from({ length: rowsPerPage }).map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          {columns.map((column, colIndex) => (
            <TableCell key={`skeleton-cell-${index}-${colIndex}`}>
              <Skeleton animation="wave" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );

  const defaultRenderEmpty = () => (
    <TableBody>
      <TableRow>
        <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <EmptyIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {emptyMessage}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No data matches your current filters
            </Typography>
          </Box>
        </TableCell>
      </TableRow>
    </TableBody>
  );

  const defaultRenderError = () => (
    <TableBody>
      <TableRow>
        <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <ErrorIcon sx={{ fontSize: 48, color: 'error.main' }} />
            <Typography variant="h6" color="error.main" gutterBottom>
              Error Loading Data
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {error}
            </Typography>
          </Box>
        </TableCell>
      </TableRow>
    </TableBody>
  );

  const defaultRenderRow = (row, index) => {
    const isSelected = isRowSelected(row, index);
    
    return (
      <TableRow
        key={row.id || index}
        hover
        selected={isSelected}
        onClick={() => handleRowClick(row, index)}
        sx={{
          cursor: onRowClick ? 'pointer' : 'default',
          '&:hover': {
            backgroundColor: onRowClick ? 'action.hover' : 'inherit',
          },
          ...(isSelected && {
            backgroundColor: 'primary.light',
            '&:hover': {
              backgroundColor: 'primary.main',
            },
          }),
        }}
      >
        {columns.map((column) => (
          <TableCell
            key={column.field}
            align={column.align || 'left'}
            sx={{
              ...column.sx,
              ...(column.width && { width: column.width }),
              ...(column.minWidth && { minWidth: column.minWidth }),
              ...(column.maxWidth && { maxWidth: column.maxWidth }),
            }}
          >
            {column.render ? column.render(row[column.field], row, index) : row[column.field]}
          </TableCell>
        ))}
      </TableRow>
    );
  };

  return (
    <Paper sx={{ overflow: 'hidden', ...sx }}>
      <TableContainer sx={containerSx}>
        <Table sx={tableSx}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.align || 'left'}
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    backgroundColor: 'background.paper',
                    borderBottom: '2px solid',
                    borderBottomColor: 'divider',
                    ...column.headerSx,
                    ...(column.width && { width: column.width }),
                    ...(column.minWidth && { minWidth: column.minWidth }),
                    ...(column.maxWidth && { maxWidth: column.maxWidth }),
                  }}
                >
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {loading && (renderLoading || defaultRenderLoading)()}
          {error && (renderError || defaultRenderError)()}
          {!loading && !error && data.length === 0 && (renderEmpty || defaultRenderEmpty)()}
          {!loading && !error && data.length > 0 && (
            <TableBody>
              {data.map((row, index) => 
                renderRow ? renderRow(row, index) : defaultRenderRow(row, index)
              )}
            </TableBody>
          )}
        </Table>
      </TableContainer>

      {pagination && (
        <EnhancedPagination
          count={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={rowsPerPageOptions}
          loading={loading}
          showInfo={true}
          showPageSizeSelector={true}
        />
      )}
    </Paper>
  );
};

export default EnhancedDataTable; 
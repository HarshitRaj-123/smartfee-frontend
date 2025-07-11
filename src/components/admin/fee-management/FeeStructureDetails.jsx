import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Close as CloseIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  AccountBalance as AccountBalanceIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const FeeStructureDetails = ({ open, onClose, structure }) => {
  if (!structure) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      active: 'success',
      inactive: 'warning',
      archived: 'error'
    };
    return colors[status] || 'default';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Fee Structure Details
          </Typography>
          <Chip
            label={structure.status}
            color={getStatusColor(structure.status)}
            size="small"
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Course Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Course Information</Typography>
                </Box>
                <List dense>
                  <ListItem disablePadding>
                    <ListItemText
                      primary="Program Name"
                      secondary={structure.programName}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText
                      primary="Branch"
                      secondary={structure.branch}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText
                      primary="Semester"
                      secondary={structure.semester}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText
                      primary="Academic Session"
                      secondary={structure.academicSession}
                    />
                  </ListItem>
                  {structure.courseInfo && (
                    <>
                      <ListItem disablePadding>
                        <ListItemText
                          primary="Category"
                          secondary={structure.courseInfo.category}
                        />
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemText
                          primary="Duration"
                          secondary={structure.courseInfo.duration}
                        />
                      </ListItem>
                    </>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Fee Summary */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AccountBalanceIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Fee Summary</Typography>
                </Box>
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Base Fees Total
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(structure.totalBaseFee)}
                  </Typography>
                </Box>
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Service Fees Total
                  </Typography>
                  <Typography variant="h6" color="secondary">
                    {formatCurrency(structure.totalServiceFee)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Grand Total
                  </Typography>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {formatCurrency(structure.grandTotal)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Base Fees Breakdown */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Base Fee Components ({structure.baseFees?.length || 0} items)
                </Typography>
                {structure.baseFees && structure.baseFees.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Fee Name</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Required</TableCell>
                          <TableCell>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {structure.baseFees.map((fee, index) => (
                          <TableRow key={index}>
                            <TableCell>{fee.name}</TableCell>
                            <TableCell>
                              <Chip label={fee.type} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell>{formatCurrency(fee.amount)}</TableCell>
                            <TableCell>
                              <Chip
                                label={fee.isRequired ? 'Required' : 'Optional'}
                                color={fee.isRequired ? 'success' : 'default'}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>{fee.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="textSecondary">No base fees configured</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Service Fees Breakdown */}
          {structure.serviceFees && structure.serviceFees.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Service Fee Components ({structure.serviceFees.length} items)
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Service Name</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Optional</TableCell>
                          <TableCell>Configuration</TableCell>
                          <TableCell>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {structure.serviceFees.map((fee, index) => (
                          <TableRow key={index}>
                            <TableCell>{fee.name}</TableCell>
                            <TableCell>
                              <Chip label={fee.serviceType} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell>{formatCurrency(fee.amount)}</TableCell>
                            <TableCell>
                              <Chip
                                label={fee.isOptional ? 'Optional' : 'Required'}
                                color={fee.isOptional ? 'default' : 'success'}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {fee.configuration && (
                                <Box>
                                  {fee.configuration.roomType && (
                                    <Typography variant="caption" display="block">
                                      Room: {fee.configuration.roomType}
                                    </Typography>
                                  )}
                                  {fee.configuration.route && (
                                    <Typography variant="caption" display="block">
                                      Route: {fee.configuration.route}
                                    </Typography>
                                  )}
                                  {fee.configuration.distance && (
                                    <Typography variant="caption" display="block">
                                      Distance: {fee.configuration.distance} km
                                    </Typography>
                                  )}
                                  {fee.configuration.eventName && (
                                    <Typography variant="caption" display="block">
                                      Event: {fee.configuration.eventName}
                                    </Typography>
                                  )}
                                </Box>
                              )}
                            </TableCell>
                            <TableCell>{fee.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Assignment Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Assignment Information</Typography>
                </Box>
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Assigned Students
                  </Typography>
                  <Typography variant="h6">
                    {structure.assignedStudents?.length || 0}
                  </Typography>
                </Box>
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Created On
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(structure.createdAt)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Last Modified
                  </Typography>
                  <Typography variant="body1">
                    {structure.updatedAt ? formatDate(structure.updatedAt) : 'Never'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Settings</Typography>
                </Box>
                <List dense>
                  <ListItem disablePadding>
                    <ListItemText
                      primary="Auto-assign to new students"
                      secondary={
                        structure.propagationSettings?.autoAssignToNewStudents
                          ? 'Enabled'
                          : 'Disabled'
                      }
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText
                      primary="Notify on changes"
                      secondary={
                        structure.propagationSettings?.notifyOnChanges
                          ? 'Enabled'
                          : 'Disabled'
                      }
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText
                      primary="Effective From"
                      secondary={
                        structure.propagationSettings?.effectiveFrom
                          ? formatDate(structure.propagationSettings.effectiveFrom)
                          : 'Not set'
                      }
                    />
                  </ListItem>
                  {structure.isTemplate && (
                    <ListItem disablePadding>
                      <ListItemText
                        primary="Template Name"
                        secondary={structure.templateName || 'Unnamed Template'}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Notes */}
          {structure.notes && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Notes
                  </Typography>
                  <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                    {structure.notes}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Audit Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Audit Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="textSecondary">
                      Created By
                    </Typography>
                    <Typography variant="body1">
                      {structure.createdBy?.firstName} {structure.createdBy?.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="textSecondary">
                      Last Modified By
                    </Typography>
                    <Typography variant="body1">
                      {structure.lastModifiedBy?.firstName} {structure.lastModifiedBy?.lastName || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="textSecondary">
                      Modifications
                    </Typography>
                    <Typography variant="body1">
                      {structure.modificationHistory?.length || 0} changes
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeeStructureDetails;
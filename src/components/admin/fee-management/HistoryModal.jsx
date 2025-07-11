import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import {
  Close as CloseIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import * as feeStructureAPI from '../../../services/feeStructureAPI';

const HistoryModal = ({ open, onClose, structure }) => {
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState(null);

  useEffect(() => {
    if (open && structure) {
      fetchHistory();
    }
  }, [open, structure]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await feeStructureAPI.getAssignmentHistory(structure._id);
      setHistoryData(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChangeIcon = (changeType) => {
    switch (changeType) {
      case 'created':
        return <EditIcon />;
      case 'assigned':
        return <AssignmentIcon />;
      case 'modified':
        return <EditIcon />;
      default:
        return <HistoryIcon />;
    }
  };

  const getChangeColor = (changeType) => {
    switch (changeType) {
      case 'created':
        return 'success';
      case 'assigned':
        return 'primary';
      case 'modified':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (!structure) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <HistoryIcon sx={{ mr: 1 }} />
          Fee Structure History & Logs
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {/* Structure Overview */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {structure.programName} - {structure.branch}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Semester {structure.semester} • {structure.academicSession}
                </Typography>
                <Box mt={2}>
                  <Chip
                    label={structure.status}
                    color={structure.status === 'active' ? 'success' : 'default'}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`${historyData?.totalAssigned || 0} students assigned`}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Assignment History */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">
                  Student Assignments ({historyData?.assignedStudents?.length || 0})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {historyData?.assignedStudents?.length > 0 ? (
                  <List>
                    {historyData.assignedStudents.map((assignment, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              assignment.studentId ? 
                                `${assignment.studentId.firstName} ${assignment.studentId.lastName}` :
                                'Student details not available'
                            }
                            secondary={
                              <Box>
                                <Typography variant="caption" display="block">
                                  Student ID: {assignment.studentId?.studentId || 'N/A'}
                                </Typography>
                                <Typography variant="caption" display="block">
                                  Assigned on: {formatDate(assignment.assignedDate)}
                                </Typography>
                                <Typography variant="caption" display="block">
                                  Assigned by: {assignment.assignedBy?.firstName} {assignment.assignedBy?.lastName}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < historyData.assignedStudents.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No students have been assigned to this fee structure yet.
                  </Alert>
                )}
              </AccordionDetails>
            </Accordion>

            {/* Modification History */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">
                  Modification History ({historyData?.modificationHistory?.length || 0})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {historyData?.modificationHistory?.length > 0 ? (
                  <Timeline>
                    {historyData.modificationHistory.map((modification, index) => (
                      <TimelineItem key={index}>
                        <TimelineSeparator>
                          <TimelineDot color="primary">
                            <EditIcon fontSize="small" />
                          </TimelineDot>
                          {index < historyData.modificationHistory.length - 1 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent>
                          <Card variant="outlined" sx={{ mb: 1 }}>
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                                <Typography variant="subtitle2">
                                  {modification.reason || 'Fee structure modified'}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {formatDate(modification.modifiedAt)}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                Modified by: {modification.modifiedBy?.firstName} {modification.modifiedBy?.lastName}
                              </Typography>
                              {modification.changes && (
                                <Box mt={2}>
                                  <Typography variant="caption" color="textSecondary">
                                    Changes made:
                                  </Typography>
                                  <Box component="pre" sx={{ 
                                    fontSize: '0.75rem', 
                                    backgroundColor: 'grey.100', 
                                    p: 1, 
                                    borderRadius: 1,
                                    overflow: 'auto',
                                    maxHeight: 200
                                  }}>
                                    {JSON.stringify(modification.changes, null, 2)}
                                  </Box>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>
                ) : (
                  <Alert severity="info">
                    No modifications have been made to this fee structure.
                  </Alert>
                )}
              </AccordionDetails>
            </Accordion>

            {/* Creation Timeline */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">
                  Creation Timeline
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Timeline>
                  <TimelineItem>
                    <TimelineSeparator>
                      <TimelineDot color="success">
                        <EditIcon fontSize="small" />
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom>
                            Fee Structure Created
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Created by: {structure.createdBy?.firstName} {structure.createdBy?.lastName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(structure.createdAt)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </TimelineContent>
                  </TimelineItem>

                  {structure.status === 'active' && (
                    <TimelineItem>
                      <TimelineSeparator>
                        <TimelineDot color="primary">
                          <ScheduleIcon fontSize="small" />
                        </TimelineDot>
                      </TimelineSeparator>
                      <TimelineContent>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                              Fee Structure Activated
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Status changed to active
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {structure.updatedAt ? formatDate(structure.updatedAt) : 'Date not available'}
                            </Typography>
                          </CardContent>
                        </Card>
                      </TimelineContent>
                    </TimelineItem>
                  )}
                </Timeline>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HistoryModal;
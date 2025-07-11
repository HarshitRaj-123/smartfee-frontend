import React, { useState, useEffect } from 'react';
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
  TextField,
  InputAdornment,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  Cancel as CancelIcon,
  People as PeopleIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useNotification } from '../../../contexts/NotificationContext';
import adminAPI from '../../../services/adminAPI';
import * as feeStructureAPI from '../../../services/feeStructureAPI';

const AssignStudentsModal = ({ open, onClose, structure, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { showNotification } = useNotification();

  useEffect(() => {
    if (open && structure) {
      fetchEligibleStudents();
    }
  }, [open, structure]);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm]);

  const fetchEligibleStudents = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStudents({
        role: 'student',
        isActive: true,
        'courseInfo.program_name': structure.programName,
        'courseInfo.branch': structure.branch,
        currentSemester: structure.semester
      });

      // Filter out students who are already assigned to this fee structure
      const assignedStudentIds = structure.assignedStudents?.map(a => a.studentId._id || a.studentId) || [];
      const eligibleStudents = response.data.filter(student => 
        !assignedStudentIds.includes(student._id)
      );

      setStudents(eligibleStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      showNotification('Failed to fetch eligible students', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(student => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const studentId = student.studentId?.toLowerCase() || '';
      const email = student.email?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();

      return fullName.includes(search) || 
             studentId.includes(search) || 
             email.includes(search);
    });

    setFilteredStudents(filtered);
  };

  const handleStudentToggle = (student) => {
    setSelectedStudents(prev => {
      const isSelected = prev.some(s => s._id === student._id);
      if (isSelected) {
        return prev.filter(s => s._id !== student._id);
      } else {
        return [...prev, student];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents([...filteredStudents]);
    }
  };

  const handleAssign = async () => {
    if (selectedStudents.length === 0) {
      showNotification('Please select at least one student', 'warning');
      return;
    }

    try {
      setLoading(true);
      const studentIds = selectedStudents.map(s => s._id);
      
      await feeStructureAPI.assignToStudents(structure._id, {
        studentIds,
        assignmentType: 'manual'
      });

      showNotification(
        `Fee structure assigned to ${selectedStudents.length} students successfully`,
        'success'
      );
      
      onSuccess();
    } catch (error) {
      showNotification(
        error.response?.data?.message || 'Failed to assign fee structure',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!structure) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <AssignmentIcon sx={{ mr: 1 }} />
          Assign Fee Structure to Students
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Fee Structure Summary */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Fee Structure Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  Program: {structure.programName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Branch: {structure.branch}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Semester: {structure.semester}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Session: {structure.academicSession}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" color="primary">
                  Total Amount: {formatCurrency(structure.grandTotal)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Base Fees: {formatCurrency(structure.totalBaseFee)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Service Fees: {formatCurrency(structure.totalServiceFee)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Search and Selection */}
        <Box mb={2}>
          <TextField
            fullWidth
            placeholder="Search students by name, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Eligible Students ({filteredStudents.length})
          </Typography>
          <Box>
            <Button
              onClick={handleSelectAll}
              size="small"
              disabled={filteredStudents.length === 0}
            >
              {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Chip
              label={`${selectedStudents.length} selected`}
              color="primary"
              size="small"
              sx={{ ml: 1 }}
            />
          </Box>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : filteredStudents.length === 0 ? (
          <Alert severity="info">
            {students.length === 0 
              ? `No eligible students found for ${structure.programName} - ${structure.branch} (Semester ${structure.semester})`
              : 'No students match your search criteria'
            }
          </Alert>
        ) : (
          <Card variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
            <List dense>
              {filteredStudents.map((student, index) => (
                <React.Fragment key={student._id}>
                  <ListItem button onClick={() => handleStudentToggle(student)}>
                    <ListItemIcon>
                      <Checkbox
                        checked={selectedStudents.some(s => s._id === student._id)}
                        onChange={() => handleStudentToggle(student)}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box>
                          <Typography variant="subtitle2">
                            {student.firstName} {student.lastName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            ID: {student.studentId} • {student.email}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            {student.courseInfo?.program_name} - {student.courseInfo?.branch}
                          </Typography>
                          {student.phone && (
                            <Typography variant="caption" color="textSecondary" display="block">
                              Phone: {student.phone}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={`Sem ${student.currentSemester || 'N/A'}`}
                        size="small"
                        variant="outlined"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < filteredStudents.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Card>
        )}

        {/* Assignment Summary */}
        {selectedStudents.length > 0 && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="subtitle2">
              Assignment Summary
            </Typography>
            <Typography variant="body2">
              {selectedStudents.length} students will be assigned the fee structure totaling {formatCurrency(structure.grandTotal)} each.
            </Typography>
            <Typography variant="body2">
              Total fee amount to be assigned: {formatCurrency(structure.grandTotal * selectedStudents.length)}
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} startIcon={<CancelIcon />}>
          Cancel
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          startIcon={<AssignmentIcon />}
          disabled={loading || selectedStudents.length === 0}
        >
          {loading ? 'Assigning...' : `Assign to ${selectedStudents.length} Students`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignStudentsModal;
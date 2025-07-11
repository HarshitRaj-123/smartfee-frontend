import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Chip,
  Divider,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';
import { useNotification } from '../../../contexts/NotificationContext';
import adminAPI from '../../../services/adminAPI';
import * as feeStructureAPI from '../../../services/feeStructureAPI';

const FeeStructureForm = ({ open, onClose, structure, onSuccess }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const { showNotification } = useNotification();

  // Form data
  const [formData, setFormData] = useState({
    programName: '',
    branch: '',
    semester: 1,
    academicSession: '',
    baseFees: feeStructureAPI.getDefaultBaseFees(),
    serviceFees: [],
    isTemplate: false,
    templateName: '',
    propagationSettings: {
      autoAssignToNewStudents: true,
      notifyOnChanges: true,
      effectiveFrom: new Date().toISOString().split('T')[0]
    },
    notes: ''
  });

  const [totals, setTotals] = useState({
    baseFeeTotal: 0,
    serviceFeeTotal: 0,
    grandTotal: 0
  });

  useEffect(() => {
    if (open) {
      fetchCourses();
      if (structure) {
        // Edit mode - populate form with existing data
        setFormData({
          programName: structure.programName || '',
          branch: structure.branch || '',
          semester: structure.semester || 1,
          academicSession: structure.academicSession || '',
          baseFees: structure.baseFees || feeStructureAPI.getDefaultBaseFees(),
          serviceFees: structure.serviceFees || [],
          isTemplate: structure.isTemplate || false,
          templateName: structure.templateName || '',
          propagationSettings: structure.propagationSettings || {
            autoAssignToNewStudents: true,
            notifyOnChanges: true,
            effectiveFrom: new Date().toISOString().split('T')[0]
          },
          notes: structure.notes || ''
        });
      } else {
        // Create mode - reset form
        setFormData({
          programName: '',
          branch: '',
          semester: 1,
          academicSession: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1).toString().slice(-2),
          baseFees: feeStructureAPI.getDefaultBaseFees(),
          serviceFees: [],
          isTemplate: false,
          templateName: '',
          propagationSettings: {
            autoAssignToNewStudents: true,
            notifyOnChanges: true,
            effectiveFrom: new Date().toISOString().split('T')[0]
          },
          notes: ''
        });
      }
    }
  }, [open, structure]);

  useEffect(() => {
    calculateTotals();
  }, [formData.baseFees, formData.serviceFees]);

  const fetchCourses = async () => {
    try {
      const response = await adminAPI.getOrganizedCourses();
      setCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const calculateTotals = () => {
    const baseFeeTotal = formData.baseFees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
    const serviceFeeTotal = formData.serviceFees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
    const grandTotal = baseFeeTotal + serviceFeeTotal;

    setTotals({
      baseFeeTotal,
      serviceFeeTotal,
      grandTotal
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-populate course info when program/branch changes
    if (field === 'programName' || field === 'branch') {
      const course = courses.find(c => 
        c.program_name === (field === 'programName' ? value : formData.programName) &&
        c.branch === (field === 'branch' ? value : formData.branch)
      );
      setSelectedCourse(course);
    }
  };

  const handleBaseFeeChange = (index, field, value) => {
    const updatedFees = [...formData.baseFees];
    updatedFees[index] = {
      ...updatedFees[index],
      [field]: field === 'amount' ? parseFloat(value) || 0 : value
    };
    setFormData(prev => ({ ...prev, baseFees: updatedFees }));
  };

  const handleServiceFeeChange = (index, field, value) => {
    const updatedFees = [...formData.serviceFees];
    if (field.startsWith('configuration.')) {
      const configField = field.split('.')[1];
      updatedFees[index] = {
        ...updatedFees[index],
        configuration: {
          ...updatedFees[index].configuration,
          [configField]: value
        }
      };
    } else {
      updatedFees[index] = {
        ...updatedFees[index],
        [field]: field === 'amount' ? parseFloat(value) || 0 : value
      };
    }
    setFormData(prev => ({ ...prev, serviceFees: updatedFees }));
  };

  const addBaseFee = () => {
    const newFee = {
      name: '',
      amount: 0,
      type: 'base',
      isRequired: true,
      description: '',
      metadata: {}
    };
    setFormData(prev => ({
      ...prev,
      baseFees: [...prev.baseFees, newFee]
    }));
  };

  const removeBaseFee = (index) => {
    const updatedFees = formData.baseFees.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, baseFees: updatedFees }));
  };

  const addServiceFee = () => {
    const newFee = {
      serviceType: 'custom',
      name: '',
      amount: 0,
      isOptional: true,
      configuration: {
        customFields: {}
      },
      description: ''
    };
    setFormData(prev => ({
      ...prev,
      serviceFees: [...prev.serviceFees, newFee]
    }));
  };

  const removeServiceFee = (index) => {
    const updatedFees = formData.serviceFees.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, serviceFees: updatedFees }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validation
      if (!formData.programName || !formData.branch || !formData.semester || !formData.academicSession) {
        showNotification('Please fill in all required fields', 'error');
        return;
      }

      const payload = {
        ...formData,
        totalBaseFee: totals.baseFeeTotal,
        totalServiceFee: totals.serviceFeeTotal,
        grandTotal: totals.grandTotal
      };

      if (structure) {
        // Update existing structure
        await feeStructureAPI.updateFeeStructure(structure._id, payload);
        showNotification('Fee structure updated successfully', 'success');
      } else {
        // Create new structure
        await feeStructureAPI.createFeeStructure(payload);
        showNotification('Fee structure created successfully', 'success');
      }

      onSuccess();
    } catch (error) {
      showNotification(
        error.response?.data?.message || 'Failed to save fee structure',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const CourseSelectionTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Course Information
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel>Program Name</InputLabel>
            <Select
              value={formData.programName}
              label="Program Name"
              onChange={(e) => handleInputChange('programName', e.target.value)}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              }}
            >
              {[...new Set(courses.map(c => c.program_name))].map(program => (
                <MenuItem key={program} value={program}>
                  {program}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel>Branch</InputLabel>
            <Select
              value={formData.branch}
              label="Branch"
              onChange={(e) => handleInputChange('branch', e.target.value)}
              disabled={!formData.programName}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              }}
            >
              {courses
                .filter(c => c.program_name === formData.programName)
                .map(course => (
                  <MenuItem key={course.branch} value={course.branch}>
                    {course.branch}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Semester"
            type="number"
            value={formData.semester}
            onChange={(e) => handleInputChange('semester', parseInt(e.target.value))}
            inputProps={{ min: 1, max: selectedCourse?.totalSemesters || 8 }}
            required
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Academic Session"
            value={formData.academicSession}
            onChange={(e) => handleInputChange('academicSession', e.target.value)}
            placeholder="2024-25"
            required
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isTemplate}
                onChange={(e) => handleInputChange('isTemplate', e.target.checked)}
              />
            }
            label="Save as Template"
          />
        </Grid>

        {formData.isTemplate && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Template Name"
              value={formData.templateName}
              onChange={(e) => handleInputChange('templateName', e.target.value)}
              placeholder="Enter template name for future use"
            />
          </Grid>
        )}

        {selectedCourse && (
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Course Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Category: {selectedCourse.category}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Duration: {selectedCourse.duration}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Total Semesters: {selectedCourse.totalSemesters}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Course Name: {selectedCourse.course_name}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  const BaseFeeTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          Base Fee Components
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addBaseFee}
          size="small"
        >
          Add Fee Component
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fee Name</TableCell>
              <TableCell>Amount (₹)</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Required</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formData.baseFees.map((fee, index) => (
              <TableRow key={index}>
                <TableCell>
                  <TextField
                    fullWidth
                    value={fee.name}
                    onChange={(e) => handleBaseFeeChange(index, 'name', e.target.value)}
                    size="small"
                    required
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    type="number"
                    value={fee.amount}
                    onChange={(e) => handleBaseFeeChange(index, 'amount', e.target.value)}
                    size="small"
                    inputProps={{ min: 0 }}
                  />
                </TableCell>
                <TableCell>
                  <FormControl fullWidth size="small">
                    <Select
                      value={fee.type}
                      onChange={(e) => handleBaseFeeChange(index, 'type', e.target.value)}
                    >
                      {feeStructureAPI.getFeeTypeOptions().map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={fee.isRequired}
                    onChange={(e) => handleBaseFeeChange(index, 'isRequired', e.target.checked)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    value={fee.description}
                    onChange={(e) => handleBaseFeeChange(index, 'description', e.target.value)}
                    size="small"
                    multiline
                    rows={1}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => removeBaseFee(index)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
        <Typography variant="subtitle1" fontWeight="bold">
          Base Fee Total: ₹{totals.baseFeeTotal.toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );

  const ServiceFeeTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          Service Fee Components
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addServiceFee}
          size="small"
        >
          Add Service Fee
        </Button>
      </Box>

      {formData.serviceFees.length === 0 ? (
        <Alert severity="info">
          No service fees added. Click "Add Service Fee" to add optional services like hostel, mess, transport, etc.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {formData.serviceFees.map((fee, index) => (
            <Grid item xs={12} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="between" alignItems="start" mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Service Fee #{index + 1}
                    </Typography>
                    <IconButton
                      onClick={() => removeServiceFee(index)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Service Type</InputLabel>
                        <Select
                          value={fee.serviceType}
                          label="Service Type"
                          onChange={(e) => handleServiceFeeChange(index, 'serviceType', e.target.value)}
                        >
                          {feeStructureAPI.getServiceTypeOptions().map(option => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.icon} {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Service Name"
                        value={fee.name}
                        onChange={(e) => handleServiceFeeChange(index, 'name', e.target.value)}
                        size="small"
                        required
                      />
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Amount (₹)"
                        type="number"
                        value={fee.amount}
                        onChange={(e) => handleServiceFeeChange(index, 'amount', e.target.value)}
                        size="small"
                        inputProps={{ min: 0 }}
                      />
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={fee.isOptional}
                            onChange={(e) => handleServiceFeeChange(index, 'isOptional', e.target.checked)}
                            size="small"
                          />
                        }
                        label="Optional"
                      />
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={fee.description}
                        onChange={(e) => handleServiceFeeChange(index, 'description', e.target.value)}
                        size="small"
                      />
                    </Grid>

                    {/* Service-specific configuration */}
                    {fee.serviceType === 'hostel' && (
                      <Grid item xs={12}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Room Type</InputLabel>
                          <Select
                            value={fee.configuration?.roomType || 'shared'}
                            label="Room Type"
                            onChange={(e) => handleServiceFeeChange(index, 'configuration.roomType', e.target.value)}
                          >
                            {feeStructureAPI.getRoomTypeOptions().map(option => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}

                    {fee.serviceType === 'transport' && (
                      <>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Route Name"
                            value={fee.configuration?.route || ''}
                            onChange={(e) => handleServiceFeeChange(index, 'configuration.route', e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Distance (km)"
                            type="number"
                            value={fee.configuration?.distance || ''}
                            onChange={(e) => handleServiceFeeChange(index, 'configuration.distance', parseFloat(e.target.value) || 0)}
                            size="small"
                          />
                        </Grid>
                      </>
                    )}

                    {fee.serviceType === 'event' && (
                      <>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Event Name"
                            value={fee.configuration?.eventName || ''}
                            onChange={(e) => handleServiceFeeChange(index, 'configuration.eventName', e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Event Date"
                            type="date"
                            value={fee.configuration?.eventDate ? new Date(fee.configuration.eventDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleServiceFeeChange(index, 'configuration.eventDate', e.target.value)}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
        <Typography variant="subtitle1" fontWeight="bold">
          Service Fee Total: ₹{totals.serviceFeeTotal.toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );

  const SettingsTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Propagation Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.propagationSettings.autoAssignToNewStudents}
                onChange={(e) => handleInputChange('propagationSettings', {
                  ...formData.propagationSettings,
                  autoAssignToNewStudents: e.target.checked
                })}
              />
            }
            label="Auto-assign to new students"
          />
          <Typography variant="body2" color="textSecondary">
            Automatically assign this fee structure to new students matching the course criteria
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.propagationSettings.notifyOnChanges}
                onChange={(e) => handleInputChange('propagationSettings', {
                  ...formData.propagationSettings,
                  notifyOnChanges: e.target.checked
                })}
              />
            }
            label="Notify on changes"
          />
          <Typography variant="body2" color="textSecondary">
            Send notifications to students when fee structure is modified
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Effective From"
            type="date"
            value={formData.propagationSettings.effectiveFrom}
            onChange={(e) => handleInputChange('propagationSettings', {
              ...formData.propagationSettings,
              effectiveFrom: e.target.value
            })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            multiline
            rows={4}
            placeholder="Add any additional notes or comments about this fee structure..."
          />
        </Grid>
      </Grid>
    </Box>
  );

  const PreviewTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Fee Structure Preview
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Course Information
              </Typography>
              <Typography><strong>Program:</strong> {formData.programName}</Typography>
              <Typography><strong>Branch:</strong> {formData.branch}</Typography>
              <Typography><strong>Semester:</strong> {formData.semester}</Typography>
              <Typography><strong>Session:</strong> {formData.academicSession}</Typography>
              {formData.isTemplate && (
                <Typography><strong>Template:</strong> {formData.templateName}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Fee Summary
              </Typography>
              <Typography><strong>Base Fees:</strong> ₹{totals.baseFeeTotal.toLocaleString()}</Typography>
              <Typography><strong>Service Fees:</strong> ₹{totals.serviceFeeTotal.toLocaleString()}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" color="primary">
                <strong>Grand Total: ₹{totals.grandTotal.toLocaleString()}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Fee Breakdown
              </Typography>
              
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Base Fees ({formData.baseFees.length} items)
              </Typography>
              {formData.baseFees.map((fee, index) => (
                <Box key={index} display="flex" justifyContent="space-between" mb={1}>
                  <Typography>{fee.name}</Typography>
                  <Typography>₹{fee.amount.toLocaleString()}</Typography>
                </Box>
              ))}

              {formData.serviceFees.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Service Fees ({formData.serviceFees.length} items)
                  </Typography>
                  {formData.serviceFees.map((fee, index) => (
                    <Box key={index} display="flex" justifyContent="space-between" mb={1}>
                      <Typography>{fee.name} {fee.isOptional && <Chip label="Optional" size="small" />}</Typography>
                      <Typography>₹{fee.amount.toLocaleString()}</Typography>
                    </Box>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {structure ? 'Edit Fee Structure' : 'Create Fee Structure'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Course Info" />
            <Tab label="Base Fees" />
            <Tab label="Service Fees" />
            <Tab label="Settings" />
            <Tab label="Preview" />
          </Tabs>
        </Box>

        {activeTab === 0 && <CourseSelectionTab />}
        {activeTab === 1 && <BaseFeeTab />}
        {activeTab === 2 && <ServiceFeeTab />}
        {activeTab === 3 && <SettingsTab />}
        {activeTab === 4 && <PreviewTab />}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} startIcon={<CancelIcon />}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={loading}
        >
          {loading ? 'Saving...' : (structure ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeeStructureForm;
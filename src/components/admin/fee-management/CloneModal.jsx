import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Typography,
  Box,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Cancel as CancelIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useNotification } from '../../../contexts/NotificationContext';
import * as feeStructureAPI from '../../../services/feeStructureAPI';

const CloneModal = ({ open, onClose, structure, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    academicSession: '',
    semester: '',
    templateName: ''
  });
  const { showNotification } = useNotification();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClone = async () => {
    try {
      setLoading(true);

      // Validation
      if (!formData.academicSession && !formData.semester) {
        showNotification('Please specify either a new academic session or semester', 'error');
        return;
      }

      const payload = {
        academicSession: formData.academicSession || structure.academicSession,
        semester: formData.semester ? parseInt(formData.semester) : structure.semester,
        templateName: formData.templateName
      };

      await feeStructureAPI.cloneFeeStructure(structure._id, payload);
      
      showNotification('Fee structure cloned successfully', 'success');
      onSuccess();
    } catch (error) {
      showNotification(
        error.response?.data?.message || 'Failed to clone fee structure',
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <CopyIcon sx={{ mr: 1 }} />
          Clone Fee Structure
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Source Structure Info */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Source Fee Structure
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Program: {structure.programName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Branch: {structure.branch}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Semester: {structure.semester}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Session: {structure.academicSession}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" color="primary">
                  Total Amount: {formatCurrency(structure.grandTotal)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Alert severity="info" sx={{ mb: 3 }}>
          Cloning will create a new fee structure with the same fee components and settings. 
          You can specify a different academic session and/or semester for the new structure.
        </Alert>

        {/* Clone Configuration */}
        <Typography variant="h6" gutterBottom>
          Clone Configuration
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Academic Session"
              value={formData.academicSession}
              onChange={(e) => handleInputChange('academicSession', e.target.value)}
              placeholder={structure.academicSession}
              helperText="Leave empty to use the same session"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Semester"
              type="number"
              value={formData.semester}
              onChange={(e) => handleInputChange('semester', e.target.value)}
              placeholder={structure.semester.toString()}
              inputProps={{ min: 1, max: 12 }}
              helperText="Leave empty to use the same semester"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Template Name (Optional)"
              value={formData.templateName}
              onChange={(e) => handleInputChange('templateName', e.target.value)}
              placeholder="Enter a name for this cloned structure"
              helperText="Useful for identifying this structure later"
            />
          </Grid>
        </Grid>

        {/* Preview */}
        <Box mt={3}>
          <Typography variant="subtitle1" gutterBottom>
            New Structure Preview:
          </Typography>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2">
                <strong>Program:</strong> {structure.programName}
              </Typography>
              <Typography variant="body2">
                <strong>Branch:</strong> {structure.branch}
              </Typography>
              <Typography variant="body2">
                <strong>Semester:</strong> {formData.semester || structure.semester}
              </Typography>
              <Typography variant="body2">
                <strong>Academic Session:</strong> {formData.academicSession || structure.academicSession}
              </Typography>
              <Typography variant="body2">
                <strong>Total Amount:</strong> {formatCurrency(structure.grandTotal)}
              </Typography>
              <Typography variant="body2">
                <strong>Base Fees:</strong> {structure.baseFees?.length || 0} components
              </Typography>
              <Typography variant="body2">
                <strong>Service Fees:</strong> {structure.serviceFees?.length || 0} components
              </Typography>
              {formData.templateName && (
                <Typography variant="body2">
                  <strong>Template Name:</strong> {formData.templateName}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} startIcon={<CancelIcon />}>
          Cancel
        </Button>
        <Button
          onClick={handleClone}
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={loading}
        >
          {loading ? 'Cloning...' : 'Clone Structure'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CloneModal; 
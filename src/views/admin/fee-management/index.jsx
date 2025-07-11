import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  Pagination,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Skeleton,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  ContentCopy as CopyIcon,
  Visibility as ViewIcon,
  Archive as ArchiveIcon,
  PlayArrow as ActivateIcon,
  Assignment as AssignIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  AccountBalance as AccountBalanceIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useNotification } from '../../../contexts/NotificationContext';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import FeeStructureForm from '../../../components/admin/fee-management/FeeStructureForm';
import FeeStructureDetails from '../../../components/admin/fee-management/FeeStructureDetails';
import AssignStudentsModal from '../../../components/admin/fee-management/AssignStudentsModal';
import HistoryModal from '../../../components/admin/fee-management/HistoryModal';
import CloneModal from '../../../components/admin/fee-management/CloneModal';
import * as feeStructureAPI from '../../../services/feeStructureAPI';

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuStructureId, setMenuStructureId] = useState(null);
  
  // Modal states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  
  // Filter and pagination states
  const [filters, setFilters] = useState({
    search: '',
    programName: '',
    branch: '',
    semester: '',
    academicSession: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0
  });

  const { showNotification } = useNotification();

  useEffect(() => {
    fetchFeeStructures();
    fetchStats();
  }, [filters, pagination.page]);

  const fetchFeeStructures = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await feeStructureAPI.getFeeStructures(params);
      setFeeStructures(response.data);
      setPagination(prev => ({
        ...prev,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.totalItems
      }));
    } catch (error) {
      showNotification('Failed to fetch fee structures', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await feeStructureAPI.getFeeStructureStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMenuClick = (event, structureId) => {
    setAnchorEl(event.currentTarget);
    setMenuStructureId(structureId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuStructureId(null);
  };

  const handleAction = (action, structure) => {
    setSelectedStructure(structure);
    handleMenuClose();
    
    switch (action) {
      case 'view':
        setShowDetails(true);
        break;
      case 'edit':
        setShowEditForm(true);
        break;
      case 'clone':
        setShowCloneModal(true);
        break;
      case 'assign':
        setShowAssignModal(true);
        break;
      case 'history':
        setShowHistoryModal(true);
        break;
      case 'activate':
        handleActivate(structure._id);
        break;
      case 'archive':
        handleArchive(structure._id);
        break;
    }
  };

  const handleActivate = async (id) => {
    try {
      await feeStructureAPI.activateFeeStructure(id);
      showNotification('Fee structure activated successfully', 'success');
      fetchFeeStructures();
      fetchStats();
    } catch (error) {
      showNotification('Failed to activate fee structure', 'error');
    }
  };

  const handleArchive = async (id) => {
    try {
      await feeStructureAPI.archiveFeeStructure(id, 'Archived by admin');
      showNotification('Fee structure archived successfully', 'success');
      fetchFeeStructures();
      fetchStats();
    } catch (error) {
      showNotification('Failed to archive fee structure', 'error');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box color={color}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );

  const CourseFeesTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Course Fees
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Academic Year</InputLabel>
            <Select
              value={filters.academicSession}
              label="Academic Year"
              onChange={(e) => handleFilterChange('academicSession', e.target.value)}
            >
              <MenuItem value="">All Years</MenuItem>
              <MenuItem value="2024-25">2024-25</MenuItem>
              <MenuItem value="2025-26">2025-26</MenuItem>
              <MenuItem value="2026-27">2026-27</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Dashboard Stats */}
      {stats && (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Structures"
              value={stats.counts.active}
              icon={<SchoolIcon fontSize="large" />}
              color="success.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Draft Structures"
              value={stats.counts.draft}
              icon={<EditIcon fontSize="large" />}
              color="warning.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Structures"
              value={stats.counts.total}
              icon={<AccountBalanceIcon fontSize="large" />}
              color="primary.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Active Value"
              value={formatCurrency(stats.totalActiveAmount)}
              icon={<TrendingUpIcon fontSize="large" />}
              color="info.main"
              subtitle="Combined value"
            />
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by program, branch, or course..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Program</InputLabel>
                <Select
                  value={filters.programName}
                  label="Program"
                  onChange={(e) => handleFilterChange('programName', e.target.value)}
                >
                  <MenuItem value="">All Programs</MenuItem>
                  {/* Add program options dynamically */}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Branch</InputLabel>
                <Select
                  value={filters.branch}
                  label="Branch"
                  onChange={(e) => handleFilterChange('branch', e.target.value)}
                >
                  <MenuItem value="">All Branches</MenuItem>
                  {/* Add branch options dynamically */}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Semester</InputLabel>
                <Select
                  value={filters.semester}
                  label="Semester"
                  onChange={(e) => handleFilterChange('semester', e.target.value)}
                >
                  <MenuItem value="">All Semesters</MenuItem>
                  {[1,2,3,4,5,6,7,8].map(sem => (
                    <MenuItem key={sem} value={sem}>{sem}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Course Fees Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Course Fee Structures
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Program</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Branch</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Semester</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Academic Year</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Total Fee</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Base Fee</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Service Fee</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Assigned Students</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feeStructures.length > 0 ? (
                      feeStructures.map((structure) => (
                        <TableRow key={structure._id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {structure.programName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {structure.branch}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {structure.semester}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {structure.academicSession}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1" fontWeight="bold" color="primary">
                              {formatCurrency(structure.grandTotal)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatCurrency(structure.totalBaseFee)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatCurrency(structure.totalServiceFee)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={structure.status}
                              color={getStatusColor(structure.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <PeopleIcon fontSize="small" color="action" />
                              <Typography variant="body2">
                                {structure.assignedStudents?.length || 0}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={(e) => handleMenuClick(e, structure._id)}
                              size="small"
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} align="center">
                          <Typography color="textSecondary" py={4}>
                            No fee structures found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.page}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  const ServiceFeesTab = () => {
    const [baseFees, setBaseFees] = useState(feeStructureAPI.getDefaultBaseFees());
    const [editingFee, setEditingFee] = useState(null);
    const [showAddFee, setShowAddFee] = useState(false);

    const handleFeeChange = (index, field, value) => {
      const updatedFees = [...baseFees];
      updatedFees[index] = {
        ...updatedFees[index],
        [field]: field === 'amount' ? parseFloat(value) || 0 : value
      };
      setBaseFees(updatedFees);
    };

    const handleAddFee = () => {
      const newFee = {
        name: '',
        amount: 0,
        type: 'base',
        isRequired: true,
        description: ''
      };
      setBaseFees([...baseFees, newFee]);
      setShowAddFee(false);
    };

    const handleRemoveFee = (index) => {
      const updatedFees = baseFees.filter((_, i) => i !== index);
      setBaseFees(updatedFees);
    };

    const handleSaveChanges = async () => {
      try {
        // Here you would typically save the changes to the backend
        showNotification('Fee components updated successfully', 'success');
      } catch (error) {
        showNotification('Failed to update fee components', 'error');
      }
    };

    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            Base Fee Components Management
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddFee}
            >
              Add Fee Component
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveChanges}
            >
              Save Changes
            </Button>
          </Box>
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Standard Fee Components
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Manage the standard fee components that will be available when creating fee structures.
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Fee Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Default Amount (₹)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Required</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {baseFees.map((fee, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={fee.name}
                          onChange={(e) => handleFeeChange(index, 'name', e.target.value)}
                          size="small"
                          variant="outlined"
                          sx={{ minWidth: 150 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          type="number"
                          value={fee.amount}
                          onChange={(e) => handleFeeChange(index, 'amount', e.target.value)}
                          size="small"
                          variant="outlined"
                          inputProps={{ min: 0, step: 0.01 }}
                          sx={{ minWidth: 120 }}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={fee.type}
                            onChange={(e) => handleFeeChange(index, 'type', e.target.value)}
                          >
                            {feeStructureAPI.getFeeTypeOptions().map(option => (
                              <MenuItem key={option.value} value={option.value}>
                                <Chip 
                                  label={option.label} 
                                  size="small" 
                                  color={option.color}
                                  variant="outlined"
                                />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={fee.isRequired}
                            onChange={(e) => handleFeeChange(index, 'isRequired', e.target.value)}
                          >
                            <MenuItem value={true}>
                              <Chip label="Required" color="error" size="small" />
                            </MenuItem>
                            <MenuItem value={false}>
                              <Chip label="Optional" color="default" size="small" />
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={fee.description}
                          onChange={(e) => handleFeeChange(index, 'description', e.target.value)}
                          size="small"
                          variant="outlined"
                          multiline
                          maxRows={2}
                          sx={{ minWidth: 200 }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleRemoveFee(index)}
                          color="error"
                          size="small"
                          title="Remove Fee Component"
                        >
                          <ArchiveIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box mt={3}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Note:</strong> These are the standard fee components that will be available when creating new fee structures. 
                  You can customize amounts for each fee structure individually. Changes here will affect the default values for new structures.
                </Typography>
              </Alert>
            </Box>
          </CardContent>
        </Card>

        {/* Service Fee Types Section */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Additional Service Types
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              These optional services can be added to fee structures as needed.
            </Typography>
            <Grid container spacing={2}>
              {feeStructureAPI.getServiceTypeOptions().map((service) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={service.value}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="h4">{service.icon}</Typography>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {service.label}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Optional service
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    );
  };

  const LogsTab = () => (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Fee Structure Logs
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        View detailed logs and history for each fee structure by clicking on the "History" action in the Course Fees tab.
      </Alert>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <Typography color="textSecondary">
            Activity logs will be displayed here when fee structures are modified or assigned.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box p={3}>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Fee Management
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Create, modify, assign, and track fee structures and service-based fees dynamically
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateForm(true)}
          size="large"
        >
          Create New Fee Structure
        </Button>
      </Box>

      <Card>
        <Box borderBottom={1} borderColor="divider">
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Course Fees" />
            <Tab label="Service Fees" />
            <Tab label="Logs" />
          </Tabs>
        </Box>

        <CardContent>
          {activeTab === 0 && <CourseFeesTab />}
          {activeTab === 1 && <ServiceFeesTab />}
          {activeTab === 2 && <LogsTab />}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('view', feeStructures.find(s => s._id === menuStructureId))}>
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleAction('edit', feeStructures.find(s => s._id === menuStructureId))}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleAction('clone', feeStructures.find(s => s._id === menuStructureId))}>
          <CopyIcon sx={{ mr: 1 }} />
          Clone
        </MenuItem>
        <MenuItem onClick={() => handleAction('assign', feeStructures.find(s => s._id === menuStructureId))}>
          <AssignIcon sx={{ mr: 1 }} />
          Assign to Students
        </MenuItem>
        <MenuItem onClick={() => handleAction('history', feeStructures.find(s => s._id === menuStructureId))}>
          <HistoryIcon sx={{ mr: 1 }} />
          View History
        </MenuItem>
        <MenuItem onClick={() => handleAction('activate', feeStructures.find(s => s._id === menuStructureId))}>
          <ActivateIcon sx={{ mr: 1 }} />
          Activate
        </MenuItem>
        <MenuItem onClick={() => handleAction('archive', feeStructures.find(s => s._id === menuStructureId))}>
          <ArchiveIcon sx={{ mr: 1 }} />
          Archive
        </MenuItem>
      </Menu>

      {/* Modals */}
      <FeeStructureForm
        open={showCreateForm || showEditForm}
        onClose={() => {
          setShowCreateForm(false);
          setShowEditForm(false);
          setSelectedStructure(null);
        }}
        structure={showEditForm ? selectedStructure : null}
        onSuccess={() => {
          fetchFeeStructures();
          fetchStats();
          setShowCreateForm(false);
          setShowEditForm(false);
          setSelectedStructure(null);
        }}
      />

      <FeeStructureDetails
        open={showDetails}
        onClose={() => {
          setShowDetails(false);
          setSelectedStructure(null);
        }}
        structure={selectedStructure}
      />

      <AssignStudentsModal
        open={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedStructure(null);
        }}
        structure={selectedStructure}
        onSuccess={() => {
          fetchFeeStructures();
          setShowAssignModal(false);
          setSelectedStructure(null);
        }}
      />

      <HistoryModal
        open={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setSelectedStructure(null);
        }}
        structure={selectedStructure}
      />

      <CloneModal
        open={showCloneModal}
        onClose={() => {
          setShowCloneModal(false);
          setSelectedStructure(null);
        }}
        structure={selectedStructure}
        onSuccess={() => {
          fetchFeeStructures();
          fetchStats();
          setShowCloneModal(false);
          setSelectedStructure(null);
        }}
      />
    </Box>
  );
};

export default FeeManagement; 
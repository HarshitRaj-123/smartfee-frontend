import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import FeeStructureForm from '../../../components/admin/fee-management/FeeStructureForm';
import FeeStructureDetails from '../../../components/admin/fee-management/FeeStructureDetails';
import AssignStudentsModal from '../../../components/admin/fee-management/AssignStudentsModal';
import HistoryModal from '../../../components/admin/fee-management/HistoryModal';
import CloneModal from '../../../components/admin/fee-management/CloneModal';
import * as feeStructureAPI from '../../../services/feeStructureAPI';
import { useAuth } from '../../../contexts/AuthContext';
import { assignAllFeeStructures } from '../../../services/feeStructureAPI';

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuStructureId, setMenuStructureId] = useState(null);
  const buttonRefs = useRef({}); // Store refs for each row
  
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

  const { showSuccess, showError } = useNotification();
  const { user } = useAuth();
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    // Clear all filters on initial mount
    setFilters({
      search: '',
      programName: '',
      branch: '',
      semester: '',
      academicSession: '',
      status: ''
    });
  }, []);

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
      console.log('Fee Structures API response:', response); // Debug log
      setFeeStructures(response.data || []); // Fix: use correct property
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.pagination?.totalPages || 1,
        totalItems: response.data.pagination?.totalItems || 0
      }));
    } catch (error) {
      showError('Failed to fetch fee structures');
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

  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
  };

  const handleMenuClick = (structureId) => {
    setAnchorEl(buttonRefs.current[structureId]);
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
      showSuccess('Fee structure activated successfully');
      fetchFeeStructures();
      fetchStats();
    } catch (error) {
      showError('Failed to activate fee structure');
    }
  };

  const handleArchive = async (id) => {
    try {
      await feeStructureAPI.archiveFeeStructure(id, 'Archived by admin');
      showSuccess('Fee structure archived successfully');
      fetchFeeStructures();
      fetchStats();
    } catch (error) {
      showError('Failed to archive fee structure');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
        </div>
        <div className={`text-3xl ${color}`}>{icon}</div>
      </div>
    </div>
  );

  const CourseFeesTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Course Fees</h2>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <select
              value={filters.academicSession}
              onChange={(e) => handleFilterChange('academicSession', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">All Years</option>
              <option value="2024-25">2024-25</option>
              <option value="2025-26">2025-26</option>
              <option value="2026-27">2026-27</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Active Structures"
              value={stats.counts.active}
            icon={<span className="material-symbols-outlined">school</span>}
            color="text-green-600"
            />
            <StatCard
              title="Draft Structures"
              value={stats.counts.draft}
            icon={<span className="material-symbols-outlined">edit</span>}
            color="text-yellow-600"
            />
            <StatCard
              title="Total Structures"
              value={stats.counts.total}
            icon={<span className="material-symbols-outlined">account_balance</span>}
            color="text-blue-600"
            />
            <StatCard
              title="Total Active Value"
              value={formatCurrency(stats.totalActiveAmount)}
            icon={<span className="material-symbols-outlined">trending_up</span>}
            color="text-indigo-600"
              subtitle="Combined value"
            />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
          <div className="md:col-span-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">search</span>
              <input
                type="text"
                placeholder="Search by program, branch, or course..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div>
            <select
                  value={filters.programName}
                  onChange={(e) => handleFilterChange('programName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
              <option value="">All Programs</option>
                  {/* Add program options dynamically */}
            </select>
          </div>
          <div>
            <select
                  value={filters.branch}
                  onChange={(e) => handleFilterChange('branch', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
              <option value="">All Branches</option>
                  {/* Add branch options dynamically */}
            </select>
          </div>
          <div>
            <select
                  value={filters.semester}
                  onChange={(e) => handleFilterChange('semester', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
              <option value="">All Semesters</option>
                  {[1,2,3,4,5,6,7,8].map(sem => (
                <option key={sem} value={sem}>{sem}</option>
                  ))}
            </select>
          </div>
          <div>
            <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fee Structures Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
          <div className="p-8 text-center">
            <LoadingSpinner />
          </div>
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee Structure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Students
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {feeStructures.map((structure) => (
                    <tr key={structure._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                              {structure.programName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {structure.branch} • Semester {structure.semester}
                          </div>
                          <div className="text-xs text-gray-400">
                              {structure.academicSession}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(structure.totalAmount)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {structure.feeItems?.length || 0} components
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(structure.status)}`}>
                          {structure.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {structure.assignedStudents?.length || 0} assigned
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="relative">
                          <button
                            ref={(el) => (buttonRefs.current[structure._id] = el)}
                            onClick={() => handleMenuClick(structure._id)}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
                          
                          {anchorEl === buttonRefs.current[structure._id] && menuStructureId === structure._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                              <div className="py-1">
                                <button
                                  onClick={() => handleAction('view', structure)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <span className="material-symbols-outlined mr-3 text-sm">visibility</span>
                                  View Details
                                </button>
                                <button
                                  onClick={() => handleAction('edit', structure)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <span className="material-symbols-outlined mr-3 text-sm">edit</span>
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleAction('clone', structure)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <span className="material-symbols-outlined mr-3 text-sm">content_copy</span>
                                  Clone
                                </button>
                                <button
                                  onClick={() => handleAction('assign', structure)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                  <span className="material-symbols-outlined mr-3 text-sm">assignment</span>
                                  Assign Students
                                </button>
                                <button
                                  onClick={() => handleAction('history', structure)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <span className="material-symbols-outlined mr-3 text-sm">history</span>
                                  History
                                </button>
                                {structure.status === 'draft' && (
                                  <button
                                    onClick={() => handleAction('activate', structure)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                  >
                                    <span className="material-symbols-outlined mr-3 text-sm">play_arrow</span>
                                    Activate
                                  </button>
                                )}
                                {structure.status !== 'archived' && (
                                  <button
                                    onClick={() => handleAction('archive', structure)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                  >
                                    <span className="material-symbols-outlined mr-3 text-sm">archive</span>
                                    Archive
                                  </button>
                    )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.totalItems)}
                      </span>{' '}
                      of <span className="font-medium">{pagination.totalItems}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                      </button>
                      
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.page
                              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
              )}
            </>
          )}
      </div>
    </div>
  );

  const ServiceFeesTab = () => {
    const [serviceFees, setServiceFees] = useState([
      { name: 'Hostel Fee', amount: 50000, description: 'Accommodation and basic amenities' },
      { name: 'Mess Fee', amount: 30000, description: 'Daily meals and dining facilities' },
      { name: 'Transport Fee', amount: 15000, description: 'Bus transportation services' },
      { name: 'Library Fee', amount: 5000, description: 'Library access and resources' },
      { name: 'Laboratory Fee', amount: 10000, description: 'Lab equipment and materials' }
    ]);

    const handleFeeChange = (index, field, value) => {
      const updatedFees = [...serviceFees];
      updatedFees[index][field] = value;
      setServiceFees(updatedFees);
    };

    const handleAddFee = () => {
      setServiceFees([...serviceFees, { name: '', amount: 0, description: '' }]);
    };

    const handleRemoveFee = (index) => {
      const updatedFees = serviceFees.filter((_, i) => i !== index);
      setServiceFees(updatedFees);
    };

    const handleSaveChanges = async () => {
      try {
        // API call to save service fees
        showSuccess('Service fees updated successfully');
      } catch (error) {
        showError('Failed to update service fees');
      }
    };

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Service Fees</h2>
          <div className="flex gap-3">
            <button
              onClick={handleAddFee}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center"
            >
              <span className="material-symbols-outlined mr-2 text-sm">add</span>
              Add Fee Component
            </button>
            <button
              onClick={handleSaveChanges}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
            >
              <span className="material-symbols-outlined mr-2 text-sm">save</span>
              Save Changes
            </button>
          </div>
        </div>

        {/* Service Fee Components */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Standard Fee Components</h3>
          <p className="text-gray-600 mb-6">
            These are the standard fee components that will be available when creating new fee structures. 
            You can customize amounts for each fee structure individually.
          </p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {serviceFees.map((fee, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                          value={fee.name}
                          onChange={(e) => handleFeeChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                          type="number"
                          value={fee.amount}
                        onChange={(e) => handleFeeChange(index, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <textarea
                          value={fee.description}
                          onChange={(e) => handleFeeChange(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                          onClick={() => handleRemoveFee(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                          title="Remove Fee Component"
                        >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </td>
                  </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                  <strong>Note:</strong> These are the standard fee components that will be available when creating new fee structures. 
                  You can customize amounts for each fee structure individually. Changes here will affect the default values for new structures.
              </p>
            </div>
          </div>
        </div>

        {/* Service Fee Types Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Service Types</h3>
          <p className="text-gray-600 mb-6">
              These optional services can be added to fee structures as needed.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {feeStructureAPI.getServiceTypeOptions().map((service) => (
              <div key={service.value} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{service.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{service.label}</h4>
                    <p className="text-sm text-gray-500">Optional service</p>
                  </div>
                </div>
              </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  const LogsTab = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Fee Structure Logs</h2>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800">
        View detailed logs and history for each fee structure by clicking on the "History" action in the Course Fees tab.
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <p className="text-gray-600">
            Activity logs will be displayed here when fee structures are modified or assigned.
        </p>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Fee Management</h1>
          <p className="text-gray-600">
            Create, modify, assign, and track fee structures and service-based fees dynamically
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center"
        >
          <span className="material-symbols-outlined mr-2">add</span>
          Create New Fee Structure
        </button>
      </div>

      {/* Assign All Fee Structures Button for super_admin/admin */}
      {(user?.role === 'super_admin' || user?.role === 'admin') && (
        <button
          className="mb-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={async () => {
            setAssignLoading(true);
            try {
              const result = await assignAllFeeStructures();
              showSuccess(`${result.message} Assigned: ${result.totalAssigned}, Skipped: ${result.totalSkipped}`);
              fetchFeeStructures();
            } catch (err) {
              showError('Failed to assign all fee structures');
            } finally {
              setAssignLoading(false);
            }
          }}
          disabled={assignLoading}
        >
          {assignLoading ? 'Assigning...' : 'Assign All Fee Structures to Eligible Students'}
        </button>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => handleTabChange(0)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 0
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Course Fees
            </button>
            <button
              onClick={() => handleTabChange(1)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 1
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Service Fees
            </button>
            <button
              onClick={() => handleTabChange(2)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 2
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Logs
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 0 && <CourseFeesTab />}
          {activeTab === 1 && <ServiceFeesTab />}
          {activeTab === 2 && <LogsTab />}
        </div>
      </div>

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
    </div>
  );
};

export default FeeManagement; 
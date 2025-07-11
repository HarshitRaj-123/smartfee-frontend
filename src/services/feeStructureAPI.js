import api from './api';

const BASE_URL = '/fee-structures';

// Get all fee structures with filtering and pagination
export const getFeeStructures = async (params = {}) => {
  try {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching fee structures:', error);
    throw error;
  }
};

// Get dashboard statistics
export const getFeeStructureStats = async () => {
  try {
    const response = await api.get(`${BASE_URL}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching fee structure stats:', error);
    throw error;
  }
};

// Get single fee structure by ID
export const getFeeStructureById = async (id) => {
  try {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching fee structure:', error);
    throw error;
  }
};

// Create new fee structure
export const createFeeStructure = async (data) => {
  try {
    const response = await api.post(BASE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating fee structure:', error);
    throw error;
  }
};

// Update fee structure
export const updateFeeStructure = async (id, data) => {
  try {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating fee structure:', error);
    throw error;
  }
};

// Clone fee structure
export const cloneFeeStructure = async (id, data) => {
  try {
    const response = await api.post(`${BASE_URL}/${id}/clone`, data);
    return response.data;
  } catch (error) {
    console.error('Error cloning fee structure:', error);
    throw error;
  }
};

// Assign fee structure to students
export const assignToStudents = async (id, data) => {
  try {
    const response = await api.post(`${BASE_URL}/${id}/assign`, data);
    return response.data;
  } catch (error) {
    console.error('Error assigning fee structure:', error);
    throw error;
  }
};

// Get assignment history
export const getAssignmentHistory = async (id) => {
  try {
    const response = await api.get(`${BASE_URL}/${id}/history`);
    return response.data;
  } catch (error) {
    console.error('Error fetching assignment history:', error);
    throw error;
  }
};

// Activate fee structure
export const activateFeeStructure = async (id) => {
  try {
    const response = await api.put(`${BASE_URL}/${id}/activate`);
    return response.data;
  } catch (error) {
    console.error('Error activating fee structure:', error);
    throw error;
  }
};

// Archive fee structure
export const archiveFeeStructure = async (id, reason = '') => {
  try {
    const response = await api.put(`${BASE_URL}/${id}/archive`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error archiving fee structure:', error);
    throw error;
  }
};

// Helper functions for form data
export const getDefaultBaseFees = () => [
  { name: 'Tuition Fee', amount: 0, type: 'base', isRequired: true, description: 'Core academic fee' },
  { name: 'Admission Fee', amount: 0, type: 'base', isRequired: true, description: 'One-time or recurring' },
  { name: 'Examination Fee', amount: 0, type: 'base', isRequired: true, description: 'Per semester' },
  { name: 'Library Fee', amount: 0, type: 'base', isRequired: true, description: 'Per semester' },
  { name: 'Lab Fee', amount: 0, type: 'base', isRequired: false, description: 'Depending on course' },
  { name: 'Dress Fee', amount: 0, type: 'base', isRequired: false, description: 'If applicable' },
  { name: 'ID Card Fee', amount: 0, type: 'base', isRequired: false, description: 'One-time or renewal' },
  { name: 'Document Fee', amount: 0, type: 'base', isRequired: false, description: 'Per request or fixed' },
  { name: 'ERP Charges', amount: 0, type: 'base', isRequired: false, description: 'Platform fee' },
  { name: 'Indiscipline Fine', amount: 0, type: 'fine', isRequired: false, description: 'Optional, auto-calculated later' },
  { name: 'Regular Fine', amount: 0, type: 'fine', isRequired: false, description: 'Late fees, etc.' }
];

export const getDefaultServiceFees = () => [
  {
    serviceType: 'hostel',
    name: 'Hostel Fee',
    amount: 0,
    isOptional: true,
    configuration: {
      roomType: 'shared',
      customFields: {}
    },
    description: 'Accommodation charges'
  },
  {
    serviceType: 'mess',
    name: 'Mess Fee',
    amount: 0,
    isOptional: true,
    configuration: {
      customFields: {}
    },
    description: 'Food and dining charges'
  },
  {
    serviceType: 'transport',
    name: 'Transport Fee',
    amount: 0,
    isOptional: true,
    configuration: {
      route: '',
      distance: 0,
      pickupPoints: [],
      customFields: {}
    },
    description: 'Transportation charges'
  }
];

export const getRoomTypeOptions = () => [
  { value: 'single', label: 'Single Room' },
  { value: 'shared', label: 'Shared Room' },
  { value: 'ac-single', label: 'AC Single Room' },
  { value: 'ac-shared', label: 'AC Shared Room' },
  { value: 'deluxe', label: 'Deluxe Room' }
];

export const getServiceTypeOptions = () => [
  { value: 'hostel', label: 'Hostel', icon: '🏠' },
  { value: 'mess', label: 'Mess', icon: '🍽️' },
  { value: 'transport', label: 'Transport', icon: '🚌' },
  { value: 'event', label: 'Event', icon: '🎉' },
  { value: 'workshop', label: 'Workshop', icon: '🔧' },
  { value: 'certification', label: 'Certification', icon: '📜' },
  { value: 'custom', label: 'Custom', icon: '⚙️' }
];

export const getFeeTypeOptions = () => [
  { value: 'base', label: 'Base Fee', color: 'blue' },
  { value: 'service', label: 'Service Fee', color: 'green' },
  { value: 'event', label: 'Event Fee', color: 'purple' },
  { value: 'fine', label: 'Fine', color: 'red' },
  { value: 'misc', label: 'Miscellaneous', color: 'gray' },
  { value: 'custom', label: 'Custom', color: 'orange' }
];

export const getStatusOptions = () => [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'inactive', label: 'Inactive', color: 'yellow' },
  { value: 'archived', label: 'Archived', color: 'red' }
];

export default {
  getFeeStructures,
  getFeeStructureStats,
  getFeeStructureById,
  createFeeStructure,
  updateFeeStructure,
  cloneFeeStructure,
  assignToStudents,
  getAssignmentHistory,
  activateFeeStructure,
  archiveFeeStructure,
  getDefaultBaseFees,
  getDefaultServiceFees,
  getRoomTypeOptions,
  getServiceTypeOptions,
  getFeeTypeOptions,
  getStatusOptions
}; 
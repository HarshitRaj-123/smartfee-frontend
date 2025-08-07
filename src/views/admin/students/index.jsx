import React, { useState, useEffect } from 'react';
import adminAPI from '../../../services/adminAPI';
import { useNotification } from '../../../contexts/NotificationContext';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AddStudentModal from '../../../components/common/AddStudentModal';
import ImportStudentsModal from '../../../components/admin/ImportStudentsModal';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [modalType, setModalType] = useState(''); // 'view', 'edit', 'status'
    const [showFilters, setShowFilters] = useState(false);
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [showImportStudentsModal, setShowImportStudentsModal] = useState(false);
    const [editStudent, setEditStudent] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    
    // Filters and pagination
    const [filters, setFilters] = useState({
        search: '',
        courseId: '',
        semester: '',
        paymentStatus: '',
        admissionYear: '',
        status: 'active',
        hostelOpted: '',
        messOpted: '',
        transportOpted: ''
    });
    
    const [pagination, setPagination] = useState({
        current: 1,
        limit: 20,
        total: 0,
        totalRecords: 0
    });

    const [sortConfig, setSortConfig] = useState({
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });

    const { addNotification } = useNotification();

    // Fetch students when filters, pagination, or sort changes
    useEffect(() => {
        fetchStudents();
    }, [filters, pagination.current, sortConfig]);

    // Fetch courses only once on component mount
    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const params = {
                ...filters,
                page: pagination.current,
                limit: pagination.limit,
                ...sortConfig
            };
            
            const response = await adminAPI.getStudents(params);
            setStudents(response.data.data.students);
            setPagination(prev => ({
                ...prev,
                ...response.data.data.pagination
            }));
        } catch (error) {
            console.error('Error fetching students:', error);
            addNotification('Failed to fetch students', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            console.log('Fetching courses...');
            const response = await adminAPI.getCoursesList();
            console.log('Courses response:', response.data);
            setCourses(response.data.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
            addNotification('Failed to fetch courses', 'error');
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleSort = (field) => {
        setSortConfig(prev => ({
            sortBy: field,
            sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedStudents(students.map(s => s._id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSelectStudent = (studentId, checked) => {
        if (checked) {
            setSelectedStudents(prev => [...prev, studentId]);
        } else {
            setSelectedStudents(prev => prev.filter(id => id !== studentId));
        }
    };

    const openModal = async (type, student = null) => {
        setModalType(type);
        if (student && type === 'view') {
            try {
                const response = await adminAPI.getStudentById(student._id);
                setModalData(response.data.data);
            } catch (error) {
                addNotification('Failed to fetch student details', 'error');
                return;
            }
        } else {
            setModalData(student);
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalData(null);
        setModalType('');
    };

    const handleStatusUpdate = async (studentId, action, reason = '') => {
        try {
            await adminAPI.updateStudentStatus(studentId, action, reason);
            addNotification(`Student ${action}ed successfully`, 'success');
            fetchStudents();
            closeModal();
        } catch (error) {
            addNotification(`Failed to ${action} student`, 'error');
        }
    };

    const handleDeleteStudent = async (studentId) => {
        if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) return;
        try {
            await adminAPI.deleteStudent(studentId);
            addNotification('Student deleted successfully', 'success');
            fetchStudents();
        } catch (error) {
            addNotification('Failed to delete student', 'error');
        }
    };

    const handleEditStudent = (student) => {
        setEditStudent(student);
        setShowEditModal(true);
    };

    const handlePromoteSemester = async (student) => {
        if (!window.confirm(`Promote ${student.firstName} ${student.lastName} to next semester?`)) return;
        try {
            await adminAPI.updateStudent(student._id, { currentSemester: (student.currentSemester || 1) + 1 });
            addNotification('Student promoted to next semester', 'success');
            fetchStudents();
        } catch (error) {
            addNotification('Failed to promote student', 'error');
        }
    };

    const getStatusBadge = (student) => {
        if (!student.isActive) {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Blocked</span>;
        }
        if (student.academicStatus === 'hold') {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Hold</span>;
        }
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
    };

    const getPaymentStatusBadge = (feeInfo) => {
        if (feeInfo.status === 'paid') {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Paid</span>;
        }
        if (feeInfo.status === 'partial') {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Partial</span>;
        }
        if (feeInfo.status === 'overdue') {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Overdue</span>;
        }
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Due</span>;
    };

    const getServiceIndicators = (student) => {
        const services = [];
        if (student.servicesOpted?.hostel?.isOpted) services.push('🏠');
        if (student.servicesOpted?.mess?.isOpted) services.push('🍽️');
        if (student.servicesOpted?.transport?.isOpted) services.push('🚌');
        if (student.servicesOpted?.library?.isOpted) services.push('📚');
        return services.join(' ');
    };

    const clearAllFilters = () => {
        setFilters({
            search: '',
            courseId: '',
            semester: '',
            paymentStatus: '',
            admissionYear: '',
            status: 'active',
            hostelOpted: '',
            messOpted: '',
            transportOpted: ''
        });
        setPagination(prev => ({ ...prev, current: 1 }));
        setShowFilters(false);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.courseId) count++;
        if (filters.semester) count++;
        if (filters.paymentStatus) count++;
        if (filters.admissionYear) count++;
        if (filters.status !== 'active') count++;
        if (filters.hostelOpted !== '') count++;
        if (filters.messOpted !== '') count++;
        if (filters.transportOpted !== '') count++;
        return count;
    };

    if (loading && students.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-6">
            {/* Header with Actions */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <p className="text-gray-600">Manage student accounts and information</p>
                </div>
                <div className="flex gap-3">
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={() => setShowAddStudentModal(true)}
                    >
                        Add Student
                    </button>
                    <button
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        onClick={() => setShowImportStudentsModal(true)}
                    >
                        Import Students
                    </button>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex gap-4 items-center">
                    {/* Search */}
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search by name, roll number, email, or student ID..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                    
                    {/* Filter Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                        >
                            <span>Filters</span>
                            {getActiveFiltersCount() > 0 && (
                                <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                    {getActiveFiltersCount()}
                                </span>
                            )}
                            <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Filter Dropdown */}
                        {showFilters && (
                            <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                <div className="p-4 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-medium text-gray-900">Filters</h3>
                                        <button
                                            onClick={clearAllFilters}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Course Filter */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Course</label>
                                            <select
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                value={filters.courseId}
                                                onChange={(e) => handleFilterChange('courseId', e.target.value)}
                                            >
                                                <option value="">All Courses</option>
                                                {courses.map(course => (
                                                    <option key={course._id} value={course._id}>
                                                        {course.code}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        {/* Status Filter */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                                            <select
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                value={filters.status}
                                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                            >
                                                <option value="active">Active</option>
                                                <option value="blocked">Blocked</option>
                                                <option value="hold">On Hold</option>
                                                <option value="all">All Status</option>
                                            </select>
                                        </div>
                                        
                                        {/* Semester Filter */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Semester</label>
                                            <select
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                value={filters.semester}
                                                onChange={(e) => handleFilterChange('semester', e.target.value)}
                                            >
                                                <option value="">All Semesters</option>
                                                {[1,2,3,4,5,6,7,8,9,10].map(sem => (
                                                    <option key={sem} value={sem}>Semester {sem}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        {/* Payment Status Filter */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Payment</label>
                                            <select
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                value={filters.paymentStatus}
                                                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                                            >
                                                <option value="">All Payments</option>
                                                <option value="paid">Paid</option>
                                                <option value="partial">Partial</option>
                                                <option value="unpaid">Due</option>
                                                <option value="overdue">Overdue</option>
                                            </select>
                                        </div>
                                        
                                        {/* Hostel Filter */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Hostel</label>
                                            <select
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                value={filters.hostelOpted}
                                                onChange={(e) => handleFilterChange('hostelOpted', e.target.value)}
                                            >
                                                <option value="">All</option>
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        </div>
                                        
                                        {/* Mess Filter */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Mess</label>
                                            <select
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                value={filters.messOpted}
                                                onChange={(e) => handleFilterChange('messOpted', e.target.value)}
                                            >
                                                <option value="">All</option>
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        </div>
                                        
                                        {/* Transport Filter */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Transport</label>
                                            <select
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                value={filters.transportOpted}
                                                onChange={(e) => handleFilterChange('transportOpted', e.target.value)}
                                            >
                                                <option value="">All</option>
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        </div>
                                        
                                        {/* Admission Year Filter */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
                                            <select
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                value={filters.admissionYear}
                                                onChange={(e) => handleFilterChange('admissionYear', e.target.value)}
                                            >
                                                <option value="">All Years</option>
                                                {[2024, 2023, 2022, 2021, 2020].map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedStudents.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <span className="text-blue-800 font-medium">
                            {selectedStudents.length} student(s) selected
                        </span>
                        <div className="flex gap-2">
                            <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                                Bulk Promote
                            </button>
                            <button className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700">
                                Send Reminder
                            </button>
                            <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                                Block Selected
                            </button>
                            <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                                Export Selected
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Students Table */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Students ({pagination.totalRecords})
                        </h2>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => fetchStudents()}
                                className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                                Refresh
                            </button>
                            <span className="text-gray-400">|</span>
                            <button className="text-blue-600 hover:text-blue-700 text-sm">
                                Export All
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedStudents.length === students.length && students.length > 0}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('firstName')}
                                >
                                    Name & ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Course
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('currentSemester')}
                                >
                                    Semester
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fee Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Services
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('enrollmentDate')}
                                >
                                    Enrollment
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student) => (
                                <tr key={student._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.includes(student._id)}
                                            onChange={(e) => handleSelectStudent(student._id, e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {student.firstName} {student.lastName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Admission No: {student.studentId || '—'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {student.courseId?.code || student.courseInfo?.program_name || '—'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {student.courseId?.program_name || student.courseInfo?.branch || '—'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {student.currentSemester}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            ₹{student.feeInfo?.totalFee?.toLocaleString() || '0'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Paid: ₹{student.feeInfo?.paidAmount?.toLocaleString() || '0'}
                                        </div>
                                        <div className="text-sm text-red-600">
                                            Due: ₹{student.feeInfo?.dueAmount?.toLocaleString() || '0'}
                                        </div>
                                        {getPaymentStatusBadge(student.feeInfo || {})}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <span className="text-lg">
                                            {getServiceIndicators(student) || '—'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {student.enrollmentDate
                                            ? new Date(student.enrollmentDate).toLocaleDateString()
                                            : (student.yearOfJoining ? student.yearOfJoining : '—')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(student)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openModal('view', student)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="View Details"
                                            >
                                                👁️
                                            </button>
                                            <button
                                                onClick={() => handleEditStudent(student)}
                                                className="text-green-600 hover:text-green-900"
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => openModal('status', student)}
                                                className="text-yellow-600 hover:text-yellow-900"
                                                title="Change Status"
                                            >
                                                🔄
                                            </button>
                                            <button
                                                onClick={() => handlePromoteSemester(student)}
                                                className="text-purple-600 hover:text-purple-900"
                                                title="Promote Semester"
                                            >
                                                ⬆️
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStudent(student._id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete Student"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing {((pagination.current - 1) * pagination.limit) + 1} to {Math.min(pagination.current * pagination.limit, pagination.totalRecords)} of {pagination.totalRecords} results
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, current: Math.max(1, prev.current - 1) }))}
                                disabled={pagination.current === 1}
                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1 text-sm text-gray-700">
                                Page {pagination.current} of {pagination.total}
                            </span>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, current: Math.min(pagination.total, prev.current + 1) }))}
                                disabled={pagination.current === pagination.total}
                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Student Details Modal */}
            {showModal && modalType === 'view' && modalData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Student Profile - {modalData.firstName} {modalData.lastName}
                                </h3>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                    ✕
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-3">Basic Information</h4>
                                    <div className="space-y-2 text-sm">
                                        <div><strong>Name:</strong> {modalData.firstName} {modalData.lastName}</div>
                                        <div><strong>Student ID:</strong> {modalData.studentId}</div>
                                        <div><strong>Roll Number:</strong> {modalData.rollNumber}</div>
                                        <div><strong>Email:</strong> {modalData.email}</div>
                                        <div><strong>Phone:</strong> {modalData.phone}</div>
                                        <div><strong>Gender:</strong> {modalData.gender || 'Not specified'}</div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-3">Academic Details</h4>
                                    <div className="space-y-2 text-sm">
                                        <div><strong>Course:</strong> {modalData.courseId?.name}</div>
                                        <div><strong>Program:</strong> {modalData.courseId?.program_name}</div>
                                        <div><strong>Current Semester:</strong> {modalData.currentSemester}</div>
                                        <div><strong>Academic Year:</strong> {modalData.academicYear}</div>
                                        <div><strong>Enrollment Date:</strong> {modalData.enrollmentDate ? new Date(modalData.enrollmentDate).toLocaleDateString() : 'Not specified'}</div>
                                        <div><strong>Status:</strong> {getStatusBadge(modalData)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Services Opted */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-800 mb-3">Services Opted</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 p-3 rounded">
                                        <div className="font-medium">Hostel</div>
                                        <div className="text-sm text-gray-600">
                                            {modalData.servicesOpted?.hostel?.isOpted ? (
                                                <>
                                                    <div>✅ Opted</div>
                                                    <div>Room: {modalData.servicesOpted.hostel.roomType}</div>
                                                    <div>Block: {modalData.servicesOpted.hostel.blockName}</div>
                                                </>
                                            ) : '❌ Not opted'}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-3 rounded">
                                        <div className="font-medium">Mess</div>
                                        <div className="text-sm text-gray-600">
                                            {modalData.servicesOpted?.mess?.isOpted ? (
                                                <>
                                                    <div>✅ Opted</div>
                                                    <div>Type: {modalData.servicesOpted.mess.mealType}</div>
                                                </>
                                            ) : '❌ Not opted'}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-3 rounded">
                                        <div className="font-medium">Transport</div>
                                        <div className="text-sm text-gray-600">
                                            {modalData.servicesOpted?.transport?.isOpted ? (
                                                <>
                                                    <div>✅ Opted</div>
                                                    <div>Route: {modalData.servicesOpted.transport.route}</div>
                                                </>
                                            ) : '❌ Not opted'}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-3 rounded">
                                        <div className="font-medium">Library</div>
                                        <div className="text-sm text-gray-600">
                                            {modalData.servicesOpted?.library?.isOpted ? (
                                                <>
                                                    <div>✅ Opted</div>
                                                    <div>Card: {modalData.servicesOpted.library.cardNumber}</div>
                                                </>
                                            ) : '❌ Not opted'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Fee History */}
                            {modalData.feeHistory && modalData.feeHistory.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-semibold text-gray-800 mb-3">Fee History</h4>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-3 py-2 text-left">Semester</th>
                                                    <th className="px-3 py-2 text-left">Academic Year</th>
                                                    <th className="px-3 py-2 text-left">Total Fee</th>
                                                    <th className="px-3 py-2 text-left">Paid</th>
                                                    <th className="px-3 py-2 text-left">Due</th>
                                                    <th className="px-3 py-2 text-left">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {modalData.feeHistory.map((fee, index) => (
                                                    <tr key={index} className="border-t">
                                                        <td className="px-3 py-2">{fee.semester}</td>
                                                        <td className="px-3 py-2">{fee.academicYear}</td>
                                                        <td className="px-3 py-2">₹{fee.netAmount?.toLocaleString()}</td>
                                                        <td className="px-3 py-2">₹{fee.totalPaid?.toLocaleString()}</td>
                                                        <td className="px-3 py-2">₹{fee.balanceDue?.toLocaleString()}</td>
                                                        <td className="px-3 py-2">{getPaymentStatusBadge(fee)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => openModal('edit', modalData)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Edit Student
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {showModal && modalType === 'status' && modalData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full mx-4">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Update Student Status
                            </h3>
                        </div>
                        
                        <div className="p-6">
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-4">
                                    Current status of <strong>{modalData.firstName} {modalData.lastName}</strong>: {getStatusBadge(modalData)}
                                </p>
                                
                                <div className="space-y-3">
                                    {modalData.isActive ? (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(modalData._id, 'block', 'Blocked by admin')}
                                                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                                            >
                                                Block Student
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(modalData._id, 'hold', 'Academic hold')}
                                                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700"
                                            >
                                                Put on Hold
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleStatusUpdate(modalData._id, 'unblock')}
                                            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                                        >
                                            Unblock Student
                                        </button>
                                    )}
                                    
                                    {modalData.academicStatus === 'hold' && (
                                        <button
                                            onClick={() => handleStatusUpdate(modalData._id, 'activate')}
                                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                                        >
                                            Remove Hold
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <AddStudentModal
                isOpen={showAddStudentModal}
                onClose={() => setShowAddStudentModal(false)}
                onSuccess={() => {
                    setShowAddStudentModal(false);
                    fetchStudents();
                }}
                courses={courses}
            />
            <AddStudentModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={() => {
                    setShowEditModal(false);
                    fetchStudents();
                }}
                courses={courses}
                editStudent={editStudent}
            />
            <ImportStudentsModal
                isOpen={showImportStudentsModal}
                onClose={() => setShowImportStudentsModal(false)}
                onSuccess={() => {
                    setShowImportStudentsModal(false);
                    fetchStudents();
                }}
            />
        </div>
    );
};

export default Students; 
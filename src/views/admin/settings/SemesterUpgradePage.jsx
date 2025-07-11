import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import adminAPI from '../../../services/adminAPI';

const SemesterUpgradePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('eligible');
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [eligibleStudents, setEligibleStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [upgradeHistory, setUpgradeHistory] = useState([]);
    const [upgradeStats, setUpgradeStats] = useState({});
    const [bulkUpgradeData, setBulkUpgradeData] = useState({
        reason: '',
        notes: '',
        excludeStudents: []
    });

    const tabs = [
        { id: 'eligible', label: 'Eligible Students', icon: '👥' },
        { id: 'bulk-upgrade', label: 'Bulk Upgrade', icon: '🚀' },
        { id: 'history', label: 'Upgrade History', icon: '📜' },
        { id: 'statistics', label: 'Statistics', icon: '📊' }
    ];

    // Fetch initial data
    useEffect(() => {
        fetchCourses();
        fetchUpgradeStats();
    }, []);

    // Fetch eligible students when filters change
    useEffect(() => {
        if (selectedCourse || selectedSemester) {
            fetchEligibleStudents();
        }
    }, [selectedCourse, selectedSemester]);

    const fetchCourses = async () => {
        try {
            const response = await adminAPI.getAllCourses();
            setCourses(response.data || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchEligibleStudents = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedCourse) params.courseId = selectedCourse;
            if (selectedSemester) params.currentSemester = selectedSemester;

            const response = await fetch('/api/semester-upgrade/eligible-students?' + new URLSearchParams(params), {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setEligibleStudents(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching eligible students:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUpgradeHistory = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/semester-upgrade/history', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setUpgradeHistory(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching upgrade history:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUpgradeStats = async () => {
        try {
            const response = await fetch('/api/semester-upgrade/statistics', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setUpgradeStats(data.data || {});
            }
        } catch (error) {
            console.error('Error fetching upgrade stats:', error);
        }
    };

    const handleStudentSelection = (studentId, isSelected) => {
        if (isSelected) {
            setSelectedStudents(prev => [...prev, studentId]);
        } else {
            setSelectedStudents(prev => prev.filter(id => id !== studentId));
        }
    };

    const handleSelectAll = (isSelected) => {
        if (isSelected) {
            setSelectedStudents(eligibleStudents.map(student => student._id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleBulkUpgrade = async () => {
        if (selectedStudents.length === 0) {
            alert('Please select at least one student to upgrade');
            return;
        }

        if (!bulkUpgradeData.reason.trim()) {
            alert('Please provide a reason for the upgrade');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/semester-upgrade/bulk-upgrade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    studentIds: selectedStudents,
                    reason: bulkUpgradeData.reason,
                    notes: bulkUpgradeData.notes,
                    excludeStudents: bulkUpgradeData.excludeStudents
                })
            });

            const data = await response.json();
            
            if (data.success) {
                alert(`Successfully upgraded ${data.data.successful.length} students`);
                setSelectedStudents([]);
                setBulkUpgradeData({ reason: '', notes: '', excludeStudents: [] });
                fetchEligibleStudents();
                fetchUpgradeStats();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error during bulk upgrade:', error);
            alert('Failed to upgrade students');
        } finally {
            setLoading(false);
        }
    };

    const handleSingleUpgrade = async (studentId) => {
        const reason = prompt('Enter reason for upgrade:');
        if (!reason) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/semester-upgrade/student/${studentId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ reason })
            });

            const data = await response.json();
            
            if (data.success) {
                alert('Student upgraded successfully');
                fetchEligibleStudents();
                fetchUpgradeStats();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error upgrading student:', error);
            alert('Failed to upgrade student');
        } finally {
            setLoading(false);
        }
    };

    const renderEligibleStudents = () => (
        <div className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Course</label>
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Courses</option>
                        {courses.map(course => (
                            <option key={course._id} value={course._id}>
                                {course.name} ({course.code})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Current Semester</label>
                    <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Semesters</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Students List */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading eligible students...</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {eligibleStudents.length > 0 && (
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedStudents.length === eligibleStudents.length}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="mr-2"
                                />
                                <span className="font-medium">Select All ({eligibleStudents.length} students)</span>
                            </label>
                            <span className="text-sm text-gray-600">
                                {selectedStudents.length} selected
                            </span>
                        </div>
                    )}

                    {eligibleStudents.map(student => (
                        <div key={student._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedStudents.includes(student._id)}
                                    onChange={(e) => handleStudentSelection(student._id, e.target.checked)}
                                    className="mr-3"
                                />
                                <div>
                                    <h4 className="font-medium text-gray-900">
                                        {student.firstName} {student.lastName}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        ID: {student.studentId} | Course: {student.courseId?.name} | 
                                        Current Semester: {student.currentSemester}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleSingleUpgrade(student._id)}
                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                            >
                                Upgrade
                            </button>
                        </div>
                    ))}

                    {eligibleStudents.length === 0 && !loading && (
                        <div className="text-center py-8 text-gray-500">
                            <p>No eligible students found for upgrade</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderBulkUpgrade = () => (
        <div className="space-y-6">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2">⚠️ Bulk Upgrade Warning</h3>
                <p className="text-sm text-yellow-700">
                    This action will upgrade multiple students simultaneously. Please ensure you have selected the correct students 
                    and provided appropriate reason for the upgrade.
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upgrade Reason *</label>
                    <select
                        value={bulkUpgradeData.reason}
                        onChange={(e) => setBulkUpgradeData(prev => ({ ...prev, reason: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Reason</option>
                        <option value="semester_completion">Semester Completion</option>
                        <option value="academic_promotion">Academic Promotion</option>
                        <option value="administrative_decision">Administrative Decision</option>
                        <option value="batch_upgrade">Batch Upgrade</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                    <textarea
                        value={bulkUpgradeData.notes}
                        onChange={(e) => setBulkUpgradeData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter any additional notes for this upgrade..."
                    />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <h4 className="font-medium text-gray-900">Selected Students</h4>
                        <p className="text-sm text-gray-600">{selectedStudents.length} students selected for upgrade</p>
                    </div>
                    <button
                        onClick={handleBulkUpgrade}
                        disabled={loading || selectedStudents.length === 0 || !bulkUpgradeData.reason}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Upgrading...' : `Upgrade ${selectedStudents.length} Students`}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderHistory = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Recent Upgrades</h3>
                <button
                    onClick={fetchUpgradeHistory}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                </div>
            ) : (
                <div className="space-y-2">
                    {upgradeHistory.map(log => (
                        <div key={log._id} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium text-gray-900">
                                        {log.studentId?.firstName} {log.studentId?.lastName}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Upgraded from Semester {log.fromSemester} to {log.toSemester}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Reason: {log.upgradeReason} | Type: {log.upgradeType}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        log.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        log.status === 'failed' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {log.status}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(log.upgradeDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {upgradeHistory.length === 0 && !loading && (
                        <div className="text-center py-8 text-gray-500">
                            <p>No upgrade history found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderStatistics = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Total Upgrades</h3>
                <p className="text-3xl font-bold text-blue-600">{upgradeStats.totalUpgrades || 0}</p>
                <p className="text-sm text-blue-600">This Academic Year</p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Successful Upgrades</h3>
                <p className="text-3xl font-bold text-green-600">{upgradeStats.successfulUpgrades || 0}</p>
                <p className="text-sm text-green-600">Completed Successfully</p>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Pending Upgrades</h3>
                <p className="text-3xl font-bold text-yellow-600">{upgradeStats.pendingUpgrades || 0}</p>
                <p className="text-sm text-yellow-600">In Progress</p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">Students Eligible</h3>
                <p className="text-3xl font-bold text-purple-600">{eligibleStudents.length}</p>
                <p className="text-sm text-purple-600">Ready for Upgrade</p>
            </div>

            <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Failed Upgrades</h3>
                <p className="text-3xl font-bold text-red-600">{upgradeStats.failedUpgrades || 0}</p>
                <p className="text-sm text-red-600">Requires Attention</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Courses Active</h3>
                <p className="text-3xl font-bold text-gray-600">{courses.length}</p>
                <p className="text-sm text-gray-600">Total Active Courses</p>
            </div>
        </div>
    );

    return (
        <div className="p-6">
            {/* Header with Back Button */}
            <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={() => navigate(`/dashboard/${user?.id}/settings`)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Settings
                    </button>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">🎓 Semester Upgradation</h1>
                <p className="text-gray-600">Manage student semester upgrades and academic progression</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                if (tab.id === 'history') fetchUpgradeHistory();
                            }}
                            className={`py-4 px-2 border-b-2 font-medium text-sm ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-md p-6">
                {activeTab === 'eligible' && renderEligibleStudents()}
                {activeTab === 'bulk-upgrade' && renderBulkUpgrade()}
                {activeTab === 'history' && renderHistory()}
                {activeTab === 'statistics' && renderStatistics()}
            </div>
        </div>
    );
};

export default SemesterUpgradePage; 
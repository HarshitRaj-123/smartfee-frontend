import React from 'react';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AccountantDashboard = () => {
    const { user } = useAuth();
    const { profile, dashboardData, assignedStudents, isDashboardLoading, isProfileLoading } = useUser();

    if (isDashboardLoading || isProfileLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className='p-6'>
            {/* Welcome Header with User-Specific Info */}
            <div className='mb-6'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-3xl font-bold text-gray-800 mb-2'>
                            Welcome back, {profile?.firstName || user?.firstName}!
                        </h1>
                        <p className='text-gray-600'>
                            Accountant
                            {profile?.employeeId && ` • Employee ID: ${profile.employeeId}`}
                            {profile?.department && ` • ${profile.department}`}
                        </p>
                        {profile?.email && (
                            <p className='text-sm text-gray-500 mt-1'>
                                {profile.email}
                            </p>
                        )}
                    </div>
                    <div className='text-right'>
                        <div className='text-sm text-gray-500'>Today's Date</div>
                        <div className='text-sm font-medium text-gray-700'>
                            {new Date().toLocaleDateString()}
                        </div>
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                            profile?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                            {profile?.status || 'Active'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Accountant Performance Stats */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
                <div className='bg-white rounded-lg shadow-md p-6'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <p className='text-sm font-medium text-gray-600'>Students Assigned</p>
                            <p className='text-2xl font-bold text-blue-600'>
                                {dashboardData?.personalStats?.studentsAssigned || assignedStudents?.length || '0'}
                            </p>
                        </div>
                        <div className='text-3xl text-blue-500'>👥</div>
                    </div>
                </div>

                <div className='bg-white rounded-lg shadow-md p-6'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <p className='text-sm font-medium text-gray-600'>Payments Processed</p>
                            <p className='text-2xl font-bold text-green-600'>
                                {dashboardData?.personalStats?.paymentsProcessed || '0'}
                            </p>
                        </div>
                        <div className='text-3xl text-green-500'>✅</div>
                    </div>
                </div>

                <div className='bg-white rounded-lg shadow-md p-6'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <p className='text-sm font-medium text-gray-600'>Pending Verifications</p>
                            <p className='text-2xl font-bold text-orange-600'>
                                {dashboardData?.personalStats?.pendingVerifications || '0'}
                            </p>
                        </div>
                        <div className='text-3xl text-orange-500'>⏳</div>
                    </div>
                </div>

                <div className='bg-white rounded-lg shadow-md p-6'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <p className='text-sm font-medium text-gray-600'>Monthly Collections</p>
                            <p className='text-2xl font-bold text-purple-600'>
                                ₹{dashboardData?.personalStats?.monthlyCollections || '0'}
                            </p>
                        </div>
                        <div className='text-3xl text-purple-500'>💰</div>
                    </div>
                </div>
            </div>

            {/* Accountant Actions & Recent Activity */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                <div className='bg-white rounded-lg shadow-md p-6'>
                    <h3 className='text-lg font-semibold text-gray-800 mb-4'>Quick Actions</h3>
                    <div className='space-y-3'>
                        <button className='w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-left'>
                            <div className='font-medium'>Process Payment</div>
                            <div className='text-sm opacity-90'>Record new student payment</div>
                        </button>
                        <button className='w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-left'>
                            <div className='font-medium'>Verify Transactions</div>
                            <div className='text-sm opacity-90'>Review pending payments</div>
                        </button>
                        <button className='w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-left'>
                            <div className='font-medium'>Generate Receipt</div>
                            <div className='text-sm opacity-90'>Create payment receipts</div>
                        </button>
                        <button className='w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors text-left'>
                            <div className='font-medium'>Send Reminders</div>
                            <div className='text-sm opacity-90'>Notify students about dues</div>
                        </button>
                    </div>
                </div>

                <div className='bg-white rounded-lg shadow-md p-6'>
                    <h3 className='text-lg font-semibold text-gray-800 mb-4'>Recent Activity</h3>
                    <div className='space-y-3'>
                        {dashboardData?.recentActivities?.length > 0 ? (
                            dashboardData.recentActivities.map((activity, index) => (
                                <div key={index} className='flex items-center space-x-3 p-3 bg-gray-50 rounded'>
                                    <div className='flex-1'>
                                        <div className='text-sm text-gray-600'>{activity.description}</div>
                                        <div className='text-xs text-gray-400'>{activity.date}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className='text-center py-4 text-gray-500'>
                                <div className='text-4xl mb-2'>📊</div>
                                <p>No recent activity</p>
                                <p className='text-sm'>Your payment processing activity will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Assigned Students Overview */}
            <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>Your Assigned Students</h3>
                {assignedStudents?.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {assignedStudents.slice(0, 6).map((student, index) => (
                            <div key={index} className='p-4 bg-gray-50 rounded-lg'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <div className='font-medium text-gray-800'>{student.name}</div>
                                        <div className='text-sm text-gray-600'>{student.studentId}</div>
                                        <div className='text-xs text-gray-500'>{student.department}</div>
                                    </div>
                                    <div className='text-right'>
                                        <div className={`text-xs px-2 py-1 rounded ${
                                            student.feeStatus === 'paid' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {student.feeStatus || 'Pending'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='text-center py-8 text-gray-500'>
                        <div className='text-4xl mb-2'>👥</div>
                        <p>No students assigned yet</p>
                        <p className='text-sm'>Students will be assigned to you for fee management</p>
                    </div>
                )}
                {assignedStudents?.length > 6 && (
                    <div className='mt-4 text-center'>
                        <button className='text-blue-600 hover:text-blue-800 text-sm font-medium'>
                            View All {assignedStudents.length} Students
                        </button>
                    </div>
                )}
            </div>

            {/* Accountant Profile */}
            <div className='bg-white rounded-lg shadow-md p-6'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>Your Profile</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                        <h4 className='font-medium text-gray-700 mb-2'>Personal Information</h4>
                        <div className='space-y-2 text-sm'>
                            <div><strong>Name:</strong> {profile?.firstName} {profile?.lastName}</div>
                            <div><strong>Email:</strong> {profile?.email}</div>
                            {profile?.phone && <div><strong>Phone:</strong> {profile.phone}</div>}
                            {profile?.employeeId && <div><strong>Employee ID:</strong> {profile.employeeId}</div>}
                        </div>
                    </div>
                    <div>
                        <h4 className='font-medium text-gray-700 mb-2'>Work Information</h4>
                        <div className='space-y-2 text-sm'>
                            <div><strong>Role:</strong> 
                                <span className='ml-2 px-2 py-1 rounded text-xs bg-blue-100 text-blue-800'>
                                    Accountant
                                </span>
                            </div>
                            {profile?.department && <div><strong>Department:</strong> {profile.department}</div>}
                            {profile?.joinDate && <div><strong>Join Date:</strong> {new Date(profile.joinDate).toLocaleDateString()}</div>}
                            <div><strong>Status:</strong> 
                                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                    profile?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {profile?.status || 'Active'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountantDashboard;
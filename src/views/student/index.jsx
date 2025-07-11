import React from 'react';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StudentDashboard = () => {
    const { user } = useAuth();
    const { profile, dashboardData, fees, transactions, isDashboardLoading, isProfileLoading } = useUser();

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
                            {profile?.studentId && `Student ID: ${profile.studentId}`}
                            {profile?.department && ` • ${profile.department}`}
                        </p>
                        {profile?.email && (
                            <p className='text-sm text-gray-500 mt-1'>
                                {profile.email}
                            </p>
                        )}
                    </div>
                    <div className='text-right'>
                        <div className='text-sm text-gray-500'>Status</div>
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            profile?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                            {profile?.status || 'Active'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Personal Stats */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
                <div className='bg-white rounded-lg shadow-md p-6'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <p className='text-sm font-medium text-gray-600'>Outstanding Fees</p>
                            <p className='text-2xl font-bold text-red-600'>
                                ₹{dashboardData?.personalStats?.outstandingFees || '0'}
                            </p>
                        </div>
                        <div className='text-3xl text-red-500'>💳</div>
                    </div>
                </div>

                <div className='bg-white rounded-lg shadow-md p-6'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <p className='text-sm font-medium text-gray-600'>Paid Fees</p>
                            <p className='text-2xl font-bold text-green-600'>
                                ₹{dashboardData?.personalStats?.paidFees || '0'}
                            </p>
                        </div>
                        <div className='text-3xl text-green-500'>✅</div>
                    </div>
                </div>

                <div className='bg-white rounded-lg shadow-md p-6'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <p className='text-sm font-medium text-gray-600'>Upcoming Payments</p>
                            <p className='text-2xl font-bold text-orange-600'>
                                {dashboardData?.personalStats?.upcomingPayments || '0'}
                            </p>
                        </div>
                        <div className='text-3xl text-orange-500'>⏰</div>
                    </div>
                </div>

                <div className='bg-white rounded-lg shadow-md p-6'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <p className='text-sm font-medium text-gray-600'>Total Transactions</p>
                            <p className='text-2xl font-bold text-blue-600'>
                                {dashboardData?.personalStats?.totalTransactions || '0'}
                            </p>
                        </div>
                        <div className='text-3xl text-blue-500'>📊</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                <div className='bg-white rounded-lg shadow-md p-6'>
                    <h3 className='text-lg font-semibold text-gray-800 mb-4'>Quick Actions</h3>
                    <div className='space-y-3'>
                        <button className='w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors'>
                            Pay Fees Online
                        </button>
                        <button className='w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors'>
                            View Fee Structure
                        </button>
                        <button className='w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors'>
                            Download Receipt
                        </button>
                    </div>
                </div>

                <div className='bg-white rounded-lg shadow-md p-6'>
                    <h3 className='text-lg font-semibold text-gray-800 mb-4'>Recent Activity</h3>
                    <div className='space-y-3'>
                        {dashboardData?.recentActivities?.length > 0 ? (
                            dashboardData.recentActivities.map((activity, index) => (
                                <div key={index} className='flex items-center space-x-3 p-2 bg-gray-50 rounded'>
                                    <div className='text-sm text-gray-600'>{activity.description}</div>
                                    <div className='text-xs text-gray-400'>{activity.date}</div>
                                </div>
                            ))
                        ) : (
                            <div className='text-center py-4 text-gray-500'>
                                <div className='text-4xl mb-2'>📋</div>
                                <p>No recent activity</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Summary */}
            <div className='bg-white rounded-lg shadow-md p-6'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>Your Profile</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                        <h4 className='font-medium text-gray-700 mb-2'>Personal Information</h4>
                        <div className='space-y-2 text-sm'>
                            <div><strong>Student Name:</strong> {profile?.firstName} {profile?.lastName}</div>
                            <div><strong>Email:</strong> {profile?.email}</div>
                            {profile?.phone && <div><strong>Phone:</strong> {profile.phone}</div>}
                            {profile?.dateOfBirth && <div><strong>Date of Birth:</strong> {new Date(profile.dateOfBirth).toLocaleDateString()}</div>}
                        </div>
                    </div>
                    <div>
                        <h4 className='font-medium text-gray-700 mb-2'>Academic Information</h4>
                        <div className='space-y-2 text-sm'>
                            <div><strong>Student ID:</strong> {profile?.studentId || 'Not assigned'}</div>
                            {profile?.department && <div><strong>Department:</strong> {profile.department}</div>}
                            {profile?.enrollmentDate && <div><strong>Enrollment Date:</strong> {new Date(profile.enrollmentDate).toLocaleDateString()}</div>}
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

export default StudentDashboard;
import React, { useState, useMemo, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ReactApexChart from 'react-apexcharts';
import { renderIcon } from '../../utils/iconMapper';
import adminAPI from '../../services/adminAPI';

const AdminDashboard = () => {
    const { user } = useAuth();
    const { profile, dashboardData, isDashboardLoading, isProfileLoading } = useUser();
    const [selectedPeriod, setSelectedPeriod] = useState('monthly');
    const [dateFilter, setDateFilter] = useState({
        fromDate: '',
        toDate: ''
    });
    const [isDateFilterApplied, setIsDateFilterApplied] = useState(false);
    const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
    const [realDashboardData, setRealDashboardData] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Fetch real dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Prepare API parameters
                const params = {};
                if (isDateFilterApplied && dateFilter.fromDate && dateFilter.toDate) {
                    params.fromDate = dateFilter.fromDate;
                    params.toDate = dateFilter.toDate;
                }

                // Fetch dashboard stats and revenue trends in parallel
                const [statsResponse, trendsResponse] = await Promise.all([
                    adminAPI.getDashboardStats(params),
                    adminAPI.getRevenueTrends({ period: selectedPeriod, ...params })
                ]);

                setRealDashboardData(statsResponse.data.data);
                setChartData(trendsResponse.data.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError('Failed to load dashboard data');
                
                // Set fallback data
                setRealDashboardData({
                    metrics: {
                        totalStudents: 0,
                        totalPayments: 0,
                        pendingDues: 0
                    },
                    departmentWiseFee: [
                        { id: 1, name: "No data available", students: 0, fee: 0, percentage: "0%" }
                    ],
                    recentTransactions: []
                });
                setChartData({
                    categories: ['No Data'],
                    revenue: [0],
                    payments: [0],
                    pending: [0]
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [selectedPeriod, isDateFilterApplied, dateFilter]);

    // Chart configuration
    const chartOptions = {
        chart: {
            type: 'line',
            height: 350,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            }
        },
        colors: ['#3B82F6', '#10B981', '#F59E0B'],
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        markers: {
            size: 4,
            colors: ['#3B82F6', '#10B981', '#F59E0B'],
            strokeColors: '#fff',
            strokeWidth: 1,
            hover: {
                size: 6,
                sizeOffset: 2
            }
        },
        grid: {
            show: true,
            borderColor: '#E5E7EB',
            strokeDashArray: 0,
            position: 'back'
        },
        xaxis: {
            categories: chartData?.categories || [],
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            labels: {
                formatter: function (val) {
                    return "₹" + val.toLocaleString();
                }
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            floating: true,
            offsetY: -25,
            offsetX: -5
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return "₹" + val.toLocaleString();
                }
            }
        }
    };

    const chartSeries = [
        {
            name: 'Revenue',
            data: chartData?.revenue || []
        },
        {
            name: 'Payments',
            data: chartData?.payments || []
        },
        {
            name: 'Pending',
            data: chartData?.pending || []
        }
    ];

    // Format number helper
    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toLocaleString();
    };

    // Navigation handlers
    const handleStudentsClick = () => {
        navigate(`/dashboard/${user?.id}/students`);
    };

    const handleTransactionsClick = () => {
        navigate(`/dashboard/${user?.id}/transactions`);
    };

    // Date filter handlers
    const handleDateFilterChange = (field, value) => {
        setDateFilter(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const applyDateFilter = () => {
        setIsDateFilterApplied(true);
        setIsDateDropdownOpen(false);
    };

    const clearDateFilter = () => {
        setDateFilter({
            fromDate: '',
            toDate: ''
        });
        setIsDateFilterApplied(false);
        setIsDateDropdownOpen(false);
    };

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const getFilterButtonText = () => {
        if (isDateFilterApplied && dateFilter.fromDate && dateFilter.toDate) {
            return `${formatDateForDisplay(dateFilter.fromDate)} - ${formatDateForDisplay(dateFilter.toDate)}`;
        }
        return 'Filter by Date';
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
                    <p className="text-gray-600">Welcome back, {user?.firstName || 'Admin'}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
                    {/* Date Filter Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            {renderIcon('CalendarToday', { className: 'w-4 h-4 text-gray-500' })}
                            <span className="text-sm text-gray-700">{getFilterButtonText()}</span>
                            {renderIcon('ArrowDropDown', { className: 'w-4 h-4 text-gray-500' })}
                        </button>
                        
                        {isDateDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                                    <input
                                        type="date"
                                        value={dateFilter.fromDate}
                                        onChange={(e) => handleDateFilterChange('fromDate', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                                    <input
                                        type="date"
                                        value={dateFilter.toDate}
                                        onChange={(e) => handleDateFilterChange('toDate', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={applyDateFilter}
                                        disabled={!dateFilter.fromDate || !dateFilter.toDate}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Apply
                                    </button>
                                    <button
                                        onClick={clearDateFilter}
                                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Export Button */}
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        {renderIcon('Download', { className: 'w-4 h-4' })}
                        <span className="text-sm">Export</span>
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Students */}
                <div 
                    className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-100 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={handleStudentsClick}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-600 text-sm font-medium">Total Students</p>
                            <p className="text-2xl font-bold text-blue-900">
                                {realDashboardData?.metrics?.totalStudents ? formatNumber(realDashboardData.metrics.totalStudents) : 'NA'}
                            </p>
                            <p className="text-green-600 text-sm flex items-center gap-1 mt-1">
                                {renderIcon('TrendingUp', { className: 'w-4 h-4' })}
                                +5.3% from last month
                            </p>
                        </div>
                        <div className="p-3 rounded-lg">
                            {renderIcon('Groups', { className: 'w-6 h-6 text-blue-600' })}
                        </div>
                    </div>
                </div>

                {/* Total Payments */}
                <div 
                    className="bg-green-50 p-6 rounded-lg shadow-md border border-green-100 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={handleTransactionsClick}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-600 text-sm font-medium">Total Payments</p>
                            <p className="text-2xl font-bold text-green-900">
                                ₹{realDashboardData?.metrics?.totalPayments ? formatNumber(realDashboardData.metrics.totalPayments) : 'NA'}
                            </p>
                            <p className="text-green-600 text-sm flex items-center gap-1 mt-1">
                                {renderIcon('TrendingUp', { className: 'w-4 h-4' })}
                                +18.2% from last month
                            </p>
                        </div>
                        <div className="p-3 rounded-lg">
                            {renderIcon('Payments', { className: 'w-6 h-6 text-green-600' })}
                        </div>
                    </div>
                </div>

                {/* Pending Dues */}
                <div 
                    className="bg-orange-50 p-6 rounded-lg shadow-md border border-orange-100 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={handleTransactionsClick}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-600 text-sm font-medium">Pending Dues</p>
                            <p className="text-2xl font-bold text-orange-900">
                                ₹{realDashboardData?.metrics?.pendingDues ? formatNumber(realDashboardData.metrics.pendingDues) : 'NA'}
                            </p>
                            <p className="text-red-600 text-sm flex items-center gap-1 mt-1">
                                {renderIcon('TrendingDown', { className: 'w-4 h-4' })}
                                -3.1% from last month
                            </p>
                        </div>
                        <div className="p-3 rounded-lg">
                            {renderIcon('AccountBalanceWallet', { className: 'w-6 h-6 text-orange-600' })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts and Department Data */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Trends Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Revenue Trends</h2>
                        <div className="flex gap-2 mt-2 sm:mt-0">
                            {['monthly', 'quarterly', 'yearly'].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setSelectedPeriod(period)}
                                    className={`px-3 py-1 text-sm rounded-md capitalize ${
                                        selectedPeriod === period
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-80">
                        <ReactApexChart
                            options={chartOptions}
                            series={chartSeries}
                            type="line"
                            height="100%"
                        />
                    </div>
                </div>

                {/* Department Wise Fee */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Department Wise Fee</h2>
                        {renderIcon('MoreHoriz', { className: 'w-5 h-5 text-gray-400 cursor-pointer' })}
                    </div>
                    <div className="space-y-4">
                        {realDashboardData?.departmentWiseFee?.map((dept) => (
                            <div key={dept.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold text-sm">
                                            {dept.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{dept.name}</p>
                                        <p className="text-gray-500 text-xs">{dept.students} students</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900 text-sm">
                                        ₹{dept.fee ? formatNumber(dept.fee) : 'NA'}
                                    </p>
                                    <p className="text-green-600 text-xs">{dept.percentage}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="mt-8 bg-white rounded-lg shadow-md border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
                        <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                            <span className="text-sm">View All</span>
                            {renderIcon('ChevronRight', { className: 'w-4 h-4' })}
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institute</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {realDashboardData?.recentTransactions?.length > 0 ? (
                                realDashboardData.recentTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {transaction.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {transaction.institute}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {transaction.student}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {transaction.date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ₹{transaction.amount?.toLocaleString() || 'NA'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                transaction.status === 'Completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {transaction.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button className="text-blue-600 hover:text-blue-900">
                                                {renderIcon('Visibility', { className: 'w-4 h-4' })}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        No transactions available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard; 
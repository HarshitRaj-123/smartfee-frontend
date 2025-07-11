import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../services/api';

const PaymentManagement = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [activeTab, setActiveTab] = useState('offline');
  const [payments, setPayments] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  
  // Payment form states
  const [paymentForm, setPaymentForm] = useState({
    studentId: '',
    studentFeeId: '',
    mode: 'offline',
    method: 'cash',
    paidAmount: '',
    paidFor: [],
    transactionId: '',
    chequeDetails: {},
    notes: '',
    paymentSource: 'admin_entry'
  });
  
  // EMI form states
  const [emiForm, setEmiForm] = useState({
    studentId: '',
    studentFeeId: '',
    planType: 'monthly',
    totalAmount: '',
    installmentAmount: '',
    totalInstallments: '',
    startDate: '',
    notes: ''
  });
  
  // QR form states
  const [qrForm, setQrForm] = useState({
    studentId: '',
    studentFeeId: '',
    amount: '',
    description: ''
  });

  useEffect(() => {
    fetchDashboardData();
    fetchPayments();
    fetchSubscriptions();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/payments/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments');
      setPayments(response.data.data.payments || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions');
      setSubscriptions(response.data.data.subscriptions || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const handleOfflinePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post('/payments', paymentForm);
      
      if (response.data.success) {
        showNotification('Payment recorded successfully', 'success');
        setPaymentForm({
          studentId: '',
          studentFeeId: '',
          mode: 'offline',
          method: 'cash',
          paidAmount: '',
          paidFor: [],
          transactionId: '',
          chequeDetails: {},
          notes: '',
          paymentSource: 'admin_entry'
        });
        fetchPayments();
        fetchDashboardData();
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error recording payment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEMICreation = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post('/subscriptions', emiForm);
      
      if (response.data.success) {
        showNotification('EMI subscription created successfully', 'success');
        setEmiForm({
          studentId: '',
          studentFeeId: '',
          planType: 'monthly',
          totalAmount: '',
          installmentAmount: '',
          totalInstallments: '',
          startDate: '',
          notes: ''
        });
        fetchSubscriptions();
        
        // Open authorization URL if provided
        if (response.data.data.authUrl) {
          window.open(response.data.data.authUrl, '_blank');
        }
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error creating EMI subscription', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQRGeneration = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post('/payments/generate-qr', qrForm);
      
      if (response.data.success) {
        showNotification('QR code generated successfully', 'success');
        // You can show QR code in a modal or download it
        console.log('QR Data:', response.data.data);
        setQrForm({
          studentId: '',
          studentFeeId: '',
          amount: '',
          description: ''
        });
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error generating QR code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentId, approved, notes) => {
    try {
      const response = await api.patch(`/payments/${paymentId}/verify`, {
        approved,
        verificationNotes: notes
      });
      
      if (response.data.success) {
        showNotification(`Payment ${approved ? 'verified' : 'rejected'} successfully`, 'success');
        fetchPayments();
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error verifying payment', 'error');
    }
  };

  const cancelSubscription = async (subscriptionId, reason) => {
    try {
      const response = await api.patch(`/subscriptions/${subscriptionId}/cancel`, { reason });
      
      if (response.data.success) {
        showNotification('Subscription cancelled successfully', 'success');
        fetchSubscriptions();
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error cancelling subscription', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-2">Manage offline, online, and EMI payments</p>
        </div>

        {/* Dashboard Stats */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500">Total Collection</h3>
              <p className="text-2xl font-bold text-green-600">
                ₹{dashboardData.stats.totalAmount?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500">Total Payments</h3>
              <p className="text-2xl font-bold text-blue-600">
                {dashboardData.stats.totalPayments || 0}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500">Online Payments</h3>
              <p className="text-2xl font-bold text-purple-600">
                {dashboardData.stats.onlinePayments || 0}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500">Pending Verifications</h3>
              <p className="text-2xl font-bold text-orange-600">
                {dashboardData.pendingVerifications || 0}
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'offline', name: 'Offline Payments', icon: '💰' },
                { id: 'online', name: 'Online Payments', icon: '🌐' },
                { id: 'emi', name: 'EMI Management', icon: '📅' },
                { id: 'qr', name: 'QR Payments', icon: '📱' },
                { id: 'history', name: 'Payment History', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Offline Payments Tab */}
            {activeTab === 'offline' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Record Offline Payment</h2>
                <form onSubmit={handleOfflinePayment} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Student ID
                      </label>
                      <input
                        type="text"
                        value={paymentForm.studentId}
                        onChange={(e) => setPaymentForm({...paymentForm, studentId: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter student ID"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method
                      </label>
                      <select
                        value={paymentForm.method}
                        onChange={(e) => setPaymentForm({...paymentForm, method: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="cash">Cash</option>
                        <option value="cheque">Cheque</option>
                        <option value="upi">UPI</option>
                        <option value="card">Card</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount
                      </label>
                      <input
                        type="number"
                        value={paymentForm.paidAmount}
                        onChange={(e) => setPaymentForm({...paymentForm, paidAmount: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter amount"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transaction ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={paymentForm.transactionId}
                        onChange={(e) => setPaymentForm({...paymentForm, transactionId: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter transaction ID"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Add any notes..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Recording...' : 'Record Payment'}
                  </button>
                </form>
              </div>
            )}

            {/* EMI Management Tab */}
            {activeTab === 'emi' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Create EMI Subscription</h2>
                <form onSubmit={handleEMICreation} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Student ID
                      </label>
                      <input
                        type="text"
                        value={emiForm.studentId}
                        onChange={(e) => setEmiForm({...emiForm, studentId: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter student ID"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plan Type
                      </label>
                      <select
                        value={emiForm.planType}
                        onChange={(e) => setEmiForm({...emiForm, planType: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Amount
                      </label>
                      <input
                        type="number"
                        value={emiForm.totalAmount}
                        onChange={(e) => setEmiForm({...emiForm, totalAmount: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter total amount"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Installment Amount
                      </label>
                      <input
                        type="number"
                        value={emiForm.installmentAmount}
                        onChange={(e) => setEmiForm({...emiForm, installmentAmount: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter installment amount"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Installments
                      </label>
                      <input
                        type="number"
                        value={emiForm.totalInstallments}
                        onChange={(e) => setEmiForm({...emiForm, totalInstallments: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter number of installments"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={emiForm.startDate}
                        onChange={(e) => setEmiForm({...emiForm, startDate: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={emiForm.notes}
                      onChange={(e) => setEmiForm({...emiForm, notes: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Add any notes..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create EMI Subscription'}
                  </button>
                </form>

                {/* Subscriptions List */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Active Subscriptions</h3>
                  <div className="space-y-4">
                    {subscriptions.map((subscription) => (
                      <div key={subscription._id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {subscription.studentId?.firstName} {subscription.studentId?.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              ₹{subscription.installmentAmount} × {subscription.totalInstallments} installments
                            </p>
                            <p className="text-sm text-gray-600">
                              Status: <span className={`font-medium ${
                                subscription.status === 'active' ? 'text-green-600' :
                                subscription.status === 'completed' ? 'text-blue-600' :
                                'text-orange-600'
                              }`}>
                                {subscription.status}
                              </span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {subscription.completedInstallments}/{subscription.totalInstallments} paid
                            </p>
                            <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{width: `${subscription.completionPercentage}%`}}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* QR Payments Tab */}
            {activeTab === 'qr' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Generate QR Code for Payment</h2>
                <form onSubmit={handleQRGeneration} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Student ID
                      </label>
                      <input
                        type="text"
                        value={qrForm.studentId}
                        onChange={(e) => setQrForm({...qrForm, studentId: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter student ID"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount
                      </label>
                      <input
                        type="number"
                        value={qrForm.amount}
                        onChange={(e) => setQrForm({...qrForm, amount: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter amount"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={qrForm.description}
                      onChange={(e) => setQrForm({...qrForm, description: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Payment description"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : 'Generate QR Code'}
                  </button>
                </form>
              </div>
            )}

            {/* Payment History Tab */}
            {activeTab === 'history' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Payment History</h2>
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment._id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            Receipt: {payment.receiptNo}
                          </p>
                          <p className="text-sm text-gray-600">
                            Student: {payment.studentId?.firstName} {payment.studentId?.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            Amount: ₹{payment.paidAmount} via {payment.method}
                          </p>
                          <p className="text-sm text-gray-600">
                            Date: {new Date(payment.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'verified' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payment.status}
                          </span>
                          {payment.requiresVerification && user.role !== 'student' && (
                            <div className="mt-2 space-x-2">
                              <button
                                onClick={() => verifyPayment(payment._id, true, 'Verified by admin')}
                                className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => verifyPayment(payment._id, false, 'Rejected by admin')}
                                className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement; 
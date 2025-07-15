import React, { useEffect, useState } from 'react';
import userAPI from '../../../services/userAPI';
import api from '../../../services/api';
import razorpayAPI from '../../../services/razorpayAPI';
import adminAPI from '../../../services/adminAPI';
import { useAuth } from '../../../contexts/AuthContext';
import Modal from '../../../utils/Modal/ConfirmationModal';

const FeePaymentPage = () => {
  // UI and state
  const [tab, setTab] = useState(0);
  const [offlineMenuAnchor, setOfflineMenuAnchor] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentFee, setStudentFee] = useState(null);
  const [feeItems, setFeeItems] = useState([]);
  const [selectedFeeItems, setSelectedFeeItems] = useState([]);
  const [amounts, setAmounts] = useState({});
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [qrData, setQrData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [receiptId, setReceiptId] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showOfflineDropdown, setShowOfflineDropdown] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFeeItems, setEditFeeItems] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [addFeeModalOpen, setAddFeeModalOpen] = useState(false);
  const [addFeeLoading, setAddFeeLoading] = useState(false);
  const [newFeeData, setNewFeeData] = useState({
    name: '',
    amount: '',
    description: '',
    isOptional: false
  });

  const { user } = useAuth();

  // Fetch students on mount based on role
  useEffect(() => {
    async function fetchStudents() {
      if (!user) return;
      if (user.role === 'admin' || user.role === 'super_admin') {
        // Fetch all students
        const res = await userAPI.getUsersByRole('student');
        setStudents((res.data.data?.users || []).map(u => ({
          id: u.id || u._id,
          name: u.name || `${u.firstName} ${u.lastName}`,
          studentId: u.studentId,
          email: u.email,
          phone: u.phone,
          department: u.department,
          semester: u.currentSemester || u.semester,
          courseId: u.courseInfo?._id || u.courseId || null,
          program: u.courseInfo?.program_name || '',
          fatherName: u.guardianName || '',
        })));
      } else if (user.role === 'accountant') {
        // Fetch only assigned students
        const res = await userAPI.getAssignedStudents();
        setStudents((res.data.data || []).map(u => ({
          ...u,
          fatherName: u.guardianName || '',
        })));
      }
    }
    fetchStudents();
  }, [user]);

  // Fetch student fee details when a student is selected
  useEffect(() => {
    if (selectedStudent) {
      fetchStudentFee(selectedStudent.id);
      fetchPaymentHistory(selectedStudent.id);
    } else {
      setStudentFee(null);
      setFeeItems([]);
      setSelectedFeeItems([]);
      setAmounts({});
      setPaymentHistory([]);
    }
  }, [selectedStudent]);

  // Fetch student fee record
  const fetchStudentFee = async (studentId) => {
    setLoading(true);
    try {
      const res = await api.get(`/student-fees/by-student/${studentId}`);
      const fee = res.data.data;
      setStudentFee(fee);
      setFeeItems(fee.feeItems || []);
      setSelectedFeeItems(fee.feeItems.map(item => item._id));
      setAmounts(Object.fromEntries((fee.feeItems || []).map(item => [item._id, item.originalAmount])));
    } catch (err) {
      setStudentFee(null);
      setFeeItems([]);
      setSelectedFeeItems([]);
      setAmounts({});
      setSnackbar({ open: true, message: 'No fee record found for this student.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch payment history for the student
  const fetchPaymentHistory = async (studentId) => {
    try {
      const res = await api.get(`/payments/student/${studentId}`);
      setPaymentHistory(res.data.data || []);
    } catch (err) {
      setPaymentHistory([]);
    }
  };

  // Handle fee item selection
  const handleFeeItemToggle = (feeItemId) => {
    setSelectedFeeItems(prev => prev.includes(feeItemId)
      ? prev.filter(id => id !== feeItemId)
      : [...prev, feeItemId]
    );
  };

  // Handle amount change
  const handleAmountChange = (feeItemId, value) => {
    setAmounts(prev => ({ ...prev, [feeItemId]: value }));
  };

  // Calculate total selected amount
  const totalSelectedAmount = selectedFeeItems.reduce((sum, id) => sum + (Number(amounts[id]) || 0), 0);
  const remainingAfterPayment = studentFee ? Math.max(0, (studentFee.balanceDue || 0) - totalSelectedAmount) : 0;

  // Handle offline payment
  const handleOfflinePayment = async () => {
    setLoading(true);
    try {
      const payload = {
        studentId: selectedStudent.id,
        studentFeeId: studentFee._id,
        mode: 'offline',
        method: 'cash', // or cheque/upi/card
        paidAmount: totalSelectedAmount,
        paidFor: selectedFeeItems.map(id => ({ feeItemId: id })),
        notes: remarks,
        paymentSource: 'admin_entry',
      };
      const res = await api.post('/payments', payload);
      setSnackbar({ open: true, message: 'Payment recorded successfully.', severity: 'success' });
      fetchStudentFee(selectedStudent.id);
      fetchPaymentHistory(selectedStudent.id);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Payment failed.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle QR code generation
  const handleGenerateQR = async () => {
    setLoading(true);
    try {
      const payload = {
        studentId: selectedStudent.id,
        studentFeeId: studentFee._id,
        amount: totalSelectedAmount,
        description: remarks || 'Fee Payment',
      };
      const res = await api.post('/payments/generate-qr', payload);
      setQrData(res.data.data);
      setSnackbar({ open: true, message: 'QR code generated.', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'QR generation failed.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle online payment (Razorpay)
  const handleOnlinePayment = async () => {
    setLoading(true);
    try {
      // 1. Create Razorpay order
      const orderRes = await razorpayAPI.createOrder({
        studentId: selectedStudent.id,
        studentFeeId: studentFee._id,
        amount: totalSelectedAmount,
        notes: { paidFor: selectedFeeItems.map(id => ({ feeItemId: id })), remarks },
      });
      // 2. Open Razorpay modal
      const paymentRes = await razorpayAPI.initializePayment({
        key: orderRes.key,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: 'SmartFee',
        description: 'Fee Payment',
        order_id: orderRes.orderId,
        prefill: {
          name: selectedStudent.name,
          email: selectedStudent.email,
          contact: selectedStudent.phone,
        },
        notes: orderRes.notes,
      });
      // 3. Verify payment
      const verifyRes = await razorpayAPI.verifyPayment({
        razorpay_order_id: orderRes.orderId,
        razorpay_payment_id: paymentRes.razorpay_payment_id,
        razorpay_signature: paymentRes.razorpay_signature,
        studentId: selectedStudent.id,
        studentFeeId: studentFee._id,
        paidFor: selectedFeeItems.map(id => ({ feeItemId: id })),
        notes: remarks,
      });
      setSnackbar({ open: true, message: 'Online payment successful.', severity: 'success' });
      fetchStudentFee(selectedStudent.id);
      fetchPaymentHistory(selectedStudent.id);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Online payment failed.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle print/email/SMS receipt (placeholder)
  const handlePrintReceipt = (paymentId) => {
    setReceiptId(paymentId);
    // TODO: Fetch and display receipt data, then trigger print
  };

  // Handle adding custom fee
  const handleAddCustomFee = async () => {
    if (!selectedStudent) {
      setSnackbar({ open: true, message: 'Please select a student first.', severity: 'error' });
      return;
    }

    if (!newFeeData.name || !newFeeData.amount) {
      setSnackbar({ open: true, message: 'Please fill in fee name and amount.', severity: 'error' });
      return;
    }

    setAddFeeLoading(true);
    try {
      let currentStudentFee = studentFee;
      
      // If no fee record exists, create one first
      if (!studentFee) {
        try {
          // Create a new student fee record for custom fees
          const createResponse = await api.post('/student-fees/create-for-custom-fees', {
            studentId: selectedStudent.id,
            courseId: selectedStudent.courseId || null, // fallback to null if missing
            semester: selectedStudent.semester || 1, // fallback to 1 if missing
            academicYear: new Date().getFullYear().toString()
          });
          
          if (createResponse.data.success) {
            currentStudentFee = createResponse.data.data;
            setSnackbar({ open: true, message: 'Student fee record created successfully!', severity: 'success' });
          } else {
            throw new Error('Failed to create student fee record');
          }
        } catch (createError) {
          setSnackbar({ 
            open: true, 
            message: createError.response?.data?.message || createError.message || 'Failed to create student fee record.', 
            severity: 'error' 
          });
          return;
        }
      }

      // Now add the custom fee to the existing or newly created fee record
      const response = await api.post(`/student-fee/${currentStudentFee._id}/add-custom-fee`, {
        name: newFeeData.name,
        amount: parseFloat(newFeeData.amount),
        description: newFeeData.description,
        isOptional: newFeeData.isOptional
      });

      if (response.data.success) {
        setSnackbar({ open: true, message: 'Custom fee added successfully!', severity: 'success' });
        setAddFeeModalOpen(false);
        setNewFeeData({ name: '', amount: '', description: '', isOptional: false });
        // Refresh student fee data
        await fetchStudentFee(selectedStudent.id);
      }
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to add custom fee.', 
        severity: 'error' 
      });
    } finally {
      setAddFeeLoading(false);
    }
  };

  // Filter students based on search
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.studentId.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

    return (
    <div id="webcrumbs">
      <div className="mx-auto px-2 bg-gray-50 min-h-screen">

          <div className="p-6">
            <div className="mb-8">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">search</span>
                <input
                  type="text"
                  placeholder="Search by Name, Admission No., Email, or Phone..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && studentSearch.trim()) {
                      // Try to fetch by admission number
                      setLoading(true);
                      try {
                        const res = await adminAPI.getStudentByAdmissionNo(studentSearch.trim());
                        const s = res.data.data;
                        setSelectedStudent({
                          id: s._id,
                          name: `${s.firstName} ${s.lastName}`,
                          studentId: s.studentId,
                          email: s.email,
                          phone: s.phone,
                          department: s.courseInfo?.program_name || s.department,
                          program: s.courseInfo?.program_name || '',
                          fatherName: s.guardianName || s.fathersName || '',
                          semester: s.currentSemester || s.semester || '',
                          courseId: s.courseInfo?._id || s.courseId || null
                        });
                        setStudentSearch(`${s.firstName} ${s.lastName}`);
                        setShowSearchDropdown(false);
                      } catch (err) {
                        setSnackbar({ open: true, message: 'Student not found', severity: 'error' });
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                />
                
                {/* Search Dropdown */}
                {showSearchDropdown && studentSearch && (
                  <div className="absolute mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 z-10">
                    <div className="p-2 max-h-60 overflow-y-auto">
                      {filteredStudents.map((student) => (
                        <div 
                          key={student.id}
                          className="p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedStudent({
                              ...student,
                              program: student.program || student.courseInfo?.program_name || '',
                              fatherName: student.guardianName || student.fathersName || '',
                            });
                            setStudentSearch(student.name);
                            setShowSearchDropdown(false);
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{student.name}</span>
                            <span className="text-sm text-gray-500">{student.studentId}</span>
                          </div>
                          <div className="text-xs text-gray-500">{student.department} - Semester {student.semester}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button 
                  className={`py-3 px-4 border-b-2 font-medium transition-colors duration-200 flex items-center ${
                    tab === 0 
                      ? 'border-primary-600 text-primary-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setTab(0)}
                >
                  <span className="material-symbols-outlined mr-2 text-sm">qr_code</span>
                  Online Payment
                </button>
                <div className="relative">
                  <button 
                    className={`py-3 px-4 border-b-2 font-medium transition-colors duration-200 flex items-center ${
                      tab === 1 
                        ? 'border-primary-600 text-primary-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setShowOfflineDropdown(!showOfflineDropdown)}
                  >
                    <span className="material-symbols-outlined mr-2 text-sm">receipt_long</span>
                    Offline Payment
                  </button>
                  
                  {/* Offline Payment Dropdown */}
                  {showOfflineDropdown && (
                    <div className="absolute mt-2 bg-white shadow-lg rounded-lg border border-gray-200 p-4 w-64 z-10">
                      <div className="space-y-2">
                        <button 
                          className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setTab(1);
                            setShowOfflineDropdown(false);
                            handleOfflinePayment();
                          }}
                        >
                          <span className="material-symbols-outlined mr-2 text-sm align-middle">payments</span>
                          Cash
                        </button>
                        <button 
                          className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setTab(2);
                            setShowOfflineDropdown(false);
                            handleOfflinePayment();
                          }}
                        >
                          <span className="material-symbols-outlined mr-2 text-sm align-middle">account_balance</span>
                          Cheque
                        </button>
                        <button 
                          className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setTab(3);
                            setShowOfflineDropdown(false);
                            handleOfflinePayment();
                          }}
                        >
                          <span className="material-symbols-outlined mr-2 text-sm align-middle">description</span>
                          DD
                        </button>
                        <button 
                          className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setTab(4);
                            setShowOfflineDropdown(false);
                            handleOfflinePayment();
                          }}
                        >
                          <span className="material-symbols-outlined mr-2 text-sm align-middle">smartphone</span>
                          UPI (manual)
                        </button>
                        <button 
                          className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setTab(5);
                            setShowOfflineDropdown(false);
                            handleOfflinePayment();
                          }}
                        >
                          <span className="material-symbols-outlined mr-2 text-sm align-middle">more_horiz</span>
                          Other
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </nav>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                {/* Student Details */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="material-symbols-outlined mr-2">person</span>
                    Student Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={selectedStudent ? selectedStudent.name : ''}
                        readOnly
                        placeholder="Student name will appear here..."
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                          selectedStudent ? 'bg-gray-100 text-gray-600' : 'bg-white text-gray-400'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Admission No.</label>
                      <input
                        type="text"
                        value={selectedStudent ? selectedStudent.studentId : ''}
                        readOnly
                        placeholder="Admission number will appear here..."
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                          selectedStudent ? 'bg-gray-100 text-gray-600' : 'bg-white text-gray-400'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                      <input
                        type="text"
                        value={selectedStudent ? selectedStudent.program || '' : ''}
                        readOnly
                        placeholder="Program will appear here..."
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md ${selectedStudent ? 'bg-gray-100 text-gray-600' : 'bg-white text-gray-400'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                      <input
                        type="text"
                        value={selectedStudent && (studentFee ? studentFee.semester : (selectedStudent.currentSemester || selectedStudent.semester || ''))}
                        readOnly
                        placeholder="Semester will appear here..."
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                          selectedStudent ? 'bg-gray-100 text-gray-600' : 'bg-white text-gray-400'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                      <input
                        type="text"
                        value={selectedStudent ? selectedStudent.fatherName || '' : ''}
                        readOnly
                        placeholder="Father's name will appear here..."
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md ${selectedStudent ? 'bg-gray-100 text-gray-600' : 'bg-white text-gray-400'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={selectedStudent ? selectedStudent.email : ''}
                        readOnly
                        placeholder="Email will appear here..."
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                          selectedStudent ? 'bg-gray-100 text-gray-600' : 'bg-white text-gray-400'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={selectedStudent ? (selectedStudent.phone || '+91 9876543210') : ''}
                        readOnly
                        placeholder="Phone will appear here..."
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                          selectedStudent ? 'bg-gray-100 text-gray-600' : 'bg-white text-gray-400'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Fee Breakdown */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span className="material-symbols-outlined mr-2">receipt</span>
                      Fee Breakdown
                    </h3>
                    <div className="flex gap-2">
                      {/* Show Add Fee button for super_admin/admin when student is selected */}
                      {selectedStudent && (user?.role === 'super_admin' || user?.role === 'admin') && (
                        <button
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
                          onClick={() => setAddFeeModalOpen(true)}
                        >
                          <span className="material-symbols-outlined mr-1 text-sm">add</span>
                          Add Fee
                        </button>
                      )}
                      {/* Show Add Fee button for accountants only when fee record exists */}
                      {selectedStudent && user?.role === 'accountant' && studentFee && (
                        <button
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
                          onClick={() => setAddFeeModalOpen(true)}
                        >
                          <span className="material-symbols-outlined mr-1 text-sm">add</span>
                          Add Fee
                        </button>
                      )}
                      {(user?.role === 'super_admin' || user?.role === 'admin') && selectedStudent && studentFee && feeItems.length > 0 && (
                        <button
                          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                          onClick={() => {
                            setEditFeeItems(feeItems.map(item => ({ ...item })));
                            setEditModalOpen(true);
                          }}
                        >
                          Edit Fee Items
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {selectedStudent && studentFee && feeItems.length > 0 ? (
                    <>
                      <div className="overflow-x-auto mb-6">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="py-2 px-3 text-left text-sm font-medium text-gray-700 border-b">Fee Head</th>
                              <th className="py-2 px-3 text-right text-sm font-medium text-gray-700 border-b">Amount Due</th>
                              <th className="py-2 px-3 text-center text-sm font-medium text-gray-700 border-b">Select</th>
                              <th className="py-2 px-3 text-center text-sm font-medium text-gray-700 border-b">Editable Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {feeItems.map((item) => (
                              <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-3 text-sm text-gray-900">{item.name}</td>
                                <td className="py-3 px-3 text-sm text-gray-900 text-right">₹{item.originalAmount?.toLocaleString()}</td>
                                <td className="py-3 px-3 text-center">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedFeeItems.includes(item._id)}
                                    onChange={() => handleFeeItemToggle(item._id)}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                                  />
                                </td>
                                <td className="py-3 px-3">
                                  <input 
                                    type="number" 
                                    value={amounts[item._id] || ''}
                                    onChange={(e) => handleAmountChange(item._id, e.target.value)}
                                    disabled={!selectedFeeItems.includes(item._id)}
                                    className="w-full px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="mt-4 mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                        <textarea 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                          rows="2" 
                          placeholder="Add any notes or remarks about this payment..."
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                        />
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-base font-medium text-gray-700">Total Selected Amount:</span>
                            <span className="text-xl font-bold text-primary-600">₹{totalSelectedAmount?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Remaining After Payment:</span>
                            <span className="text-sm font-medium text-red-600">₹{remainingAfterPayment?.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center"
                            onClick={handleOnlinePayment}
                            disabled={loading || !selectedFeeItems.length || !totalSelectedAmount}
                          >
                            <span className="material-symbols-outlined mr-2">check_circle</span>
                            Online Pay
                          </button>
                          <button 
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
                            onClick={handleOfflinePayment}
                            disabled={loading || !selectedFeeItems.length || !totalSelectedAmount}
                          >
                            <span className="material-symbols-outlined mr-2">payments</span>
                            Record Offline
                          </button>
                          <button 
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
                            onClick={handleGenerateQR}
                            disabled={loading || !selectedFeeItems.length || !totalSelectedAmount}
                          >
                            <span className="material-symbols-outlined mr-2">qr_code</span>
                            Generate QR
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <span className="material-symbols-outlined text-6xl">receipt</span>
                      </div>
                      <h4 className="text-lg font-medium text-gray-600 mb-2">No Fee Items Available</h4>
                      <p className="text-gray-500">
                        {selectedStudent 
                          ? 'Fee breakdown will appear here once student data is loaded...' 
                          : 'Search for a student to view their fee breakdown...'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-1">
                {/* Payment QR Code */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="material-symbols-outlined mr-2">qr_code</span>
                    Payment QR Code
                  </h3>
                  
                  <div className="text-center">
                    <div className="inline-block bg-gray-100 p-8 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                      <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <div className="text-center">
                          {qrData ? (
                            <div>
                              <span className="material-symbols-outlined text-6xl text-gray-400 mb-2">qr_code</span>
                              <p className="text-sm text-gray-500">QR: {qrData.qrString}</p>
                            </div>
                          ) : (
                            <div>
                              <span className="material-symbols-outlined text-6xl text-gray-400 mb-2">qr_code</span>
                              <p className="text-sm text-gray-500">QR Code will appear here</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center mx-auto mb-4 transform hover:scale-105 transition-transform"
                      onClick={handleGenerateQR}
                      disabled={loading || !selectedFeeItems.length || !totalSelectedAmount}
                    >
                      <span className="material-symbols-outlined mr-2">landscape</span>
                      Generate QR Code
                    </button>
                    
                    <div className="text-sm text-gray-600 mb-4">
                      <p>Student can scan this QR code to pay</p>
                      <p className="font-medium">Amount: ₹{totalSelectedAmount?.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1">Includes: {remarks || 'Selected Fees'}</p>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center">
                        <span className="material-symbols-outlined text-yellow-600 mr-2">pending</span>
                        <span className="text-sm text-yellow-800 font-medium">Payment Status: Pending</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center transform hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined mr-2">refresh</span>
                        Check Payment Status
                      </button>
                      
                      <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center transform hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined mr-2">print</span>
                        Print Receipt
                      </button>
                      
                      <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center transform hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined mr-2">mail</span>
                        Email Receipt
                      </button>
                      
                      <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center transform hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined mr-2">sms</span>
                        Send SMS
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Payment Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <span className="material-symbols-outlined mr-2">info</span>
                    Payment Instructions
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• QR Code is valid for 30 minutes</li>
                    <li>• Payment will be processed via Razorpay</li>
                    <li>• Receipt will be sent via email and SMS</li>
                    <li>• Contact support if payment fails</li>
                  </ul>
                </div>

                {/* Payment History */}
                {selectedStudent && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="material-symbols-outlined mr-2">receipt</span>
                      Payment History
                    </h3>
                    {paymentHistory.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No payments found.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="py-2 px-3 text-left text-sm font-medium text-gray-700 border-b">Date</th>
                              <th className="py-2 px-3 text-left text-sm font-medium text-gray-700 border-b">Amount</th>
                              <th className="py-2 px-3 text-left text-sm font-medium text-gray-700 border-b">Mode</th>
                              <th className="py-2 px-3 text-left text-sm font-medium text-gray-700 border-b">Status</th>
                              <th className="py-2 px-3 text-center text-sm font-medium text-gray-700 border-b">Receipt</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {paymentHistory.map((payment) => (
                              <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-3 text-sm text-gray-900">
                                  {new Date(payment.date).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-3 text-sm text-gray-900">₹{payment.paidAmount}</td>
                                <td className="py-3 px-3 text-sm text-gray-900">{payment.mode}</td>
                                <td className="py-3 px-3 text-sm text-gray-900">{payment.status}</td>
                                <td className="py-3 px-3 text-center">
                                  <button 
                                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center justify-center"
                                    onClick={() => handlePrintReceipt(payment._id)}
                                  >
                                    <span className="material-symbols-outlined text-sm">print</span>
                                    Print
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        {/* Snackbar */}
        {snackbar.open && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            snackbar.severity === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            <div className="flex items-center">
              <span className="material-symbols-outlined mr-2">
                {snackbar.severity === 'success' ? 'check_circle' : 'error'}
              </span>
              {snackbar.message}
              <button 
                className="ml-4 text-gray-500 hover:text-gray-700"
                onClick={() => setSnackbar({ ...snackbar, open: false })}
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          </div>
        )}

        {/* Add Fee Modal */}
        {addFeeModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="material-symbols-outlined mr-2">add</span>
                  Add Custom Fee
                </h3>
                <button
                  onClick={() => setAddFeeModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fee Name *
                  </label>
                  <input
                    type="text"
                    value={newFeeData.name}
                    onChange={(e) => setNewFeeData({ ...newFeeData, name: e.target.value })}
                    placeholder="e.g., Late Fee, Fine, Additional Charge"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={newFeeData.amount}
                    onChange={(e) => setNewFeeData({ ...newFeeData, amount: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newFeeData.description}
                    onChange={(e) => setNewFeeData({ ...newFeeData, description: e.target.value })}
                    placeholder="Optional description for this fee..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isOptional"
                    checked={newFeeData.isOptional}
                    onChange={(e) => setNewFeeData({ ...newFeeData, isOptional: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isOptional" className="ml-2 text-sm text-gray-700">
                    Optional Fee (student can choose to pay or not)
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setAddFeeModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={addFeeLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomFee}
                  disabled={addFeeLoading || !newFeeData.name || !newFeeData.amount}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {addFeeLoading ? (
                    <>
                      <span className="material-symbols-outlined mr-2 animate-spin">refresh</span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined mr-2">add</span>
                      Add Fee
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
            </div>
        </div>
    );
};

export default FeePaymentPage; 
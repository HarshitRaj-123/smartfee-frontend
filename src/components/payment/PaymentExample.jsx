import React, { useState, useEffect } from 'react';
import RazorpayPayment from './RazorpayPayment';
import { useAuth } from '../../contexts/AuthContext';

const PaymentExample = () => {
  const { user } = useAuth();
  const [studentFees, setStudentFees] = useState([]);
  const [selectedFees, setSelectedFees] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  // Mock student fee data - replace with actual API call
  useEffect(() => {
    const mockFees = [
      {
        id: '1',
        name: 'Tuition Fee',
        amount: 25000,
        dueDate: '2024-03-31',
        status: 'pending'
      },
      {
        id: '2',
        name: 'Hostel Fee',
        amount: 15000,
        dueDate: '2024-03-31',
        status: 'pending'
      },
      {
        id: '3',
        name: 'Library Fee',
        amount: 2000,
        dueDate: '2024-03-31',
        status: 'pending'
      }
    ];
    setStudentFees(mockFees);
  }, []);

  // Calculate total amount when selected fees change
  useEffect(() => {
    const total = selectedFees.reduce((sum, feeId) => {
      const fee = studentFees.find(f => f.id === feeId);
      return sum + (fee ? fee.amount : 0);
    }, 0);
    setTotalAmount(total);
  }, [selectedFees, studentFees]);

  const handleFeeSelection = (feeId) => {
    setSelectedFees(prev => 
      prev.includes(feeId) 
        ? prev.filter(id => id !== feeId)
        : [...prev, feeId]
    );
  };

  const handlePaymentSuccess = (paymentData) => {
    console.log('Payment successful:', paymentData);
    // Refresh fee data or redirect to success page
    alert('Payment successful! Receipt: ' + paymentData.receiptNo);
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    // Handle payment failure
  };

  const paidForData = selectedFees.map(feeId => {
    const fee = studentFees.find(f => f.id === feeId);
    return {
      feeItemId: feeId,
      name: fee.name,
      amount: fee.amount
    };
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Fee Payment</h1>
      
      {/* Student Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Student Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Name:</span> {user?.firstName} {user?.lastName}
          </div>
          <div>
            <span className="font-medium">Student ID:</span> {user?.studentId}
          </div>
          <div>
            <span className="font-medium">Email:</span> {user?.email}
          </div>
          <div>
            <span className="font-medium">Phone:</span> {user?.phone}
          </div>
        </div>
      </div>

      {/* Fee Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Select Fees to Pay</h2>
        <div className="space-y-3">
          {studentFees.map(fee => (
            <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={fee.id}
                  checked={selectedFees.includes(fee.id)}
                  onChange={() => handleFeeSelection(fee.id)}
                  className="mr-3 h-4 w-4 text-blue-600"
                />
                <label htmlFor={fee.id} className="flex-1">
                  <div className="font-medium">{fee.name}</div>
                  <div className="text-sm text-gray-500">Due: {fee.dueDate}</div>
                </label>
              </div>
              <div className="text-right">
                <div className="font-semibold">₹{fee.amount.toLocaleString()}</div>
                <div className={`text-sm ${fee.status === 'pending' ? 'text-red-500' : 'text-green-500'}`}>
                  {fee.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Summary */}
      {selectedFees.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
          <div className="space-y-2">
            {selectedFees.map(feeId => {
              const fee = studentFees.find(f => f.id === feeId);
              return (
                <div key={feeId} className="flex justify-between">
                  <span>{fee.name}</span>
                  <span>₹{fee.amount.toLocaleString()}</span>
                </div>
              );
            })}
            <hr className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total Amount</span>
              <span>₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Button */}
      {selectedFees.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Payment Options</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <RazorpayPayment
              studentId={user?.id}
              studentFeeId="mock-student-fee-id" // Replace with actual student fee ID
              amount={totalAmount}
              paidFor={paidForData}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              buttonText={`Pay ₹${totalAmount.toLocaleString()} via Razorpay`}
              buttonClass="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            />
            
            {/* Offline Payment Option */}
            <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              <div className="flex items-center justify-center">
                <span className="material-symbols-outlined mr-2">account_balance</span>
                Pay Offline
              </div>
            </button>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>• Razorpay supports UPI, Cards, Net Banking, and Wallets</p>
            <p>• All transactions are secure and encrypted</p>
            <p>• You will receive a receipt via email after successful payment</p>
          </div>
        </div>
      )}

      {selectedFees.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <span className="material-symbols-outlined text-yellow-600 text-4xl mb-2 block">info</span>
          <h3 className="text-lg font-medium text-yellow-800 mb-2">No Fees Selected</h3>
          <p className="text-yellow-700">Please select at least one fee to proceed with payment.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentExample; 
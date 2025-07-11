import React, { useState } from 'react';
import razorpayAPI from '../../services/razorpayAPI';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const RazorpayPayment = ({ 
  studentId, 
  studentFeeId, 
  amount, 
  paidFor, 
  onSuccess, 
  onError,
  buttonText = "Pay Now",
  buttonClass = "bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
}) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Create order
      const orderData = {
        studentId,
        studentFeeId,
        amount,
        notes: {
          purpose: 'Fee Payment',
          student: studentId,
          semester: 'Current'
        }
      };

      const orderResponse = await razorpayAPI.createOrder(orderData);
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      const order = orderResponse.data;

      // Razorpay payment options
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'SmartFee',
        description: 'Student Fee Payment',
        order_id: order.orderId,
        prefill: {
          name: order.studentName,
          email: order.studentEmail,
          contact: order.studentPhone
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            addNotification('Payment cancelled by user', 'info');
          }
        }
      };

      // Initialize Razorpay payment
      const paymentResponse = await razorpayAPI.initializePayment(options);

      // Verify payment
      const verificationData = {
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        studentId,
        studentFeeId,
        paidFor,
        notes: `Payment via Razorpay - ${paymentResponse.razorpay_payment_id}`
      };

      const verificationResponse = await razorpayAPI.verifyPayment(verificationData);

      if (verificationResponse.success) {
        addNotification('Payment successful!', 'success');
        if (onSuccess) {
          onSuccess(verificationResponse.data);
        }
      } else {
        throw new Error(verificationResponse.message || 'Payment verification failed');
      }

    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error.message || 'Payment failed';
      addNotification(errorMessage, 'error');
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`${buttonClass} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Processing...
        </div>
      ) : (
        <div className="flex items-center">
          <span className="material-symbols-outlined mr-2">payment</span>
          {buttonText}
        </div>
      )}
    </button>
  );
};

export default RazorpayPayment; 
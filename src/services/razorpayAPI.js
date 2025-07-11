import api from './api';

const razorpayAPI = {
  // Create Razorpay order
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/razorpay/create-order', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    try {
      const response = await api.post('/razorpay/verify-payment', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get payment status
  getPaymentStatus: async (paymentId) => {
    try {
      const response = await api.get(`/razorpay/payment-status/${paymentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create refund
  createRefund: async (paymentId, refundData) => {
    try {
      const response = await api.post(`/razorpay/refund/${paymentId}`, refundData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Initialize Razorpay payment
  initializePayment: (options) => {
    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        ...options,
        handler: function (response) {
          resolve(response);
        },
        modal: {
          ondismiss: function () {
            reject(new Error('Payment cancelled by user'));
          }
        }
      });
      rzp.open();
    });
  }
};

export default razorpayAPI; 
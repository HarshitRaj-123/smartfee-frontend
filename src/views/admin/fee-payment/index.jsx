import React from 'react';

const FeePayment = () => {
    return (
        <div className='p-6'>
            <div className='mb-6'>
                <h1 className='text-3xl font-bold text-gray-800 mb-2'>Fee Payment</h1>
                <p className='text-gray-600'>Process and manage fee payments</p>
            </div>
            <div className='bg-white rounded-lg shadow-md p-6'>
                <div className='text-center py-12'>
                    <div className='text-6xl text-gray-300 mb-4'>💳</div>
                    <h2 className='text-2xl font-semibold text-gray-700 mb-2'>Fee Payment</h2>
                    <p className='text-gray-500 mb-4'>Process payments, generate receipts, and manage payment records</p>
                    <div className='bg-gray-50 rounded-lg p-4 max-w-md mx-auto'>
                        <h3 className='font-medium text-gray-700 mb-2'>Features:</h3>
                        <ul className='text-sm text-gray-600 space-y-1'>
                            <li>• Process payments</li>
                            <li>• Generate receipts</li>
                            <li>• Payment history</li>
                            <li>• Refund management</li>
                            <li>• Payment verification</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeePayment; 
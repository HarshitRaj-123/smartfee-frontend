import React from 'react';

const Transactions = () => {
    return (
        <div className='p-6'>
            <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
                <h1 className='text-3xl font-bold text-gray-800 mb-2'>Transactions</h1>
                <p className='text-gray-600'>View and manage financial transactions</p>
            </div>
            <div className='bg-white rounded-lg shadow-md p-6'>
                <div className='text-center py-12'>
                    <div className='text-6xl text-gray-300 mb-4'>📊</div>
                    <h2 className='text-2xl font-semibold text-gray-700 mb-2'>Transaction Management</h2>
                    <p className='text-gray-500 mb-4'>Monitor and manage all financial transactions</p>
                    <div className='bg-gray-50 rounded-lg p-4 max-w-md mx-auto'>
                        <h3 className='font-medium text-gray-700 mb-2'>Features:</h3>
                        <ul className='text-sm text-gray-600 space-y-1'>
                            <li>• Transaction history</li>
                            <li>• Payment tracking</li>
                            <li>• Financial reports</li>
                            <li>• Transaction verification</li>
                            <li>• Export data</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transactions; 
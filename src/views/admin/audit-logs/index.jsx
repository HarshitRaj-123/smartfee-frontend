import React from 'react';

const AuditLogs = () => {
    return (
        <div className='p-6'>
            <div className='mb-6'>
                <h1 className='text-3xl font-bold text-gray-800 mb-2'>Audit Logs</h1>
                <p className='text-gray-600'>Monitor system activities and user actions</p>
            </div>
            <div className='bg-white rounded-lg shadow-md p-6'>
                <div className='text-center py-12'>
                    <div className='text-6xl text-gray-300 mb-4'>📋</div>
                    <h2 className='text-2xl font-semibold text-gray-700 mb-2'>System Audit Logs</h2>
                    <p className='text-gray-500 mb-4'>Track all system activities and maintain security logs</p>
                    <div className='bg-gray-50 rounded-lg p-4 max-w-md mx-auto'>
                        <h3 className='font-medium text-gray-700 mb-2'>Features:</h3>
                        <ul className='text-sm text-gray-600 space-y-1'>
                            <li>• Activity tracking</li>
                            <li>• User action logs</li>
                            <li>• Security monitoring</li>
                            <li>• Log filtering</li>
                            <li>• Export reports</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs; 
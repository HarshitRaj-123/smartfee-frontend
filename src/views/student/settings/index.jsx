import React from 'react';

const Settings = () => {
    return (
        <div className='p-6'>
            <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
                <h1 className='text-3xl font-bold text-gray-800 mb-2'>Settings</h1>
                <p className='text-gray-600'>Manage your account settings and preferences</p>
            </div>
            <div className='bg-white rounded-lg shadow-md p-6'>
                <div className='text-center py-12'>
                    <div className='text-6xl text-gray-300 mb-4'>⚙️</div>
                    <h2 className='text-2xl font-semibold text-gray-700 mb-2'>Account Settings</h2>
                    <p className='text-gray-500 mb-4'>Update your profile and account preferences</p>
                    <div className='bg-gray-50 rounded-lg p-4 max-w-md mx-auto'>
                        <h3 className='font-medium text-gray-700 mb-2'>Features:</h3>
                        <ul className='text-sm text-gray-600 space-y-1'>
                            <li>• Profile information</li>
                            <li>• Change password</li>
                            <li>• Notification settings</li>
                            <li>• Contact information</li>
                            <li>• Privacy settings</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings; 
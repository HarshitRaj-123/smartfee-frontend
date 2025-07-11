import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

const Settings = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const settingsCards = [
        {
            id: 'semester-upgrade',
            title: 'Semester Upgradation',
            description: 'Upgrade students to next semester and manage academic progression',
            icon: '🎓',
            color: 'bg-blue-500',
            action: () => navigate(`/dashboard/${user?.id}/settings/semester-upgrade`),
            features: [
                'Bulk semester upgrade',
                'Individual student promotion',
                'Service management during upgrade',
                'Fee structure adjustment',
                'Upgrade history tracking'
            ]
        },
        {
            id: 'system-config',
            title: 'System Configuration',
            description: 'Configure general system settings and preferences',
            icon: '⚙️',
            color: 'bg-purple-500',
            action: () => alert('System Configuration - Coming Soon!'),
            features: [
                'General settings',
                'User preferences',
                'Security settings',
                'Backup & restore',
                'System maintenance'
            ]
        }
    ];

    return (
        <div className='p-6'>
            {/* Header */}
            <div className='mb-6'>
                <h1 className='text-3xl font-bold text-gray-800 mb-2'>System Settings</h1>
                <p className='text-gray-600'>Configure and manage various system components and preferences</p>
            </div>

            {/* Settings Cards Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {settingsCards.map((card) => (
                    <div key={card.id} className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200'>
                        <div className='p-6'>
                            {/* Card Header */}
                            <div className='flex items-center mb-4'>
                                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-white text-2xl mr-4`}>
                                    {card.icon}
                                </div>
                                <div>
                                    <h3 className='text-xl font-semibold text-gray-800'>{card.title}</h3>
                                </div>
                            </div>

                            {/* Card Description */}
                            <p className='text-gray-600 mb-4'>{card.description}</p>

                            {/* Features List */}
                            <div className='mb-6'>
                                <h4 className='text-sm font-medium text-gray-700 mb-2'>Features:</h4>
                                <ul className='text-sm text-gray-600 space-y-1'>
                                    {card.features.map((feature, index) => (
                                        <li key={index} className='flex items-center'>
                                            <span className='text-green-500 mr-2'>•</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={card.action}
                                className={`w-full ${card.color} text-white py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity duration-200`}
                            >
                                Open {card.title}
                            </button>
                        </div>
                    </div>
                ))}
            </div>


        </div>
    );
};

export default Settings; 
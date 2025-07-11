import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import adminAPI from '../../services/adminAPI';

const ImportStudentsModal = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [step, setStep] = useState(1); // 1: Service Selection, 2: File Upload, 3: Preview
    const [previewData, setPreviewData] = useState(null);
    const { addNotification } = useNotification();

    // Service configuration state
    const [serviceConfig, setServiceConfig] = useState({
        hostel: {
            enabled: false,
            roomType: 'shared' // shared, single, ac-shared, ac-single
        },
        mess: {
            enabled: false
        },
        transport: {
            enabled: false,
            route: '',
            distance: 0
        },
        scholarship: {
            enabled: false,
            percentage: 0
        },
        feeCustomization: {
            enabled: false
        }
    });

    const handleServiceChange = (service, field, value) => {
        setServiceConfig(prev => ({
            ...prev,
            [service]: {
                ...prev[service],
                [field]: value
            }
        }));
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (selectedFile) => {
        const allowedTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        
        if (!allowedTypes.includes(selectedFile.type)) {
            addNotification('Please select a CSV or Excel file', 'error');
            return;
        }
        
        if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
            addNotification('File size should be less than 5MB', 'error');
            return;
        }
        
        setFile(selectedFile);
    };

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const downloadTemplate = () => {
        // Generate CSV template based on service configuration
        const headers = [
            'studentName',
            'email',
            'phoneNumber',
            'gender',
            'dateOfBirth',
            'aadhaarNumber',
            'programName',
            'branch',
            'currentSemester',
            'admissionNumber',
            'batchYear',
            'fatherName',
            'motherName'
        ];

        // Add service-specific headers if enabled
        if (serviceConfig.hostel.enabled) {
            headers.push('hostelRoomType');
        }
        if (serviceConfig.transport.enabled) {
            headers.push('transportRoute', 'transportDistance');
        }

        const sampleData = [
            'Rajesh Kumar',
            'rajeshkumar@example.com',
            '9876543210',
            'Male',
            '2005-06-15',
            '1234-5678-9123',
            'BCA',
            'Computer Applications',
            '2',
            'SVIET-2023-BCA-091',
            '2023',
            'Manoj Kumar',
            'Sunita Devi'
        ];

        // Add service-specific sample data
        if (serviceConfig.hostel.enabled) {
            sampleData.push(serviceConfig.hostel.roomType);
        }
        if (serviceConfig.transport.enabled) {
            sampleData.push('Route A', '15');
        }

        const sampleData2 = [
            'Priya Sharma',
            'priyasharma@example.com',
            '9876543211',
            'Female',
            '2004-08-22',
            '2345-6789-0123',
            'B.Tech',
            'Computer Science and Engineering',
            '1',
            'SVIET-2024-CSE-045',
            '2024',
            'Ramesh Sharma',
            'Kavita Sharma'
        ];

        // Add service-specific sample data for second row
        if (serviceConfig.hostel.enabled) {
            sampleData2.push('single');
        }
        if (serviceConfig.transport.enabled) {
            sampleData2.push('Route B', '8');
        }

        const csvContent = [
            headers.join(','),
            sampleData.map(field => `"${field}"`).join(','),
            sampleData2.map(field => `"${field}"`).join(',')
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'students_import_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        addNotification('Template downloaded successfully!', 'success');
    };

    const handlePreview = async () => {
        if (!file) {
            addNotification('Please select a file first', 'error');
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('serviceConfig', JSON.stringify(serviceConfig));
            formData.append('preview', 'true');

            const response = await adminAPI.previewStudentImport(formData);
            setPreviewData(response.data.data);
            setStep(3);
        } catch (error) {
            console.error('Preview error:', error);
            addNotification(
                error.response?.data?.message || 'Failed to preview import',
                'error'
            );
        } finally {
            setIsUploading(false);
        }
    };

    const handleImport = async () => {
        if (!file) {
            addNotification('Please select a file to import', 'error');
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('serviceConfig', JSON.stringify(serviceConfig));

            const response = await adminAPI.importStudents(formData);
            
            addNotification(
                `Successfully imported ${response.data.data.imported} students. ${response.data.data.skipped} records skipped.`,
                'success'
            );
            
            onSuccess();
            onClose();
            resetModal();
        } catch (error) {
            console.error('Import error:', error);
            addNotification(
                error.response?.data?.message || 'Failed to import students',
                'error'
            );
        } finally {
            setIsUploading(false);
        }
    };

    const resetModal = () => {
        setFile(null);
        setStep(1);
        setPreviewData(null);
        setServiceConfig({
            hostel: { enabled: false, roomType: 'shared' },
            mess: { enabled: false },
            transport: { enabled: false, route: '', distance: 0 },
            scholarship: { enabled: false, percentage: 0 },
            feeCustomization: { enabled: false }
        });
    };

    const handleClose = () => {
        onClose();
        resetModal();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Import Students - Step {step} of 3
                        </h3>
                        <button 
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600"
                            disabled={isUploading}
                        >
                            ✕
                        </button>
                    </div>
                    
                    {/* Progress indicator */}
                    <div className="mt-4 flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>1</div>
                        <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>2</div>
                        <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>3</div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Step 1: Service Configuration */}
                    {step === 1 && (
                        <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Configure Services & Fees</h4>
                            <p className="text-sm text-gray-600 mb-6">
                                Select which services will be available for the students being imported. These settings will apply to all students in the CSV.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Hostel Configuration */}
                                <div 
                                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                                        serviceConfig.hostel.enabled 
                                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                    onClick={() => handleServiceChange('hostel', 'enabled', !serviceConfig.hostel.enabled)}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-medium text-gray-700 cursor-pointer">Hostel Facility</label>
                                        <input
                                            type="checkbox"
                                            checked={serviceConfig.hostel.enabled}
                                            onChange={(e) => e.stopPropagation()} // Prevent double toggle
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                                        />
                                    </div>
                                    {serviceConfig.hostel.enabled && (
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Default Room Type</label>
                                            <select
                                                value={serviceConfig.hostel.roomType}
                                                onChange={(e) => handleServiceChange('hostel', 'roomType', e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="shared">Shared Room</option>
                                                <option value="single">Single Room</option>
                                                <option value="ac-shared">AC Shared Room</option>
                                                <option value="ac-single">AC Single Room</option>
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {/* Mess Configuration */}
                                <div 
                                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                                        serviceConfig.mess.enabled 
                                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                    onClick={() => handleServiceChange('mess', 'enabled', !serviceConfig.mess.enabled)}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-medium text-gray-700 cursor-pointer">Mess Facility</label>
                                        <input
                                            type="checkbox"
                                            checked={serviceConfig.mess.enabled}
                                            onChange={(e) => e.stopPropagation()} // Prevent double toggle
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                                        />
                                    </div>
                                    {serviceConfig.mess.enabled && (
                                        <p className="text-xs text-gray-500">Students can choose meal preferences during enrollment</p>
                                    )}
                                </div>

                                {/* Transport Configuration */}
                                <div 
                                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                                        serviceConfig.transport.enabled 
                                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                    onClick={() => handleServiceChange('transport', 'enabled', !serviceConfig.transport.enabled)}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-medium text-gray-700 cursor-pointer">Transport Facility</label>
                                        <input
                                            type="checkbox"
                                            checked={serviceConfig.transport.enabled}
                                            onChange={(e) => e.stopPropagation()} // Prevent double toggle
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                                        />
                                    </div>
                                    {serviceConfig.transport.enabled && (
                                        <p className="text-xs text-gray-500">Route and distance can be specified in CSV or assigned later</p>
                                    )}
                                </div>

                                {/* Scholarship Configuration */}
                                <div 
                                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                                        serviceConfig.scholarship.enabled 
                                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                    onClick={() => handleServiceChange('scholarship', 'enabled', !serviceConfig.scholarship.enabled)}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-medium text-gray-700 cursor-pointer">Scholarship/Discount</label>
                                        <input
                                            type="checkbox"
                                            checked={serviceConfig.scholarship.enabled}
                                            onChange={(e) => e.stopPropagation()} // Prevent double toggle
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                                        />
                                    </div>
                                    {serviceConfig.scholarship.enabled && (
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Default Discount %</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={serviceConfig.scholarship.percentage}
                                                onChange={(e) => handleServiceChange('scholarship', 'percentage', parseInt(e.target.value) || 0)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                placeholder="0"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex justify-between">
                                <button
                                    onClick={downloadTemplate}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Download Template
                                </button>
                                <button
                                    onClick={() => setStep(2)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Next: Upload File
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: File Upload */}
                    {step === 2 && (
                        <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Upload Student Data</h4>
                            
                            {/* File Upload Area */}
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors mb-6 ${
                                    dragActive 
                                        ? 'border-blue-400 bg-blue-50' 
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                {file ? (
                                    <div className="space-y-2">
                                        <div className="text-green-600 text-4xl">📄</div>
                                        <div className="text-sm font-medium text-gray-900">{file.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </div>
                                        <button
                                            onClick={() => setFile(null)}
                                            className="text-sm text-red-600 hover:text-red-800"
                                            disabled={isUploading}
                                        >
                                            Remove file
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="text-gray-400 text-4xl">📁</div>
                                        <div className="text-gray-600">
                                            Drag and drop your file here, or{' '}
                                            <label className="text-blue-600 hover:text-blue-800 cursor-pointer underline">
                                                browse
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept=".csv,.xlsx,.xls"
                                                    onChange={handleFileInputChange}
                                                    disabled={isUploading}
                                                />
                                            </label>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Supports CSV, Excel files (max 5MB)
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Required Fields Info */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h5 className="font-medium text-gray-800 mb-2">Required Fields</h5>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                                    <div>• studentName</div>
                                    <div>• email</div>
                                    <div>• phoneNumber</div>
                                    <div>• gender</div>
                                    <div>• dateOfBirth</div>
                                    <div>• programName</div>
                                    <div>• branch</div>
                                    <div>• currentSemester</div>
                                    <div>• admissionNumber</div>
                                    <div>• batchYear</div>
                                    <div>• fatherName</div>
                                    <div>• motherName</div>
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    Optional: aadhaarNumber, service-specific fields based on your configuration
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <div className="space-x-3">
                                    <button
                                        onClick={handlePreview}
                                        disabled={!file || isUploading}
                                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUploading ? 'Processing...' : 'Preview Import'}
                                    </button>
                                    <button
                                        onClick={handleImport}
                                        disabled={!file || isUploading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUploading ? 'Importing...' : 'Import Now'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Preview */}
                    {step === 3 && previewData && (
                        <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Import Preview</h4>
                            
                            {/* Summary */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">{previewData.valid}</div>
                                    <div className="text-sm text-green-700">Valid Records</div>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-red-600">{previewData.errors}</div>
                                    <div className="text-sm text-red-700">Errors</div>
                                </div>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{previewData.duplicates}</div>
                                    <div className="text-sm text-yellow-700">Duplicates</div>
                                </div>
                            </div>

                            {/* Error Details */}
                            {previewData.errorDetails && previewData.errorDetails.length > 0 && (
                                <div className="mb-6">
                                    <h5 className="font-medium text-red-700 mb-2">Errors Found:</h5>
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                                        {previewData.errorDetails.slice(0, 10).map((error, index) => (
                                            <div key={index} className="text-sm text-red-600 mb-1">
                                                {error}
                                            </div>
                                        ))}
                                        {previewData.errorDetails.length > 10 && (
                                            <div className="text-xs text-red-500 mt-2">
                                                ... and {previewData.errorDetails.length - 10} more errors
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <button
                                    onClick={() => setStep(2)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Back to Upload
                                </button>
                                <button
                                    onClick={handleImport}
                                    disabled={previewData.valid === 0 || isUploading}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isUploading && (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    )}
                                    {isUploading ? 'Importing...' : `Import ${previewData.valid} Students`}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImportStudentsModal;
import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import adminAPI from '../../services/adminAPI';

const AddStudentModal = ({ isOpen, onClose, onSuccess, courses = [] }) => {
    const { showSuccess, showError } = useNotification();
    
    // Multi-step state
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    
    // Form data state
    const [formData, setFormData] = useState({
        // Personal Information
        fullName: '',
        admissionNo: '',
        gender: '',
        dateOfBirth: '',
        email: '',
        phoneNumber: '',
        
        // Academic Information
        courseId: '',
        programName: '',
        courseDuration: '',
        batchYear: new Date().getFullYear(),
        currentSemester: 1,
        modeOfAdmission: 'Regular',
        status: 'Active',
        
        // Services Opted
        services: {
            hostel: {
                isOpted: false,
                roomType: 'Shared',
                acType: 'Non-AC'
            },
            mess: {
                isOpted: false
            },
            transport: {
                isOpted: false,
                routeName: '',
                distance: 0
            }
        },
        
        // Fee & Financial Information
        assignCurrentSemesterFee: true,
        scholarship: {
            amount: 0,
            reason: ''
        },
        previousDues: {
            amount: 0,
            semesterDetails: ''
        },
        advancePayment: 0,
        finesAtAdmission: {
            amount: 0,
            reason: ''
        }
    });

    const steps = [
        { id: 1, title: 'Personal Info', icon: '👤' },
        { id: 2, title: 'Academic Info', icon: '🎓' },
        { id: 3, title: 'Services', icon: '🏠' },
        { id: 4, title: 'Fee Details', icon: '💰' }
    ];

    const genderOptions = ['Male', 'Female', 'Other'];
    const modeOfAdmissionOptions = ['Regular', 'Lateral Entry', 'Transfer'];
    const statusOptions = ['Active', 'Blocked'];
    const roomTypeOptions = ['Shared', 'Single', 'Double'];
    const acTypeOptions = ['Non-AC', 'AC'];

    useEffect(() => {
        if (formData.courseId) {
            const selectedCourse = courses.find(course => course._id === formData.courseId);
            if (selectedCourse) {
                setFormData(prev => ({
                    ...prev,
                    programName: selectedCourse.name,
                    courseDuration: `${selectedCourse.duration} ${selectedCourse.durationType || 'Years'}`
                }));
            }
        }
    }, [formData.courseId, courses]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear validation error for this field
        if (validationErrors[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleNestedInputChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleServiceChange = (service, field, value) => {
        setFormData(prev => ({
            ...prev,
            services: {
                ...prev.services,
                [service]: {
                    ...prev.services[service],
                    [field]: value
                }
            }
        }));
    };

    const validateStep = (step) => {
        const errors = {};
        
        switch (step) {
            case 1: // Personal Information
                if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
                if (!formData.admissionNo.trim()) errors.admissionNo = 'Admission number is required';
                if (!formData.gender) errors.gender = 'Gender is required';
                if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
                if (!formData.email.trim()) errors.email = 'Email is required';
                else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
                if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required';
                else if (!/^\d{10}$/.test(formData.phoneNumber)) errors.phoneNumber = 'Phone number must be 10 digits';
                break;
                
            case 2: // Academic Information
                if (!formData.courseId) errors.courseId = 'Course is required';
                if (!formData.batchYear) errors.batchYear = 'Batch year is required';
                if (!formData.currentSemester) errors.currentSemester = 'Semester is required';
                break;
                
            case 3: // Services (optional, no required fields)
                break;
                
            case 4: // Fee Details (optional validations)
                if (formData.scholarship.amount < 0) errors.scholarshipAmount = 'Scholarship amount cannot be negative';
                if (formData.previousDues.amount < 0) errors.previousDuesAmount = 'Previous dues cannot be negative';
                if (formData.advancePayment < 0) errors.advancePayment = 'Advance payment cannot be negative';
                if (formData.finesAtAdmission.amount < 0) errors.finesAmount = 'Fines amount cannot be negative';
                break;
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 4));
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateStep(4)) return;
        
        setLoading(true);
        try {
            // Prepare data for submission
            const studentData = {
                // Personal Information
                firstName: formData.fullName.split(' ')[0],
                lastName: formData.fullName.split(' ').slice(1).join(' ') || '',
                admissionNo: formData.admissionNo,
                gender: formData.gender,
                dateOfBirth: formData.dateOfBirth,
                email: formData.email,
                phone: formData.phoneNumber,
                guardianName: formData.guardianName,
                guardianContact: formData.guardianContact,
                address: formData.address,
                
                // Academic Information
                courseId: formData.courseId,
                batchYear: formData.batchYear,
                currentSemester: formData.currentSemester,
                modeOfAdmission: formData.modeOfAdmission,
                status: formData.status,
                enrollmentDate: new Date().toISOString(),
                
                // Services
                servicesOpted: formData.services,
                
                // Fee Information
                assignCurrentSemesterFee: formData.assignCurrentSemesterFee,
                scholarship: formData.scholarship,
                previousDues: formData.previousDues,
                advancePayment: formData.advancePayment,
                finesAtAdmission: formData.finesAtAdmission
            };

            const response = await adminAPI.createStudent(studentData);
            showSuccess('Student added successfully!');
            onSuccess(response.data);
            handleClose();
        } catch (error) {
            console.error('Error adding student:', error);
            showError(error.response?.data?.message || 'Failed to add student');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setCurrentStep(1);
        setFormData({
            fullName: '',
            admissionNo: '',
            gender: '',
            dateOfBirth: '',
            email: '',
            phoneNumber: '',
            courseId: '',
            programName: '',
            courseDuration: '',
            batchYear: new Date().getFullYear(),
            currentSemester: 1,
            modeOfAdmission: 'Regular',
            status: 'Active',
            services: {
                hostel: { isOpted: false, roomType: 'Shared', acType: 'Non-AC' },
                mess: { isOpted: false },
                transport: { isOpted: false, routeName: '', distance: 0 }
            },
            assignCurrentSemesterFee: true,
            scholarship: { amount: 0, reason: '' },
            previousDues: { amount: 0, semesterDetails: '' },
            advancePayment: 0,
            finesAtAdmission: { amount: 0, reason: '' }
        });
        setValidationErrors({});
        onClose();
    };

    const handleReset = () => {
        const currentStepData = { ...formData };
        switch (currentStep) {
            case 1:
                setFormData(prev => ({
                    ...prev,
                    fullName: '',
                    admissionNo: '',
                    gender: '',
                    dateOfBirth: '',
                    email: '',
                    phoneNumber: ''
                }));
                break;
            case 2:
                setFormData(prev => ({
                    ...prev,
                    courseId: '',
                    programName: '',
                    courseDuration: '',
                    batchYear: new Date().getFullYear(),
                    currentSemester: 1,
                    modeOfAdmission: 'Regular',
                    status: 'Active'
                }));
                break;
            case 3:
                setFormData(prev => ({
                    ...prev,
                    services: {
                        hostel: { isOpted: false, roomType: 'Shared', acType: 'Non-AC' },
                        mess: { isOpted: false },
                        transport: { isOpted: false, routeName: '', distance: 0 }
                    }
                }));
                break;
            case 4:
                setFormData(prev => ({
                    ...prev,
                    assignCurrentSemesterFee: true,
                    scholarship: { amount: 0, reason: '' },
                    previousDues: { amount: 0, semesterDetails: '' },
                    advancePayment: 0,
                    finesAtAdmission: { amount: 0, reason: '' }
                }));
                break;
        }
        setValidationErrors({});
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 text-white p-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Add New Student</h2>
                        <button
                            onClick={handleClose}
                            className="text-white hover:text-gray-200 text-2xl"
                        >
                            ×
                        </button>
                    </div>
                    
                    {/* Step Indicator */}
                    <div className="flex justify-center mt-4 space-x-4">
                        {steps.map((step) => (
                            <div
                                key={step.id}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                                    currentStep === step.id
                                        ? 'bg-blue-500 text-white'
                                        : currentStep > step.id
                                        ? 'bg-green-500 text-white'
                                        : 'bg-blue-300 text-blue-100'
                                }`}
                            >
                                <span className="text-lg">{step.icon}</span>
                                <span className="font-medium">{step.title}</span>
                                {currentStep > step.id && (
                                    <span className="text-sm">✓</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {/* Step 1: Personal Information */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            validationErrors.fullName ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter full name"
                                    />
                                    {validationErrors.fullName && (
                                        <p className="text-red-500 text-sm mt-1">{validationErrors.fullName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Admission No. *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.admissionNo}
                                        onChange={(e) => handleInputChange('admissionNo', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            validationErrors.admissionNo ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter admission number"
                                    />
                                    {validationErrors.admissionNo && (
                                        <p className="text-red-500 text-sm mt-1">{validationErrors.admissionNo}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Gender *
                                    </label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => handleInputChange('gender', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            validationErrors.gender ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Select Gender</option>
                                        {genderOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                    {validationErrors.gender && (
                                        <p className="text-red-500 text-sm mt-1">{validationErrors.gender}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date of Birth *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            validationErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {validationErrors.dateOfBirth && (
                                        <p className="text-red-500 text-sm mt-1">{validationErrors.dateOfBirth}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            validationErrors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter email address"
                                    />
                                    {validationErrors.email && (
                                        <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            validationErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter 10-digit phone number"
                                        maxLength="10"
                                    />
                                    {validationErrors.phoneNumber && (
                                        <p className="text-red-500 text-sm mt-1">{validationErrors.phoneNumber}</p>
                                    )}
                                </div>

                            </div>
                        </div>
                    )}

                    {/* Step 2: Academic Information */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Academic Information</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Course *
                                    </label>
                                    <select
                                        value={formData.courseId}
                                        onChange={(e) => handleInputChange('courseId', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            validationErrors.courseId ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">Select Course</option>
                                        {courses.map(course => (
                                            <option key={course._id} value={course._id}>
                                                {course.name} ({course.code})
                                            </option>
                                        ))}
                                    </select>
                                    {validationErrors.courseId && (
                                        <p className="text-red-500 text-sm mt-1">{validationErrors.courseId}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Program Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.programName}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                                        placeholder="Auto-filled from course"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Course Duration
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.courseDuration}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                                        placeholder="Auto-filled from course"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Batch Year / Enrollment Year *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.batchYear}
                                        onChange={(e) => handleInputChange('batchYear', parseInt(e.target.value))}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            validationErrors.batchYear ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        min="2000"
                                        max="2030"
                                    />
                                    {validationErrors.batchYear && (
                                        <p className="text-red-500 text-sm mt-1">{validationErrors.batchYear}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Semester *
                                    </label>
                                    <select
                                        value={formData.currentSemester}
                                        onChange={(e) => handleInputChange('currentSemester', parseInt(e.target.value))}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            validationErrors.currentSemester ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                            <option key={sem} value={sem}>Semester {sem}</option>
                                        ))}
                                    </select>
                                    {validationErrors.currentSemester && (
                                        <p className="text-red-500 text-sm mt-1">{validationErrors.currentSemester}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mode of Admission *
                                    </label>
                                    <select
                                        value={formData.modeOfAdmission}
                                        onChange={(e) => handleInputChange('modeOfAdmission', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {modeOfAdmissionOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status *
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => handleInputChange('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {statusOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Services Opted */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Services Opted (Optional)</h3>
                            
                            {/* Hostel Service */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center space-x-3 mb-3">
                                    <input
                                        type="checkbox"
                                        id="hostel"
                                        checked={formData.services.hostel.isOpted}
                                        onChange={(e) => handleServiceChange('hostel', 'isOpted', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="hostel" className="text-lg font-medium text-gray-700">
                                        🏠 Hostel
                                    </label>
                                </div>
                                
                                {formData.services.hostel.isOpted && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Room Type
                                            </label>
                                            <select
                                                value={formData.services.hostel.roomType}
                                                onChange={(e) => handleServiceChange('hostel', 'roomType', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {roomTypeOptions.map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                AC Type
                                            </label>
                                            <select
                                                value={formData.services.hostel.acType}
                                                onChange={(e) => handleServiceChange('hostel', 'acType', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {acTypeOptions.map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mess Service */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        id="mess"
                                        checked={formData.services.mess.isOpted}
                                        onChange={(e) => handleServiceChange('mess', 'isOpted', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="mess" className="text-lg font-medium text-gray-700">
                                        🍽️ Mess
                                    </label>
                                </div>
                            </div>

                            {/* Transport Service */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center space-x-3 mb-3">
                                    <input
                                        type="checkbox"
                                        id="transport"
                                        checked={formData.services.transport.isOpted}
                                        onChange={(e) => handleServiceChange('transport', 'isOpted', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="transport" className="text-lg font-medium text-gray-700">
                                        🚌 Transport
                                    </label>
                                </div>
                                
                                {formData.services.transport.isOpted && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Route Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.services.transport.routeName}
                                                onChange={(e) => handleServiceChange('transport', 'routeName', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter route name"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Distance (km)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.services.transport.distance}
                                                onChange={(e) => handleServiceChange('transport', 'distance', parseFloat(e.target.value) || 0)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter distance"
                                                min="0"
                                                step="0.1"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Fee & Financial Information */}
                    {currentStep === 4 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Fee & Financial Information</h3>
                            
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        id="assignFee"
                                        checked={formData.assignCurrentSemesterFee}
                                        onChange={(e) => handleInputChange('assignCurrentSemesterFee', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="assignFee" className="text-lg font-medium text-gray-700">
                                        💰 Assign Current Semester Fee
                                    </label>
                                </div>
                                <p className="text-sm text-gray-600 mt-2 ml-7">
                                    Fee structure will auto-load from predefined template based on course + semester
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Scholarship Amount
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.scholarship.amount}
                                        onChange={(e) => handleNestedInputChange('scholarship', 'amount', parseFloat(e.target.value) || 0)}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            validationErrors.scholarshipAmount ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter scholarship amount"
                                        min="0"
                                    />
                                    {validationErrors.scholarshipAmount && (
                                        <p className="text-red-500 text-sm mt-1">{validationErrors.scholarshipAmount}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Scholarship Reason
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.scholarship.reason}
                                        onChange={(e) => handleNestedInputChange('scholarship', 'reason', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter reason for scholarship"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Previous Dues Amount
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.previousDues.amount}
                                        onChange={(e) => handleNestedInputChange('previousDues', 'amount', parseFloat(e.target.value) || 0)}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            validationErrors.previousDuesAmount ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter previous dues"
                                        min="0"
                                    />
                                    {validationErrors.previousDuesAmount && (
                                        <p className="text-red-500 text-sm mt-1">{validationErrors.previousDuesAmount}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Semester Details for Dues
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.previousDues.semesterDetails}
                                        onChange={(e) => handleNestedInputChange('previousDues', 'semesterDetails', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter semester details"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Advance Payment Made
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.advancePayment}
                                        onChange={(e) => handleInputChange('advancePayment', parseFloat(e.target.value) || 0)}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            validationErrors.advancePayment ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter advance payment"
                                        min="0"
                                    />
                                    {validationErrors.advancePayment && (
                                        <p className="text-red-500 text-sm mt-1">{validationErrors.advancePayment}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fines/Extra Charges at Admission
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.finesAtAdmission.amount}
                                        onChange={(e) => handleNestedInputChange('finesAtAdmission', 'amount', parseFloat(e.target.value) || 0)}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            validationErrors.finesAmount ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter fines amount"
                                        min="0"
                                    />
                                    {validationErrors.finesAmount && (
                                        <p className="text-red-500 text-sm mt-1">{validationErrors.finesAmount}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Reason for Fines/Extra Charges
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.finesAtAdmission.reason}
                                        onChange={(e) => handleNestedInputChange('finesAtAdmission', 'reason', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter reason for fines"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                    <div className="flex space-x-2">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Reset Step
                        </button>
                    </div>
                    
                    <div className="flex space-x-2">
                        {currentStep > 1 && (
                            <button
                                onClick={handlePrevious}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Previous
                            </button>
                        )}
                        
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        
                        {currentStep < 4 ? (
                            <button
                                onClick={handleNext}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : 'Save Student'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddStudentModal; 
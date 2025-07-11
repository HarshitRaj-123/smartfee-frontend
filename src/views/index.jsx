import React from 'react';
import '../styles/webcrumbs.css';

const LandingPage = () => {
    return (
        <div id="webcrumbs">
            <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-200/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary-100/20 to-primary-200/20 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                    <div className="text-center lg:text-left px-4 lg:px-0">
                        <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full mb-6">
                            <span className="material-symbols-outlined text-primary-600 mr-2">
                                auto_awesome
                            </span>
                            <span className="text-primary-700 font-medium">
                                Complete Fee & Finance Automation
                            </span>
                        </div>

                        <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
                            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                Smart
                            </span>
                            <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                                Fee
                            </span>
                        </h2>

                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            Eliminate inefficiencies, paperwork, and revenue leaks in education finance systems through
                            automation, transparency, and intelligent role-based controls.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <button className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                                <span className="flex items-center justify-center">
                                    <span className="material-symbols-outlined mr-2">
                                        rocket_launch
                                    </span>
                                    Call for Support
                                </span>
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-8 text-center">
                            <div>
                                <div className="text-3xl font-bold text-primary-600 mb-2">
                                    500+
                                </div>
                                <div className="text-gray-500">
                                    Institutes
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-primary-600 mb-2">
                                    50K+
                                </div>
                                <div className="text-gray-500">
                                    Students
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-primary-600 mb-2">
                                    99.9%
                                </div>
                                <div className="text-gray-500">
                                    Uptime
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative px-4 lg:px-0">
                        <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-6 lg:p-8 transform hover:scale-105 transition-transform">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                </div>
                                <span className="text-gray-400 text-sm">
                                    Dashboard Preview
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                                            <span className="material-symbols-outlined text-white">
                                                account_balance_wallet
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-800">
                                                Total Collection
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                This Month
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-primary-600">
                                            ₹8,45,000
                                        </div>
                                        <div className="text-sm text-green-500">
                                            +12.5%
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-blue-50 rounded-xl">
                                        <div className="text-2xl font-bold text-primary-600 mb-1">
                                            1,247
                                        </div>
                                        <div className="text-sm text-blue-500">
                                            Active Students
                                        </div>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-xl">
                                        <div className="text-2xl font-bold text-green-600 mb-1">
                                            ₹2,34,500
                                        </div>
                                        <div className="text-sm text-green-500">
                                            Pending Dues
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-medium text-gray-700">
                                            Recent Payments
                                        </span>
                                        <span className="material-symbols-outlined text-gray-400">
                                            more_horiz
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">
                                                John Doe - Semester 3
                                            </span>
                                            <span className="text-green-600 font-medium">
                                                ₹15,000
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">
                                                Sarah Wilson - Hostel Fee
                                            </span>
                                            <span className="text-green-600 font-medium">
                                                ₹8,500
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">
                                                Mike Johnson - Transport
                                            </span>
                                            <span className="text-green-600 font-medium">
                                                ₹3,200
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full opacity-80 animate-pulse"></div>
                        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-primary-300 to-primary-400 rounded-full opacity-60 animate-pulse delay-500"></div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white rounded-3xl shadow-sm mb-16">
                <div className="max-w-6xl mx-auto px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full mb-6">
                            <span className="material-symbols-outlined text-primary-600 mr-2">
                                stars
                            </span>
                            <span className="text-primary-700 font-medium">
                                Key Features
                            </span>
                        </div>
                        <h3 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Everything You Need for Fee Management
                        </h3>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            From role-based access to automated payments, SmartFee provides all the tools your institution
                            needs.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="group p-8 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-white text-2xl">
                                    security
                                </span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 mb-4">
                                Role-Based Access
                            </h4>
                            <p className="text-gray-600 mb-4">
                                Admin, Accountant, and Student roles with custom permissions and dynamic dashboards.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-primary-200 text-primary-700 rounded-full text-sm">
                                    JWT Auth
                                </span>
                                <span className="px-3 py-1 bg-primary-200 text-primary-700 rounded-full text-sm">
                                    Custom Perms
                                </span>
                            </div>
                        </div>

                        <div className="group p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-white text-2xl">
                                    payment
                                </span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 mb-4">
                                Online & Offline Payments
                            </h4>
                            <p className="text-gray-600 mb-4">
                                Razorpay integration for digital payments plus manual entry for cash and cheque.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-blue-200 text-blue-700 rounded-full text-sm">
                                    Razorpay
                                </span>
                                <span className="px-3 py-1 bg-blue-200 text-blue-700 rounded-full text-sm">
                                    PDF Receipts
                                </span>
                            </div>
                        </div>

                        <div className="group p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-white text-2xl">
                                    auto_awesome
                                </span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 mb-4">
                                Dynamic Fee Management
                            </h4>
                            <p className="text-gray-600 mb-4">
                                Course-wise templates, service-based fees, and fine management with full customization.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-green-200 text-green-700 rounded-full text-sm">
                                    Templates
                                </span>
                                <span className="px-3 py-1 bg-green-200 text-green-700 rounded-full text-sm">
                                    Custom Fees
                                </span>
                            </div>
                        </div>

                        <div className="group p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-white text-2xl">
                                    school
                                </span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 mb-4">
                                Semester Management
                            </h4>
                            <p className="text-gray-600 mb-4">
                                Automatic student promotion, carry-forward balances, and semester-wise service tracking.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-purple-200 text-purple-700 rounded-full text-sm">
                                    Auto Upgrade
                                </span>
                                <span className="px-3 py-1 bg-purple-200 text-purple-700 rounded-full text-sm">
                                    History Log
                                </span>
                            </div>
                        </div>

                        <div className="group p-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-white text-2xl">
                                    notifications
                                </span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 mb-4">
                                Smart Notifications
                            </h4>
                            <p className="text-gray-600 mb-4">
                                Email and SMS alerts for due payments, semester upgrades, and successful transactions.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-orange-200 text-orange-700 rounded-full text-sm">
                                    Nodemailer
                                </span>
                                <span className="px-3 py-1 bg-orange-200 text-orange-700 rounded-full text-sm">
                                    Twilio SMS
                                </span>
                            </div>
                        </div>

                        <div className="group p-8 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-white text-2xl">
                                    analytics
                                </span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 mb-4">
                                Advanced Analytics
                            </h4>
                            <p className="text-gray-600 mb-4">
                                Role-specific dashboards, audit logs, and export capabilities for compliance reporting.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-teal-200 text-teal-700 rounded-full text-sm">
                                    CSV Export
                                </span>
                                <span className="px-3 py-1 bg-teal-200 text-teal-700 rounded-full text-sm">
                                    Audit Logs
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Advantages Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl text-white mb-16 mx-8">
                <div className="max-w-6xl mx-auto px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Competitive Advantage</h2>
                    <p className="text-xl mb-12 opacity-90 max-w-3xl mx-auto">
                        See how SmartFee outperforms traditional fee management solutions
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-200">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                <span className="material-symbols-outlined text-2xl">done</span>
                            </div>
                            <h4 className="text-lg font-semibold mb-2">Custom Permissions</h4>
                            <p className="text-sm opacity-80">Flexible role management vs fixed roles</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-200">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                <span className="material-symbols-outlined text-2xl">payments</span>
                            </div>
                            <h4 className="text-lg font-semibold mb-2">Dual Payment Support</h4>
                            <p className="text-sm opacity-80">Online + offline vs online-only solutions</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-200">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                <span className="material-symbols-outlined text-2xl">autorenew</span>
                            </div>
                            <h4 className="text-lg font-semibold mb-2">Semester Automation</h4>
                            <p className="text-sm opacity-80">Built-in logic vs manual tracking</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-200">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                <span className="material-symbols-outlined text-2xl">cloud</span>
                            </div>
                            <h4 className="text-lg font-semibold mb-2">Self-Hosted Option</h4>
                            <p className="text-sm opacity-80">Full control vs SaaS dependency</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Future Roadmap Section */}
            <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl mb-16 mx-8">
                <div className="max-w-6xl mx-auto px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Future Roadmap</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Exciting features coming soon to enhance your experience
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200">
                            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                                <span className="material-symbols-outlined text-white text-2xl">psychology</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">AI Predictions</h4>
                            <p className="text-gray-600 text-sm">Smart payment forecasting and automated reminders</p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                                <span className="material-symbols-outlined text-white text-2xl">qr_code</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">QR Payments</h4>
                            <p className="text-gray-600 text-sm">Quick physical payment processing with QR codes</p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                                <span className="material-symbols-outlined text-white text-2xl">support_agent</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">AI Call Support</h4>
                            <p className="text-gray-600 text-sm">Automated call reminders and support assistance</p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                                <span className="material-symbols-outlined text-white text-2xl">phone_android</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Mobile App</h4>
                            <p className="text-gray-600 text-sm">Native mobile application for enhanced accessibility</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                        Ready to Transform Your Institution?
                    </h2>
                    <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
                        Join hundreds of educational institutions already using SmartFee to streamline their financial
                        operations
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
                        <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2">
                            <span>Start Your Free Trial</span>
                            <span className="material-symbols-outlined">rocket_launch</span>
                        </button>
                        <button className="border-2 border-gray-300 text-gray-700 px-10 py-4 rounded-xl text-lg font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-200 flex items-center space-x-2">
                            <span className="material-symbols-outlined">schedule</span>
                            <span>Schedule Demo</span>
                        </button>
                    </div>
                    <div className="flex items-center justify-center space-x-8 text-gray-500">
                        <div className="flex items-center space-x-2">
                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                            <span>No Setup Fees</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                            <span>30-Day Free Trial</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                            <span>24/7 Support</span>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default LandingPage;
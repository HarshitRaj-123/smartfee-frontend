import React from "react";
import { lazy, Suspense } from "react";
import Loader from '../utils/Loader/index'
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Import critical components directly (not lazy loaded)
import LandingLayout from "../layout";
import DashboardLayoutAppBar from "../layout/admin";
import ProtectedRoute from "./ProtectedRoute";
import AuthRoutes from "./auth";

// Lazy load main pages with appropriate fallbacks
const LandingPage = Loader(lazy(() => import("../views/index")), 'page');

// Dashboard pages for all roles
const AdminDashboard = Loader(lazy(() => import("../views/admin/index")), 'page');
const AccountantDashboard = Loader(lazy(() => import("../views/accountant/index")), 'page');
const StudentDashboard = Loader(lazy(() => import("../views/student/index")), 'page');

// Admin pages with page-level loading
const UsersPage = Loader(lazy(() => import("../views/admin/users/index")), 'page');
const StudentsPage = Loader(lazy(() => import("../views/admin/students/index")), 'page');
const FeeManagementPage = Loader(lazy(() => import("../views/admin/fee-management/index")), 'page');
const AdminFeePaymentPage = Loader(lazy(() => import("../views/admin/fee-payment/index")), 'page');
const AdminTransactionsPage = Loader(lazy(() => import("../views/admin/transactions/index")), 'page');
const AdminNotificationsPage = Loader(lazy(() => import("../views/admin/notifications/index")), 'page');
const AuditLogsPage = Loader(lazy(() => import("../views/admin/audit-logs/index")), 'page');
const AdminSettingsPage = Loader(lazy(() => import("../views/admin/settings/index")), 'page');
const SemesterUpgradePage = Loader(lazy(() => import("../views/admin/settings/SemesterUpgradePage")), 'page');

// Accountant pages with page-level loading
const AccountantStudentsPage = Loader(lazy(() => import("../views/accountant/students/index")), 'page');
const AccountantFeePaymentPage = Loader(lazy(() => import("../views/accountant/fee-payment/index")), 'page');
const AccountantTransactionsPage = Loader(lazy(() => import("../views/accountant/transactions/index")), 'page');
const AccountantNotificationsPage = Loader(lazy(() => import("../views/accountant/notifications/index")), 'page');
const AccountantSettingsPage = Loader(lazy(() => import("../views/accountant/settings/index")), 'page');

// Student pages with page-level loading
const StudentTransactionsPage = Loader(lazy(() => import("../views/student/transactions/index")), 'page');
const StudentFeePaymentPage = Loader(lazy(() => import("../views/student/fee-payment/index")), 'page');
const StudentNotificationsPage = Loader(lazy(() => import("../views/student/notifications/index")), 'page');
const StudentSettingsPage = Loader(lazy(() => import("../views/student/settings/index")), 'page');

// Import the custom 404 component
const NotFound = lazy(() => import("../components/NotFound"));

// Error pages as regular components
const UnauthorizedPage = () => (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-lg text-gray-600 mb-8">You don't have permission to access this page.</p>
            <a 
                href="/" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
                Go Back Home
            </a>
        </div>
    </div>
);

const NotFoundPage = Loader(NotFound, 'page');

// Role-based dashboard component selector with lazy loading
const DashboardSelector = () => {
    const { user } = useAuth();
    
    if (!user) return <div>Loading...</div>;
    
    switch (user.role) {
        case 'super_admin':
        case 'admin':
            return <AdminDashboard />;
        case 'accountant':
            return <AccountantDashboard />;
        case 'student':
            return <StudentDashboard />;
        default:
            return <div>Invalid user role</div>;
    }
};

// Role-based component selector for different pages
const PageSelector = ({ pageType }) => {
    const { user } = useAuth();
    
    if (!user) return <div>Loading...</div>;
    
    const role = user.role;
    
    switch (pageType) {
        case 'users':
            if (role === 'super_admin' || role === 'admin') {
                return <UsersPage />;
            }
            return <UnauthorizedPage />;
            
        case 'students':
            if (role === 'super_admin' || role === 'admin') {
                return <StudentsPage />;
            } else if (role === 'accountant') {
                return <AccountantStudentsPage />;
            }
            return <UnauthorizedPage />;
            
        case 'fee-management':
            if (role === 'super_admin' || role === 'admin') {
                return <FeeManagementPage />;
            }
            return <UnauthorizedPage />;
            
        case 'fee-payment':
            if (role === 'super_admin' || role === 'admin') {
                return <AdminFeePaymentPage />;
            } else if (role === 'accountant') {
                return <AccountantFeePaymentPage />;
            } else if (role === 'student') {
                return <StudentFeePaymentPage />;
            }
            return <UnauthorizedPage />;
            
        case 'transactions':
            if (role === 'accountant') {
                return <AccountantTransactionsPage />;
            } else if (role === 'student') {
                return <StudentTransactionsPage />;
            }
            return <UnauthorizedPage />;
            
        case 'notifications':
            if (role === 'super_admin' || role === 'admin') {
                return <AdminNotificationsPage />;
            } else if (role === 'accountant') {
                return <AccountantNotificationsPage />;
            } else if (role === 'student') {
                return <StudentNotificationsPage />;
            }
            return <UnauthorizedPage />;
            
        case 'audit-logs':
            if (role === 'super_admin' || role === 'admin') {
                return <AuditLogsPage />;
            }
            return <UnauthorizedPage />;
            
        case 'settings':
            if (role === 'super_admin' || role === 'admin') {
                return <AdminSettingsPage />;
            } else if (role === 'accountant') {
                return <AccountantSettingsPage />;
            } else if (role === 'student') {
                return <StudentSettingsPage />;
            }
            return <UnauthorizedPage />;
            
        case 'semester-upgrade':
            if (role === 'super_admin' || role === 'admin') {
                return <SemesterUpgradePage />;
            }
            return <UnauthorizedPage />;
            
        default:
            return <UnauthorizedPage />;
    }
};

const LandingRoutes = {
    path: "/",
    element: <LandingLayout />,
    children: [
        {
            path: "/",
            element: <LandingPage />
        },
        {
            path: "/unauthorized",
            element: <UnauthorizedPage />
        },
        {
            path: "/401",
            element: <UnauthorizedPage />
        },
        {
            path: "/404",
            element: <NotFoundPage />
        },
        {
            path: "*",
            element: <NotFoundPage />
        }
    ],
}

// Unified dashboard routes using user ID
const DashboardRoutes = {
    element: (
      <ProtectedRoute redirectTo="/login">
        <DashboardLayoutAppBar />
      </ProtectedRoute>
    ),
    path: "/dashboard/:userId",
    children: [
        {
            path: "/dashboard/:userId/dashboard",
            element: <DashboardSelector />
        },
        {
            path: "/dashboard/:userId",
            element: <Navigate to="dashboard" replace />
        },
        {
            path: "/dashboard/:userId/users",
            element: <PageSelector pageType="users" />
        },
        {
            path: "/dashboard/:userId/students",
            element: <PageSelector pageType="students" />
        },
        {
            path: "/dashboard/:userId/fee-management",
            element: <PageSelector pageType="fee-management" />
        },
        {
            path: "/dashboard/:userId/fee-payment",
            element: <PageSelector pageType="fee-payment" />
        },
        {
            path: "/dashboard/:userId/transactions",
            element: <PageSelector pageType="transactions" />
        },
        {
            path: "/dashboard/:userId/notifications",
            element: <PageSelector pageType="notifications" />
        },
        {
            path: "/dashboard/:userId/audit-logs",
            element: <PageSelector pageType="audit-logs" />
        },
        {
            path: "/dashboard/:userId/settings",
            element: <PageSelector pageType="settings" />
        },
        {
            path: "/dashboard/:userId/settings/semester-upgrade",
            element: <PageSelector pageType="semester-upgrade" />
        }
    ]
}

const router = createBrowserRouter([
    LandingRoutes,
    AuthRoutes,
    DashboardRoutes,
]);

export default router;
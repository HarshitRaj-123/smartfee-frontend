import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'

const ProtectedRoute = ({ children, allowedRoles = [], role, layout, redirectTo = '/login' }) => {
    const location = useLocation()
    const { isAuthenticated, user, accessToken, isLoading, isInitialized } = useAuth()

    // Role hierarchy for access control (matches backend roles)
    const roleHierarchy = {
        super_admin: ['super_admin', 'admin', 'accountant', 'student'],
        admin: ['admin', 'accountant', 'student'],
        accountant: ['accountant', 'student'],
        student: ['student']
    }

    // Show loading spinner while initial auth check is in progress
    if (!isInitialized || isLoading) {
        return <LoadingSpinner />
    }

    // Check if user is authenticated (must have accessToken in memory)
    if (isInitialized && (!isAuthenticated || !accessToken || !user)) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Check role-based access with hierarchy
    if (role && user?.role) {
        const userRole = user.role
        const allowedRolesForUser = roleHierarchy[userRole] || []
        
        // Check if user's role hierarchy includes the required role
        if (!allowedRolesForUser.includes(role)) {
            return <Navigate to="/unauthorized" replace />
        }
    }

    // Check allowed roles
    if (allowedRoles.length > 0) {
        const userRole = user?.role
        const allowedRolesForUser = roleHierarchy[userRole] || []
        const hasAccess = allowedRoles.some(r => allowedRolesForUser.includes(r))
        
        if (!hasAccess) {
            return <Navigate to="/unauthorized" replace />
        }
    }

    // If layout is provided, wrap children with it
    if (layout) {
        return React.cloneElement(layout, {}, children)
    }

    return children
}

export default ProtectedRoute
import React, { lazy, Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { UserProvider } from './contexts/UserContext'
import router from './routes'

// Lazy load components that can be lazy loaded
const NotificationContainer = lazy(() => import('./components/NotificationContainer'))

// Loading fallback component
const AppLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading SmartFee...</p>
    </div>
  </div>
)

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <UserProvider>
          <RouterProvider router={router} />
          <Suspense fallback={null}>
            <NotificationContainer />
          </Suspense>
        </UserProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
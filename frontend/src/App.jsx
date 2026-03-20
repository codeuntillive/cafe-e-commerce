import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/db'
import Otp from './pages/otp'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import MenuManagement from './pages/admin/MenuManagement'
import TableManagement from './pages/admin/TableManagement'
import OrderManagement from './pages/admin/OrderManagement'
import TransactionHistory from './pages/admin/TransactionHistory'

// Customer Pages
import CustomerMenu from './pages/customer/CustomerMenu'
import Cart from './pages/customer/Cart'
import OrderSuccess from './pages/customer/OrderSuccess'

// Auth Store
import { useAuthStore } from './zustnd/authStore'

// Protected Route Component for Admin
const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />
  }

  if (!isAdmin) {
    return <Navigate to='/' replace />
  }

  return children
}

// Protected Route Component for authenticated users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />
  }

  return children
}

// Public Route - redirect if already logged in
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isAuthenticated) {
    if (isAdmin) {
      return <Navigate to='/admin' replace />
    }
    return <Navigate to='/' replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Home/>} />
        <Route path='/login' element={
          <PublicRoute>
            <Login/>
          </PublicRoute>
        } />
        <Route path='/signup' element={
          <PublicRoute>
            <Signup/>
          </PublicRoute>
        } />
        <Route path='/dashboard' element={<Dashboard/>} />
        <Route path="/otp" element={<Otp />} />

        {/* Customer Routes (no login required) */}
        <Route path='/table/:uniqueLink' element={<CustomerMenu />} />
        <Route path='/customer/cart/:uniqueLink' element={<Cart />} />
        <Route path='/customer/success/:orderId' element={<OrderSuccess />} />

        {/* Admin Routes (protected) */}
        <Route path='/admin' element={
          <ProtectedAdminRoute>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedAdminRoute>
        } />
        <Route path='/admin/orders' element={
          <ProtectedAdminRoute>
            <AdminLayout>
              <OrderManagement />
            </AdminLayout>
          </ProtectedAdminRoute>
        } />
        <Route path='/admin/menu' element={
          <ProtectedAdminRoute>
            <AdminLayout>
              <MenuManagement />
            </AdminLayout>
          </ProtectedAdminRoute>
        } />
        <Route path='/admin/tables' element={
          <ProtectedAdminRoute>
            <AdminLayout>
              <TableManagement />
            </AdminLayout>
          </ProtectedAdminRoute>
        } />
        <Route path='/admin/history' element={
          <ProtectedAdminRoute>
            <AdminLayout>
              <TransactionHistory />
            </AdminLayout>
          </ProtectedAdminRoute>
        } />

        {/* Fallback */}
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  )
}

export default App

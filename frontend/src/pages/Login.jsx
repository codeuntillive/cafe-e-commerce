import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuthStore } from '../zustnd/authStore'
import '../style/Login.css'

const API_URL = 'http://localhost:3000/api';

function Login() {
  const navigate = useNavigate()
  const { setUser, setIsAdmin } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.email,
          password: formData.password
        })
      })

      if (res.ok) {
        // Check if user is admin
        const adminRes = await fetch(`${API_URL}/auth/is-admin`, {
          credentials: 'include'
        })
        const adminData = await adminRes.json()
        
        // Get user data
        const userRes = await fetch(`${API_URL}/auth/user`, {
          credentials: 'include'
        })
        const userData = await userRes.json()

        if (userData.validate) {
          setUser(userData.user)
          setIsAdmin(adminData.isAdmin)
          toast.success('Login successful!')
          
          if (adminData.isAdmin) {
            navigate('/admin')
          } else {
            navigate('/')
          }
        }
      } else {
        const errorText = await res.text()
        toast.error(errorText || 'Login failed. Please try again.')
      }
    } catch (err) {
      console.error('Login error:', err)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='login-container'>
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <h1>Welcome back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className='login-form'>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input 
                  type="email" 
                  id='email' 
                  name='email' 
                  placeholder='Enter your email'
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id='password' 
                  name='password' 
                  placeholder='Enter your password'
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button type='submit' className='login-btn' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="btn-icon" size={18} />
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>Don't have an account?</p>
            <Link to="/signup" className="signup-link">
              Create account
            </Link>
          </div>

          <div className="admin-hint">
            <p>Admin login: <code>admin@restaurant.com</code> / <code>admin123</code></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

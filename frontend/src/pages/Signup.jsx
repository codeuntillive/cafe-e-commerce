import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, Image, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuthStore } from '../zustnd/authStore'
import '../style/Signup.css'

function Signup() {
  const navigate = useNavigate()
  const { register } = useAuthStore()
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    profilepic: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await register(formData.fullname, formData.email, formData.password)
      
      if (result.validate) {
        toast.success('OTP sent to your email. Please verify.')
        navigate('/otp')
      } else {
        toast.error(result.message || 'Registration failed. Please try again.')
      }
    } catch (err) {
      console.error('Registration error:', err)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='signup-container'>
      <div className="signup-wrapper">
        <div className="signup-card">
          <div className="signup-header">
            <h1>Create account</h1>
            <p>Sign up to get started with your account</p>
          </div>

          <form onSubmit={handleSubmit} className='signup-form'>
            <div className="input-group">
              <label htmlFor="fullname">Full Name</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input 
                  type="text" 
                  id='fullname' 
                  name='fullname' 
                  placeholder='Enter your full name'
                  value={formData.fullname} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

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
                  placeholder='Create a password'
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
            </div>

            <div className="input-group">
              <label htmlFor="profilepic">Profile Picture URL <span className="optional">(optional)</span></label>
              <div className="input-wrapper">
                <Image className="input-icon" size={18} />
                <input 
                  type="text" 
                  id='profilepic' 
                  name='profilepic' 
                  placeholder='Enter profile picture URL'
                  value={formData.profilepic} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <button type='submit' className='signup-btn' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="btn-icon" size={18} />
                </>
              )}
            </button>
          </form>

          <div className="signup-footer">
            <p>Already have an account?</p>
            <Link to="/login" className="login-link">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup

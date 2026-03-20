import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { KeyRound, ArrowRight, Loader2, RotateCcw } from 'lucide-react'
import { useAuthStore } from '../zustnd/authStore'
import '../style/Login.css'

function Otp() {
  const navigate = useNavigate()
  const { verifyOtp, resendOtp } = useAuthStore()
  const [otp, setOtp] = useState('')
  const [timer, setTimer] = useState(120)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(timer - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!otp || otp.length < 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    setIsLoading(true)

    try {
      const result = await verifyOtp(otp)
      
      if (result.validate) {
        toast.success('Account verified successfully!')
        navigate('/login')
      } else {
        toast.error(result.message || 'Invalid OTP. Please try again.')
      }
    } catch (err) {
      console.error('OTP verification error:', err)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setIsResending(true)
    
    try {
      const result = await resendOtp()
      
      if (result.validate) {
        toast.success('OTP resent successfully!')
        setTimer(120)
      } else {
        toast.error(result.message || 'Failed to resend OTP')
      }
    } catch (err) {
      console.error('Resend OTP error:', err)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className='login-container'>
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <h1>Verify Email</h1>
            <p>Enter the OTP sent to your email address</p>
          </div>

          <form onSubmit={handleSubmit} className='login-form'>
            <div className="input-group">
              <label htmlFor="otp">One-Time Password</label>
              <div className="input-wrapper">
                <KeyRound className="input-icon" size={18} />
                <input 
                  type="text" 
                  id='otp' 
                  name='otp'
                  placeholder='Enter 6-digit OTP'
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required 
                />
              </div>
            </div>

            <button type='submit' className='login-btn' disabled={isLoading || otp.length < 6}>
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Verifying...
                </>
              ) : (
                <>
                  Verify
                  <ArrowRight className="btn-icon" size={18} />
                </>
              )}
            </button>

            <div className="resend-section">
              <button 
                type='button' 
                className='resend-btn'
                onClick={handleResendOtp}
                disabled={timer > 0 || isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Resending...
                  </>
                ) : timer > 0 ? (
                  `Resend in ${formatTime(timer)}`
                ) : (
                  <>
                    <RotateCcw size={16} />
                    Resend OTP
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="login-footer">
            <p>Didn't receive the code?</p>
            <button 
              type="button"
              className="signup-link back-link"
              onClick={() => navigate('/signup')}
            >
              Go back to signup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Otp

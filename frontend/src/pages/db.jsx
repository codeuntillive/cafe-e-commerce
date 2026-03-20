import React from 'react'
import '../style/Dashboard.css'
import { useStore } from '../zustnd/store'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
function dashboard() {
  const { user, setUser } = useStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true })
      setUser(null)
      toast.success('Logged out successfully!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data || 'Logout failed')
    }
  }

  return (
    <div className='main'>
      DASHBOARD
      <button className='logout-btn' onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default dashboard

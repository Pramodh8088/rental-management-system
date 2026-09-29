import React from 'react'
import { useNavigate } from 'react-router-dom'

const LogoutButton = () => {

  const navigate = useNavigate()

  const handleLogout = () => {

    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')

    navigate('/login', {
      replace: true
    })
  }

  return (
    <button
      className="logout-button"
      onClick={handleLogout}
    >
      Logout
    </button>
  )
}

export default LogoutButton
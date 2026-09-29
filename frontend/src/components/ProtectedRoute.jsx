import React from 'react'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, role }) => {

  const token = localStorage.getItem('access_token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  try {

    const payload = JSON.parse(
      atob(token.split('.')[1])
    )

    if (role && payload.role !== role) {
      if (payload.role === 'LANDLORD') {
        return <Navigate to="/landlord" replace />
      }

      if (payload.role === 'TENANT') {
        return <Navigate to="/tenant" replace />
      }

      return <Navigate to="/login" replace />
    }

    return children

  } catch (error) {

    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')

    return <Navigate to="/login" replace />
  }
}

export default ProtectedRoute
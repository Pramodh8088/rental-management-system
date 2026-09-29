import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import '../Auth.css'

const Login = ({ role }) => {

  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isLandlord = role === 'LANDLORD'

  const handleLogin = async (event) => {

    event.preventDefault()

    setError('')
    setLoading(true)

    try {

      const response = await api.post(
        '/auth/login/',
        {
          username: username,
          password: password
        }
      )

      const accessToken = response.data.access
      const refreshToken = response.data.refresh

      const payload = JSON.parse(
        atob(accessToken.split('.')[1])
      )

      if (payload.role !== role) {

        setError(
          `This account is not a ${isLandlord ? 'landlord' : 'tenant'} account.`
        )

        setLoading(false)

        return
      }

      localStorage.setItem(
        'access_token',
        accessToken
      )

      localStorage.setItem(
        'refresh_token',
        refreshToken
      )

      if (payload.role === 'LANDLORD') {

        navigate('/landlord', {
          replace: true
        })

      } else if (payload.role === 'TENANT') {

        navigate('/tenant', {
          replace: true
        })

      }

    } catch (error) {

      console.error(error)

      if (error.response?.data?.detail) {

        setError(
          error.response.data.detail
        )

      } else {

        setError(
          'Invalid username or password.'
        )

      }

    } finally {

      setLoading(false)

    }
  }

  return (
    <div className="auth-page">

      <div className="auth-container">

        <div className="auth-card">

          <div className="auth-header">

            <div className="auth-icon">
              {isLandlord ? '🏠' : '👤'}
            </div>

            <h1>
              {isLandlord
                ? 'Landlord Login'
                : 'Tenant Login'}
            </h1>

            <p>
              {isLandlord
                ? 'Sign in to manage your rental properties'
                : 'Sign in to access your rental information'}
            </p>

          </div>

          <form
            className="auth-form"
            onSubmit={handleLogin}
          >

            <div className="form-group">

              <label>
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                placeholder={
                  isLandlord
                    ? 'Enter landlord username'
                    : 'Enter tenant ID'
                }
                required
              />

            </div>

            <div className="form-group">

              <label>
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter password"
                required
              />

            </div>

            {error && (
              <p className="auth-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="auth-primary-button"
              disabled={loading}
            >
              {loading
                ? 'Logging in...'
                : 'Login'}
            </button>

          </form>

          <div className="auth-footer">

            {isLandlord && (
              <>
                <p>
                  Don't have a landlord account?
                </p>

                <div className="auth-footer-buttons">

                  <button
                    type="button"
                    className="auth-secondary-button"
                    onClick={() =>
                      navigate('/landlord/register')
                    }
                  >
                    Create Account
                  </button>

                </div>
              </>
            )}

            <div className="auth-footer-buttons">

              <button
                type="button"
                className="auth-secondary-button"
                onClick={() =>
                  navigate('/')
                }
              >
                Back to Home
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Login
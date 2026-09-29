import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import '../Auth.css'

const LandlordRegister = () => {

  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (event) => {

    event.preventDefault()

    setError('')
    setSuccess('')

    if (password !== password2) {

      setError(
        'Passwords do not match.'
      )

      return
    }

    setLoading(true)

    try {

      const response = await api.post(
        '/auth/register/',
        {
          username: username,
          email: email,
          password: password,
          first_name: firstName,
          last_name: lastName
        }
      )

      setSuccess(
        response.data.message ||
        'Landlord account created successfully.'
      )

      setUsername('')
      setEmail('')
      setFirstName('')
      setLastName('')
      setPassword('')
      setPassword2('')

      setTimeout(() => {

        navigate('/landlord/login')

      }, 1500)

    } catch (error) {

      console.error(error)

      if (error.response?.data) {

        const data = error.response.data

        if (typeof data === 'object') {

          const messages = Object.values(data)
            .flat()
            .join(' ')

          setError(messages)

        } else {

          setError(
            'Registration failed.'
          )

        }

      } else {

        setError(
          'Unable to create account.'
        )

      }

    } finally {

      setLoading(false)

    }
  }

  return (
    <div className="auth-page">

      <div className="auth-container register-container">

        <div className="auth-card">

          <div className="auth-header">

            <div className="auth-icon">
              🏠
            </div>

            <h1>
              Create Landlord Account
            </h1>

            <p>
              Register to manage your rental properties
            </p>

          </div>

          <form
            className="auth-form"
            onSubmit={handleRegister}
          >

            <div className="auth-form-grid">

              <div className="form-group">

                <label>
                  First Name
                </label>

                <input
                  type="text"
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(event.target.value)
                  }
                  placeholder="Enter first name"
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Last Name
                </label>

                <input
                  type="text"
                  value={lastName}
                  onChange={(event) =>
                    setLastName(event.target.value)
                  }
                  placeholder="Enter last name"
                  required
                />

              </div>

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
                  placeholder="Choose a username"
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Enter email address"
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
                  placeholder="Create a password"
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Confirm Password
                </label>

                <input
                  type="password"
                  value={password2}
                  onChange={(event) =>
                    setPassword2(event.target.value)
                  }
                  placeholder="Confirm your password"
                  required
                />

              </div>

            </div>

            {error && (
              <p className="auth-error">
                {error}
              </p>
            )}

            {success && (
              <p className="auth-success">
                {success}
              </p>
            )}

            <button
              type="submit"
              className="auth-primary-button"
              disabled={loading}
            >
              {loading
                ? 'Creating Account...'
                : 'Create Landlord Account'}
            </button>

          </form>

          <div className="auth-footer">

            <p>
              Already have a landlord account?
            </p>

            <div className="auth-footer-buttons">

              <button
                type="button"
                className="auth-secondary-button"
                onClick={() =>
                  navigate('/landlord/login')
                }
              >
                Login to Account
              </button>

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

export default LandlordRegister
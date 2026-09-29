import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../Auth.css'

const Home = () => {

  const navigate = useNavigate()

  return (
    <div className="home-page">

      <div className="home-container">

        <div className="home-brand">

          <h1>
            Rental Management System
          </h1>

          <p className="home-subtitle">
            Manage properties, tenants, rent, bills and agreements
            easily from one place.
          </p>

        </div>

        <div className="home-options">

          <div className="home-card">

            <div className="home-card-icon">
              🏠
            </div>

            <h2>
              Landlord
            </h2>

            <p>
              Create and manage your rental properties,
              rooms, tenants, payments, bills and agreements.
            </p>

            <div className="home-button-group">

              <button
                type="button"
                className="home-primary-button"
                onClick={() =>
                  navigate('/landlord/register')
                }
              >
                Create Landlord Account
              </button>

              <button
                type="button"
                className="home-secondary-button"
                onClick={() =>
                  navigate('/landlord/login')
                }
              >
                Landlord Login
              </button>

            </div>

          </div>

          <div className="home-card">

            <div className="home-card-icon">
              👤
            </div>

            <h2>
              Tenant
            </h2>

            <p>
              Login to view your room, rent payments,
              bills, rental agreement and complaints.
            </p>

            <div className="home-button-group">

              <button
                type="button"
                className="home-primary-button"
                onClick={() =>
                  navigate('/tenant/login')
                }
              >
                Tenant Login
              </button>

            </div>

          </div>

        </div>

        <div className="home-footer">
          Secure rental management for landlords and tenants.
        </div>

      </div>

    </div>
  )
}

export default Home
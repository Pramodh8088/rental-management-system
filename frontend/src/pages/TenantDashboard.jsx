import React, { useEffect, useState } from 'react'
import LogoutButton from '../components/LogoutButton'
import TenantPayments from '../components/TenantPayments'
import TenantBills from '../components/TenantBills'
import TenantAgreement from '../components/TenantAgreement'
import TenantComplaints from '../components/TenantComplaints'
import api from '../services/api'

const TenantDashboard = () => {

  const [activeTab, setActiveTab] = useState('dashboard')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard'
    },
    {
      id: 'profile',
      label: 'My Profile'
    },
    {
      id: 'room',
      label: 'My Room'
    },
    {
      id: 'payments',
      label: 'Rent Payments'
    },
    {
      id: 'bills',
      label: 'Water & Electricity'
    },
    {
      id: 'agreement',
      label: 'Rental Agreement'
    },
    {
      id: 'complaints',
      label: 'Complaints'
    }
  ]

  const loadProfile = async () => {

    try {

      setError('')

      const response = await api.get(
        '/tenants/me/'
      )

      setProfile(response.data)

    } catch (error) {

      console.error(error)

      if (error.response?.data) {

        setError(
          JSON.stringify(error.response.data)
        )

      } else {

        setError(
          'Failed to load your profile.'
        )

      }

    } finally {

      setLoading(false)

    }
  }

  useEffect(() => {

    loadProfile()

  }, [])

  const getTenantName = () => {

    if (!profile) {
      return 'Tenant'
    }

    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Tenant'
  }

  const renderActiveSection = () => {

    if (activeTab === 'dashboard') {

      return (
        <div>

          <h2>
            Tenant Dashboard
          </h2>

          <p>
            Welcome to your rental management dashboard.
          </p>

          <div className="summary-grid">

            <div className="summary-card">

              <h3>
                Tenant ID
              </h3>

              <h2>
                {profile?.tenant_id || '-'}
              </h2>

              <p>
                Your login ID
              </p>

            </div>

            <div className="summary-card">

              <h3>
                Account Status
              </h3>

              <h2>
                {profile?.is_active
                  ? 'Active'
                  : 'Inactive'}
              </h2>

              <p>
                Current account status
              </p>

            </div>

            <div className="summary-card">

              <h3>
                Room
              </h3>

              <h2>
                {profile?.room_number ||
                  'Not Assigned'}
              </h2>

              <p>
                Your assigned room
              </p>

            </div>

            <div className="summary-card">

              <h3>
                Monthly Rent
              </h3>

              <h2>
                {profile?.monthly_rent
                  ? `₹${profile.monthly_rent}`
                  : '-'}
              </h2>

              <p>
                Current monthly rent
              </p>

            </div>

          </div>

        </div>
      )
    }

    if (activeTab === 'profile') {

      return (
        <div>

          <h2>
            My Profile
          </h2>

          {profile && (

            <div className="profile-grid">

              <div className="profile-item">

                <span>
                  Tenant ID
                </span>

                <strong>
                  {profile.tenant_id || '-'}
                </strong>

              </div>

              <div className="profile-item">

                <span>
                  First Name
                </span>

                <strong>
                  {profile.first_name || '-'}
                </strong>

              </div>

              <div className="profile-item">

                <span>
                  Last Name
                </span>

                <strong>
                  {profile.last_name || '-'}
                </strong>

              </div>

              <div className="profile-item">

                <span>
                  Email
                </span>

                <strong>
                  {profile.email || '-'}
                </strong>

              </div>

              <div className="profile-item">

                <span>
                  Phone
                </span>

                <strong>
                  {profile.phone || '-'}
                </strong>

              </div>

              <div className="profile-item">

                <span>
                  Joining Date
                </span>

                <strong>
                  {profile.joining_date || '-'}
                </strong>

              </div>

              <div className="profile-item">

                <span>
                  Leaving Date
                </span>

                <strong>
                  {profile.leaving_date ||
                    'Not applicable'}
                </strong>

              </div>

              <div className="profile-item">

                <span>
                  Account Status
                </span>

                <strong>
                  {profile.is_active
                    ? 'Active'
                    : 'Inactive'}
                </strong>

              </div>

              <div className="profile-item">

                <span>
                  Address
                </span>

                <strong>
                  {profile.address || '-'}
                </strong>

              </div>

            </div>

          )}

        </div>
      )
    }

    if (activeTab === 'room') {

      return (
        <div>

          <h2>
            My Room
          </h2>

          {profile?.room_number ? (

            <div className="room-card">

              <div>

                <span>
                  Property
                </span>

                <strong>
                  {profile.property_name || '-'}
                </strong>

              </div>

              <div>

                <span>
                  Room Number
                </span>

                <strong>
                  {profile.room_number}
                </strong>

              </div>

              <div>

                <span>
                  Monthly Rent
                </span>

                <strong>
                  ₹{profile.monthly_rent}
                </strong>

              </div>

              <div>

                <span>
                  Advance Amount
                </span>

                <strong>
                  ₹{profile.advance_amount || '0.00'}
                </strong>

              </div>

            </div>

          ) : (

            <div className="data-card">

              <h3>
                No Room Assigned
              </h3>

              <p>
                Your landlord has not assigned a room
                to your account yet.
              </p>

            </div>

          )}

        </div>
      )
    }

    if (activeTab === 'payments') {

      return <TenantPayments />

    }

    if (activeTab === 'bills') {

      return <TenantBills />

    }

    if (activeTab === 'agreement') {

      return <TenantAgreement />

    }

    if (activeTab === 'complaints') {

      return <TenantComplaints />

    }

    return null
  }

  if (loading) {

    return (
      <div className="dashboard">

        <main className="dashboard-content">

          <section className="dashboard-section">

            <h2>
              Loading your dashboard...
            </h2>

          </section>

        </main>

      </div>
    )
  }

  if (error) {

    return (
      <div className="dashboard">

        <main className="dashboard-content">

          <section className="dashboard-section">

            <h2>
              Unable to load dashboard
            </h2>

            <p className="error-message">
              {error}
            </p>

            <button
              type="button"
              onClick={loadProfile}
            >
              Try Again
            </button>

          </section>

        </main>

      </div>
    )
  }

  return (
    <div className="dashboard">

      <header className="dashboard-header">

        <div>

          <h1>
            Tenant Dashboard
          </h1>

          <p className="dashboard-welcome">
            Welcome, {getTenantName()}
          </p>

        </div>

        <LogoutButton />

      </header>

      <nav className="dashboard-nav">

        <div className="dashboard-nav-inner">

          {tabs.map((tab) => (

            <button
              key={tab.id}
              type="button"
              className={
                activeTab === tab.id
                  ? 'nav-tab active'
                  : 'nav-tab'
              }
              onClick={() =>
                setActiveTab(tab.id)
              }
            >
              {tab.label}
            </button>

          ))}

        </div>

      </nav>

      <main className="dashboard-content">

        <section className="dashboard-section">

          {renderActiveSection()}

        </section>

      </main>

    </div>
  )
}

export default TenantDashboard
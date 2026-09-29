import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import LogoutButton from '../components/LogoutButton'
import LandlordSummary from '../components/LandlordSummary'
import PropertyManagement from '../components/PropertyManagement'
import RoomManagement from '../components/RoomManagement'
import TenantManagement from '../components/TenantManagement'
import PaymentManagement from '../components/PaymentManagement'
import UtilityBillManagement from '../components/UtilityBillManagement'
import AgreementManagement from '../components/AgreementManagement'
import ComplaintManagement from '../components/ComplaintManagement'

import MonthlyRentReport from './MonthlyRentReport'
import ElectricityBillReport from './ElectricityBillReport'
import WaterBillReport from './WaterBillReport'

import api from '../services/api'

const LandlordDashboard = () => {

  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard'
    },
    {
      id: 'properties',
      label: 'Properties'
    },
    {
      id: 'rooms',
      label: 'Rooms'
    },
    {
      id: 'tenants',
      label: 'Tenants'
    },
    {
      id: 'payments',
      label: 'Payments'
    },
    {
      id: 'bills',
      label: 'Bills'
    },
    {
      id: 'agreements',
      label: 'Agreements'
    },
    {
      id: 'complaints',
      label: 'Complaints'
    },
    {
      id: 'rent-report',
      label: 'Rent Report'
    },
    {
      id: 'electricity-report',
      label: 'Electricity Report'
    },
    {
      id: 'water-report',
      label: 'Water Report'
    },
    {
      id: 'account',
      label: 'Account'
    }
  ]

  const handleDeleteAccount = async () => {

    setDeleteError('')
    setDeleting(true)

    try {

      await api.delete(
        '/auth/delete-account/'
      )

      localStorage.removeItem(
        'access_token'
      )

      localStorage.removeItem(
        'refresh_token'
      )

      navigate('/', {
        replace: true
      })

    } catch (error) {

      console.error(error)

      if (error.response?.data?.error) {

        setDeleteError(
          error.response.data.error
        )

      } else if (error.response?.data?.detail) {

        setDeleteError(
          error.response.data.detail
        )

      } else {

        setDeleteError(
          'Unable to delete your account. Please try again.'
        )

      }

    } finally {

      setDeleting(false)

    }
  }

  const renderActiveSection = () => {

    if (activeTab === 'dashboard') {
      return <LandlordSummary />
    }

    if (activeTab === 'properties') {
      return <PropertyManagement />
    }

    if (activeTab === 'rooms') {
      return <RoomManagement />
    }

    if (activeTab === 'tenants') {
      return <TenantManagement />
    }

    if (activeTab === 'payments') {
      return <PaymentManagement />
    }

    if (activeTab === 'bills') {
      return <UtilityBillManagement />
    }

    if (activeTab === 'agreements') {
      return <AgreementManagement />
    }

    if (activeTab === 'complaints') {
      return <ComplaintManagement />
    }

    if (activeTab === 'rent-report') {
      return <MonthlyRentReport />
    }

    if (activeTab === 'electricity-report') {
      return <ElectricityBillReport />
    }

    if (activeTab === 'water-report') {
      return <WaterBillReport />
    }

    if (activeTab === 'account') {
      return (
        <div className="account-section">

          <h2>
            Account Settings
          </h2>

          <p>
            Manage your landlord account.
          </p>

          <div className="danger-zone">

            <h3>
              Delete Account
            </h3>

            <p>
              Deleting your account will deactivate your
              landlord login. Your rental history and
              existing records will be preserved.
            </p>

            {!showDeleteConfirmation && (
              <button
                type="button"
                className="delete-account-button"
                onClick={() => {
                  setDeleteError('')
                  setShowDeleteConfirmation(true)
                }}
              >
                Delete My Account
              </button>
            )}

            {showDeleteConfirmation && (
              <div className="delete-confirmation">

                <h4>
                  Are you sure?
                </h4>

                <p>
                  Your landlord account will be deactivated
                  and you will no longer be able to log in.
                  Your rental records will remain preserved.
                </p>

                {deleteError && (
                  <p className="error-message">
                    {deleteError}
                  </p>
                )}

                <div className="confirmation-buttons">

                  <button
                    type="button"
                    className="delete-account-button"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                  >
                    {deleting
                      ? 'Deleting Account...'
                      : 'Yes, Delete My Account'}
                  </button>

                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setShowDeleteConfirmation(false)
                      setDeleteError('')
                    }}
                    disabled={deleting}
                  >
                    Cancel
                  </button>

                </div>

              </div>
            )}

          </div>

        </div>
      )
    }

    return <LandlordSummary />
  }

  return (
    <div className="dashboard">

      <header className="dashboard-header">

        <div>

          <h1>
            Landlord Dashboard
          </h1>

          <p className="dashboard-welcome">
            Manage your rental properties
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

export default LandlordDashboard
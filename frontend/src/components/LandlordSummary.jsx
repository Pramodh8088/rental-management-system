import React, { useEffect, useState } from 'react'
import api from '../services/api'

const LandlordSummary = () => {

  const [properties, setProperties] = useState([])
  const [rooms, setRooms] = useState([])
  const [tenants, setTenants] = useState([])
  const [payments, setPayments] = useState([])
  const [bills, setBills] = useState([])
  const [complaints, setComplaints] = useState([])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadSummary = async () => {

    try {

      setError('')

      const [
        propertiesResponse,
        roomsResponse,
        tenantsResponse,
        paymentsResponse,
        billsResponse,
        complaintsResponse
      ] = await Promise.all([
        api.get('/rentals/properties/'),
        api.get('/rentals/rooms/'),
        api.get('/tenants/'),
        api.get('/rentals/payments/'),
        api.get('/rentals/bills/'),
        api.get('/complaints/')
      ])

      setProperties(propertiesResponse.data)
      setRooms(roomsResponse.data)
      setTenants(tenantsResponse.data)
      setPayments(paymentsResponse.data)
      setBills(billsResponse.data)
      setComplaints(complaintsResponse.data)

    } catch (error) {

      console.error(error)

      if (error.response?.data) {

        setError(
          JSON.stringify(error.response.data)
        )

      } else {

        setError(
          'Failed to load dashboard summary.'
        )

      }

    } finally {

      setLoading(false)
      setRefreshing(false)

    }
  }

  useEffect(() => {
    loadSummary()
  }, [])

  const handleRefresh = async () => {

    setRefreshing(true)

    await loadSummary()
  }

  if (loading) {

    return (
      <div>

        <h2>
          Dashboard Summary
        </h2>

        <p>
          Loading...
        </p>

      </div>
    )
  }

  const totalProperties =
    properties.length

  const totalRooms =
    rooms.length

  const occupiedRooms =
    rooms.filter(
      (room) => room.is_occupied
    ).length

  const availableRooms =
    rooms.filter(
      (room) => !room.is_occupied
    ).length

  const activeTenants =
    tenants.filter(
      (tenant) => tenant.is_active
    ).length

  const pendingRentPayments =
    payments.filter(
      (payment) =>
        payment.payment_type === 'RENT' &&
        payment.status === 'PENDING'
    )

  const pendingRentAmount =
    pendingRentPayments.reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
      0
    )

  const pendingBills =
    bills.filter(
      (bill) =>
        bill.status === 'PENDING'
    )

  const pendingBillAmount =
    pendingBills.reduce(
      (total, bill) =>
        total + Number(bill.amount || 0),
      0
    )

  const openComplaints =
    complaints.filter(
      (complaint) =>
        complaint.status !== 'RESOLVED'
    ).length

  return (
    <div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}
      >

        <h2>
          Dashboard Summary
        </h2>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing
            ? 'Refreshing...'
            : 'Refresh Dashboard'}
        </button>

      </div>

      {error && (
        <p>
          {error}
        </p>
      )}

      <div className="summary-grid">

        <div className="summary-card">

          <h3>
            Properties
          </h3>

          <h2>
            {totalProperties}
          </h2>

        </div>

        <div className="summary-card">

          <h3>
            Total Rooms
          </h3>

          <h2>
            {totalRooms}
          </h2>

        </div>

        <div className="summary-card">

          <h3>
            Occupied Rooms
          </h3>

          <h2>
            {occupiedRooms}
          </h2>

        </div>

        <div className="summary-card">

          <h3>
            Available Rooms
          </h3>

          <h2>
            {availableRooms}
          </h2>

        </div>

        <div className="summary-card">

          <h3>
            Active Tenants
          </h3>

          <h2>
            {activeTenants}
          </h2>

        </div>

        <div className="summary-card">

          <h3>
            Pending Rent
          </h3>

          <h2>
            ₹{pendingRentAmount.toFixed(2)}
          </h2>

          <p>
            {pendingRentPayments.length}{' '}
            pending payment(s)
          </p>

        </div>

        <div className="summary-card">

          <h3>
            Pending Bills
          </h3>

          <h2>
            ₹{pendingBillAmount.toFixed(2)}
          </h2>

          <p>
            {pendingBills.length}{' '}
            pending bill(s)
          </p>

        </div>

        <div className="summary-card">

          <h3>
            Open Complaints
          </h3>

          <h2>
            {openComplaints}
          </h2>

        </div>

      </div>

    </div>
  )
}

export default LandlordSummary
import React, { useEffect, useState } from 'react'
import api from '../services/api'

const TenantBills = () => {
  const [bills, setBills] = useState([])
  const [error, setError] = useState('')

  const loadBills = async () => {
    try {
      const response = await api.get('/rentals/bills/')
      setBills(response.data)
    } catch (error) {
      console.error(error)

      if (error.response?.data) {
        setError(JSON.stringify(error.response.data))
      } else {
        setError('Failed to load utility bills')
      }
    }
  }

  useEffect(() => {
    loadBills()
  }, [])

  const getStatusLabel = (status) => {
    if (status === 'PAID') {
      return 'Paid'
    }

    if (status === 'PARTIALLY_PAID') {
      return 'Partially Paid'
    }

    return 'Pending'
  }

  const getStatusClass = (status) => {
    if (status === 'PAID') {
      return 'status-paid'
    }

    if (status === 'PARTIALLY_PAID') {
      return 'status-partial'
    }

    return 'status-pending'
  }

  const getPaidAmount = (bill) => {
    return Number(bill.paid_amount || 0)
  }

  const getRemainingAmount = (bill) => {
    if (bill.remaining_amount !== undefined && bill.remaining_amount !== null) {
      return Number(bill.remaining_amount)
    }

    const required = Number(bill.amount || 0)
    const paid = getPaidAmount(bill)

    return Math.max(required - paid, 0)
  }

  return (
    <div>
      <hr />

      <h2>My Electricity & Water Bills</h2>

      {error && <p>{error}</p>}

      {bills.length === 0 ? (
        <p>No utility bills found.</p>
      ) : (
        bills.map((bill) => {
          const requiredAmount = Number(bill.amount || 0)
          const paidAmount = getPaidAmount(bill)
          const remainingAmount = getRemainingAmount(bill)

          return (
            <div key={bill.id}>
              <h3>{bill.bill_type}</h3>

              <p>
                <strong>Bill ID:</strong> {bill.id}
              </p>

              <p>
                <strong>Required Amount:</strong> ₹{requiredAmount.toFixed(2)}
              </p>

              <p>
                <strong>Paid Amount:</strong> ₹{paidAmount.toFixed(2)}
              </p>

              <p>
                <strong>Remaining Amount:</strong> ₹{remainingAmount.toFixed(2)}
              </p>

              <p>
                <strong>Billing Month:</strong> {bill.billing_month}
              </p>

              <p>
                <strong>Due Date:</strong>{' '}
                {bill.due_date || 'Not specified'}
              </p>

              <p>
                <strong>Units:</strong>{' '}
                {bill.units !== null &&
                bill.units !== undefined &&
                bill.units !== ''
                  ? bill.units
                  : 'Not specified'}
              </p>

              <p>
                <strong>Status:</strong>{' '}
                <span className={getStatusClass(bill.status)}>
                  {getStatusLabel(bill.status)}
                </span>
              </p>

              {bill.paid_date && (
                <p>
                  <strong>Paid Date:</strong> {bill.paid_date}
                </p>
              )}

              {bill.notes && (
                <p>
                  <strong>Notes:</strong> {bill.notes}
                </p>
              )}

              <hr />
            </div>
          )
        })
      )}
    </div>
  )
}

export default TenantBills
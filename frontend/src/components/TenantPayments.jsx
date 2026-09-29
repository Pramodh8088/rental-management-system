import React, { useEffect, useState } from 'react'
import api from '../services/api'

const TenantPayments = () => {
  const [payments, setPayments] = useState([])
  const [profile, setProfile] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPayments = async () => {
    try {
      setLoading(true)
      setError('')

      const [
        paymentsResponse,
        profileResponse
      ] = await Promise.all([
        api.get('/rentals/payments/'),
        api.get('/tenants/me/')
      ])

      setPayments(paymentsResponse.data)
      setProfile(profileResponse.data)

    } catch (error) {
      console.error(error)

      if (error.response?.data) {
        setError(
          JSON.stringify(error.response.data)
        )
      } else {
        setError(
          'Failed to load payment information.'
        )
      }

    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayments()
  }, [])

  const getPaidAdvance = () => {
    return payments
      .filter(
        (payment) =>
          payment.payment_type === 'ADVANCE' &&
          payment.status === 'PAID'
      )
      .reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      )
  }

  const getPendingAdvance = () => {
    return payments
      .filter(
        (payment) =>
          payment.payment_type === 'ADVANCE' &&
          payment.status === 'PENDING'
      )
      .reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      )
  }

  const getAdvanceRequired = () => {
    return Number(
      profile?.advance_amount || 0
    )
  }

  const getAdvanceRemaining = () => {
    const required = getAdvanceRequired()
    const paid = getPaidAdvance()

    return Math.max(
      required - paid,
      0
    )
  }

  const getAdvanceStatus = () => {
    const required = getAdvanceRequired()
    const paid = getPaidAdvance()

    if (required === 0) {
      return 'Not Required'
    }

    if (paid === 0) {
      return 'Pending'
    }

    if (paid < required) {
      return 'Partially Paid'
    }

    return 'Paid'
  }

  const getRentPaymentsForMonth = (month) => {
    return payments
      .filter(
        (payment) =>
          payment.payment_type === 'RENT' &&
          payment.rent_month &&
          payment.rent_month.substring(0, 7) === month
      )
  }

  const getPaidRentForMonth = (month) => {
    return getRentPaymentsForMonth(month)
      .filter(
        (payment) =>
          payment.status === 'PAID'
      )
      .reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      )
  }

  const getPendingRentForMonth = (month) => {
    return getRentPaymentsForMonth(month)
      .filter(
        (payment) =>
          payment.status === 'PENDING'
      )
      .reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      )
  }

  const getRentStatus = (month) => {
    const required = Number(
      profile?.monthly_rent || 0
    )

    const paid = getPaidRentForMonth(month)

    if (required === 0) {
      return 'Not Required'
    }

    if (paid === 0) {
      return 'Pending'
    }

    if (paid < required) {
      return 'Partially Paid'
    }

    return 'Paid'
  }

  const getRentRemaining = (month) => {
    const required = Number(
      profile?.monthly_rent || 0
    )

    const paid = getPaidRentForMonth(month)

    return Math.max(
      required - paid,
      0
    )
  }

  const getStatusClass = (status) => {
    if (status === 'Paid') {
      return 'status-paid'
    }

    if (status === 'Partially Paid') {
      return 'status-pending'
    }

    if (status === 'Pending') {
      return 'status-pending'
    }

    return ''
  }

  const getRecordStatusClass = (status) => {
    if (status === 'PAID') {
      return 'status-paid'
    }

    return 'status-pending'
  }

  const formatMonth = (dateValue) => {
    if (!dateValue) {
      return 'Not specified'
    }

    const [year, month] =
      dateValue.substring(0, 7).split('-')

    const date = new Date(
      Number(year),
      Number(month) - 1,
      1
    )

    return date.toLocaleString(
      'en-US',
      {
        month: 'long',
        year: 'numeric'
      }
    )
  }

  const getRentMonths = () => {
    const months = payments
      .filter(
        (payment) =>
          payment.payment_type === 'RENT' &&
          payment.rent_month
      )
      .map(
        (payment) =>
          payment.rent_month.substring(0, 7)
      )

    return [...new Set(months)].sort().reverse()
  }

  const getAdvanceSummary = () => {
    const required = getAdvanceRequired()
    const paid = getPaidAdvance()
    const remaining = Math.max(
      required - paid,
      0
    )

    const status = getAdvanceStatus()

    return {
      required,
      paid,
      remaining,
      status
    }
  }

  const getRentSummaryForPayment = (payment) => {
    const month = payment.rent_month
      ? payment.rent_month.substring(0, 7)
      : ''

    const required = Number(
      profile?.monthly_rent || 0
    )

    const paid = getPaidRentForMonth(month)

    const remaining = Math.max(
      required - paid,
      0
    )

    const status = getRentStatus(month)

    return {
      required,
      paid,
      remaining,
      status
    }
  }

  const getAdvanceSummaryForPayment = () => {
    const required = getAdvanceRequired()
    const paid = getPaidAdvance()

    const remaining = Math.max(
      required - paid,
      0
    )

    const status = getAdvanceStatus()

    return {
      required,
      paid,
      remaining,
      status
    }
  }

  const paidAdvance = getPaidAdvance()
  const pendingAdvance = getPendingAdvance()
  const advanceRequired = getAdvanceRequired()
  const advanceRemaining = getAdvanceRemaining()
  const advanceStatus = getAdvanceStatus()

  if (loading) {
    return (
      <div>

        <h2>
          My Rent & Payments
        </h2>

        <p>
          Loading payment information...
        </p>

      </div>
    )
  }

  return (
    <div>

      <hr />

      <h2>
        My Rent & Payments
      </h2>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      <h3>
        Advance Payment Summary
      </h3>

      <div className="summary-grid">

        <div className="summary-card">

          <h3>
            Required Advance
          </h3>

          <h2>
            ₹{advanceRequired.toFixed(2)}
          </h2>

          <p>
            Total advance amount
          </p>

        </div>

        <div className="summary-card">

          <h3>
            Advance Paid
          </h3>

          <h2>
            ₹{paidAdvance.toFixed(2)}
          </h2>

          <p>
            Amount successfully paid
          </p>

        </div>

        <div className="summary-card">

          <h3>
            Advance Remaining
          </h3>

          <h2>
            ₹{advanceRemaining.toFixed(2)}
          </h2>

          <p>
            Amount still remaining
          </p>

        </div>

        <div className="summary-card">

          <h3>
            Advance Status
          </h3>

          <h2
            className={getStatusClass(
              advanceStatus
            )}
          >
            {advanceStatus}
          </h2>

          <p>
            Current advance status
          </p>

        </div>

      </div>

      {pendingAdvance > 0 && (

        <div className="data-card">

          <p>
            <strong>
              Pending Advance Payment:
            </strong>{' '}
            ₹{pendingAdvance.toFixed(2)}
          </p>

        </div>

      )}

      <hr />

      <h3>
        Rent Payment Summary
      </h3>

      {getRentMonths().length === 0 ? (

        <div className="data-card">

          <p>
            No rent payment records found.
          </p>

          {profile?.monthly_rent && (

            <>
              <p>
                <strong>
                  Required Monthly Rent:
                </strong>{' '}
                ₹{Number(
                  profile.monthly_rent
                ).toFixed(2)}
              </p>

              <p>
                <strong>
                  Paid:
                </strong>{' '}
                ₹0.00
              </p>

              <p>
                <strong>
                  Remaining:
                </strong>{' '}
                ₹{Number(
                  profile.monthly_rent
                ).toFixed(2)}
              </p>

              <p>
                <strong>
                  Status:
                </strong>{' '}

                <span className="status-pending">
                  Pending
                </span>
              </p>
            </>

          )}

        </div>

      ) : (

        getRentMonths().map((month) => {

          const monthlyRent = Number(
            profile?.monthly_rent || 0
          )

          const paidRent =
            getPaidRentForMonth(month)

          const pendingRent =
            getPendingRentForMonth(month)

          const remainingRent =
            getRentRemaining(month)

          const rentStatus =
            getRentStatus(month)

          return (

            <div
              key={month}
              className="data-card"
            >

              <h3>
                {formatMonth(month)}
              </h3>

              <p>
                <strong>
                  Required Rent:
                </strong>{' '}
                ₹{monthlyRent.toFixed(2)}
              </p>

              <p>
                <strong>
                  Paid:
                </strong>{' '}
                ₹{paidRent.toFixed(2)}
              </p>

              {pendingRent > 0 && (

                <p>
                  <strong>
                    Pending Payment:
                  </strong>{' '}
                  ₹{pendingRent.toFixed(2)}
                </p>

              )}

              <p>
                <strong>
                  Remaining:
                </strong>{' '}
                ₹{remainingRent.toFixed(2)}
              </p>

              <p>
                <strong>
                  Status:
                </strong>{' '}

                <span
                  className={getStatusClass(
                    rentStatus
                  )}
                >
                  {rentStatus}
                </span>

              </p>

            </div>

          )

        })

      )}

      <hr />

      <h3>
        Payment History
      </h3>

      {payments.length === 0 ? (

        <p>
          No payment records found.
        </p>

      ) : (

        payments.map((payment) => {

          const isAdvance =
            payment.payment_type === 'ADVANCE'

          const advanceSummary =
            isAdvance
              ? getAdvanceSummaryForPayment()
              : null

          const rentSummary =
            !isAdvance
              ? getRentSummaryForPayment(
                  payment
                )
              : null

          return (

            <div
              key={payment.id}
              className="data-card"
            >

              <h3>
                {isAdvance
                  ? 'Advance Payment'
                  : 'Rent Payment'}
              </h3>

              <p>
                <strong>
                  Payment #{payment.id}
                </strong>
              </p>

              {isAdvance ? (

                <>
                  <p>
                    <strong>
                      Required Advance:
                    </strong>{' '}
                    ₹{advanceSummary.required.toFixed(2)}
                  </p>

                  <p>
                    <strong>
                      Total Advance Paid:
                    </strong>{' '}
                    ₹{advanceSummary.paid.toFixed(2)}
                  </p>

                  <p>
                    <strong>
                      Remaining Advance:
                    </strong>{' '}
                    ₹{advanceSummary.remaining.toFixed(2)}
                  </p>

                  <p>
                    <strong>
                      Overall Status:
                    </strong>{' '}

                    <span
                      className={getStatusClass(
                        advanceSummary.status
                      )}
                    >
                      {advanceSummary.status}
                    </span>
                  </p>

                </>

              ) : (

                <>

                  <p>
                    <strong>
                      Rent Month:
                    </strong>{' '}
                    {formatMonth(
                      payment.rent_month
                    )}
                  </p>

                  <p>
                    <strong>
                      Required Rent:
                    </strong>{' '}
                    ₹{rentSummary.required.toFixed(2)}
                  </p>

                  <p>
                    <strong>
                      Total Rent Paid:
                    </strong>{' '}
                    ₹{rentSummary.paid.toFixed(2)}
                  </p>

                  <p>
                    <strong>
                      Remaining Rent:
                    </strong>{' '}
                    ₹{rentSummary.remaining.toFixed(2)}
                  </p>

                  <p>
                    <strong>
                      Overall Status:
                    </strong>{' '}

                    <span
                      className={getStatusClass(
                        rentSummary.status
                      )}
                    >
                      {rentSummary.status}
                    </span>
                  </p>

                </>

              )}

              <hr />

              <p>
                <strong>
                  This Payment Amount:
                </strong>{' '}
                ₹{Number(
                  payment.amount || 0
                ).toFixed(2)}
              </p>

              <p>
                <strong>
                  Payment Date:
                </strong>{' '}
                {payment.payment_date ||
                  'Not specified'}
              </p>

              <p>
                <strong>
                  Payment Record Status:
                </strong>{' '}

                <span
                  className={getRecordStatusClass(
                    payment.status
                  )}
                >
                  {payment.status === 'PAID'
                    ? 'Paid'
                    : 'Pending'}
                </span>
              </p>

              {payment.notes && (

                <p>
                  <strong>
                    Notes:
                  </strong>{' '}
                  {payment.notes}
                </p>

              )}

            </div>

          )

        })

      )}

    </div>
  )
}

export default TenantPayments
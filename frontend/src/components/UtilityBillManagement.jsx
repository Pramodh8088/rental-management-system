import React, { useEffect, useState } from 'react'
import api from '../services/api'

const UtilityBillManagement = () => {
  const [bills, setBills] = useState([])
  const [tenants, setTenants] = useState([])
  const [rooms, setRooms] = useState([])

  const [selectedTenant, setSelectedTenant] = useState('')
  const [billType, setBillType] = useState('ELECTRICITY')
  const [amount, setAmount] = useState('')
  const [paidAmount, setPaidAmount] = useState('')
  const [billingMonth, setBillingMonth] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [paidDate, setPaidDate] = useState('')
  const [units, setUnits] = useState('')
  const [notes, setNotes] = useState('')

  const [editingBill, setEditingBill] = useState(null)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [
        billsResponse,
        tenantsResponse,
        roomsResponse
      ] = await Promise.all([
        api.get('/rentals/bills/'),
        api.get('/tenants/'),
        api.get('/rentals/rooms/')
      ])

      setBills(billsResponse.data)
      setTenants(tenantsResponse.data)
      setRooms(roomsResponse.data)

    } catch (error) {
      console.error(error)

      if (error.response?.data) {
        setError(
          getErrorMessage(error.response.data)
        )
      } else {
        setError(
          'Failed to load utility bill data.'
        )
      }

    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const getErrorMessage = (data) => {
    if (!data) {
      return 'Something went wrong.'
    }

    if (typeof data === 'string') {
      return data
    }

    if (data.detail) {
      return data.detail
    }

    if (data.error) {
      return data.error
    }

    const messages = []

    Object.keys(data).forEach((key) => {
      const value = data[key]

      if (Array.isArray(value)) {
        messages.push(
          `${key}: ${value.join(', ')}`
        )
      } else if (typeof value === 'string') {
        messages.push(
          `${key}: ${value}`
        )
      }
    })

    if (messages.length > 0) {
      return messages.join(' | ')
    }

    return 'Unable to complete the request.'
  }

  const resetBillForm = () => {
    setSelectedTenant('')
    setBillType('ELECTRICITY')
    setAmount('')
    setPaidAmount('')
    setBillingMonth('')
    setDueDate('')
    setPaidDate('')
    setUnits('')
    setNotes('')
    setEditingBill(null)
    setError('')
  }

  const handleEditBill = (bill) => {
    setError('')
    setSuccess('')

    setEditingBill(bill)

    setSelectedTenant(
      String(bill.tenant)
    )

    setBillType(
      bill.bill_type || 'ELECTRICITY'
    )

    setAmount(
      bill.amount || ''
    )

    setPaidAmount(
      bill.paid_amount || '0'
    )

    if (bill.billing_month) {
      setBillingMonth(
        bill.billing_month.substring(0, 7)
      )
    } else {
      setBillingMonth('')
    }

    setDueDate(
      bill.due_date || ''
    )

    setPaidDate(
      bill.paid_date || ''
    )

    setUnits(
      bill.units !== null &&
      bill.units !== undefined
        ? bill.units
        : ''
    )

    setNotes(
      bill.notes || ''
    )

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!selectedTenant) {
      setError(
        'Please select a tenant.'
      )
      return
    }

    if (!amount || Number(amount) <= 0) {
      setError(
        'Please enter a valid bill amount greater than zero.'
      )
      return
    }

    if (Number(paidAmount || 0) < 0) {
      setError(
        'Paid amount cannot be negative.'
      )
      return
    }

    if (Number(paidAmount || 0) > Number(amount)) {
      setError(
        'Paid amount cannot be greater than the bill amount.'
      )
      return
    }

    if (!billingMonth) {
      setError(
        'Please select the billing month.'
      )
      return
    }

    setSubmitting(true)

    try {

      if (!editingBill) {

        await api.post(
          '/rentals/bills/',
          {
            tenant: Number(selectedTenant),
            bill_type: billType,
            amount: Number(amount),

            // New bills always start unpaid.
            paid_amount: 0,

            billing_month: `${billingMonth}-01`,
            due_date: dueDate || null,
            paid_date: null,
            units: units
              ? Number(units)
              : null,
            notes: notes
          }
        )

        resetBillForm()

        setSuccess(
          'Utility bill created successfully as Pending.'
        )

      } else {

        await api.put(
          `/rentals/bills/${editingBill.id}/`,
          {
            tenant: Number(selectedTenant),
            bill_type: billType,
            amount: Number(amount),
            paid_amount: Number(
              paidAmount || 0
            ),
            billing_month: `${billingMonth}-01`,
            due_date: dueDate || null,

            paid_date:
              Number(paidAmount || 0) >=
              Number(amount)
                ? paidDate || null
                : null,

            units: units
              ? Number(units)
              : null,

            notes: notes
          }
        )

        resetBillForm()

        setSuccess(
          'Utility bill updated successfully.'
        )
      }

      await loadData()

    } catch (error) {
      console.error(error)

      setError(
        getErrorMessage(
          error.response?.data
        )
      )

    } finally {
      setSubmitting(false)
    }
  }

  const totalBillAmount = bills.reduce(
    (total, bill) =>
      total + Number(bill.amount || 0),
    0
  )

  const totalPaidAmount = bills.reduce(
    (total, bill) =>
      total + Number(bill.paid_amount || 0),
    0
  )

  const totalRemainingAmount = bills.reduce(
    (total, bill) =>
      total +
      Math.max(
        Number(bill.amount || 0) -
        Number(bill.paid_amount || 0),
        0
      ),
    0
  )

  const paidBills = bills.filter(
    (bill) =>
      bill.status === 'PAID'
  )

  const partiallyPaidBills = bills.filter(
    (bill) =>
      bill.status === 'PARTIALLY_PAID'
  )

  const pendingBills = bills.filter(
    (bill) =>
      bill.status === 'PENDING'
  )

  const waterBills = bills.filter(
    (bill) =>
      bill.bill_type === 'WATER'
  )

  const electricityBills = bills.filter(
    (bill) =>
      bill.bill_type === 'ELECTRICITY'
  )

  const getTenantName = (bill) => {
    if (bill.tenant_name) {
      return bill.tenant_name
    }

    const tenant = tenants.find(
      (item) =>
        Number(item.id) === Number(bill.tenant)
    )

    if (tenant) {
      return `${tenant.first_name} ${tenant.last_name || ''}`.trim()
    }

    return bill.tenant
  }

  const getRoomNumber = (bill) => {
    const tenant = tenants.find(
      (item) =>
        Number(item.id) === Number(bill.tenant)
    )

    if (!tenant) {
      return 'Not Assigned'
    }

    if (tenant.room) {
      const room = rooms.find(
        (item) =>
          Number(item.id) === Number(tenant.room)
      )

      if (room) {
        return room.room_number
      }
    }

    if (tenant.room_number) {
      return tenant.room_number
    }

    return 'Not Assigned'
  }

  const getBillTypeLabel = (type) => {
    if (type === 'WATER') {
      return 'Water Bill'
    }

    if (type === 'ELECTRICITY') {
      return 'Electricity Bill'
    }

    return type
  }

  const getStatusLabel = (status) => {
    if (status === 'PARTIALLY_PAID') {
      return 'Partially Paid'
    }

    if (status === 'PAID') {
      return 'Paid'
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

  if (loading) {
    return (
      <div>
        <h2>
          Utility Bill Management
        </h2>

        <p>
          Loading utility bills...
        </p>
      </div>
    )
  }

  return (
    <div>

      <h2>
        Utility Bill Management
      </h2>

      <p>
        Manage water and electricity bills for your tenants.
      </p>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {success && (
        <p className="success-message">
          {success}
        </p>
      )}

      {/* SUMMARY */}

      <div className="summary-grid">

        <div className="summary-card">
          <h3>Total Bills</h3>
          <h2>{bills.length}</h2>
          <p>All utility bills</p>
        </div>

        <div className="summary-card">
          <h3>Paid Bills</h3>
          <h2>{paidBills.length}</h2>
          <p>Fully paid</p>
        </div>

        <div className="summary-card">
          <h3>Partially Paid</h3>
          <h2>{partiallyPaidBills.length}</h2>
          <p>Part payments received</p>
        </div>

        <div className="summary-card">
          <h3>Pending Bills</h3>
          <h2>{pendingBills.length}</h2>
          <p>No payment received</p>
        </div>

        <div className="summary-card">
          <h3>Water Bills</h3>
          <h2>{waterBills.length}</h2>
          <p>Water charges</p>
        </div>

        <div className="summary-card">
          <h3>Electricity Bills</h3>
          <h2>{electricityBills.length}</h2>
          <p>Electricity charges</p>
        </div>

        <div className="summary-card">
          <h3>Total Bill Amount</h3>
          <h2>
            ₹{totalBillAmount.toFixed(2)}
          </h2>
          <p>Total required</p>
        </div>

        <div className="summary-card">
          <h3>Paid Amount</h3>
          <h2>
            ₹{totalPaidAmount.toFixed(2)}
          </h2>
          <p>Total collected</p>
        </div>

        <div className="summary-card">
          <h3>Remaining Amount</h3>
          <h2>
            ₹{totalRemainingAmount.toFixed(2)}
          </h2>
          <p>Total outstanding</p>
        </div>

      </div>

      <hr />

      {/* FORM */}

      <h3>
        {editingBill
          ? 'Edit Utility Bill'
          : 'Create Utility Bill'}
      </h3>

      {editingBill && (
        <p className="success-message">
          Editing{' '}
          {getBillTypeLabel(
            editingBill.bill_type
          ).toLowerCase()}
          {' '}for{' '}
          {getTenantName(editingBill)}
          {' '} - Room{' '}
          {getRoomNumber(editingBill)}
        </p>
      )}

      {!editingBill && (
        <p>
          New bills are created as Pending with
          ₹0 paid. Use Edit Bill after receiving
          a payment.
        </p>
      )}

      <form onSubmit={handleSubmit}>

        <div className="form-grid">

          {/* TENANT */}

          <div className="form-group">

            <label>
              Tenant
            </label>

            <select
              value={selectedTenant}
              onChange={(event) =>
                setSelectedTenant(
                  event.target.value
                )
              }
              required
              disabled={Boolean(editingBill)}
            >

              <option value="">
                Select Tenant
              </option>

              {tenants
                .filter(
                  (tenant) =>
                    tenant.is_active
                )
                .map((tenant) => (

                  <option
                    key={tenant.id}
                    value={tenant.id}
                  >
                    {tenant.tenant_id} -{' '}
                    {tenant.first_name}{' '}
                    {tenant.last_name || ''}
                  </option>

                ))}

            </select>

          </div>

          {/* BILL TYPE */}

          <div className="form-group">

            <label>
              Bill Type
            </label>

            <select
              value={billType}
              onChange={(event) =>
                setBillType(
                  event.target.value
                )
              }
              disabled={Boolean(editingBill)}
            >

              <option value="ELECTRICITY">
                Electricity
              </option>

              <option value="WATER">
                Water
              </option>

            </select>

          </div>

          {/* REQUIRED AMOUNT */}

          <div className="form-group">

            <label>
              Required Amount
            </label>

            <input
              type="number"
              value={amount}
              onChange={(event) =>
                setAmount(
                  event.target.value
                )
              }
              placeholder="Enter total bill amount"
              min="0.01"
              step="0.01"
              required
            />

          </div>

          {/* PAID AMOUNT */}

          <div className="form-group">

            <label>
              Paid Amount
            </label>

            <input
              type="number"
              value={paidAmount}
              onChange={(event) =>
                setPaidAmount(
                  event.target.value
                )
              }
              placeholder="Enter amount paid"
              min="0"
              step="0.01"
              disabled={!editingBill}
            />

            {!editingBill && (
              <small>
                New bills start with ₹0 paid.
              </small>
            )}

          </div>

          {/* REMAINING */}

          <div className="form-group">

            <label>
              Remaining Amount
            </label>

            <input
              type="text"
              value={Math.max(
                Number(amount || 0) -
                Number(paidAmount || 0),
                0
              ).toFixed(2)}
              readOnly
            />

          </div>

          {/* BILLING MONTH */}

          <div className="form-group">

            <label>
              Billing Month
            </label>

            <input
              type="month"
              value={billingMonth}
              onChange={(event) =>
                setBillingMonth(
                  event.target.value
                )
              }
              required
            />

          </div>

          {/* DUE DATE */}

          <div className="form-group">

            <label>
              Due Date
            </label>

            <input
              type="date"
              value={dueDate}
              onChange={(event) =>
                setDueDate(
                  event.target.value
                )
              }
            />

          </div>

          {/* PAID DATE */}

          <div className="form-group">

            <label>
              Paid Date
            </label>

            <input
              type="date"
              value={paidDate}
              onChange={(event) =>
                setPaidDate(
                  event.target.value
                )
              }
              disabled={
                !editingBill ||
                Number(paidAmount || 0) <
                Number(amount || 0)
              }
            />

          </div>

          {/* UNITS */}

          <div className="form-group">

            <label>
              Units
            </label>

            <input
              type="number"
              value={units}
              onChange={(event) =>
                setUnits(
                  event.target.value
                )
              }
              placeholder="Optional"
              min="0"
              step="0.01"
            />

          </div>

          {/* NOTES */}

          <div className="form-group full-width">

            <label>
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value
                )
              }
              placeholder="Optional notes"
              rows="3"
            />

          </div>

        </div>

        <br />

        <button
          type="submit"
          disabled={submitting}
        >

          {submitting
            ? (
              editingBill
                ? 'Updating...'
                : 'Creating...'
            )
            : (
              editingBill
                ? 'Update Utility Bill'
                : 'Create Utility Bill'
            )}

        </button>

        {editingBill && (
          <button
            type="button"
            onClick={resetBillForm}
            disabled={submitting}
            style={{
              marginLeft: '10px',
              background: '#64748b'
            }}
          >
            Cancel Edit
          </button>
        )}

      </form>

      <hr />

      {/* HISTORY */}

      <h3>
        Utility Bill History
      </h3>

      {bills.length === 0 ? (

        <p>
          No utility bills found.
        </p>

      ) : (

        bills.map((bill) => {

          const requiredAmount =
            Number(bill.amount || 0)

          const paid =
            Number(bill.paid_amount || 0)

          const remaining =
            Math.max(
              requiredAmount - paid,
              0
            )

          return (
            <div
              key={bill.id}
              className="data-card"
            >

              <h3>
                {getBillTypeLabel(
                  bill.bill_type
                )}
              </h3>

              <p>
                <strong>
                  Tenant:
                </strong>{' '}
                {getTenantName(bill)}
              </p>

              <p>
                <strong>
                  Room No:
                </strong>{' '}
                {getRoomNumber(bill)}
              </p>

              <p>
                <strong>
                  Required:
                </strong>{' '}
                ₹{requiredAmount.toFixed(2)}
              </p>

              <p>
                <strong>
                  Paid:
                </strong>{' '}
                ₹{paid.toFixed(2)}
              </p>

              <p>
                <strong>
                  Remaining:
                </strong>{' '}
                ₹{remaining.toFixed(2)}
              </p>

              <p>
                <strong>
                  Status:
                </strong>{' '}

                <span
                  className={
                    getStatusClass(
                      bill.status
                    )
                  }
                >
                  {getStatusLabel(
                    bill.status
                  )}
                </span>
              </p>

              <p>
                <strong>
                  Billing Month:
                </strong>{' '}
                {bill.billing_month}
              </p>

              <p>
                <strong>
                  Due Date:
                </strong>{' '}
                {bill.due_date ||
                  'Not provided'}
              </p>

              <p>
                <strong>
                  Units:
                </strong>{' '}
                {bill.units !== null &&
                bill.units !== undefined &&
                bill.units !== ''
                  ? bill.units
                  : 'Not provided'}
              </p>

              {bill.paid_date && (
                <p>
                  <strong>
                    Paid Date:
                  </strong>{' '}
                  {bill.paid_date}
                </p>
              )}

              {bill.notes && (
                <p>
                  <strong>
                    Notes:
                  </strong>{' '}
                  {bill.notes}
                </p>
              )}

              <button
                type="button"
                onClick={() =>
                  handleEditBill(bill)
                }
                disabled={submitting}
              >
                Edit Bill
              </button>

            </div>
          )
        })

      )}

    </div>
  )
}

export default UtilityBillManagement
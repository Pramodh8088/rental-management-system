import React, { useEffect, useState } from 'react'
import api from '../services/api'

const PaymentManagement = () => {
  const [payments, setPayments] = useState([])
  const [tenants, setTenants] = useState([])
  const [rooms, setRooms] = useState([])
  const [properties, setProperties] = useState([])

  const [selectedTenant, setSelectedTenant] = useState('')
  const [paymentType, setPaymentType] = useState('RENT')
  const [amount, setAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState('')
  const [rentMonth, setRentMonth] = useState('')
  const [status, setStatus] = useState('PAID')
  const [notes, setNotes] = useState('')

  const [editingPaymentId, setEditingPaymentId] = useState(null)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Payment history filters
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState('ALL')
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('ALL')
  const [selectedTenantFilter, setSelectedTenantFilter] = useState('ALL')
  const [selectedPaymentTypeFilter, setSelectedPaymentTypeFilter] = useState('ALL')
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('ALL')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL')

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [
        paymentsResponse,
        tenantsResponse,
        roomsResponse,
        propertiesResponse
      ] = await Promise.all([
        api.get('/rentals/payments/'),
        api.get('/tenants/'),
        api.get('/rentals/rooms/'),
        api.get('/rentals/properties/')
      ])

      setPayments(paymentsResponse.data)
      setTenants(tenantsResponse.data)
      setRooms(roomsResponse.data)
      setProperties(propertiesResponse.data)
    } catch (error) {
      console.error(error)

      if (error.response?.data) {
        setError(
          JSON.stringify(error.response.data)
        )
      } else {
        setError(
          'Failed to load payment data.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const clearForm = () => {
    setSelectedTenant('')
    setPaymentType('RENT')
    setAmount('')
    setPaymentDate('')
    setRentMonth('')
    setStatus('PAID')
    setNotes('')
    setEditingPaymentId(null)
  }

  const getMonthFromDate = (dateValue) => {
    if (!dateValue) {
      return ''
    }

    return dateValue.substring(0, 7)
  }

  const getSelectedTenantData = () => {
    return tenants.find(
      (tenant) =>
        Number(tenant.id) === Number(selectedTenant)
    )
  }

  const getSelectedRoom = () => {
    const tenant = getSelectedTenantData()

    if (!tenant || !tenant.room) {
      return null
    }

    return (
      rooms.find(
        (room) =>
          Number(room.id) === Number(tenant.room)
      ) || null
    )
  }

  const getExistingAdvanceTotal = () => {
    if (!selectedTenant) {
      return 0
    }

    return payments
      .filter(
        (payment) =>
          Number(payment.tenant) === Number(selectedTenant) &&
          payment.payment_type === 'ADVANCE' &&
          Number(payment.id) !== Number(editingPaymentId)
      )
      .reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      )
  }

  const getExistingRentTotal = () => {
    if (!selectedTenant || !rentMonth) {
      return 0
    }

    return payments
      .filter(
        (payment) =>
          Number(payment.tenant) === Number(selectedTenant) &&
          payment.payment_type === 'RENT' &&
          getMonthFromDate(payment.rent_month) === rentMonth &&
          Number(payment.id) !== Number(editingPaymentId)
      )
      .reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      )
  }

  const getMaximumPaymentAmount = () => {
    const room = getSelectedRoom()

    if (!room) {
      return 0
    }

    if (paymentType === 'ADVANCE') {
      return Number(room.advance_amount || 0)
    }

    return Number(room.monthly_rent || 0)
  }

  const getRemainingPaymentAmount = () => {
    const room = getSelectedRoom()

    if (!room) {
      return 0
    }

    if (paymentType === 'ADVANCE') {
      const remaining =
        Number(room.advance_amount || 0) -
        getExistingAdvanceTotal()

      return Math.max(remaining, 0)
    }

    if (!rentMonth) {
      return Number(room.monthly_rent || 0)
    }

    const remaining =
      Number(room.monthly_rent || 0) -
      getExistingRentTotal()

    return Math.max(remaining, 0)
  }

  const handlePaymentTypeChange = (event) => {
    const newPaymentType = event.target.value

    setPaymentType(newPaymentType)
    setEditingPaymentId(null)
    setSuccess('')
    setError('')

    if (newPaymentType === 'ADVANCE') {
      setRentMonth('')
    } else {
      setAmount('')
      setPaymentDate('')
      setStatus('PAID')
      setNotes('')
    }
  }

  const handleTenantChange = (event) => {
    setSelectedTenant(event.target.value)
    setEditingPaymentId(null)
    setAmount('')
    setPaymentDate('')
    setRentMonth('')
    setStatus('PAID')
    setNotes('')
    setSuccess('')
    setError('')
  }

  const handleRentMonthChange = (event) => {
    setRentMonth(event.target.value)
    setEditingPaymentId(null)
    setAmount('')
    setPaymentDate('')
    setStatus('PAID')
    setNotes('')
    setSuccess('')
    setError('')
  }

  const handleCreatePayment = async (event) => {
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
        'Please enter a valid amount greater than zero.'
      )
      return
    }

    if (paymentType === 'RENT' && !rentMonth) {
      setError(
        'Please select the rent month.'
      )
      return
    }

    if (!paymentDate) {
      setError(
        'Please select the payment date.'
      )
      return
    }

    const selectedRoom = getSelectedRoom()

    if (!selectedRoom) {
      setError(
        'This tenant is not assigned to a room. Please assign a room before recording a payment.'
      )
      return
    }

    const maximumAmount = getMaximumPaymentAmount()
    const remainingAmount = getRemainingPaymentAmount()
    const enteredAmount = Number(amount)

    if (paymentType === 'ADVANCE') {
      if (remainingAmount <= 0 && !editingPaymentId) {
        setError(
          `The advance amount of ₹${maximumAmount.toFixed(2)} has already been fully paid.`
        )
        return
      }

      if (
        enteredAmount > remainingAmount
      ) {
        setError(
          `Advance payment cannot exceed the remaining advance amount of ₹${remainingAmount.toFixed(2)}. Room advance limit: ₹${maximumAmount.toFixed(2)}.`
        )
        return
      }
    }

    if (paymentType === 'RENT') {
      if (remainingAmount <= 0 && !editingPaymentId) {
        setError(
          `The monthly rent of ₹${maximumAmount.toFixed(2)} has already been fully recorded for the selected month.`
        )
        return
      }

      if (
        enteredAmount > remainingAmount
      ) {
        setError(
          `Rent payment cannot exceed the remaining rent amount of ₹${remainingAmount.toFixed(2)} for the selected month. Monthly rent: ₹${maximumAmount.toFixed(2)}.`
        )
        return
      }
    }

    setSubmitting(true)

    const isEditing = Boolean(editingPaymentId)

    try {
      const paymentData = {
        tenant: Number(selectedTenant),
        amount: amount,
        payment_type: paymentType,
        payment_date: paymentDate,
        rent_month:
          paymentType === 'RENT'
            ? `${rentMonth}-01`
            : null,
        status: status,
        notes: notes
      }

      if (isEditing) {
        await api.put(
          `/rentals/payments/${editingPaymentId}/`,
          paymentData
        )

        setSuccess(
          `${paymentType === 'RENT' ? 'Rent' : 'Advance'} payment updated successfully.`
        )
      } else {
        await api.post(
          '/rentals/payments/',
          paymentData
        )

        setSuccess(
          'Payment recorded successfully.'
        )
      }

      clearForm()

      await loadData()
    } catch (error) {
      console.error(error)

      if (error.response?.data) {
        setError(
          JSON.stringify(error.response.data)
        )
      } else {
        setError(
          isEditing
            ? 'Failed to update payment.'
            : 'Failed to record payment.'
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  /*
   * -------------------------------------------------------
   * PAYMENT HISTORY HELPERS
   * -------------------------------------------------------
   */

  const getTenantName = (payment) => {
    if (payment.tenant_name) {
      return payment.tenant_name
    }

    const tenant = tenants.find(
      (item) =>
        Number(item.id) === Number(payment.tenant)
    )

    if (tenant) {
      return `${tenant.first_name} ${tenant.last_name || ''}`.trim()
    }

    return payment.tenant
  }

  const getPaymentTypeLabel = (type) => {
    if (type === 'RENT') {
      return 'Rent Payment'
    }

    if (type === 'ADVANCE') {
      return 'Advance Payment'
    }

    return type
  }

  const getPaymentTenant = (payment) => {
    return (
      tenants.find(
        (tenant) =>
          Number(tenant.id) === Number(payment.tenant)
      ) || null
    )
  }

  const getPaymentRoom = (payment) => {
    const tenant = getPaymentTenant(payment)

    if (!tenant || !tenant.room) {
      return null
    }

    return (
      rooms.find(
        (room) =>
          Number(room.id) === Number(tenant.room)
      ) || null
    )
  }

  const getPaymentProperty = (payment) => {
    const room = getPaymentRoom(payment)

    if (!room || !room.property) {
      return null
    }

    return (
      properties.find(
        (property) =>
          Number(property.id) === Number(room.property)
      ) || null
    )
  }

  const handleEditPayment = (payment) => {
    setEditingPaymentId(payment.id)

    setSelectedTenant(
      String(payment.tenant)
    )

    setPaymentType(
      payment.payment_type
    )

    setAmount(
      payment.amount || ''
    )

    setPaymentDate(
      payment.payment_date || ''
    )

    setRentMonth(
      payment.rent_month
        ? payment.rent_month.substring(0, 7)
        : ''
    )

    setStatus(
      payment.status || 'PAID'
    )

    setNotes(
      payment.notes || ''
    )

    setError('')

    setSuccess(
      `Editing payment #${payment.id}. Change the amount and click Update Payment.`
    )

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const getAdvanceSummaryForTenant = (tenantId) => {
    const tenant = tenants.find(
      (item) =>
        Number(item.id) === Number(tenantId)
    )

    const room = tenant?.room
      ? rooms.find(
          (item) =>
            Number(item.id) === Number(tenant.room)
        )
      : null

    const required = Number(
      room?.advance_amount ??
      tenant?.advance_amount ??
      0
    )

    const paid = payments
      .filter(
        (payment) =>
          Number(payment.tenant) === Number(tenantId) &&
          payment.payment_type === 'ADVANCE' &&
          payment.status === 'PAID'
      )
      .reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      )

    const remaining = Math.max(
      required - paid,
      0
    )

    let paymentStatus = 'Pending'

    if (required === 0) {
      paymentStatus = 'Not Required'
    } else if (paid >= required) {
      paymentStatus = 'Paid'
    } else if (paid > 0) {
      paymentStatus = 'Partially Paid'
    }

    return {
      required,
      paid,
      remaining,
      status: paymentStatus
    }
  }

  const getRentSummaryForPayment = (payment) => {
    const tenant = tenants.find(
      (item) =>
        Number(item.id) === Number(payment.tenant)
    )

    const room = tenant?.room
      ? rooms.find(
          (item) =>
            Number(item.id) === Number(tenant.room)
        )
      : null

    const required = Number(
      room?.monthly_rent ??
      tenant?.monthly_rent ??
      0
    )

    const month = payment.rent_month
      ? payment.rent_month.substring(0, 7)
      : ''

    const paid = payments
      .filter(
        (item) =>
          Number(item.tenant) === Number(payment.tenant) &&
          item.payment_type === 'RENT' &&
          item.status === 'PAID' &&
          item.rent_month &&
          item.rent_month.substring(0, 7) === month
      )
      .reduce(
        (total, item) =>
          total + Number(item.amount || 0),
        0
      )

    const remaining = Math.max(
      required - paid,
      0
    )

    let paymentStatus = 'Pending'

    if (required === 0) {
      paymentStatus = 'Not Required'
    } else if (paid >= required) {
      paymentStatus = 'Paid'
    } else if (paid > 0) {
      paymentStatus = 'Partially Paid'
    }

    return {
      required,
      paid,
      remaining,
      status: paymentStatus
    }
  }

  /*
   * -------------------------------------------------------
   * FILTER HELPERS
   * -------------------------------------------------------
   */

  const getPaymentMonth = (payment) => {
    if (!payment.rent_month) {
      return ''
    }

    return payment.rent_month.substring(0, 7)
  }

  const getPaymentFilteredRooms = () => {
    if (selectedPropertyFilter === 'ALL') {
      return rooms
    }

    return rooms.filter(
      (room) =>
        Number(room.property) ===
        Number(selectedPropertyFilter)
    )
  }

  const getFilteredTenantsForPayment = () => {
    return tenants.filter((tenant) => {
      /*
       * Do NOT remove inactive tenants here.
       * Historical payment records should remain searchable.
       */

      if (!tenant.room) {
        return false
      }

      const room = rooms.find(
        (item) =>
          Number(item.id) === Number(tenant.room)
      )

      if (!room) {
        return false
      }

      if (
        selectedPropertyFilter !== 'ALL' &&
        Number(room.property) !==
          Number(selectedPropertyFilter)
      ) {
        return false
      }

      if (
        selectedRoomFilter !== 'ALL' &&
        Number(room.id) !==
          Number(selectedRoomFilter)
      ) {
        return false
      }

      return true
    })
  }

  const getFilteredPaymentHistory = () => {
    return payments.filter((payment) => {
      const tenant = tenants.find(
        (item) =>
          Number(item.id) === Number(payment.tenant)
      )

      if (!tenant) {
        return false
      }

      const room = tenant.room
        ? rooms.find(
            (item) =>
              Number(item.id) === Number(tenant.room)
          )
        : null

      /*
       * Property filter
       */
      if (
        selectedPropertyFilter !== 'ALL'
      ) {
        if (
          !room ||
          Number(room.property) !==
            Number(selectedPropertyFilter)
        ) {
          return false
        }
      }

      /*
       * Room filter
       */
      if (
        selectedRoomFilter !== 'ALL'
      ) {
        if (
          !room ||
          Number(room.id) !==
            Number(selectedRoomFilter)
        ) {
          return false
        }
      }

      /*
       * Tenant filter
       */
      if (
        selectedTenantFilter !== 'ALL' &&
        Number(payment.tenant) !==
          Number(selectedTenantFilter)
      ) {
        return false
      }

      /*
       * Payment type filter
       */
      if (
        selectedPaymentTypeFilter !== 'ALL' &&
        payment.payment_type !==
          selectedPaymentTypeFilter
      ) {
        return false
      }

      /*
       * Month filter
       *
       * Advance payments do not have a rent month.
       * Therefore, selecting a month shows rent
       * records for that month.
       */
      if (
        selectedMonthFilter !== 'ALL'
      ) {
        if (
          getPaymentMonth(payment) !==
          selectedMonthFilter
        ) {
          return false
        }
      }

      /*
       * Status filter
       */
      if (
        selectedStatusFilter !== 'ALL'
      ) {
        if (
          payment.status !==
          selectedStatusFilter
        ) {
          return false
        }
      }

      return true
    })
  }

  const getPaymentHistoryMonths = () => {
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

  const clearPaymentFilters = () => {
    setSelectedPropertyFilter('ALL')
    setSelectedRoomFilter('ALL')
    setSelectedTenantFilter('ALL')
    setSelectedPaymentTypeFilter('ALL')
    setSelectedMonthFilter('ALL')
    setSelectedStatusFilter('ALL')
  }

  const filteredPayments =
    getFilteredPaymentHistory()

  /*
   * -------------------------------------------------------
   * FILTERED SUMMARY TOTALS
   * -------------------------------------------------------
   */

  const totalRentCollected = filteredPayments
    .filter(
      (payment) =>
        payment.payment_type === 'RENT' &&
        payment.status === 'PAID'
    )
    .reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
      0
    )

  const totalAdvanceCollected = filteredPayments
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

  const totalPendingRent = filteredPayments
    .filter(
      (payment) =>
        payment.payment_type === 'RENT' &&
        payment.status === 'PENDING'
    )
    .reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
      0
    )

  const totalPendingAdvance = filteredPayments
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

  const totalPendingPayments =
    totalPendingRent + totalPendingAdvance

  if (loading) {
    return (
      <div>
        <h2>
          Payment Management
        </h2>

        <p>
          Loading payment information...
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2>
        Payment Management
      </h2>

      <p>
        Record and track rent and advance payments.
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
          <h3>
            Rent Collected
          </h3>

          <h2>
            ₹{totalRentCollected.toFixed(2)}
          </h2>

          <p>
            Paid rent
          </p>
        </div>

        <div className="summary-card">
          <h3>
            Advance Collected
          </h3>

          <h2>
            ₹{totalAdvanceCollected.toFixed(2)}
          </h2>

          <p>
            Paid advance
          </p>
        </div>

        <div className="summary-card">
          <h3>
            Pending Payments
          </h3>

          <h2>
            ₹{totalPendingPayments.toFixed(2)}
          </h2>

          <p>
            Pending rent and advance
          </p>
        </div>

        <div className="summary-card">
          <h3>
            Total Payments
          </h3>

          <h2>
            {filteredPayments.length}
          </h2>

          <p>
            Filtered payment records
          </p>
        </div>
      </div>

      <hr />

      {/* PAYMENT FORM */}

      <h3>
        {editingPaymentId
          ? 'Update Payment'
          : 'Record Payment'}
      </h3>

      <form onSubmit={handleCreatePayment}>
        <div className="form-grid">

          <div className="form-group">
            <label>
              Tenant
            </label>

            <select
              value={selectedTenant}
              onChange={handleTenantChange}
              required
              disabled={Boolean(editingPaymentId)}
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

          <div className="form-group">
            <label>
              Payment Type
            </label>

            <select
              value={paymentType}
              onChange={handlePaymentTypeChange}
              disabled={Boolean(editingPaymentId)}
            >
              <option value="RENT">
                Rent
              </option>

              <option value="ADVANCE">
                Advance
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>
              Amount
            </label>

            <input
              type="number"
              value={amount}
              onChange={(event) =>
                setAmount(
                  event.target.value
                )
              }
              placeholder="Enter amount"
              min="0.01"
              max={
                getRemainingPaymentAmount() > 0
                  ? getRemainingPaymentAmount()
                  : undefined
              }
              step="0.01"
              required
            />

            {selectedTenant && (
              <small
                style={{
                  color: '#64748b'
                }}
              >
                {getSelectedRoom()
                  ? paymentType === 'ADVANCE'
                    ? `Maximum remaining advance: ₹${getRemainingPaymentAmount().toFixed(2)} (Room advance: ₹${Number(getSelectedRoom().advance_amount || 0).toFixed(2)})`
                    : rentMonth
                      ? `Remaining rent for this month: ₹${getRemainingPaymentAmount().toFixed(2)} (Monthly rent: ₹${Number(getSelectedRoom().monthly_rent || 0).toFixed(2)})`
                      : `Monthly rent: ₹${Number(getSelectedRoom().monthly_rent || 0).toFixed(2)}`
                  : 'This tenant is not assigned to a room.'}
              </small>
            )}
          </div>

          <div className="form-group">
            <label>
              Payment Date
            </label>

            <input
              type="date"
              value={paymentDate}
              onChange={(event) =>
                setPaymentDate(
                  event.target.value
                )
              }
              required
            />
          </div>

          <div className="form-group">
            <label>
              Rent Month
            </label>

            <input
              type="month"
              value={rentMonth}
              onChange={handleRentMonthChange}
              disabled={
                paymentType !== 'RENT' ||
                Boolean(
                  editingPaymentId &&
                  paymentType === 'ADVANCE'
                )
              }
              required={
                paymentType === 'RENT'
              }
            />
          </div>

          <div className="form-group">
            <label>
              Status
            </label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }
            >
              <option value="PAID">
                Paid
              </option>

              <option value="PENDING">
                Pending
              </option>
            </select>
          </div>

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
            ? 'Saving...'
            : editingPaymentId
              ? 'Update Payment'
              : 'Record Payment'}
        </button>

        {editingPaymentId && (
          <button
            type="button"
            onClick={clearForm}
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

      {/* PAYMENT HISTORY FILTERS */}

      <div
        className="data-card"
        style={{
          marginBottom: '20px'
        }}
      >
        <h3>
          Payment History Filters
        </h3>

        <div className="form-grid">

          {/* PROPERTY */}

          <div className="form-group">
            <label>
              Property
            </label>

            <select
              value={selectedPropertyFilter}
              onChange={(event) => {
                setSelectedPropertyFilter(
                  event.target.value
                )

                setSelectedRoomFilter('ALL')
                setSelectedTenantFilter('ALL')
              }}
            >
              <option value="ALL">
                All Properties
              </option>

              {properties.map((property) => (
                <option
                  key={property.id}
                  value={property.id}
                >
                  {property.name}
                </option>
              ))}
            </select>
          </div>

          {/* ROOM */}

          <div className="form-group">
            <label>
              Room
            </label>

            <select
              value={selectedRoomFilter}
              onChange={(event) => {
                setSelectedRoomFilter(
                  event.target.value
                )

                setSelectedTenantFilter('ALL')
              }}
            >
              <option value="ALL">
                All Rooms
              </option>

              {getPaymentFilteredRooms().map(
                (room) => (
                  <option
                    key={room.id}
                    value={room.id}
                  >
                    {room.room_number}
                  </option>
                )
              )}
            </select>
          </div>

          {/* TENANT */}

          <div className="form-group">
            <label>
              Tenant
            </label>

            <select
              value={selectedTenantFilter}
              onChange={(event) =>
                setSelectedTenantFilter(
                  event.target.value
                )
              }
            >
              <option value="ALL">
                All Tenants
              </option>

              {getFilteredTenantsForPayment().map(
                (tenant) => (
                  <option
                    key={tenant.id}
                    value={tenant.id}
                  >
                    {tenant.tenant_id ||
                      tenant.id}{' '}
                    -{' '}
                    {tenant.first_name}{' '}
                    {tenant.last_name || ''}
                  </option>
                )
              )}
            </select>
          </div>

          {/* PAYMENT TYPE */}

          <div className="form-group">
            <label>
              Payment Type
            </label>

            <select
              value={selectedPaymentTypeFilter}
              onChange={(event) =>
                setSelectedPaymentTypeFilter(
                  event.target.value
                )
              }
            >
              <option value="ALL">
                All Payment Types
              </option>

              <option value="RENT">
                Rent
              </option>

              <option value="ADVANCE">
                Advance
              </option>
            </select>
          </div>

          {/* MONTH */}

          <div className="form-group">
            <label>
              Rent Month
            </label>

            <select
              value={selectedMonthFilter}
              onChange={(event) =>
                setSelectedMonthFilter(
                  event.target.value
                )
              }
            >
              <option value="ALL">
                All Months
              </option>

              {getPaymentHistoryMonths().map(
                (month) => (
                  <option
                    key={month}
                    value={month}
                  >
                    {month}
                  </option>
                )
              )}
            </select>
          </div>

          {/* STATUS */}

          <div className="form-group">
            <label>
              Status
            </label>

            <select
              value={selectedStatusFilter}
              onChange={(event) =>
                setSelectedStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="ALL">
                All Status
              </option>

              <option value="PAID">
                Paid
              </option>

              <option value="PENDING">
                Pending
              </option>
            </select>
          </div>

        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginTop: '15px',
            flexWrap: 'wrap'
          }}
        >
          <button
            type="button"
            onClick={clearPaymentFilters}
          >
            Clear Filters
          </button>

          <span
            style={{
              color: '#64748b',
              fontSize: '14px'
            }}
          >
            Showing{' '}
            <strong>
              {filteredPayments.length}
            </strong>{' '}
            of{' '}
            <strong>
              {payments.length}
            </strong>{' '}
            payment records
          </span>
        </div>
      </div>

      {/* PAYMENT HISTORY */}

      <h3>
        Payment History
      </h3>

      {filteredPayments.length === 0 ? (
        <div className="data-card">
          <p>
            No payments found for the selected filters.
          </p>
        </div>
      ) : (
        filteredPayments.map((payment) => {
          const advanceSummary =
            payment.payment_type === 'ADVANCE'
              ? getAdvanceSummaryForTenant(
                  payment.tenant
                )
              : null

          const rentSummary =
            payment.payment_type === 'RENT'
              ? getRentSummaryForPayment(
                  payment
                )
              : null

          const paymentRoom =
            getPaymentRoom(payment)

          const paymentProperty =
            getPaymentProperty(payment)

          return (
            <div
              key={payment.id}
              className="data-card"
            >
              <h3>
                {getPaymentTypeLabel(
                  payment.payment_type
                )}
              </h3>

              <p>
                <strong>
                  Payment #{payment.id}
                </strong>
              </p>

              <p>
                <strong>
                  Tenant:
                </strong>{' '}
                {getTenantName(payment)}
              </p>

              <p>
                <strong>
                  Building:
                </strong>{' '}

                {paymentProperty
                  ? paymentProperty.name
                  : 'Not available'}
              </p>

              <p>
                <strong>
                  Room No:
                </strong>{' '}

                {paymentRoom
                  ? paymentRoom.room_number
                  : 'Not assigned'}
              </p>

              {payment.payment_type === 'ADVANCE' ? (
                <>
                  <p>
                    <strong>
                      Required Advance:
                    </strong>{' '}

                    ₹
                    {advanceSummary.required.toFixed(
                      2
                    )}
                  </p>

                  <p>
                    <strong>
                      Total Advance Paid:
                    </strong>{' '}

                    ₹
                    {advanceSummary.paid.toFixed(
                      2
                    )}
                  </p>

                  <p>
                    <strong>
                      Remaining Advance:
                    </strong>{' '}

                    ₹
                    {advanceSummary.remaining.toFixed(
                      2
                    )}
                  </p>

                  <p>
                    <strong>
                      Overall Advance Status:
                    </strong>{' '}

                    <span
                      className={
                        advanceSummary.status === 'Paid'
                          ? 'status-paid'
                          : advanceSummary.status ===
                              'Partially Paid'
                            ? 'status-pending'
                            : 'status-pending'
                      }
                    >
                      {advanceSummary.status}
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>
                      Required Rent:
                    </strong>{' '}

                    ₹
                    {rentSummary.required.toFixed(
                      2
                    )}
                  </p>

                  <p>
                    <strong>
                      Total Rent Paid:
                    </strong>{' '}

                    ₹
                    {rentSummary.paid.toFixed(
                      2
                    )}
                  </p>

                  <p>
                    <strong>
                      Remaining Rent:
                    </strong>{' '}

                    ₹
                    {rentSummary.remaining.toFixed(
                      2
                    )}
                  </p>

                  <p>
                    <strong>
                      Overall Rent Status:
                    </strong>{' '}

                    <span
                      className={
                        rentSummary.status === 'Paid'
                          ? 'status-paid'
                          : rentSummary.status ===
                              'Partially Paid'
                            ? 'status-pending'
                            : 'status-pending'
                      }
                    >
                      {rentSummary.status}
                    </span>
                  </p>
                </>
              )}

              <hr />

              <p>
                <strong>
                  Current Record Amount:
                </strong>{' '}

                ₹
                {Number(
                  payment.amount || 0
                ).toFixed(2)}
              </p>

              <p>
                <strong>
                  Payment Date:
                </strong>{' '}

                {payment.payment_date ||
                  'Not provided'}
              </p>

              <p>
                <strong>
                  Rent Month:
                </strong>{' '}

                {payment.rent_month
                  ? payment.rent_month.substring(
                      0,
                      7
                    )
                  : 'Not applicable'}
              </p>

              <p>
                <strong>
                  Record Status:
                </strong>{' '}

                {payment.status === 'PAID' ? (
                  <span className="status-paid">
                    Paid
                  </span>
                ) : (
                  <span className="status-pending">
                    Pending
                  </span>
                )}
              </p>

              {payment.notes && (
                <p>
                  <strong>
                    Notes:
                  </strong>{' '}

                  {payment.notes}
                </p>
              )}

              <button
                type="button"
                onClick={() =>
                  handleEditPayment(payment)
                }
                style={{
                  marginTop: '10px'
                }}
              >
                Edit Payment
              </button>
            </div>
          )
        })
      )}
    </div>
  )
}

export default PaymentManagement
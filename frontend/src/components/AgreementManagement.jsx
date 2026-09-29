import React, { useEffect, useState } from 'react'
import api from '../services/api'

const AgreementManagement = () => {

  const [agreements, setAgreements] = useState([])
  const [tenants, setTenants] = useState([])
  const [rooms, setRooms] = useState([])

  const [selectedTenant, setSelectedTenant] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('')

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [monthlyRent, setMonthlyRent] = useState('')
  const [advanceAmount, setAdvanceAmount] = useState('')
  const [document, setDocument] = useState(null)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadData = async () => {

    try {

      setLoading(true)
      setError('')

      const [
        agreementsResponse,
        tenantsResponse,
        roomsResponse
      ] = await Promise.all([
        api.get('/rentals/agreements/'),
        api.get('/tenants/'),
        api.get('/rentals/rooms/')
      ])

      setAgreements(agreementsResponse.data)
      setTenants(tenantsResponse.data)
      setRooms(roomsResponse.data)

    } catch (error) {

      console.error(error)

      if (error.response?.data) {

        setError(
          JSON.stringify(error.response.data)
        )

      } else {

        setError(
          'Failed to load agreement data.'
        )

      }

    } finally {

      setLoading(false)

    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleTenantChange = (event) => {

    const tenantId = event.target.value

    setSelectedTenant(tenantId)

    const tenant = tenants.find(
      (item) =>
        String(item.id) === String(tenantId)
    )

    if (tenant) {

      if (tenant.room) {
        setSelectedRoom(
          String(tenant.room)
        )
      } else {
        setSelectedRoom('')
      }

      if (tenant.monthly_rent) {
        setMonthlyRent(
          tenant.monthly_rent
        )
      }

    } else {

      setSelectedRoom('')
      setMonthlyRent('')

    }
  }

  const handleCreateAgreement = async (event) => {

    event.preventDefault()

    setError('')
    setSuccess('')

    if (!selectedTenant) {

      setError(
        'Please select a tenant.'
      )

      return
    }

    if (!startDate || !endDate) {

      setError(
        'Please select the agreement start and end dates.'
      )

      return
    }

    if (endDate < startDate) {

      setError(
        'End date cannot be before start date.'
      )

      return
    }

    if (!monthlyRent || Number(monthlyRent) <= 0) {

      setError(
        'Please enter a valid monthly rent.'
      )

      return
    }

    if (
      !advanceAmount ||
      Number(advanceAmount) < 0
    ) {

      setError(
        'Please enter a valid advance amount.'
      )

      return
    }

    setSubmitting(true)

    try {

      const formData = new FormData()

      formData.append(
        'tenant',
        selectedTenant
      )

      if (selectedRoom) {

        formData.append(
          'room',
          selectedRoom
        )

      }

      formData.append(
        'start_date',
        startDate
      )

      formData.append(
        'end_date',
        endDate
      )

      formData.append(
        'monthly_rent',
        monthlyRent
      )

      formData.append(
        'advance_amount',
        advanceAmount
      )

      if (document) {

        formData.append(
          'document',
          document
        )

      }

      await api.post(
        '/rentals/agreements/',
        formData
      )

      setSelectedTenant('')
      setSelectedRoom('')
      setStartDate('')
      setEndDate('')
      setMonthlyRent('')
      setAdvanceAmount('')
      setDocument(null)

      const fileInput =
        window.document.getElementById(
          'agreement-document'
        )

      if (fileInput) {
        fileInput.value = ''
      }

      setSuccess(
        'Rental agreement created successfully.'
      )

      await loadData()

    } catch (error) {

      console.error(error)

      if (error.response?.data) {

        setError(
          JSON.stringify(error.response.data)
        )

      } else {

        setError(
          'Failed to create rental agreement.'
        )

      }

    } finally {

      setSubmitting(false)

    }
  }

  const getTenantName = (agreement) => {

    if (agreement.tenant_name) {
      return agreement.tenant_name
    }

    const tenant = tenants.find(
      (item) =>
        item.id === agreement.tenant
    )

    if (tenant) {

      return `${tenant.first_name} ${tenant.last_name || ''}`

    }

    return agreement.tenant
  }

  const getRoomName = (agreement) => {

    if (agreement.room_number) {
      return agreement.room_number
    }

    const room = rooms.find(
      (item) =>
        item.id === agreement.room
    )

    if (room) {

      return `Room ${room.room_number}`

    }

    return agreement.room || 'Not assigned'
  }

  if (loading) {

    return (
      <div>

        <h2>
          Rental Agreement Management
        </h2>

        <p>
          Loading...
        </p>

      </div>
    )
  }

  return (
    <div>

      <h2>
        Rental Agreement Management
      </h2>

      {error && (
        <p>
          {error}
        </p>
      )}

      {success && (
        <p>
          {success}
        </p>
      )}

      <h3>
        Create Rental Agreement
      </h3>

      <form onSubmit={handleCreateAgreement}>

        <div className="form-group">

          <label>
            Tenant
          </label>

          <select
            value={selectedTenant}
            onChange={handleTenantChange}
            required
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

        <br />

        <div className="form-group">

          <label>
            Room
          </label>

          <select
            value={selectedRoom}
            onChange={(event) =>
              setSelectedRoom(
                event.target.value
              )
            }
          >

            <option value="">
              Select Room
            </option>

            {rooms.map((room) => (

              <option
                key={room.id}
                value={room.id}
              >
                {room.property_name
                  ? `${room.property_name} - Room ${room.room_number}`
                  : `Room ${room.room_number}`}
              </option>

            ))}

          </select>

        </div>

        <br />

        <div className="form-group">

          <label>
            Start Date
          </label>

          <input
            type="date"
            value={startDate}
            onChange={(event) =>
              setStartDate(
                event.target.value
              )
            }
            required
          />

        </div>

        <br />

        <div className="form-group">

          <label>
            End Date
          </label>

          <input
            type="date"
            value={endDate}
            onChange={(event) =>
              setEndDate(
                event.target.value
              )
            }
            required
          />

        </div>

        <br />

        <div className="form-group">

          <label>
            Monthly Rent
          </label>

          <input
            type="number"
            value={monthlyRent}
            onChange={(event) =>
              setMonthlyRent(
                event.target.value
              )
            }
            placeholder="Enter monthly rent"
            min="0"
            step="0.01"
            required
          />

        </div>

        <br />

        <div className="form-group">

          <label>
            Advance Amount
          </label>

          <input
            type="number"
            value={advanceAmount}
            onChange={(event) =>
              setAdvanceAmount(
                event.target.value
              )
            }
            placeholder="Enter advance amount"
            min="0"
            step="0.01"
            required
          />

        </div>

        <br />

        <div className="form-group">

          <label>
            Agreement Document
          </label>

          <input
            id="agreement-document"
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={(event) =>
              setDocument(
                event.target.files[0] || null
              )
            }
          />

        </div>

        <br />

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? 'Uploading...'
            : 'Create Agreement'}
        </button>

      </form>

      <hr />

      <h3>
        Agreement History
      </h3>

      {agreements.length === 0 ? (

        <p>
          No rental agreements found.
        </p>

      ) : (

        agreements.map((agreement) => (

          <div
            key={agreement.id}
            className="data-card"
          >

            <h3>
              Agreement #{agreement.id}
            </h3>

            <p>
              <strong>
                Tenant:
              </strong>{' '}
              {getTenantName(agreement)}
            </p>

            <p>
              <strong>
                Room:
              </strong>{' '}
              {getRoomName(agreement)}
            </p>

            <p>
              <strong>
                Start Date:
              </strong>{' '}
              {agreement.start_date}
            </p>

            <p>
              <strong>
                End Date:
              </strong>{' '}
              {agreement.end_date}
            </p>

            <p>
              <strong>
                Monthly Rent:
              </strong>{' '}
              ₹{agreement.monthly_rent}
            </p>

            <p>
              <strong>
                Advance Amount:
              </strong>{' '}
              ₹{agreement.advance_amount}
            </p>

            <p>

              <strong>
                Status:
              </strong>{' '}

              {agreement.is_active ? (

                <span className="status-active">
                  Active
                </span>

              ) : (

                <span className="status-inactive">
                  Inactive
                </span>

              )}

            </p>

            {agreement.document && (

              <p>

                <a
                  href={
                    agreement.document.startsWith('http')
                      ? agreement.document
                      : `http://127.0.0.1:8000${agreement.document}`
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  View / Download Agreement
                </a>

              </p>

            )}

          </div>

        ))

      )}

    </div>
  )
}

export default AgreementManagement
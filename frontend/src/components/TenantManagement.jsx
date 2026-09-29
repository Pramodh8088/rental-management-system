import React, { useEffect, useState } from 'react'
import api from '../services/api'

const TenantManagement = () => {

  const [tenants, setTenants] = useState([])
  const [rooms, setRooms] = useState([])

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [joiningDate, setJoiningDate] = useState('')

  const [selectedTenant, setSelectedTenant] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadData = async () => {

    try {

      setLoading(true)
      setError('')

      const [
        tenantResponse,
        roomResponse
      ] = await Promise.all([
        api.get('/tenants/'),
        api.get('/rentals/rooms/')
      ])

      setTenants(tenantResponse.data)
      setRooms(roomResponse.data)

    } catch (error) {

      console.error(error)

      if (error.response?.data) {

        setError(
          JSON.stringify(error.response.data)
        )

      } else {

        setError(
          'Failed to load tenant and room data.'
        )

      }

    } finally {

      setLoading(false)

    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateTenant = async (event) => {

    event.preventDefault()

    setError('')
    setSuccess('')
    setSubmitting(true)

    try {

      await api.post(
        '/auth/create-tenant/',
        {
          username: username,
          password: password,
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          address: address,
          joining_date: joiningDate
        }
      )

      setUsername('')
      setPassword('')
      setFirstName('')
      setLastName('')
      setEmail('')
      setPhone('')
      setAddress('')
      setJoiningDate('')

      setSuccess(
        'Tenant account created successfully.'
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
          'Failed to create tenant.'
        )

      }

    } finally {

      setSubmitting(false)

    }
  }

  const handleAssignRoom = async (event) => {

    event.preventDefault()

    setError('')
    setSuccess('')

    if (!selectedTenant) {

      setError(
        'Please select a tenant.'
      )

      return
    }

    if (!selectedRoom) {

      setError(
        'Please select a room.'
      )

      return
    }

    try {

      await api.post(
        `/tenants/${selectedTenant}/assign-room/`,
        {
          room: Number(selectedRoom)
        }
      )

      setSelectedTenant('')
      setSelectedRoom('')

      setSuccess(
        'Room assigned successfully.'
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
          'Failed to assign room.'
        )

      }

    }
  }

  const handleDeactivateTenant = async (tenantId) => {

    const confirmed = window.confirm(
      'Are you sure you want to close this tenant account? This will deactivate the tenant and release their room.'
    )

    if (!confirmed) {
      return
    }

    setError('')
    setSuccess('')

    try {

      await api.delete(
        `/tenants/${tenantId}/`
      )

      setSuccess(
        'Tenant account closed and room released successfully.'
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
          'Failed to close tenant account.'
        )

      }

    }
  }

  const activeTenants = tenants.filter(
    (tenant) => tenant.is_active
  )

  const tenantsWithoutRoom = activeTenants.filter(
    (tenant) => !tenant.room
  )

  const availableRooms = rooms.filter(
    (room) => !room.is_occupied
  )

  if (loading) {

    return (
      <div>

        <h2>
          Tenant Management
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
        Tenant Management
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

      <hr />

      <h3>
        Create Tenant Account
      </h3>

      <form onSubmit={handleCreateTenant}>

        <div>
          <label>
            Tenant ID / Username
          </label>

          <br />

          <input
            type="text"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
            placeholder="Enter tenant ID"
            required
          />
        </div>

        <br />

        <div>
          <label>
            Password
          </label>

          <br />

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter password"
            required
          />
        </div>

        <br />

        <div>
          <label>
            First Name
          </label>

          <br />

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

        <br />

        <div>
          <label>
            Last Name
          </label>

          <br />

          <input
            type="text"
            value={lastName}
            onChange={(event) =>
              setLastName(event.target.value)
            }
            placeholder="Enter last name"
          />
        </div>

        <br />

        <div>
          <label>
            Email
          </label>

          <br />

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="Enter email"
          />
        </div>

        <br />

        <div>
          <label>
            Phone
          </label>

          <br />

          <input
            type="text"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value)
            }
            placeholder="Enter phone number"
            required
          />
        </div>

        <br />

        <div>
          <label>
            Address
          </label>

          <br />

          <textarea
            value={address}
            onChange={(event) =>
              setAddress(event.target.value)
            }
            placeholder="Enter address"
            rows="3"
          />
        </div>

        <br />

        <div>
          <label>
            Joining Date
          </label>

          <br />

          <input
            type="date"
            value={joiningDate}
            onChange={(event) =>
              setJoiningDate(event.target.value)
            }
            required
          />
        </div>

        <br />

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? 'Creating...'
            : 'Create Tenant'}
        </button>

      </form>

      <hr />

      <h3>
        Assign Room
      </h3>

      {tenantsWithoutRoom.length === 0 ? (

        <p>
          No active tenants without a room.
        </p>

      ) : availableRooms.length === 0 ? (

        <p>
          No available rooms.
        </p>

      ) : (

        <form onSubmit={handleAssignRoom}>

          <div>

            <label>
              Tenant
            </label>

            <br />

            <select
              value={selectedTenant}
              onChange={(event) =>
                setSelectedTenant(
                  event.target.value
                )
              }
              required
            >

              <option value="">
                Select Tenant
              </option>

              {tenantsWithoutRoom.map(
                (tenant) => (

                  <option
                    key={tenant.id}
                    value={tenant.id}
                  >
                    {tenant.tenant_id} -{' '}
                    {tenant.first_name}{' '}
                    {tenant.last_name}
                  </option>

                )
              )}

            </select>

          </div>

          <br />

          <div>

            <label>
              Available Room
            </label>

            <br />

            <select
              value={selectedRoom}
              onChange={(event) =>
                setSelectedRoom(
                  event.target.value
                )
              }
              required
            >

              <option value="">
                Select Available Room
              </option>

              {availableRooms.map(
                (room) => (

                  <option
                    key={room.id}
                    value={room.id}
                  >

                    {room.property_name
                      ? `${room.property_name} - Room ${room.room_number}`
                      : `Room ${room.room_number}`}

                    {' - ₹'}

                    {room.monthly_rent}

                  </option>

                )
              )}

            </select>

          </div>

          <br />

          <button type="submit">
            Assign Room
          </button>

        </form>
      )}

      <hr />

      <h3>
        Tenant List
      </h3>

      {tenants.length === 0 ? (

        <p>
          No tenants found.
        </p>

      ) : (

        tenants.map((tenant) => (

          <div
            key={tenant.id}
            style={{
              border: '1px solid #ccc',
              padding: '20px',
              marginBottom: '20px',
              borderRadius: '8px'
            }}
          >

            <h4>
              {tenant.first_name}{' '}
              {tenant.last_name}
            </h4>

            <p>
              <strong>
                Tenant ID:
              </strong>{' '}
              {tenant.tenant_id}
            </p>

            <p>
              <strong>
                Email:
              </strong>{' '}
              {tenant.email || 'Not provided'}
            </p>

            <p>
              <strong>
                Phone:
              </strong>{' '}
              {tenant.phone}
            </p>

            <p>
              <strong>
                Joining Date:
              </strong>{' '}
              {tenant.joining_date}
            </p>

            {tenant.leaving_date && (

              <p>
                <strong>
                  Leaving Date:
                </strong>{' '}
                {tenant.leaving_date}
              </p>

            )}

            <p>
              <strong>
                Property:
              </strong>{' '}
              {tenant.property_name ||
                'Not assigned'}
            </p>

            <p>
              <strong>
                Room:
              </strong>{' '}
              {tenant.room_number ||
                'Not assigned'}
            </p>

            {tenant.monthly_rent && (

              <p>
                <strong>
                  Monthly Rent:
                </strong>{' '}
                ₹{tenant.monthly_rent}
              </p>

            )}

            <p>
              <strong>
                Status:
              </strong>{' '}

              {tenant.is_active
                ? 'Active'
                : 'Inactive'}

            </p>

            {tenant.is_active && (

              <button
                onClick={() =>
                  handleDeactivateTenant(
                    tenant.id
                  )
                }
              >
                Close Tenant
              </button>

            )}

          </div>

        ))

      )}

    </div>
  )
}

export default TenantManagement
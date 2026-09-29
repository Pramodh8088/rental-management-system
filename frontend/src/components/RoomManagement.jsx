import React, { useEffect, useState } from 'react'
import api from '../services/api'

const RoomManagement = () => {

  const [properties, setProperties] = useState([])
  const [rooms, setRooms] = useState([])

  const [selectedProperty, setSelectedProperty] = useState('')
  const [roomNumber, setRoomNumber] = useState('')
  const [monthlyRent, setMonthlyRent] = useState('')
  const [advanceAmount, setAdvanceAmount] = useState('')

  const [editingRoomId, setEditingRoomId] = useState(null)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadData = async () => {

    try {

      setLoading(true)
      setError('')

      const [
        propertiesResponse,
        roomsResponse
      ] = await Promise.all([
        api.get('/rentals/properties/'),
        api.get('/rentals/rooms/')
      ])

      setProperties(propertiesResponse.data)
      setRooms(roomsResponse.data)

    } catch (error) {

      console.error(error)

      if (error.response?.data) {

        setError(
          JSON.stringify(error.response.data)
        )

      } else {

        setError(
          'Failed to load properties and rooms.'
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

    setSelectedProperty('')
    setRoomNumber('')
    setMonthlyRent('')
    setAdvanceAmount('')
    setEditingRoomId(null)

  }

  const handleCreateRoom = async (event) => {

    event.preventDefault()

    setError('')
    setSuccess('')

    if (!selectedProperty) {

      setError(
        'Please select a property.'
      )

      return
    }

    if (!monthlyRent || Number(monthlyRent) < 0) {

      setError(
        'Please enter a valid monthly rent.'
      )

      return
    }

    if (
      advanceAmount !== '' &&
      Number(advanceAmount) < 0
    ) {

      setError(
        'Advance amount cannot be negative.'
      )

      return
    }

    setSubmitting(true)

    try {

      await api.post(
        '/rentals/rooms/',
        {
          property: Number(selectedProperty),
          room_number: roomNumber,
          monthly_rent: monthlyRent,
          advance_amount:
            advanceAmount || 0
        }
      )

      clearForm()

      setSuccess(
        'Room created successfully.'
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
          'Failed to create room.'
        )

      }

    } finally {

      setSubmitting(false)

    }
  }

  const handleEditRoom = (room) => {

    setEditingRoomId(room.id)

    setSelectedProperty(
      String(room.property)
    )

    setRoomNumber(
      room.room_number
    )

    setMonthlyRent(
      room.monthly_rent
    )

    setAdvanceAmount(
      room.advance_amount
    )

    setError('')
    setSuccess('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const handleUpdateRoom = async (event) => {

    event.preventDefault()

    setError('')
    setSuccess('')

    if (!selectedProperty) {

      setError(
        'Please select a property.'
      )

      return
    }

    if (!monthlyRent || Number(monthlyRent) < 0) {

      setError(
        'Please enter a valid monthly rent.'
      )

      return
    }

    if (
      advanceAmount !== '' &&
      Number(advanceAmount) < 0
    ) {

      setError(
        'Advance amount cannot be negative.'
      )

      return
    }

    setSubmitting(true)

    try {

      await api.put(
        `/rentals/rooms/${editingRoomId}/`,
        {
          property: Number(selectedProperty),
          room_number: roomNumber,
          monthly_rent: monthlyRent,
          advance_amount:
            advanceAmount || 0
        }
      )

      clearForm()

      setSuccess(
        'Room updated successfully.'
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
          'Failed to update room.'
        )

      }

    } finally {

      setSubmitting(false)

    }
  }

  const handleDeleteRoom = async (roomId) => {

    const confirmed = window.confirm(
      'Are you sure you want to delete this room?'
    )

    if (!confirmed) {
      return
    }

    setError('')
    setSuccess('')

    try {

      await api.delete(
        `/rentals/rooms/${roomId}/`
      )

      setSuccess(
        'Room deleted successfully.'
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
          'Failed to delete room.'
        )

      }

    }
  }

  return (
    <div>

      <h2>
        Room Management
      </h2>

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

      <h3>
        {editingRoomId
          ? 'Edit Room'
          : 'Add Room'}
      </h3>

      {properties.length === 0 ? (

        <p>
          Please create a property before adding a room.
        </p>

      ) : (

        <form
          onSubmit={
            editingRoomId
              ? handleUpdateRoom
              : handleCreateRoom
          }
        >

          <div className="form-group">

            <label>
              Property
            </label>

            <select
              value={selectedProperty}
              onChange={(event) =>
                setSelectedProperty(
                  event.target.value
                )
              }
              required
            >

              <option value="">
                Select Property
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

          <br />

          <div className="form-group">

            <label>
              Room Number
            </label>

            <input
              type="text"
              value={roomNumber}
              onChange={(event) =>
                setRoomNumber(
                  event.target.value
                )
              }
              placeholder="Example: 101"
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
              placeholder="Example: 10000"
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
              placeholder="Example: 20000"
              min="0"
              step="0.01"
            />

          </div>

          <br />

          <button
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? 'Saving...'
              : editingRoomId
                ? 'Update Room'
                : 'Add Room'}
          </button>

          {editingRoomId && (

            <button
              type="button"
              onClick={() => {
                clearForm()
                setError('')
                setSuccess('')
              }}
              disabled={submitting}
              style={{
                marginLeft: '10px',
                background: '#64748b'
              }}
            >
              Cancel
            </button>

          )}

        </form>

      )}

      <hr />

      <h3>
        My Rooms
      </h3>

      {loading ? (

        <p>
          Loading rooms...
        </p>

      ) : rooms.length === 0 ? (

        <p>
          No rooms found.
        </p>

      ) : (

        rooms.map((room) => (

          <div
            key={room.id}
            className="data-card"
          >

            <h3>
              Room {room.room_number}
            </h3>

            <p>
              <strong>
                Property:
              </strong>{' '}
              {room.property_name ||
                room.property}
            </p>

            <p>
              <strong>
                Monthly Rent:
              </strong>{' '}
              ₹{room.monthly_rent}
            </p>

            <p>
              <strong>
                Advance:
              </strong>{' '}
              ₹{room.advance_amount}
            </p>

            <p>

              <strong>
                Status:
              </strong>{' '}

              {room.is_occupied ? (

                <span className="status-inactive">
                  Occupied
                </span>

              ) : (

                <span className="status-active">
                  Available
                </span>

              )}

            </p>

            <button
              type="button"
              onClick={() =>
                handleEditRoom(room)
              }
            >
              Edit Room
            </button>

            {!room.is_occupied && (

              <button
                type="button"
                onClick={() =>
                  handleDeleteRoom(
                    room.id
                  )
                }
                style={{
                  marginLeft: '10px',
                  background: '#dc2626'
                }}
              >
                Delete Room
              </button>

            )}

          </div>

        ))

      )}

    </div>
  )
}

export default RoomManagement
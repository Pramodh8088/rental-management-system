import React, { useEffect, useState } from 'react'
import api from '../services/api'

const PropertyManagement = () => {

  const [properties, setProperties] = useState([])

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadProperties = async () => {

    try {

      setLoading(true)
      setError('')

      const response = await api.get(
        '/rentals/properties/'
      )

      setProperties(response.data)

    } catch (error) {

      console.error(error)

      if (error.response?.data) {

        setError(
          JSON.stringify(error.response.data)
        )

      } else {

        setError(
          'Failed to load properties.'
        )

      }

    } finally {

      setLoading(false)

    }
  }

  useEffect(() => {
    loadProperties()
  }, [])

  const handleCreateProperty = async (event) => {

    event.preventDefault()

    setError('')
    setSuccess('')
    setSubmitting(true)

    try {

      await api.post(
        '/rentals/properties/',
        {
          name: name,
          address: address
        }
      )

      setName('')
      setAddress('')

      setSuccess(
        'Property created successfully.'
      )

      await loadProperties()

    } catch (error) {

      console.error(error)

      if (error.response?.data) {

        setError(
          JSON.stringify(error.response.data)
        )

      } else {

        setError(
          'Failed to create property.'
        )

      }

    } finally {

      setSubmitting(false)

    }
  }

  const handleDeleteProperty = async (propertyId) => {

    const confirmed = window.confirm(
      'Are you sure you want to delete this property?'
    )

    if (!confirmed) {
      return
    }

    setError('')
    setSuccess('')

    try {

      await api.delete(
        `/rentals/properties/${propertyId}/`
      )

      setSuccess(
        'Property deleted successfully.'
      )

      await loadProperties()

    } catch (error) {

      console.error(error)

      if (error.response?.data) {

        setError(
          JSON.stringify(error.response.data)
        )

      } else {

        setError(
          'Failed to delete property.'
        )

      }

    }
  }

  return (
    <div>

      <h2>
        Property Management
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
        Add Property
      </h3>

      <form onSubmit={handleCreateProperty}>

        <div className="form-group">

          <label>
            Property Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Enter property name"
            required
          />

        </div>

        <br />

        <div className="form-group">

          <label>
            Address
          </label>

          <textarea
            value={address}
            onChange={(event) =>
              setAddress(event.target.value)
            }
            placeholder="Enter property address"
            rows="4"
            required
          />

        </div>

        <br />

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? 'Adding...'
            : 'Add Property'}
        </button>

      </form>

      <hr />

      <h3>
        My Properties
      </h3>

      {loading ? (

        <p>
          Loading properties...
        </p>

      ) : properties.length === 0 ? (

        <p>
          No properties found.
        </p>

      ) : (

        properties.map((property) => (

          <div
            key={property.id}
            className="data-card"
          >

            <h3>
              {property.name}
            </h3>

            <p>
              <strong>
                Address:
              </strong>{' '}
              {property.address}
            </p>

            <p>
              <strong>
                Property ID:
              </strong>{' '}
              {property.id}
            </p>

            <button
              onClick={() =>
                handleDeleteProperty(
                  property.id
                )
              }
            >
              Delete Property
            </button>

          </div>

        ))

      )}

    </div>
  )
}

export default PropertyManagement
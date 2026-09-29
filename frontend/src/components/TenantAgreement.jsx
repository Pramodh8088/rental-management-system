import React, { useEffect, useState } from 'react'
import api from '../services/api'

const TenantAgreement = () => {

  const [agreements, setAgreements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadAgreements = async () => {

    try {

      setLoading(true)
      setError('')

      const response = await api.get(
        '/rentals/agreements/'
      )

      setAgreements(response.data)

    } catch (error) {

      console.error(error)

      if (error.response?.data) {

        setError(
          JSON.stringify(error.response.data)
        )

      } else {

        setError(
          'Failed to load rental agreements.'
        )

      }

    } finally {

      setLoading(false)

    }
  }

  useEffect(() => {
    loadAgreements()
  }, [])

  const getDocumentUrl = (document) => {

    if (!document) {
      return ''
    }

    if (
      document.startsWith('http://') ||
      document.startsWith('https://')
    ) {
      return document
    }

    if (document.startsWith('/')) {
      return `http://127.0.0.1:8000${document}`
    }

    return `http://127.0.0.1:8000/${document}`
  }

  if (loading) {

    return (
      <div>

        <h2>
          My Rental Agreement
        </h2>

        <p>
          Loading agreement...
        </p>

      </div>
    )
  }

  return (
    <div>

      <h2>
        My Rental Agreement
      </h2>

      {error && (
        <p>
          {error}
        </p>
      )}

      {agreements.length === 0 ? (

        <p>
          No rental agreement found.
        </p>

      ) : (

        agreements.map((agreement) => (

          <div
            key={agreement.id}
            className="data-card"
          >

            <h3>
              Rental Agreement
            </h3>

            <p>
              <strong>
                Agreement ID:
              </strong>{' '}
              {agreement.id}
            </p>

            <p>
              <strong>
                Room:
              </strong>{' '}
              {agreement.room || 'Not assigned'}
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

              <span
                className={
                  agreement.is_active
                    ? 'status-active'
                    : 'status-inactive'
                }
              >
                {agreement.is_active
                  ? 'Active'
                  : 'Inactive'}
              </span>

            </p>

            {agreement.document && (

              <p>

                <strong>
                  Agreement Document:
                </strong>{' '}

                <a
                  href={getDocumentUrl(
                    agreement.document
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Document
                </a>

              </p>

            )}

          </div>

        ))

      )}

    </div>
  )
}

export default TenantAgreement
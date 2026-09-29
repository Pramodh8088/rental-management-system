import React, { useEffect, useState } from 'react'
import api from '../services/api'

const TenantComplaints = () => {

  const [complaints, setComplaints] = useState([])

  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadComplaints = async () => {

    try {

      const response = await api.get('/complaints/')

      setComplaints(response.data)

    } catch (error) {

      console.error(error)

      setError('Failed to load complaints.')

    } finally {

      setLoading(false)

    }
  }

  useEffect(() => {
    loadComplaints()
  }, [])

  const handleSubmit = async (event) => {

    event.preventDefault()

    setError('')
    setSuccess('')

    if (!subject.trim() || !description.trim()) {

      setError(
        'Please enter both subject and description.'
      )

      return
    }

    setSubmitting(true)

    try {

      await api.post('/complaints/', {
        subject: subject,
        description: description
      })

      setSubject('')
      setDescription('')

      setSuccess('Complaint submitted successfully.')

      await loadComplaints()

    } catch (error) {

      console.error(error)

      if (error.response?.data) {
        setError(
          JSON.stringify(error.response.data)
        )
      } else {
        setError('Failed to submit complaint.')
      }

    } finally {

      setSubmitting(false)

    }
  }

  const getStatusText = (status) => {

    if (status === 'OPEN') {
      return 'Open'
    }

    if (status === 'IN_PROGRESS') {
      return 'In Progress'
    }

    if (status === 'RESOLVED') {
      return 'Resolved'
    }

    return status
  }

  if (loading) {

    return (
      <div>
        <h2>My Complaints</h2>
        <p>Loading...</p>
      </div>
    )

  }

  return (
    <div>

      <h2>My Complaints</h2>

      <h3>Submit a Complaint</h3>

      <form onSubmit={handleSubmit}>

        <div>

          <label>
            Subject
          </label>

          <br />

          <input
            type="text"
            value={subject}
            onChange={(event) =>
              setSubject(event.target.value)
            }
            placeholder="Enter complaint subject"
          />

        </div>

        <br />

        <div>

          <label>
            Description
          </label>

          <br />

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Describe your complaint"
            rows="5"
          />

        </div>

        <br />

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? 'Submitting...'
            : 'Submit Complaint'}
        </button>

      </form>

      {success && (
        <p>
          {success}
        </p>
      )}

      {error && (
        <p>
          {error}
        </p>
      )}

      <hr />

      <h3>Complaint History</h3>

      {complaints.length === 0 ? (

        <p>
          You have not submitted any complaints.
        </p>

      ) : (

        complaints.map((complaint) => (

          <div
            key={complaint.id}
            style={{
              border: '1px solid #ccc',
              padding: '20px',
              marginBottom: '20px',
              borderRadius: '8px'
            }}
          >

            <h4>
              {complaint.subject}
            </h4>

            <p>
              <strong>Description:</strong>{' '}
              {complaint.description}
            </p>

            <p>
              <strong>Status:</strong>{' '}
              {getStatusText(complaint.status)}
            </p>

            {complaint.landlord_response && (

              <p>
                <strong>Landlord Response:</strong>{' '}
                {complaint.landlord_response}
              </p>

            )}

            <p>
              <strong>Created:</strong>{' '}
              {new Date(
                complaint.created_at
              ).toLocaleString()}
            </p>

            {complaint.resolved_at && (

              <p>
                <strong>Resolved:</strong>{' '}
                {new Date(
                  complaint.resolved_at
                ).toLocaleString()}
              </p>

            )}

          </div>

        ))

      )}

    </div>
  )
}

export default TenantComplaints